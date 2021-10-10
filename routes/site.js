const mongodb = require("mongodb");
const login = require('connect-ensure-login');
const collections = require("../database");


function checkFileAccess(req, res, next) {
    const _id = new mongodb.ObjectId(req.user._id);
    return collections.users.countDocuments(
        {_id, ownedFiles: {$all: [req.body.id]}},
        {limit: 1})
        .then(numFound => {
            if (numFound !== 1) {
                return res.status(403).send("File either does not exist or is not shared");
            }

            next();
        });
}


module.exports.saveFileByID = [
    login.ensureLoggedIn({redirectTo: "/login.html"}),
    checkFileAccess,
    function (req, res) {
        collections.files.update(
            {_id: new mongodb.ObjectId(req.body.id)},
            {
                $set: {
                    name: req.body.name,
                    code: req.body.code
                }
            }
        ).then(() => res.status(200).send("File saved successfully"));
    }
];

module.exports.getOwnedFiles = [
    login.ensureLoggedIn({redirectTo: "/login.html"}),
    function (req, res) {
        const _id = new mongodb.ObjectId(req.user._id);
        collections.users.findOne({_id}).then(user => {
            return collections.files.find(
                {_id: {$in: user.ownedFiles}},
                {name: 1, _id: 1}
            ).toArray()
            .then(ownedFiles => {
                return res.status(200).json(ownedFiles);
            });
        })
    }
];


module.exports.loadFileByID = [
    login.ensureLoggedIn({redirectTo: "/login.html"}),
    checkFileAccess,
    function (req, res) {
        collections.files.findOne(
            {_id: new mongodb.ObjectId(req.body.id)}
        ).then(file => res.status(200).json(file));
    }
];


// Create a new file
module.exports.createNewFile = [
    login.ensureLoggedIn({redirectTo: "/login.html"}),
    function (req, res) {
        const newFile = {
            name: req.body.name,
            code: req.body.code,
        };

        collections.files.insert(newFile)
            .then(() => collections.users.update(
                {_id: new mongodb.ObjectId(req.user._id)},
                {$push: {ownedFiles: newFile._id}}
            ))
            .then(() => {
                return res.status(200).send("File saved successfully");
            });
    }
];

module.exports.shareFile = [
    login.ensureLoggedIn({redirectTo: "/login.html"}),
    checkFileAccess,
    function (req, res) {
        collections.users.updateOne(
            {username: req.body.username},
            {$push: {ownedFiles: req.body.id}}
        ).then(result => {
            if (result.modifiedCount === 0) {
                return res.status(404).send("User does not exist");
            }

            res.status(200).send("Shared file successfully");
        });
    }
];

module.exports.getFileOwners = [
    login.ensureLoggedIn({redirectTo: "/login.html"}),
    checkFileAccess,
    function (req, res) {
        collections.users.find(
            {ownedFiles: {$all: [req.body.id]}},
            {username: 1}
        )
            .toArray()
            .then(result => res.status(200).json(result));
    }
];


const globalFiles = {
    test: {code: "test = function() { \n console.log(\"obama\") \n}"}
};


function saveFile(req, res) {
    globalFiles[req.body.name] = {
        code: req.body.code
    };

    console.log(req.body);
    console.log(globalFiles);
    sendFileNames(req, res);
}

function loadFile(req, res) {
    console.log("Sending: " + req.body.name);
    res.status(200).json(globalFiles[req.body.name]);
}

function sendFileNames(req, res) {
    const files = Object.keys(globalFiles);

    console.log("\nFILES:");
    console.log(files);

    res.status(200).json({files});
}

module.exports = {
    ...module.exports,
    saveFile,
    loadFile,
    sendFileNames
};
