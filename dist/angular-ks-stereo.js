(function() {
  'use strict';
  angular.module('ks.stereo', []);
})();

(function() {
  'use strict';

  angular.module('ks.stereo')
    .constant('MIN_SCALE', 0.0000001)
    .constant('RADIAN', Math.PI * 2);
})();

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

(function() {
  'use strict';

  angular.module('ks.stereo')
    .provider('ksAudio', ksAudioProvider);

  var EVENT_ONPAUSE = 'ksAudio::onPause';
  var EVENT_ONCHANGE = 'ksAudio::onChange';
  var EVENT_ONLOADEDMETADATA = 'ksAudio::onLoadedMetadata';
  var EVENT_ONLOADSTART = 'ksAudio::onLoadStart';
  var EVENT_ONLOADEDDATA = 'ksAudio::onLoadedData';
  var EVENT_ONERROR = 'ksAudio::onError';

  function ksAudioProvider() {

    var colors = [
      {hex: '#f26046', r: 242, g: 96, b: 70},
      {hex: '#ef8345', r: 239, g: 131, b: 69},
      {hex: '#FF8200', r: 255, g: 130, b: 0},
      {hex: '#f9b300', r: 249, g: 179, b: 0},
      {hex: '#FCD200', r: 252, g: 210, b: 0},
      {hex: '#91bc01', r: 145, g: 188, b: 1},
      {hex: '#80BD01', r: 128, g: 189, b: 1},
      {hex: '#40CE6D', r: 64, g: 206, b: 109},
      {hex: '#00e2db', r: 0, g: 226, b: 219},
      {hex: '#00BEE0', r: 0, g: 190, b: 224},
      {hex: '#00AAE5', r: 0, g: 170, b: 229}
    ];

    var defaults = this.defaults = {
      src: null,
      autoplay: false,
      enableAudio: true,
      enableAudioContext: true,
      colors: colors
    };

    this.$get = function($rootScope, ksEnableAudioContext) {

      var ksAudio = {};

      ksAudio.defaults = defaults;

      if (! defaults.enableAudio) {
        return;
      }

      ksAudio.audio = new Audio();
      ksAudio.audio.autoplay = !! defaults.autoplay;
      ksAudio.audioEnabled = true;
      ksAudio.audio.controls = true;
      ksAudio.audio.loop = true;

      if (defaults.src) {
        ksAudio.audio.src = defaults.src;
      }

      ksAudio.percent = 0;
      ksAudio.progress = 0;

      ksAudio.play = function() {
        return ksAudio.context.resume()
          .then(() => ksAudio.audio.play());
      };

      ksAudio.playByPercent = function(percent) {
        ksAudio.audio.currentTime = ksAudio.audio.duration * (percent / 100);
        if (! ksAudio.isPlaying()) {
          ksAudio.play();
        }
      };

      ksAudio.playByCurrentTime = function(currentTime) {
        ksAudio.audio.currentTime = currentTime;
        if (! ksAudio.isPlaying()) {
          ksAudio.play();
        }
      };

      ksAudio.isPlaying = function() {
        return ! ksAudio.audio.paused;
      };

      ksAudio.pause = function() {
        ksAudio.audio.pause();
      };

      ksAudio.toggle = function() {
        if (ksAudio.audio.paused) {
          return ksAudio.play();
        } else {
          return ksAudio.pause();
        }
      };

      ksAudio.audio.addEventListener('error', function(e) {
        $rootScope.$broadcast(EVENT_ONERROR, e);
      });

      ksAudio.audio.addEventListener('loadstart', function() {
        $rootScope.$broadcast(EVENT_ONLOADSTART);
      });

      ksAudio.audio.addEventListener('loadeddata', function() {
        $rootScope.$broadcast(EVENT_ONLOADEDDATA);
      });

      ksAudio.audio.addEventListener('play', function() {
        ksAudio.change();
      }, false);

      ksAudio.audio.addEventListener('pause', function() {
        ksAudio.change();
        $rootScope.$broadcast(EVENT_ONPAUSE);
      }, false);

      ksAudio.change = function() {
        $rootScope.$broadcast(EVENT_ONCHANGE);
      };

      ksAudio.onError = function(scope, cb) {
        scope.$on(EVENT_ONERROR, cb);
      };

      ksAudio.onChange = function(scope, cb) {
        scope.$on(EVENT_ONCHANGE, cb);
      };

      ksAudio.onPause = function(scope, cb) {
        scope.$on(EVENT_ONPAUSE, cb);
      };

      ksAudio.setProgress = function() {
        ksAudio.progress = ksAudio.audio.currentTime / ksAudio.audio.duration;

        if (! ksAudio.progress) {
          ksAudio.progress = 0;
        }
      };

      ksAudio.onLoadStart = function(scope, cb) {
        scope.$on(EVENT_ONLOADSTART, cb);
      };

      ksAudio.onLoadedData = function(scope, cb) {
        scope.$on(EVENT_ONLOADEDDATA, cb);
      };

      ksAudio.onLoadedMetadata = function(scope, cb) {
        scope.$on(EVENT_ONLOADEDMETADATA, cb);
      };

      ksAudio.loadedMetadata = function() {
        ksAudio.setProgress();
        $rootScope.$broadcast(EVENT_ONLOADEDMETADATA);
      };

      ksAudio.audio.addEventListener('loadedmetadata', ksAudio.loadedMetadata);

      ksAudio.getColorByPercent = function(percent) {
        var index = parseInt(percent / (100 / defaults.colors.length), 10);
        return defaults.colors[index];
      };

      if (defaults.enableAudioContext) {
        ksAudio = ksEnableAudioContext(ksAudio);
      }

      return ksAudio;
    };
  }
})();

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
  ksCanvasUtil.$inject = ["RADIAN", "ksHelper", "ksMathUtil"];
})();

(function() {
  'use strict';

  angular.module('ks.stereo')
    .service('ksDetector', ksDetector);

  function ksDetector() {

    var self = this;
    var ua = navigator.userAgent.toLowerCase();

    self.isSafari = (-1 === ua.indexOf('chrome')) && (ua.indexOf('safari') > -1);
  }

})();

/*globals window*/
(function() {
  'use strict';

  angular.module('ks.stereo')
    .factory('ksEnableAudioContext', ksEnableAudioContext);

  function ksEnableAudioContext($window, $rootScope, ksDetector, ksHelper) {

    var EVENT_ONUPDATE = 'audioContext::onUpdate';

    return function(self) {

      self.AudioContext = $window.AudioContext || $window.webkitAudioContext;
      self.numBands = 128;
      self.maxFrequency = 177;

      self.context = new self.AudioContext();

      // NOTE: createScriptProcessor method is DEPRECATED, as it is intended to be replaced by createAudioWorker.
      // http://webaudio.github.io/web-audio-api
      self.jsNode = self.context.createScriptProcessor(512, 1, 1);

      self.analyser = self.context.createAnalyser();
      self.analyser.smoothingTimeConstant = 0.75;
      self.analyser.fftSize = self.numBands * 2;
      self.analyser.minDecibels = -100;
      self.analyser.maxDecibels = -30;

      self.source = self.context.createMediaElementSource(self.audio);
      self.source.connect(self.analyser);
      self.analyser.connect(self.jsNode);
      self.jsNode.connect(self.context.destination);
      self.source.connect(self.context.destination);

      self.bands = new Uint8Array(self.analyser.frequencyBinCount);

      self.jsNode.onaudioprocess = function() {

        if (! self.isPlaying()) {
          return;
        }

        self.analyser.getByteFrequencyData(self.bands);

        self.setProgress();
        self.percent = parseInt(self.progress * 100, 10);

        if (ksDetector.isSafari) {
          self.scale = 0.3;
        } else {
          var avg = ksHelper.getAverage(self.bands);
          self.scale = avg / self.maxFrequency;
        }
        self.update();
      };

      self.update = function(args) {
        $rootScope.$broadcast(EVENT_ONUPDATE, args);
      };

      self.onUpdate = function(scope, cb) {
        scope.$on(EVENT_ONUPDATE, function(event, data) {
          cb(data);
        });
      };

      self.audioContextEnabled = true;

      return self;
    };
  }
  ksEnableAudioContext.$inject = ["$window", "$rootScope", "ksDetector", "ksHelper"];

})();

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
  ksHelper.$inject = ["$window"];

})();

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

/*globals window*/
(function() {
  'use strict';

  angular.module('ks.stereo')
    .service('ksMusicControlButton', ksMusicControlButton);

  function ksMusicControlButton($rootScope) {

    var self = this;
    var EVENT_ONMOUSEDOWN = 'ksMusicControlButton::mousedown';
    var EVENT_ONMOUSEUP = 'ksMusicControlButton::mouseup';

    self.mousedown = function() {
      $rootScope.$broadcast(EVENT_ONMOUSEDOWN);
    };
    self.mouseup = function() {
      $rootScope.$broadcast(EVENT_ONMOUSEUP);
    };
    self.onMousedown = function(scope, cb) {
      scope.$on(EVENT_ONMOUSEDOWN, cb);
    };
    self.onMouseup = function(scope, cb) {
      scope.$on(EVENT_ONMOUSEUP, cb);
    };
  }
  ksMusicControlButton.$inject = ["$rootScope"];

})();

(function() {
  'use strict';

  angular.module('ks.stereo')
    .service('ksThreeRenderer', ksThreeRenderer);

  function ksThreeRenderer($window) {

    var self = this;
    var webglRenderer = null;

    self.webgl = (function() {
      try {
        var canvas = document.createElement('canvas');
        return !! (window.WebGLRenderingContext && (canvas.getContext( 'webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    })();

    self.getRenderer = function(options) {

      var THREE = $window.THREE;

      if (self.webgl) {
        // http://stackoverflow.com/questions/21548247/clean-up-threejs-webgl-contexts
        // http://stackoverflow.com/questions/14970206/deleting-webgl-contexts
        if (! webglRenderer) {
          webglRenderer = new THREE.WebGLRenderer(options);
        }
        return webglRenderer;
      }
      return new THREE.CanvasRenderer(options);
    };
  }
  ksThreeRenderer.$inject = ["$window"];
})();

(function() {
  'use strict';

  angular.module('ks.stereo')
    .directive('ksIcosahedron', ksIcosahedron);

  function ksIcosahedron(ksDetector, $window, ksThreeRenderer, ksAnimation) {
    return {
      restrict: 'A',
      template: '<div class="icosahedron"></div>',
      scope: {
        scale: '=',
        color: '='
      },
      link: function(scope, element) {

        var animation = new ksAnimation();
        var renderer = ksThreeRenderer.getRenderer({alpha: true});
        var THREE = $window.THREE;
        var icosa = {
          color: scope.color.hex,
          isAnimating: false,
          stopAnalyzing: false,
          scale: scope.scale,
          rotationalSpeed: 0.3
        };
        var $win = angular.element($window);
        var parent = element.parent();
        var elementWidth = parent.width();
        var elementHeight = parent.height();

        var camera, scene;
        var geometry, material, mesh;

        var events = {
          mousedown: true,
          normal: true
        };

        function getScaleDelta() {
          if (elementWidth < elementHeight) {
            return 0.65;
          }
          return 1;
        }

        function onResize() {
          elementWidth = parent.width();
          camera.aspect = elementWidth / elementHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(elementWidth, elementHeight);
        }

        var timer = null;

        function resize() {
          if (timer) {
            cancelAnimationFrame(timer);
            timer = null;
          }
          timer = requestAnimationFrame(onResize);
        }

        $win.on('resize', resize);

        function init() {

          camera = new THREE.PerspectiveCamera(75, elementWidth / elementHeight, 1, 10000);
          camera.position.z = ksDetector.isSafari ? 330 : 460;

          scene = new THREE.Scene();

          geometry = new THREE.IcosahedronGeometry(280, 0);
          material = new THREE.MeshBasicMaterial({
              color: 0xf2f2f2,
              // https://github.com/mrdoob/three.js/issues/902
              transparent: true,
              wireframe: true
          });

          mesh = new THREE.Mesh(geometry, material);
          scene.add(mesh);

          renderer.setSize(elementWidth, elementHeight);
          element[0].appendChild(renderer.domElement);
        }

        init();

        scope.$watch('scale', function(newValue, oldValue) {

          if (0 === newValue) {
            setTimeout(function() {
              animation.stopAnimation();
            }, 1000 / 60);
          }
          else if (! animation.isRunning()) {
            animation.startAnimation(updateView);
          }
        });

        function getOpacityByScale() {
          var scale = icosa.scale;
          switch (true) {
            case scale < 0.3:
              return 0.2;
            case scale < 0.6:
              return 0.25;
            case scale < 0.9:
              return 0.3;
            default:
              return 0.5;
          }
        }

        function updateView() {

          icosa.scale = scope.scale;
          icosa.color = scope.color.hex;

          var scale = icosa.scale;
          var speed = icosa.rotationalSpeed;

          material.color.setStyle(icosa.color);
          material.opacity = getOpacityByScale();

          if (0 === scale) {
            scale = 0.00001;
          }

          mesh.rotation.x += 0.01 * speed;
          mesh.rotation.y += 0.02 * speed;

          scale *= getScaleDelta();

          mesh.scale.x = scale;
          mesh.scale.y = scale;
          mesh.scale.z = scale;

          renderer.render(scene, camera);
        }

        scope.$on('$destroy', function() {
          animation.stopAnimation();
          scene.remove(mesh);
          geometry.dispose();
          material.dispose();
          $win.off('resize', resize);
        });
      }
    };
  }
  ksIcosahedron.$inject = ["ksDetector", "$window", "ksThreeRenderer", "ksAnimation"];
})();

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
  ksMusicControl.$inject = ["ksAudio", "$document", "ksMusicControlButton"];
})();

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
  ksStereo.$inject = ["ksAudio", "ksMusicControlButton"];
})();

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
  ksVinyl.$inject = ["RADIAN", "$document", "ksAudio", "ksHelper", "ksCanvasUtil", "ksAnimation", "ksMathUtil"];
})();
