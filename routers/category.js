const express = require("express");
const router = express.Router();
const config = require("../config");
const upload = require("../multer");
const category = require('../models/category');
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
router.get('/', checkAuth, (req, res) => {
    {
        if (req.user.role == "admin") isadmin = true;
        else isadmin = false;
    }
    let search = req.query.search;
    if(!search)
    {
        search = "";
    }
    category.getAll(search)
        .then(categories2 => {
            if (!req.query.page) {
                req.query.page = 0;
            }
            let next = +req.query.page + 1;
            let prev = +req.query.page - 1;
            let currPage = +req.query.page + 1;
            let maxPage = Math.ceil(categories2.length / 4);
            let right = true;
            let left = true;
            if (currPage == maxPage || maxPage == 1) {
                right = false;
            }
            if (currPage == 1) {
                left = false;
            }
            let categories = categories2.slice(+req.query.page * 4, +req.query.page * 4 + 4);
            const data1 = { categories, maxPage, next, prev, currPage, right, left, search, isadmin };
            res.render('categories', data1);
        })
        .catch(err => res.status(500).send(err));
});
router.get('/new', checkAuth, (req, res) => {
    {
        if (req.user.role == "admin") isadmin = true;
        else isadmin = false;
    }
    res.render('new-category', { isadmin: isadmin });
});
router.post('/new', (req, res) => {
    console.log(req);
    category.insert(req.body)
        .then(category => res.redirect("/categories/" + category.id))
        .catch(err => res.status(500).send(err));
});
router.post('/:id', (req, res) => {
    category.deleteById(req.params.id)
        .then(() => res.redirect("/categories"))
        .catch(err => res.status(500).send(err));

});
router.get('/:id', checkAuth, function (req, res) {
    {
        if (req.user.role == "admin") isadmin = true;
        else isadmin = false;
    }
    category.getById(req.params.id)
        .then(category => {
            if (typeof category === "undefined") {
                res.statusCode = 404;
                res.send(" not found");
            }
            else {
                res.render("category",
                    {
                        category: category,
                        isadmin: isadmin
                    });
            }
        })
        .catch(err => res.status(500).send(err));
});

module.exports = router;
