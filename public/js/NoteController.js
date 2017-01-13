(function() {
  var app = angular.module("audio-visualizer");
  var NoteController = function($scope, $rootScope, $http, ngAudio) {
    var noteId = 0;
    $scope.Math = window.Math;
    $scope.notes = [];
    $scope.progress = 0;
    $scope.audioState = "Play track";
    $scope.query = "";
    $scope.cursorTimeIndication = 0;
    $scope.tracks = [];
    var timeline = angular.element(document.getElementById("timeline"))[0];
    var timelineContent = angular.element(document.getElementById("timeline-content"))[0];
    var timelineContentOffset = timelineContent.getBoundingClientRect().left;

    $scope.setCursorIndication = function(e) {
      var relX = e.pageX - timelineContentOffset;
      $scope.cursorTimeIndication = Math.round((relX + timeline.scrollLeft) * 10000 / timelineContent.clientWidth)/100;
    }
    $scope.changeTime = function(e) {
      var time = (e.pageX - timelineContentOffset + timeline.scrollLeft) / timelineContent.clientWidth;
      $scope.audio.progress = time;
    }
    $scope.cursorCreateNote = function(e) {
      var time = (e.pageX - timelineContentOffset + timeline.scrollLeft) / timelineContent.clientWidth;
      createNote(noteId, time, 0, true);
    }
    $rootScope.$on('keypress', function (evt, obj, key) {
      if(key == "m") {
        createNote(noteId, $scope.audio.progress , 0, true);
      }
    })
    $scope.deleteNote = function(note) {
      var index = $scope.notes.indexOf(note);
      $scope.notes.splice(index, 1);
    }
    var createNote = function(id, time, volume, m=false) {
      //this is the JS object
      var noteObject = {
        id: id,
        time: time,
        volume: volume,
        selected: "",
        m: m
      };
      noteId++;
      $scope.notes.push(noteObject);
    }
    $scope.select = function(note) {
      note.selected = "selected";
    }
    $scope.deselect = function(note) {
      note.selected = "";
    }
    var spotifyApi = new SpotifyWebApi();
    spotifyApi.getToken().then(function(response) {
        spotifyApi.setAccessToken(response.token);
    })
    $scope.getSpotifyData = function() {
        spotifyApi.searchTracks(
                $scope.query.trim(), {
                    limit: 1
                })
            .then(function(results) {
                var track = results.tracks.items[0];
                var previewUrl = track.preview_url;
                $scope.source = previewUrl;
                $scope.audio = ngAudio.load(previewUrl);
                var request = new XMLHttpRequest();
                request.open('GET', previewUrl, true);
                request.responseType = 'arraybuffer';
                request.onload = function() {
                    var OfflineContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
                    var offlineContext = new OfflineContext(2, 30 * 44100, 44100);

                    offlineContext.decodeAudioData(request.response, function(buffer) {
                        var source = offlineContext.createBufferSource();
                        source.buffer = buffer;
                        var lowpass = offlineContext.createBiquadFilter();
                        lowpass.type = "lowpass";
                        lowpass.frequency.value = 150;
                        lowpass.Q.value = 1;
                        source.connect(lowpass);
                        var highpass = offlineContext.createBiquadFilter();
                        highpass.type = "highpass";
                        highpass.frequency.value = 100;
                        highpass.Q.value = 1;
                        lowpass.connect(highpass);
                        highpass.connect(offlineContext.destination);
                        source.start(0);
                        offlineContext.startRendering();
                    });

                    offlineContext.oncomplete = function(e) {
                        $scope.notes = [];
                        var buffer = e.renderedBuffer;
                        var peaks = getPeaks([buffer.getChannelData(0), buffer.getChannelData(1)]);
                        var groups = getIntervals(peaks);

                        peaks.forEach(function(peak) {
                          createNote(noteId, peak.position/buffer.length, peak.volume);
                        })
                        var top = groups.sort(function(intA, intB) {
                            return intB.count - intA.count;
                        }).splice(0, 5);
                        $scope.name = track.name;
                        $scope.artists = track.artists.map(function(artist) {return artist.name}).join(", ");
                        result.style.display = 'block';
                    };
                };
                request.send();
            });
    }
    $scope.updatePlayLabel = function() {
      if($scope.audio.paused) {
        $scope.audio.play();
        $scope.audioState = 'Pause track';
      } else {
        $scope.audio.pause();
        $scope.audioState = 'Play track';
      }
    }
    function getPeaks(data) {

        // What we're going to do here, is to divide up our audio into parts.

        // We will then identify, for each part, what the loudest sample is in that
        // part.

        // It's implied that that sample would represent the most likely 'beat'
        // within that part.

        // Each part is 0.5 seconds long - or 22,050 samples.

        // This will give us 60 'beats' - we will only take the loudest half of
        // those.

        // This will allow us to ignore breaks, and allow us to address tracks with
        // a BPM below 120.

        var partSize = 22050,
            parts = data[0].length / partSize,
            peaks = [];
        for (var i = 0; i < parts; i++) {
            var max = 0;
            for (var j = i * partSize; j < (i + 1) * partSize; j++) {
                var volume = Math.max(Math.abs(data[0][j]), Math.abs(data[1][j]));
                if (!max || (volume > max.volume)) {
                    max = {
                        position: j,
                        volume: volume
                    };
                }
            }
            peaks.push(max);
        }

        // We then sort the peaks according to volume...

        peaks.sort(function(a, b) {
            return b.volume - a.volume;
        });

        // ...take the loundest half of those...

        peaks = peaks.splice(0, peaks.length * 0.5);

        // ...and re-sort it back based on position.

        peaks.sort(function(a, b) {
            return a.position - b.position;
        });

        return peaks;
    }
    function getIntervals(peaks) {

        // What we now do is get all of our peaks, and then measure the distance to
        // other peaks, to create intervals.  Then based on the distance between
        // those peaks (the distance of the intervals) we can calculate the BPM of
        // that particular interval.

        // The interval that is seen the most should have the BPM that corresponds
        // to the track itself.

        var groups = [];

        peaks.forEach(function(peak, index) {
            for (var i = 1;
                (index + i) < peaks.length && i < 10; i++) {
                var group = {
                    tempo: (60 * 44100) / (peaks[index + i].position - peak.position),
                    count: 1
                };

                while (group.tempo < 90) {
                    group.tempo *= 2;
                }

                while (group.tempo > 180) {
                    group.tempo /= 2;
                }

                group.tempo = Math.round(group.tempo);

                if (!(groups.some(function(interval) {
                        return (interval.tempo === group.tempo ? interval.count++ : 0);
                    }))) {
                    groups.push(group);
                }
            }
        });
        return groups;
    }
    function prepareData() {
      var processedNotes = [];
      $scope.notes.forEach(function(note) {
        processedNotes.push({
          time: note.time,
          volume: note.volume,
          m: note.m
        });
      })
      var track = {
        name: $scope.name,
        artists: $scope.artists,
        source: $scope.source,
        duration: $scope.audio.duration,
        notes: processedNotes
      }
      console.log(track);
      return track;
    }
    $scope.submitTrackData = function() {
      $http.post('/tracks/create', {track: prepareData()})
        .then(function successCallback(response) {
          $scope.notes = [];
          $scope.audio = null;
        }, function errorCallback(response) {
          console.log(response);
        });
    }

    var getTracks = function() {
      $http.get('/users/mytracks')
        .then(function successCallback(response) {
            data = response.data;
            $scope.tracks = response.data;
          });
    }
    var getCurrentTrack = function() {
      if(document.getElementById('data')) {
        var id = document.getElementById('data').dataset.id;
          $http.get('/tracks/' + id)
            .then(function successCallback(response) {
              $scope.name = response.data.name;
              $scope.artists = response.data.artists;
              $scope.notes = response.data.notes;
              $scope.audio = ngAudio.load(response.data.source);
              $scope.source = response.data.source;
            })
      }
    }
    getTracks();
    getCurrentTrack();
    $scope.updateTrackData = function() {
      $http.post('/tracks/' + document.getElementById('data').dataset.id + '/update', {track: prepareData()})
        .then(function successCallback(response) {
        }, function errorCallback(response) {
          console.log(response);
        });
    }
  }
  app.controller("NoteController", ["$scope", "$rootScope", "$http", "ngAudio", NoteController]);
}());
