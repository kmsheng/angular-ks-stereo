# ks-stereo [![Build Status](https://travis-ci.org/kmsheng/ks-stereo.svg?branch=master)](https://travis-ci.org/kmsheng/ks-stereo)

AngularJS Audio Visualization

<img src="https://raw.githubusercontent.com/kmsheng/angular-ks-stereo/master/images/audio-player.png?v=1" alt="">

# Demo
<a href="http://kmsheng.github.io/angular-ks-stereo" target="_blank">http://kmsheng.github.io/ks-stereo</a>


## Requirements

- jQuery
- AngularJS
- three.js
- Modernir ( optional )


## Browser Support

* Chrome
* Firefox
* Safari ( partially )

## Quick Configuration
```sh
bower install ks-stereo
```

This will copy the ks-stereo files into a `bower_components` folder, along with its dependencies. Load the script files in your application:

```html
<script src="bower_components/ks-stereo/dist/angular-ks-stereo.js"></script>
```

```javascript
angular.module('yourApp', ['ks.stereo']);
```

## ksAudio provider

```javascript
angular.module('demoApp')
  .config(function(ksAudioProvider, Modernizr) {

    // define the music path
    ksAudioProvider.defaults.src = 'demo/slumberjack-horus.mp3';

    // whether to enable Audio
    ksAudioProvider.defaults.enableAudio = Modernizr.audio;

    // whether to enable AudioConext
    ksAudioProvider.defaults.enableAudioContext = (! Modernizr.touch) && Modernizr.webaudio;

    // set the image path for cursor image files
    ksAudioProvider.defaults.imagePath = 'demo';

    // set the colors of vinyl
    ksAudioProvider.defaults.colors = [
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
  });
```
