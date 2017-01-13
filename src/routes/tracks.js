var express = require('express');
var tracksRouter = express.Router();
var mongodb = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Track = mongoose.model('Track');

String.prototype.isEmpty = function() {
    return (this.length === 0 || !this.trim());
};

function handleError(err) {
    console.log("Error: " + err);
}

var router = function() {
    tracksRouter.route('/new')
        .get(function(req, res) {
            res.render('tracks/new');
        })
    tracksRouter.route('/create')
        .post(function(req, res) {
            User.findOne({
                    email: req.user.email
                })
                .exec(function(err, user) {
                    if (err) return handleError(err);
                    var track = new Track(req.body.track);
                    var newTrackList = user.tracks;
                    newTrackList.push(track);
                    user.tracks = newTrackList;
                    track.save(function(err) {
                        user.save();
                    });
                    res.sendStatus(200);
                });
        })
    tracksRouter.get('/:id/edit', function(req, res) {
        User.findOne({
                email: req.user.email
            })
            .populate('tracks')
            .exec(function(err, user) {
                user.tracks.forEach(function(track) {
                    if (track._id == req.params.id) {
                        res.render('tracks/edit', {
                            track: track
                        });
                    }
                });
            })
    });
    tracksRouter.get('/:id', function(req, res) {
        Track.findById(req.params.id, function(err, found) {
            res.send(found);
        })
    })
    tracksRouter.post('/:id/update', function(req, res) {
        User.findOne({
                email: req.user.email
            })
            .populate('tracks')
            .exec(function(err, user) {
                user.tracks.forEach(function(track) {
                    if (track._id == req.params.id) {
                        track.notes = req.body.track.notes;
                        track.duration = req.body.track.duration;
                        track.save(function(err) {
                            if (err) {
                                res.sendStatus(400);
                            } else {
                                res.sendStatus(200);
                            }
                        });
                    }
                });
            })
    })
    tracksRouter.get('/', function(req, res) {
      Track.find({}, function(err, all) {
        res.send(all);
      });
    })
    return tracksRouter;
}

module.exports = router;
