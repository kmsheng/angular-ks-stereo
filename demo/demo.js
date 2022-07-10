(function() {

  angular.module('demoApp', ['ks.stereo']);

  angular.module('demoApp')
    .constant('Modernizr', window.Modernizr);

  angular.module('demoApp')
    .config(function(ksAudioProvider, Modernizr) {

      ksAudioProvider.defaults.src = 'demo/slumberjack-horus.mp3';
      ksAudioProvider.defaults.enableAudio = Modernizr.audio;
      ksAudioProvider.defaults.enableAudioContext = (! Modernizr.touch) && Modernizr.webaudio;
      ksAudioProvider.defaults.autoplay = false;
    });
})();
