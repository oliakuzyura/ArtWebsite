const express = require("express");
const router = express.Router();
const config = require("../config");
const upload = require("../multer");
const bot = require("../bot");
const article = require('../models/article');
const cloudinary = require('cloudinary');
const busboyBodyParser = require('busboy-body-parser');
const bodyParser = require('body-parser');
const user = require('../models/user');
const crypto = require('crypto');
function cloudinaryUploadPromise(fileBuffer, ...args) {
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream(...args, (err, data) => {
            if (err) return reject(err); resolve(data);
        }).end(fileBuffer);
    });
}

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
router.post('/new', (req, res) => {
    let fileObject = req.files.fileurl;
    let fileBuffer = fileObject.data;
    // console.log("djsbjdb");
    cloudinaryUploadPromise(fileBuffer, { resource_type: 'raw' })
        .then(result => {
            let image = result.url;
            article.insert(image, req.body)
                .then(article => {
                    user.getAll()
                        .then(users => {
                            for (let i = 0; i < users.length; i++) {
                                bot.sendMessage(users[i].chatId, "New article was added to our site!");
                            };
                            res.redirect("/articles/" + article.id)
                        })
                })
                .catch(err => res.status(500).send(err));
        })
        .catch(err => res.status(500).send(err));
});
router.post('/:id', (req, res) => {
    article.deleteById(req.params.id)
        .then(() => res.redirect("/articles"))
        .catch(err => res.status(500).send(err));

});
router.get('/new', (req, res) => {
    {
        if (req.user.role == "admin") isadmin = true;
        else isadmin = false;
    }
    res.render('new', { isadmin: isadmin });
});
router.get('/', checkAuth, function (req, res) {
    {
        if (req.user.role == "admin") isadmin = true;
        else isadmin = false;
    }
    let search = req.query.search;
    console.log(search);
    if (!search) {
        search = "";
    }
    article.getAll(search)
        .then(articles => {
            if (!req.query.page) {
                req.query.page = 0;
            }
            let next = +req.query.page + 1;
            let prev = +req.query.page - 1;
            let currPage = +req.query.page + 1;
            let maxPage = Math.ceil(articles.length / 4);
            let right = true;
            let left = true;
            if (currPage == maxPage || maxPage == 1) {
                right = false;
            }
            if (currPage == 1) {
                left = false;
            }
            let artcileOfArticles = articles.slice(+req.query.page * 4, +req.query.page * 4 + 4);
            const data1 = { artcileOfArticles, maxPage, next, prev, currPage, right, left, search, isadmin };
            res.render('articles', data1);
        })
        .catch(err => res.status(500).send(err));
});
router.get('/update/:id', checkAuth, (req, res) => {
    {
        if (req.user.role == "admin") isadmin = true;
        else isadmin = false;
    }
    res.render('article-update', { isadmin: isadmin });
});
router.post('/updatarticlese/:id', (req, res) => {
    let fileObject = req.files.fileurl;
    let fileBuffer = fileObject.data;
    cloudinaryUploadPromise(fileBuffer, { resource_type: 'raw' })
        .then(result => {
            let image = result.url;
            article.update(image, req.params.id, req.body)
                .then(article => res.redirect("/articles/" + article.id))
                .catch(err => res.status(500).send(err));
        })
        .catch(err => res.status(500).send(err));
});
router.get('/:id', checkAuth, function (req, res) {
    {
        if (req.user.role == "admin") isadmin = true;
        else isadmin = false;
    }
    article.getById(req.params.id)
        .then(article => {
            if (typeof article === "undefined") {
                res.statusCode = 404;
                res.send(" not found");
            }
            else {
                res.render("article",
                    {
                        article: article,
                        isadmin: isadmin
                    });
            }
        })
        .catch(err => res.status(500).send(err));
});
module.exports = router;