/*globals window*/
(function() {
  'use strict';

  angular.module('ks.stereo')
    .factory('ksCanvasUtil', ksCanvasUtil);

  function ksCanvasUtil(RADIAN, ksHelper, ksMathUtil) {

    return function(options) {

      options = options || {};

      var self = this;

      self.context = options.context;
      self.radius = options.radius || 235;
      self.center = options.center || {x: 0, y: 0};

      return {
        strokeCircle: strokeCircle,
        blurCircle: blurCircle,
        fillCircle: fillCircle,
        strokeGraduation: strokeGraduation
      };

      function strokeGraduation(options) {

        options = angular.extend({
          radius: self.radius,
          center: self.center,
          color: {r: 255, g: 255, b: 255, a: 1},
          lineWidth: 1
        }, options);

        var context = self.context;
        var center = options.center;
        var color = options.color;
        var centerX = center.x;
        var centerY = center.y;

        context.beginPath();
        context.strokeStyle = ksHelper.getRgbaStr(color.r, color.g, color.b, color.a);
        context.lineWidth = options.lineWidth;

        var count = 200;
        var piece = 360 / count;
        var graduationLength = 7;

        var radius = options.radius + 10;

        for (var i = 1; i <= count; i++) {

          var point = ksMathUtil.getPointByAngle(centerX, centerY, radius, RADIAN * ((piece * i) / 360));
          var secondPoint = ksMathUtil.getPointByAngle(centerX, centerY, radius + graduationLength, RADIAN * ((piece * i) / 360));

          context.moveTo(point.x, point.y);
          context.lineTo(secondPoint.x, secondPoint.y);
        }
        context.stroke();
      }

      function strokeCircle(options) {

        options = angular.extend({
          center: self.center,
          radius: self.radius,
          radian: RADIAN,
          color: {r: 255, g: 255, b: 255, a: 1},
          lineWidth: 1
        }, options);

        var center = options.center;
        var color = options.color;
        var a = options.a ? options.a : color.a;
        var context = self.context;

        context.beginPath();
        context.lineWidth = options.lineWidth;
        context.strokeStyle = ksHelper.getRgbaStr(color.r, color.g, color.b, a);
        context.arc(center.x, center.y, options.radius, 0, options.radian);
        context.stroke();
      }

      function blurCircle(options) {

        options = angular.extend({
          context: null,
          radius: self.radius,
          radian: RADIAN,
          center: self.center,
          color: {r: 255, g: 255, b: 255, a: 1},
          colorStop: 0.5,
          colorAlpha: 0.5
        }, options);

        var context = self.context;
        var color = options.color;
        var r = color.r;
        var g = color.g;
        var b = color.b;
        var a = options.a ? options.a : color.a;

        var radius = options.radius;
        var center = options.center;
        var centerX = center.x;
        var centerY = center.y;
        var radgrad = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

        radgrad.addColorStop(0, ksHelper.getRgbaStr(r, g, b, a));
        radgrad.addColorStop(options.colorStop, ksHelper.getRgbaStr(r, g, b, options.colorAlpha));
        radgrad.addColorStop(1, ksHelper.getRgbaStr(r, g, b, 0));

        context.beginPath();
        context.fillStyle = radgrad;
        context.arc(centerX, centerY, radius, 0, options.radian);
        context.fill();
      }

      function fillCircle(options) {

        options = angular.extend({
          radius: self.radius,
          radian: RADIAN,
          center: self.center,
          color: {r: 255, g: 255, b: 255, a: 1}
        }, options);

        var context = self.context;
        var color = options.color;
        var a = options.a ? options.a : color.a;
        var center = options.center;

        context.beginPath();
        context.fillStyle = ksHelper.getRgbaStr(color.r, color.g, color.b, a);
        context.arc(center.x, center.y, options.radius, 0, options.radian);
        context.fill();
      }

    };
  }
})();
