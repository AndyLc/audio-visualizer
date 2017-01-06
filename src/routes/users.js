var express = require('express');
var usersRouter = express.Router();
var mongodb = require('mongodb').MongoClient;
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var flash = require('express-flash');

var router = function() {
    //users index
    usersRouter.route('/')
        .get(function(req, res) {
            res.render('user/users', {
                users: users
            });
        });

    usersRouter.route('/logout')
        .get(function(req, res) {
            req.session.destroy(function() {
                res.redirect('/');
            });
        });

    usersRouter.route('/profile')
        .get(function(req, res) {
            res.render('user/profile', {
                user: req.user
            });
        });

    usersRouter.get('/changepassword', function(req, res) {
        res.render('user/changepassword', {
            user: req.user
        });
    })


    usersRouter.route('/profile/settings')
        .get(function(req, res) {
            res.render('user/settings', {
                user: req.user
            });
        });

    usersRouter.post('/edit', function(req, res) {
        User.findOne({email: req.user.email}, function(err, user) {
          user.email = req.body.email;
          user.save(function(err, user) {

          });
        });
    });



    return usersRouter;
}

module.exports = router;
