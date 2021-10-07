const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const routes = require('./routes');
const express = require('express'),
    app = express()


app.set("env", process.env.NODE_ENV || "development");
app.set("port", process.env.PORT || 3000);

// app.use(express.json())

app.use(express.static('build'))
app.use(cookieParser());
app.use(bodyParser.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));


if (app.get("env") === "development") {
    app.use(session({
        secret: "placeholder secret",
        resave: false,
        saveUninitialized: false,
    }));
} else {
    app.use(session(require("secrets")));
}

app.use(passport.initialize());
app.use(passport.session());


app.get('/dialog/authorize', routes.oauth.authorization);
app.post('/dialog/authorize/decision', routes.oauth.decision);
app.post('/oauth/token', routes.oauth.token);




app.listen(8080)
