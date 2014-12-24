(function() {
  'use strict';

  angular.module('ks.stereo')
    .directive('ksStereo', ksStereo);

  function ksStereo(ksAudio, ksMusicControlButton) {
    return {
      restrict: 'A',
      templateUrl: '/app/components/ks-stereo.html',
      controllerAs: 'vm',
      controller: function($scope) {

        var vm = this;
        var cursor = {mousedown: false};
        var isAnimating = false;

        vm.stereo = {
          scale: 0,
          progress: 0,
          color: ksAudio.getColorByPercent(ksAudio.percent)
        };

        ksAudio.onLoadedMetadata($scope, function() {
          vm.stereo.color = ksAudio.getColorByPercent(ksAudio.percent);
          vm.stereo.progress = ksAudio.progress;
          $scope.$digest();
        });

        ksAudio.onUpdate($scope, function() {

          if (cursor.mousedown || isAnimating) {
            return;
          }
          vm.stereo.scale = ksAudio.scale;
          vm.stereo.color = ksAudio.getColorByPercent(ksAudio.percent);
          vm.stereo.progress = ksAudio.progress;
          $scope.$digest();
        });

        var enlargedScale = 1.2;

        function enlarge() {

          if (vm.stereo.scale <= 0) {
            return;
          }
          var targetSize = vm.stereo.scale * enlargedScale;
          var index = 0;

          (function enlargeLoop() {
            if (vm.stereo.scale < targetSize && cursor.mousedown) {
              requestAnimationFrame(enlargeLoop);
            }
            vm.stereo.scale += 0.01;
            $scope.$digest();
          })();
        }

        function shrink() {

          var index = 1;

          (function shrinkLoop() {
            if (vm.stereo.scale > 0) {
              requestAnimationFrame(shrinkLoop);
            }
            vm.stereo.scale -= 0.05 * index;
            if (vm.stereo.scale <= 0) {
              vm.stereo.scale = 0;
              isAnimating = false;
            }
            $scope.$digest();
          })();
        }

        ksMusicControlButton.onMousedown($scope, function() {
          cursor.mousedown = true;
          if (ksAudio.isPlaying()) {
            enlarge();
          }
        });

        ksMusicControlButton.onMouseup($scope, function() {
          cursor.mousedown = false;
        });

        ksAudio.onPause($scope, function() {
          shrink();
        });

      }
    };
  }
})();
