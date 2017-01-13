(function() {
  var app = angular.module("audio-visualizer", ['ngAudio']);
  app.directive('keypressEvents',
  function ($document, $rootScope) {
      return {
          restrict: 'A',
          link: function () {
              console.log('linked');
              $document.bind('keypress', function (e) {
                  $rootScope.$broadcast('keypress', e, String.fromCharCode(e.which));
              });
          }
      }
  });
}())
