var express = require('express');
var formatterRouter = express.Router();
var mongodb = require('mongodb').MongoClient;
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var flash = require('express-flash');
var multer = require('multer');
var crypto = require('crypto');
var mime = require('mime');

var router = function() {
    //users index
    formatterRouter.route('/')
        .get(function(req, res) {
            res.render('formatter/index', {
                user: req.user
            });
        });

    var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, './public/uploads/')
        },
        filename: function(req, file, cb) {
            crypto.pseudoRandomBytes(16, function(err, raw) {
                cb(null, raw.toString('hex') + Date.now() + '.' + mime.extension(file.mimetype));
            });
        }
    });

    var upload = multer({
        storage: storage,
        limits: {
            fileSize: 1000000,
            files: 1
        }
    });

    formatterRouter.post('/submit', upload.single('pdf'), function(req, res) {
        pdf2html.toHtml('./' + req.file.path, './public/uploads/testhtml.html');
    })
    return formatterRouter;
}

module.exports = router;
