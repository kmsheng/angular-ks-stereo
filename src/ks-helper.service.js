(function() {
  'use strict';

  angular.module('ks.stereo')
    .service('ksHelper', ksHelper);

  function ksHelper($window) {

    var self = this;
    var $win = angular.element($window);
    var modernizr = $window.Modernizr;

    self.$win = $win;

    self.getMousePos = function(canvas, e) {
      if (modernizr && modernizr.touch) {
        e = e.originalEvent.touches[0];
      }
      var rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    self.getRgbaStr = function(r, g, b, a) {
      return 'rgba(' + [r, g, b, a].join(',') + ')';
    };

    self.isWindowHeightChanged = function(height) {
      return $win.height() !== height;
    };

    self.isWindowWidthChanged = function(width) {
      return $win.width() !== width;
    };

    self.isWindowSizeChanged = function(width, height) {
      return self.isWindowWidthChanged(width) || self.isWindowHeightChanged(height);
    };

    self.getAverage = function(arr) {

      var total = 0;
      var len = arr.length;

      for (var i = 0; i < len; i++) {
        total += arr[i];
      }
      return total / len;
    };
  }

})();
