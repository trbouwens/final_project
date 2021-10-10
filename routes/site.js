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
    saveFile,
    loadFile,
    getFileNames: sendFileNames
};
