var express = require('express');
var autofillRouter = express.Router();
var mongodb = require('mongodb').MongoClient;
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Autofill = mongoose.model('Autofill');

String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};

function valuesToDictionary(initDict) {
    var length = (Object.keys(initDict).length - 3) / 2
    var template = [];
    var values = [];
    for (var key in initDict) {
        values.push(initDict[key]);
    }
    for (var i = 0; i < length; i++) {
      if(!values[i * 2 + 3].isEmpty()) {
        template.push({
            key: values[i * 2 + 3],
            value: values[i * 2 + 4]
        });
      }
    }
    return template;
}

var router = function() {
    autofillRouter.route('/')
        .get(function(req, res) {
            var currentUser;
            User.findOne({
                    email: req.user.email
                })
                .populate('autofilltemplates')
                .exec(function(err, user) {
                    currentUser = user;
                    res.render('autofill/index', {
                        autofilltemplates: currentUser.autofilltemplates
                    });
                })
        });
    autofillRouter.route('/new')
        .get(function(req, res) {
            res.render('autofill/new')
        });
    autofillRouter.route('/submitAutofill')
        .post(function(req, res) {
            User.findOne({
                    email: req.user.email
                })
                .exec(function(err, user) {
                    var template = new Autofill({
                        name: req.body.categoryName,
                        categories: valuesToDictionary(req.body),
                        user: user
                    })
                    var newAutofillList = user.autofilltemplates;
                    newAutofillList.push(template);
                    user.autofilltemplates = newAutofillList;
                    console.log(newAutofillList);
                    user.save();
                    template.save();
                    req.flash('success', 'You created the autofill template: ' + template.name);
                    res.redirect('/autofill');
                });
        })
    autofillRouter.get('/:templatename', function(req, res) {
        User.findOne({
                email: req.user.email
            })
            .populate('autofilltemplates')
            .exec(function(err, user) {
                var targettemplate;
                user.autofilltemplates.forEach(function(template) {
                    if (template.name == req.params.templatename) {
                        targettemplate = template;
                        res.render('autofill/template', {
                            template: targettemplate
                        });
                    }
                });
            })
    });
    autofillRouter.post('/:templatename/edit', function(req, res) {
        User.findOne({
                email: req.user.email
            })
            .exec(function(err, user) {
                var newTemplate = new Autofill({
                    name: req.body.categoryName,
                    categories: valuesToDictionary(req.body),
                    user: user
                })
                Autofill.update({
                    'name': req.params.templatename
                }, {
                    '$set': {
                        'name': req.body.categoryName,
                        'categories': valuesToDictionary(req.body)
                    }
                }, function(err) {
                    req.flash('success', 'You updated the autofill template: ' + newTemplate.name);
                    res.render('autofill/template', {
                        template: newTemplate
                    });
                })
            })
    })
    return autofillRouter;
}

module.exports = router;
