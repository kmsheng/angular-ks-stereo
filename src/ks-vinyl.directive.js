(function() {
  'use strict';

  angular.module('ks.stereo')
    .directive('ksVinyl', ksVinyl);

  function ksVinyl(RADIAN, $document, ksAudio, ksHelper, ksCanvasUtil, ksAnimation, ksMathUtil) {
    return {
      restrict: 'A',
      template: '<canvas></canvas>',
      scope: {
        scale: '=',
        color: '=',
        progress: '='
      },
      // jshint maxstatements: 50
      link: function(scope, element) {

        var parent = element.parent();
        var canvasElem = element.find('canvas');
        var canvas = canvasElem[0];
        var context = canvas.getContext('2d');
        var canvasW = parent.width();
        var canvasH = parent.height();

        var $win = ksHelper.$win;
        var lastWindowWidth = $win.width();
        var lastWindowHeight = $win.height();

        var animation = new ksAnimation();

        function getRadius() {
          var side = canvasH;
          var padding = 65;
          if (canvasW < side) {
            side = canvasW;
            padding = 30;
          }
          return (side / 2) - padding;
        }

        var belt = {
          color: scope.color || {hex: '#f26046', r: 242, g: 96, b: 70},
          center: {x: 0, y: 0},
          isAnimating: false,
          radius: getRadius(),
          scale: 0,
          layerCount: 26,
          progress: scope.progress,
          stopAnalyzing: false,
          setBeltCenter: function(width, height) {
            var center = belt.center;
            var delta = 0.5;
            center.x = parseInt(width / 2, 10) + delta;
            center.y = parseInt(height / 2, 10) + delta;
          }
        };

        var canvasUtil = new ksCanvasUtil({context: context, center: belt.center, radius: belt.radius});
        var blackColor = {r: 200, g: 200, b: 200, a: 0.1};

        // adjust this number so vinyl animation won't overflow
        var layerDelta = 14687500;

        canvas.width = canvasW;
        canvas.height = canvasH;

        belt.setBeltCenter(canvasW, canvasH);

        function draw() {

          context.clearRect(0, 0, canvasW, canvasH);

          var scale = belt.scale;
          var color = belt.color;
          var beltRadius = belt.radius;
          var scaledRadius = beltRadius * scale;
          var base;
          var layerCount = belt.layerCount;

          // belt
          canvasUtil.strokeCircle({
            radius: beltRadius,
            color: blackColor,
            lineWidth: 1.5
          });

          // progress belt
          canvasUtil.strokeCircle({
            radius: beltRadius,
            radian: RADIAN * belt.progress,
            color: color,
            a: 1,
            lineWidth: 1
          });

          // draw graduation
          canvasUtil.strokeGraduation({
            radius: beltRadius,
            color: blackColor,
            lineWidth: 1.5
          });

          if (scale <= 0) {
            return;
          }

          for (var i = 0; i < layerCount; i++) {

            base = ksAudio.isPlaying() ? (10 + i) : 0;

            canvasUtil.fillCircle({
              radius: base + (scale * Math.pow(2, i)) * (beltRadius / layerDelta),
              color: color,
              a: (1 - (i / layerCount)).toFixed(2)
            });
          }

          canvasUtil.blurCircle({
            radius: 0.38 * beltRadius * scale,
            color: color,
            a: 1,
            colorStop: 0.3,
            colorAlpha: 1
          });
        }

        function inCircle(posX, posY) {
          var center = belt.center;
          var d = Math.sqrt(Math.pow(posX - center.x, 2) + Math.pow(posY - center.y, 2));
          return d < belt.radius;
        }

        var cursor = {
          mousedown: false,
          getCssClass: function() {
            var center = belt.center;
            if (cursor.inCircle(center.x, center.y, belt.radius)) {
              if (cursor.mousedown) {
                return 'cursor-closehand';
              }
              return 'cursor-openhand';
            }
            return 'cursor-default';
          },
          x: null,
          y: null,
          setPos: function(e) {
            var pos = ksHelper.getMousePos(canvas, e);
            cursor.x = pos.x;
            cursor.y = pos.y;
          },
          inCircle: function(centerX, centerY, radius) {
            return ksMathUtil.inCircle(cursor.x, cursor.y, centerX, centerY, radius);
          }
        };

        function setCursorImage() {

          var className = cursor.getCssClass();

          if (className !== canvas.className) {
            canvas.className = className;
          }
        }

        function getCentralAngle(canvas, cursor) {

          var center = belt.center;
          var radius = belt.radius;

          var l = ksMathUtil.getHypotenuse(center.x, center.y, cursor.x, cursor.y);
          var ratio = l / radius;

          var newX = ((cursor.x - center.x) / ratio) + center.x;
          var newY = (cursor.y - center.y) / ratio + center.y;

          var chord = ksMathUtil.getHypotenuse(center.x + radius, center.y, newX, newY);
          var centralAngle = Math.asin(chord / 2 / radius) / Math.PI * 360;

          if (cursor.y < center.y) {
            centralAngle = (180 - centralAngle) + 180;
          }
          return centralAngle;
        }

        function playByPercent() {

          var angle = getCentralAngle(canvas, cursor);

          var percent = angle / 360 * 100;
          if (ksAudio.isPlaying()) {
            ksAudio.playByPercent(percent);
          }
        }

        function mousedown(e) {

          cursor.setPos(e);

          if (! inCircle(cursor.x, cursor.y)) {
            return;
          }

          cursor.mousedown = true;
          setCursorImage();

          (function animate() {
            if (cursor.mousedown) {
              requestAnimationFrame(animate);
              playByPercent();
            }
          })();
        }

        function mousemove(e) {
          cursor.setPos(e);
          if (! cursor.mousedown) {
            setCursorImage();
          }
        }

        function mouseup(e) {
          cursor.mousedown = false;
          setCursorImage();
        }

        canvasElem.on('mousedown', mousedown);
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);

        scope.$watchCollection('[scale, progress]', function(newValues, oldValues) {

          var newScale = newValues[0];
          var newProgress = newValues[1];
          var oldProgress = oldValues[1];

          // handle decorator behavior
          if (newProgress > oldProgress && (! animation.isRunning())) {
            requestAnimationFrame(updateView);
          }

          if (0 === newScale) {
            setTimeout(function() {
              animation.stopAnimation();
            }, 1000 / 60);
          }
          else if (! animation.isRunning()) {
            animation.startAnimation(updateView);
          }
        });

        function onResize() {

          lastWindowWidth = $win.width();
          lastWindowHeight = $win.height();

          var newWidth = parent.width();
          if (newWidth === canvasW) {
            return;
          }
          canvasW = parent.width();
          canvas.width = canvasW;
          canvas.height = canvasH;
          belt.setBeltCenter(canvasW, canvasH);
          belt.radius = getRadius();
          draw();
        }

        var timer = null;

        $win.on('resize', function() {

          // if it's running let updateView() handle this
          if (animation.isRunning()) {
            return;
          }

          if (timer) {
            cancelAnimationFrame(timer);
            timer = null;
          }
          timer = requestAnimationFrame(function() {
            onResize();
          });
        });

        function updateView() {

          belt.scale = scope.scale;
          belt.color = scope.color;
          belt.progress = scope.progress;

          if (ksHelper.isWindowSizeChanged(lastWindowWidth, lastWindowHeight)) {
            onResize();
            return;
          }
          draw();
        }

        updateView();

        scope.$on('$destroy', function() {
          animation.stopAnimation();
          canvasElem.off('mousedown', mousedown);
          $document.off('mousemove', mousemove);
          $document.off('mouseup', mouseup);
        });
      }
    };
  }
})();
