const express = require("express");
const router = express.Router();
const config = require("../config");
const upload = require("../multer");
//const user = require('../models/user');
const cloudinary = require('cloudinary');
const busboyBodyParser = require('busboy-body-parser');
const bodyParser = require('body-parser');
const user = require('../models/user');
const crypto = require('crypto');

router.use(busboyBodyParser());
//router.set('view engine', 'ejs');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(busboyBodyParser({ limit: '5mb' }));
function checkAuth(req, res, next) {
    if (!req.user) return res.sendStatus(401); // 'Not authorized'
    next();  // пропускати далі тільки аутентифікованих
}

function checkAdmin(req, res, next) {
    if (!req.user) res.sendStatus(401); // 'Not authorized'
    else if (req.user.role !== 'admin') res.sendStatus(403); // 'Forbidden'
    else next();  // пропускати далі тільки аутентифікованих із роллю 'admin'
}
router.get('/new',checkAdmin, (req, res) => {
    if (req.user.role == "admin") isadmin = true;
            else isadmin = false;
    res.render('new-user',{isadmin: isadmin});
});
router.get('/users/:id',checkAdmin, function (req, res) {
    if (req.user.role == "admin") isadmin = true;
    else isadmin = false;
    const user_id = req.params.id;
    user.getById(user_id)
        .then(user => {
            if (typeof user === "undefined") {
                res.statuapp.post('/new',/*upload.single('fileurl'),async*/(req, res) => {
                    // console.log(req);
                    // const result = await cloudinary.v2.uploader.upload(req.file.path);
                    // let filename = "/"+req.file.path;
                    //console.log(req.body);
                    let fileObject = req.files.fileurl;
                    let fileBuffer = fileObject.data;
                    cloudinaryUploadPromise(fileBuffer, { resource_type: 'raw' })
                        .then(result => {
                            let image = result.url;
                            article.insert(image, req.body)
                                .then(article => res.redirect("/articles/" + article.id))
                                .catch(err => res.status(500).send(err));
                        })
                        .catch(err => res.status(500).send(err));
                });sCode = 404;
                res.send("User not found");
            }
            else {
                res.render("user",
                    {
                        user: user,
                        isadmin: isadmin
                    });
            }
        })
        .catch(err => res.status(500).send(err));

});
router.post('/new', (req, res) => {

    // let filename = "/"+req.file.path;
    //console.log(req.body);
    let fileObject = req.files.fileurl;
    let fileBuffer = fileObject.data;
    cloudinaryUploadPromise(fileBuffer, { resource_type: 'raw' })
        .then(result => {
            let image = result.url;
            user.insert(image, req.body)
                .then(user => res.redirect("/users/" + user.id))
                .catch(err => res.status(500).send(err));
        })
        .catch(err => res.status(500).send(err));

});

router.get('/',checkAdmin, function (req, res) {
    if (req.user.role == "admin") isadmin = true;
            else isadmin = false;
    user.getAll()
        .then(users => res.render("users",
            {
                users: users,
                isadmin: isadmin
            }))
        .catch(err => res.status(500).send(err));
});
module.exports = router;