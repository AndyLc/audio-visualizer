var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function(app) {
	app.use(passport.initialize());
	app.use(passport.session());
	passport.serializeUser(function(user, done) {
		done(null, user);
	})
	passport.deserializeUser(function(user, done) {
		User.getUserByEmail(user.email, function(err, user) {
			done(err, user);
		})
	})
	require('./strategies/local.strategy')();
};
