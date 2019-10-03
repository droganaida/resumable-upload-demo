
const fileUpload = require('../libs/fileUpload');
const Config = require('../libs/config');

exports.get = async function(req, res, next){
    //========= Clears /uploads and /files folders after the page reloads
    try {
        fileUpload.clearFolder(fileUpload.getFullPath(Config.dirs.filesDir));
        fileUpload.clearFolder(fileUpload.getFullPath([Config.dirs.publicDir, Config.dirs.uploadDir]));
    } catch (err) {
        console.error(err);
    }
    res.render('./main/main');
};
