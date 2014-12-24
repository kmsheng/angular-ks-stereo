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
})();
