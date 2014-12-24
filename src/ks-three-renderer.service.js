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
})();
