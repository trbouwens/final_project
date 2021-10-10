const {body, validationResult} = require("express-validator");
const oauth_server = require("./oauth_server");
const passport = require("passport");

function signup(req, res) {
    oauth_server.dbCollections.users
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
    passport.authenticate("local", { successRedirect: '/' })
];

module.exports.logout = (req, res) => {
    req.logout();
    res.redirect("/login.html");
};

