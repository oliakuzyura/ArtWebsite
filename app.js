const consolidate = require('consolidate');
const path = require('path');
const express = require('express');
const user = require('./models/user');
const article = require('./models/article');
const category = require('./models/category');
const app = express();
const mustache = require('mustache-express');
const busBoyBodyParser = require("busboy-body-parser");
const moment = require('moment');
const multer = require("multer");
const upload = require("./multer");
const routersAuth = require("./routers/auth");
const routerUser = require("./routers/user");
const routersCategory = require("./routers/category");
const routerArticle = require("./routers/article");
const mongoose = require('mongoose');
const config = require('./config');
const cloudinary = require("cloudinary");
const connectOptions = { useNewUrlParser: true };
const databaseUrl = config.DataBaseUrl;
const serverPort = config.ServerPort;
//console.log(databaseUrl);
//console.log(serverPort);
//app.listen(serverPort, function () { console.log('Server is ready'); });
mongoose.connect(databaseUrl, connectOptions)
    .then(() => console.log(`Database connected : ${databaseUrl}`))
    .then(() => app.listen(serverPort, function () { console.log('Server is ready'); }))
    .catch(err => console.log(`Start error: ${err}`));

cloudinary.config({
    cloud_name: config.cloud_name,
    api_key: config.api_key,
    api_secret: config.api_secret
});
function cloudinaryUploadPromise(fileBuffer, ...args) {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream(...args, (err, data) => {
            if (err) return reject(err); resolve(data);
        }).end(fileBuffer);
    });
}
app.use(busBoyBodyParser());
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// will open public/ directory files for http requests
app.use(express.static('public'));
const Path = path.join(__dirname, 'views');
app.engine('mst', mustache(path.join(Path, 'partials')));
// set app options
app.set('views', Path);
app.set('view engine', 'mst');
app.use("/", routersAuth);
app.use("/users/",routerUser);
app.use("/articles/",routerArticle);
app.use("/categories/",routersCategory);
let isadmin = false;

function checkAuth(req, res, next) {
    if (!req.user) return res.sendStatus(401); // 'Not authorized'
    next();  // пропускати далі тільки аутентифікованих
}

function checkAdmin(req, res, next) {
    if (!req.user) res.sendStatus(401); // 'Not authorized'
    else if (req.user.role !== 'admin') res.sendStatus(403); // 'Forbidden'
    else next();  // пропускати далі тільки аутентифікованих із роллю 'admin'
}
// usage
app.get('/', function (req, res) {
    if(req.user)
    {if (req.user.role == "admin") isadmin = true;
            else isadmin = false;}
    res.render('index', {isadmin: isadmin});
});

//file 
app.get('/data/fs/:file', (req, res) => {
    let curr = path.join(__dirname, "data/fs/");
    res.sendFile(curr + req.params.file);
});

app.get('/about', function (req, res) {
    if(req.user)
    {if (req.user.role == "admin") isadmin = true;
            else isadmin = false;}
    res.render('about', {isadmin: isadmin});
});

app.get('/api/users', function (req, res) {

    const users = user.getAll();
    res.setHeader('Content-Type', 'application/json');
    res.send(users);

});

app.get('/api/users/:id', function (req, res) {


    res.setHeader('Content-Type', 'application/json');
    let id = req.params.id;
    const userById = user.getById(id);
    if (userById == undefined) {

        res.statusCode = 404;
        res.end('Not Found');
    }
    else {
        res.send(userById);
    }



});
