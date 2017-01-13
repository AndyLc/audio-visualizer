var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongodb = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var User = mongoose.model('User');
module.exports = function() {
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, function(username, password, done) {
        var url = 'mongodb://localhost:27017/libraryApp';
        mongoose.connect(url, function(err, db) {
            User.findOne({
                    email: username
                },
                function(err, results) {
                    if (!results) {
                        done(null, false, {
                            message: 'Password or Email Incorrect'
                        });
                    } else {
                        User.comparePassword(password, results.password, function(err, isMatch) {
                            if (isMatch) {
                                var user = results;
                                done(null, user);
                            } else {
                                done(null, false, {
                                    message: 'Password or Email Incorrect'
                                });
                            }
                        })
                    }
                });
        });
    }));
}
