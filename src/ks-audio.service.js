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
      imagePath: '/assets/images',
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
        return ksAudio.audio.play();
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
