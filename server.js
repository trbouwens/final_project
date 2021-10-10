const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const mongodb = require("mongodb");
let secrets = require("./secrets");
const express = require("express"),
    app = express()


app.set("env", process.env.NODE_ENV || "development");
app.set("port", process.env.PORT || 3000);
console.log("Using environment: " + app.get("env"));


app.use(express.static("build"))
app.use(cookieParser());
app.use(bodyParser.json({extended: false}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(session(secrets));
app.use(passport.initialize());
app.use(passport.session());

const routes = require("./routes");

// Decide where to store database credentials later
const dbUser = process.env.DB_USER || secrets.database.user;
const dbPass = process.env.DB_USER || secrets.database.password;
const dbHost = process.env.DB_USER || secrets.database.host;

const uri = "mongodb+srv://" + dbUser + ":" + dbPass + "@" + dbHost;
const dbClient = new mongodb.MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

// Block until database is initialized
dbClient.connect().then(() => {
    console.log("Connected to database!");
    routes.oauth_server.initDatabase(dbClient.db("final_project_cluster"), secrets.secret);
});

// Public facing oauth2 hooks
app.get("/dialog/authorize", routes.oauth_server.authorization);
app.post("/dialog/authorize/decision", routes.oauth_server.decision);
app.post("/oauth/token", routes.oauth_server.token);

// Auth requests from Login.svelte
app.post("/auth/signup", routes.auth.signup);
app.post("/auth/login", routes.auth.login);
app.get("/auth/logout", routes.auth.logout);

app.get("/auth/github", routes.auth.github);
app.get("/auth/github/callback", routes.auth.githubCallback);

app.listen(app.get("port"));
