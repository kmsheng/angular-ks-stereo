(function() {
  'use strict';

  angular.module('ks.stereo')
    .factory('ksAnimation', ksAnimation);

  function ksAnimation() {

    return function() {

      var self = this;

      self.timer = null;

      self.startAnimation = function(fn) {
        (function animate() {
          self.timer = requestAnimationFrame(animate);
          fn();
        })();
      };

      self.stopAnimation = function() {
        if (self.timer) {
          cancelAnimationFrame(self.timer);
        }
        self.timer = null;
      };

      self.isRunning = function() {
        return null !== self.timer;
      };
    };
  }
})();
