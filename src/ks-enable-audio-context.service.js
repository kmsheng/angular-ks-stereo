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

})();
