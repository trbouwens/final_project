// This module contains code for an oauth2 authentication server
// Modeled after the example project for oauth2orize.
// https://github.com/awais786327/oauth2orize-examples/blob/master/routes/oauth2.js
const oauth2orize = require("oauth2orize");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const BasicStrategy = require('passport-http').BasicStrategy;
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const login = require('connect-ensure-login');

// Placeholders for mongodb (or other database) collections
let authorizationCodes = null;
let accessTokens = null;
let refreshTokens = null;
let clients = null;
let users = null;

module.exports.initDatabase = async function (cluster, secret) {
    authorizationCodes = await cluster.collection("authorizationCodes");
    accessTokens = await cluster.collection("accessTokens");
    refreshTokens = await cluster.collection("refreshTokens");
    clients = await cluster.collection("clients");
    users = await cluster.collection("users");

    // Ensure the local client is initialized in the clients list
    await clients.insertOne({
        id: "0",
        name: "local-client",
        clientId: "local-client",
        clientSecret: secret,
        isTrusted: true,
    }).catch(console.log);
}


const authServer = oauth2orize.createServer();


function issueToken(userId, clientId, done) {
    users.findOne({ userId })
        .catch(err => done(err))
        .then(user => {
            const accessToken = oauth2orize.uid(256);
            const refreshToken = oauth2orize.uid(256);

            // TODO: This may cause duplicates for a single userId/clientId.
            accessTokens.insertOne({
                token: accessToken,
                userId: userId,
                clientId: clientId,
            })
                .then(() => refreshTokens.insertOne({
                    token: refreshToken,
                    userId: userId,
                    clientId: clientId,
                }))
                .catch(err => done(err))
                .then(() => {
                    const params = { username: user.name };
                    done(null, accessToken, refreshToken, params);
                });
        });
}

authServer.grant(oauth2orize.grant.code(function (client, redirectURI, user, ares, done) {
    const code = oauth2orize.uid(16);

    authorizationCodes.insertOne({
        code,
        clientId: client.id,
        redirectURI,
        userId: user.id,
        scope: ares.scope,
    }).catch(err => done(err))
        .then(() => done(null, code));
}));

authServer.grant(oauth2orize.grant.token((client, user, ares, done) => {
    issueToken(user.id, client.clientId, done);
}));

authServer.exchange(oauth2orize.exchange.code(function (client, code, redirectURI, done) {
    authorizationCodes.findOne({code})
        .catch(err => done(err))
        .then(value => {
            // Authorization code does not match request
            if (client.id !== value.clientId || redirectURI !== value.redirectURI) {
                return done(null, false);
            }

            issueToken(value.userId, value.clientId, done);
        });
}));

authServer.exchange(oauth2orize.exchange.password((client, username, password, scope, done) => {
    clients.findOne({clientId: client.clientId})
        .catch(err => done(err))
        .then(foundClient => {
            if (foundClient.clientSecret !== client.clientSecret) {
                return done(null, false);
            }

            users.findOne({ username })
                .catch(err => done(err))
                .then(user => {
                    if (password !== user.password) {
                        return done(null, false);
                    }

                    issueToken(user.id, client.clientId, done);
                });
        });
}));

authServer.exchange(oauth2orize.exchange.clientCredentials((client, scope, done) => {
    // Validate the client
    clients.findOne({clientId: client.clientId})
        .catch(err => done(err))
        .then(foundClient => {
            if (foundClient.clientSecret !== client.clientSecret) {
                return done(null, false);
            }

            // TODO: Will this even work? The oauth2 example page does this, but it looks iffy to me.
            issueToken(null, client.clientId, done);
        });
}));

authServer.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
    refreshTokens.findOne({ token: refreshToken })
        .catch(err => done(err))
        .then(token => {
            issueToken(token.userId, client.id, (err, accessToken, refreshToken, params) => {
                if (err) {
                    done(err, null, null);
                }

                const schema = {
                    clientId: token.clientId,
                    userId: token.userId,
                };

                accessTokens.remove(schema)
                    .then(() => refreshTokens.remove(schema))
                    .catch(err => done(err, null, null))
                    .then(() => done(null, accessToken, refreshToken, params));
            })
        });
}));


passport.use(new LocalStrategy((username, password, done) => {
    users.findOne({ username })
        .catch(err => done(err))
        .then(user => {
            if (password !== user.password) {
                return done(null, false);
            }

            return done(null, user);
        });
}));


passport.serializeUser((user, done) =>  done(null, user.id));

passport.deserializeUser((userId, done) => {
    users.findOne({ userId })
        .catch(err => done(err))
        .then(user => done(null, user));
});

function verifyClient(clientId, clientSecret, done) {
    clients.findOne({ clientId })
        .catch(err => done(err))
        .then(client => {
            if (clientSecret !== client.clientSecret) {
                return done(null, false);
            }

            done(null, client);
        });
}

passport.use(new BasicStrategy(verifyClient));
passport.use(new ClientPasswordStrategy(verifyClient));

passport.use(new BearerStrategy((accessToken, done) => {
    accessTokens.findOne({ token: accessToken })
        .catch(done)
        .then(token => {
            if (token.userId) {
                users.findOne({userId: token.userId })
                    .catch(done)
                    .then(user => done(null, user, { scope: "*" }));
            } else {
                clients.findOne({clientId: token.clientId })
                    .catch(done)
                    .then(client => done(null, client, { scope: "*" }));
            }
        });
}));

module.exports.createUser = async function (username, password) {
    let id;

    // Ensure userId is unique
    do {
        id = oauth2orize.uid(16);
    } while (await users.countDocuments({ id }, { limit: 1 }) > 0);

    users.insertOne({ id, username, password });
    return id;
}

module.exports.authorization = [
    login.ensureLoggedIn(),
    authServer.authorization((clientId, redirectURI, done) => {
        clients.findOne({ clientId })
            .catch(err => done(err))
            // TODO: Example recommends verifying redirectURI
            .then(client => done(null, client, redirectURI));
    }, (client, user, done) => {
        // Not completely sure how this works
        if (client.isTrusted) {
            return done(null, true);
        }

        accessTokens.findOne({
            clientId: client.clientId,
            userId: user.id,
        })
            .catch(() => done(null, false))
            .then(() => done(null, true));
    })
    // TODO: Handle it somehow?
];

module.exports.decision = [
    login.ensureLoggedIn(),
    authServer.decision(),
];

module.exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    authServer.token(),
    authServer.errorHandler(),
];

