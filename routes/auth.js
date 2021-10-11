const {body, validationResult} = require("express-validator");
const oauth_server = require("./oauth_server");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const secrets = require("../secrets");
const collections = require("../database");
const login = require("connect-ensure-login");


function signup(req, res) {
    collections.users
        .countDocuments({username: req.body.username}, {limit: 1})
        .then(num_users => {
            // Verify that a user does not already exist with this username
            if (num_users > 0) {
                return res.status(422).json({
                    errors: ["username is already taken"]
                });
            }

            oauth_server.createUser(req.body.username, req.body.password)
                .then(_ => res.status(200).send("Created New User"));
        });
}

function collectErrors(req, res, next) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }

    return res.status(422).json({
        errors: errors.array().map(x => x.msg)
    });
}


passport.use(new GitHubStrategy(secrets.auth.github, function (accessToken, refreshToken, profile, done) {
    console.log("Got response from github strategy");
    collections.users
        .findOneAndUpdate({
                userId: profile.id,
                src: "github",
            },
            {
                $setOnInsert: {
                    userId: profile.id,
                    src: "github",
                    username: profile.username,
                    ownedFiles: []
                }
            },
            {
                returnOriginal: false,
                returnNewDocument: true,
                new: true,
                upsert: true
            })
        .catch(err => done(err))
        .then(() => {
            // MongoDB docs seem highly inconsistent regarding how to return the new object.
            // Depending on the driver, shell, or version, options might include returnOriginal, returnNewDocument, or
            // new. However none seem to give the desired effect. So instead just do a second query.
            collections.users.findOne({
                userId: profile.id,
                src: "github",
            }).then(user => {
                console.log("Got user: " + JSON.stringify(user));
                done(null, user);
            });
        });
}));

module.exports.signup = [
    body("username")
        .isAlphanumeric()
        .withMessage("username must be alphanumeric"),
    body("username")
        .isLength({min: 5, max: 32})
        .withMessage("username must be between 5 and 32 characters long"),
    body("password")
        .isLength({min: 5, max: 32})
        .withMessage("password must be between 5 and 32 characters long"),
    collectErrors,
    signup,
];

module.exports.login = [
    body("username")
        .isAlphanumeric()
        .withMessage("username must be alphanumeric"),
    body("username")
        .isLength({min: 5, max: 32})
        .withMessage("username must be between 5 and 32 characters long"),
    body("password")
        .isLength({min: 5, max: 32})
        .withMessage("password must be between 5 and 32 characters long"),
    collectErrors,
    passport.authenticate("local", {successRedirect: '/editor.html'})
];

module.exports.github = passport.authenticate("github", {scope: ["read:user", "user:email"]});
module.exports.githubCallback = [
    passport.authenticate("github", {failureRedirect: '/login.html'}),
    (req, res) => res.redirect("/editor.html"),
];

module.exports.logout = (req, res) => {
    req.logout();
    res.redirect("/login.html");
};
