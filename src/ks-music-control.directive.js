/*globals window*/
(function() {
  'use strict';

  angular.module('ks.stereo')
    .directive('ksMusicControl', ksMusicControl);

  function ksMusicControl(ksAudio, $document, ksMusicControlButton) {
    return {
      restrict: 'A',
      templateUrl: '/app/components/ks-music-control.html',
      link: function(scope, element) {

        var musicControl = {
          loading: false,
          error: false
        };

        scope.getStatus = function() {
          if (musicControl.error) {
            return 'error';
          }
          if (musicControl.loading) {
            return 'loading';
          }
          return ksAudio.isPlaying() ? 'playing' : 'paused';
        };

        scope.toggle = ksAudio.toggle;

        ksAudio.onChange(scope, function() {
          scope.$digest();
        });

        ksAudio.onLoadStart(scope, function() {
          musicControl.loading = true;
          musicControl.error = false;
        });

        ksAudio.onLoadedData(scope, function() {
          musicControl.loading = false;
          scope.$digest();
        });

        ksAudio.onError(scope, function(event, data) {
          musicControl.error = true;
          musicControl.loading = false;
          scope.$digest();
        });

        element.on('mousedown', ksMusicControlButton.mousedown);
        $document.on('mouseup', ksMusicControlButton.mouseup);
      }
    };
  }
})();
