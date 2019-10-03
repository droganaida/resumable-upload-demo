
const Config = require('./libs/config');

module.exports.commonMiddlew = async function (req, res, next) {

    res.locals.title = '#𝗕𝗹𝗼𝗻𝗱𝗶𝗲𝗖𝗼𝗱𝗲 - 𝗥𝗲𝘀𝘂𝗺𝗮𝗯𝗹𝗲 𝘂𝗽𝗹𝗼𝗮𝗱 𝗱𝗲𝗺𝗼';
    res.locals.description = 'Demo for resumable.js: express.js';
    res.locals.brand = Config.brand;
    next();
};