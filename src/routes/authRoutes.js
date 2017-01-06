var express = require('express');
var authRouter = express.Router();
var mongodb = require('mongodb').MongoClient;
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var router = function() {
    //sign up or sign in
    authRouter.route('/new')
        .post(function(req, res) {
            var user = new User({
                email: req.body.email,
                password: req.body.password
            });
            User.createUser(user, function(err, user) {
                if (err) {
                    throw err;
                } else {
                    passport.authenticate('local', { failureFlash: true }) (req, res, function() {
                        req.flash('failure', 'This is a flash message using the express-flash module.');
                        res.redirect('/users/profile');
                    });
                }
            })
        });

    authRouter.route('/signIn')
        .post(passport.authenticate('local', {
            failureRedirect: '/auth/signin',
            failureFlash: true
        }), function(req, res) {
            req.flash('success', "You're logged in as: " + req.user.email);
            res.redirect('/users/profile');
        });

    authRouter.route("/signup")
        .get(function(req, res) {
            res.render('user/new')
        });

    authRouter.route("/signin")
        .get(function(req, res) {
            res.render('user/signin')
        });
    /*
        authRouter.route('/submit')
            .post(function(req, res) {
                res.redirect('/auth/profile/?step=1');
            });
            */
    return authRouter;
}

module.exports = router;
