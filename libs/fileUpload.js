
const fs = require('fs');
const path = require('path');

exports.getFullPath = function(_path) {

    _path = [path.dirname(require.main.filename)].concat(_path);
    return (path.join.apply(null, _path));
};

exports.makeDirectory = function(dirName){

    fs.mkdirSync(dirName, { recursive: true });
};

exports.saveFile = function(fileToUpload, filePath){

    const fileBuffer = fs.readFileSync(fileToUpload.path);
    fs.writeFileSync(filePath, fileBuffer);
    return filePath;
};

exports.clearFolder = function (dirName, filterArray=[]) {

    const files = fs.readdirSync(dirName);

    for (let file of files) {

        let deleteFile = false;
        if (filterArray && filterArray.length > 0) {
            filterArray.some(filter => {
                if (filter.test(file)) {
                    deleteFile = true;
                    return true;
                }
            })
        } else {
            deleteFile = true;
        }
        if (deleteFile) {
            fs.unlinkSync(path.join(dirName, file));
        }
    }
};