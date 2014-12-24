/*globals window*/
(function() {
  'use strict';

  angular.module('ks.stereo')
    .service('ksMathUtil', ksMathUtil);

  function ksMathUtil() {

    var self = this;

    self.getHypotenuse = function(x1, y1, x2, y2) {
      return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    };

    self.inCircle = function(x, y, centerX, centerY, radius) {
      var d = self.getHypotenuse(x, y, centerX, centerY);
      return d < radius;
    };

    self.getPointByAngle = function(centerX, centerY, radius, angle) {
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    };

  }
})();
