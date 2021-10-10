const secrets = require("./secrets");
const mongodb = require("mongodb");

module.exports = {
    authorizationCodes: null,
    accessTokens: null,
    refreshTokens: null,
    clients: null,
    users: null,
};

async function initDatabase(cluster) {
    module.exports.authorizationCodes = await cluster.collection("authorizationCodes");
    module.exports.accessTokens = await cluster.collection("accessTokens");
    module.exports.refreshTokens = await cluster.collection("refreshTokens");
    module.exports.clients = await cluster.collection("clients");
    module.exports.users = await cluster.collection("users");
}

// Decide where to store database credentials later
const dbUser = process.env.DB_USER || secrets.database.user;
const dbPass = process.env.DB_USER || secrets.database.password;
const dbHost = process.env.DB_USER || secrets.database.host;

const uri = "mongodb+srv://" + dbUser + ":" + dbPass + "@" + dbHost;
const dbClient = new mongodb.MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

// Block until database is initialized
dbClient.connect().then(() => {
    console.log("Connected to database!");
    initDatabase(dbClient.db("final_project_cluster"));
});
