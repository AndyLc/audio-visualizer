(function() {
    var app = angular.module("audio-visualizer");
    var GameController = function($scope, $rootScope, $http, ngAudio) {
        /* things to pull
        $scope.audio,
        $scope.
        */
        $scope.audioState = 'Play track';
        var searchTracks = function(title) {
            $http.get('/tracks')
                .then(function successCallback(response) {
                    $scope.searchedTracks = response.data;
                });
        }
        searchTracks();
        $scope.selectTrack = function(track) {
          $scope.audio = ngAudio.load(track.source);
          $scope.duration = track.duration;
          $scope.notes = prepareNotes(track.notes);
          console.log($scope.notes);
          sendAnimationData($scope.notes, $scope.audio);
          $scope.upcomingnotes = $scope.notes;
          $scope.name = track.name;
          $scope.artists = track.artists;
        }
        var prepareNotes = function(rawNotes) {
          rawNotes.forEach(function(note) {
            note['letter'] = 'i';
            note['passed'] = false;
            note['missedTime'] = 0;
            note['animationTime'] = note.time * $scope.duration;
          })
          rawNotes.push({
            'letter': 'none',
            'passed': false,
            'missedTime': 0,
            'time': '0'
          })
          rawNotes.sort(function(a, b){
              return a.time - b.time;
          })
          return rawNotes;
        }
        $scope.startGame = function() {
          if($scope.audio.paused) {
            $scope.audio.play();
            startAnimations();
            $scope.audioState = 'Pause track';
            recordGameData();
          } else {
            $scope.audio.pause();
            stopAnimations();
            $scope.audioState = 'Play track';
            pauseGameData();
          }
        }
        var animation;
        var recordGameData = function() {
          if($scope.upcomingnotes.length == 1) {
            return;
          }
          if ($scope.upcomingnotes[1].time < $scope.audio.progress) {
            $scope.upcomingnotes = $scope.upcomingnotes.splice(1);
          }
          animation = requestAnimationFrame(recordGameData);
        }
        var pauseGameData = function() {
          cancelAnimationFrame(animation);
        }
        $rootScope.$on('keypress', function (evt, obj, key) {
          if(!$scope.audio.paused && $scope.upcomingnotes.length > 1) {
            console.log(key);
            console.log("pressedTime: ", $scope.audio.progress);
            if(Math.abs($scope.audio.progress - $scope.upcomingnotes[0].time) > Math.abs($scope.audio.progress - $scope.upcomingnotes[1].time)) {
              //if we hit it too late
              console.log("Wanted time: ", $scope.upcomingnotes[1].time);
              console.log("Error: ", $scope.audio.progress - $scope.upcomingnotes[1].time)
            } else {
              //if we hit it too soon
              console.log("Wanted time: ", $scope.upcomingnotes[0].time);
              console.log("Error: ", $scope.audio.progress - $scope.upcomingnotes[0].time);
            }
          }
        })


    }
    app.controller("GameController", ["$scope", "$rootScope", "$http", "ngAudio", GameController]);
}());
