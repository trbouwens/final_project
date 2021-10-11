const login = require("connect-ensure-login");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const secrets = require("./secrets");
const morgan = require("morgan");
const cors = require("cors");
const express = require("express"),
    app = express();

app.set("env", process.env.NODE_ENV || "development");
app.set("port", process.env.PORT || 3000);
console.log("Using environment: " + app.get("env"));

// Ignore cors
app.all("/*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.use(cors());
app.use(morgan("tiny"));
app.use(cookieParser());
app.use(bodyParser.json({extended: false}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(session(secrets));
app.use(passport.initialize());
app.use(passport.session());

const routes = require("./routes");

// Simple middleware to ensure user is logged in before serving editor page
app.use(function (req, res, next) {
    if (req.method === "GET" && (req.url === "/editor.html" || req.url === "/" || req.url === "/index.html")) {
        return login.ensureLoggedIn({redirectTo: "/login.html"})(req, res, next);
    }

    next();
});

app.use(express.static("build"));


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

app.get("/api/files", routes.site.getOwnedFiles);
app.post("/api/save", routes.site.saveFileByID);
app.post("/api/delete", routes.site.deleteFileByID);
app.post("/api/load", routes.site.loadFileByID);
app.post("/api/create", routes.site.createNewFile);
app.post("/api/share", routes.site.shareFile);
app.post("/api/owners", routes.site.getFileOwners);

app.get("/login", (req, res) => res.redirect("/login.html"));
app.get("/", (req, res) => res.redirect("/login.html"));

app.listen(app.get("port"));
