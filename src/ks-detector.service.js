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
