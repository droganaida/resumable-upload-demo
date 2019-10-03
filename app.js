
const express = require('express');
const path = require('path');
const Config = require('./libs/config');
const common = require('./common');
const multipart = require('connect-multiparty');

const http = require('http');
const app = express();

app.set('views', __dirname + '/templates');
app.set('view engine', 'ejs');
app.set('view options', {compileDebug: false, self: true, cache: true});

app.use(express.static(path.join(__dirname, Config.dirs.publicDir)));
app.use(Config.filesLink, express.static(path.join(__dirname, Config.dirs.filesDir)));

app.use(multipart());

app.use(common.commonMiddlew);
require('./routes')(app);

app.use((err, req, res, next) => {
    console.error(`============== 500 err: ${err.stack}`);
    res.status(err.status || 500);
    if (req.method === "GET") {
        next();
    } else {
        res.send('Server Error');
    }
});
app.use((req, res, next) => {
    res.status(404);
    res.render('./error/error', {
        title: '404: Page not found',
        message: '404: Page not found'
    });
});

const httpServer = http.createServer(app);
const port = Config.port;
httpServer.on('listening', () => {
    console.log(`Listening on port ${port}`)
});
httpServer.listen(port, '127.0.0.1');
