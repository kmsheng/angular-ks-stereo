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

})();
