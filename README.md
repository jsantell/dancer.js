dancer.js
======

dancer.js is a high-level audio API, usable with both Mozilla's Audio Data API and Web Audio API with flash fallback, designed to make sweet visualizations.

http://jsantell.github.com/dancer.js

_v0.4.0 (2/2/2014)_

Features
---
* Use real-time audio waveform and frequency data and map it to any arbitrary visualization
* Use Dancer to get audio data from any preexisting audio source
* Leverage kick detection into your visualizations
* Simple API to time callbacks and events to any section of a song
* Supports Web Audio (webkit/mozilla), Audio Data (mozilla) and flash fallback (v9+)
* Extensible framework supporting plugins and custom behaviours

Dancer Instance Methods
---

### Setup

* `load( source )` specifies the audio source for the dancer instance. `source` can either be an audio element, or an object with a `src` property and an optional `codecs` array. While the audio element source is recommended to use with other players, if you specify a config object, the `src` property can either be a string of the audio path, or a string of the audio path, without the file extension, if you specify a codec array to work across multiple audio implementations. Examples of input:
```
  var dancer = new Dancer();

  // Using an audio object
  var a = new Audio();
  a.src = 'somesong.mp3';
  dancer.load( a );

  // Using an audio element on the page
  dancer.load( document.getElementsByTagName('audio')[0] );

  // Using a config object and you only have one encoding
  dancer.load({ src: 'somesong.mp3' });

  // Using a config object, and you have an ogg and mp3 version
  dancer.load({ src: 'somesong', codecs: [ 'ogg', 'mp3' ]});
```

### Controls

All controls return `this`. If provided an audio element as the source, one can also control the audio through that, or can access the audio element in the `audio` property on the dancer instance.

* `play()` plays the audio and begins the dance.
* `pause()` pauses the madness.
* `setVolume()` sets the player's current volume.

### Getters

* `getVolume()` returns a normalized value (0 to 1) of the current volume.
* `getTime()` returns the current time.
* `getProgress()` returns the downloading progress as a float from 0 to 1.
* `getWaveform()` returns the waveform data array (Float32Array(1024))
* `getSpectrum()` returns the frequency data array (Float32Array(512)). 
* `getFrequency( freq [, endFreq ] )` returns the magnitude of a frequency or average over a range of frequencies.
* `isLoaded()` returns a boolean value for the dancer instance's song load state.
* `isPlaying()` returns a boolean value indicating whether the dancer instance's song is currently playing or not.

### Sections

All section methods return `this` (CHAIN IT UP) and callbacks executed with `this` referencing the dancer instance.

* `after( t, callback )` fires callback on every frame after time `t`.
* `before( t, callback )` fires callback on every frame before time `t`.
* `between( t0, t1, callback )` fires callback on every frame between time `t0` and `t1`.
* `onceAt( t, callback )` fires callback once at time `t`.

### Bindings

Basic pub/sub to tie into the dancer instance. `update` and `loaded` are predefined events called within the framework that are published on every frame (update) and on audio file load (loaded). All callbacks executed with `this` referencing the dancer instance.

* `bind( name, callback )` subscribes a callback of `name`. Can call this method several times to bind several callbacks of the same name.
* `unbind( name )` unsubscribes all callbacks of `name`.
* `trigger( name )` calls all callbacks of `name`.

### Kick

Kicks are detected when the amplitude (normalized values between 0 and 1) of a specified frequency, or the max amplitude over a range, is greater than the minimum threshold, as well as greater than the previously registered kick's amplitude, which is decreased by the decay rate per frame.

* `createKick( options )` creates a new kick instance tied to the dancer instance, with an options object passed as an argument. Options listed below.
  * `frequency` the frequency (element of the spectrum) to check for a spike. Can be a single frequency (number) or a range (2 element array) that uses the frequency with highest amplitude. Default: `[ 0, 10 ]`
  * `threshold` the minimum amplitude of the frequency range in order for a kick to occur. Default: `0.3`
  * `decay` the rate that the previously registered kick's amplitude is reduced by on every frame. Default: `0.02`
  * `onKick` the callback to be called when a kick is detected.
  * `offKick` the callback to be called when there is no kick on the current frame.

Dancer Static Methods
---

* `addPlugin( name, fn )` registers a plugin of `name` with initiation function `fn` -- described in more detail below
* `isSupported()` returns a string of `webaudio`, `audiodata` or `flash` indicating level of support. Returns an empty string if the browser doesn't support any of the methods. Can also return `null` when browser does not support typed arrays.
* `canPlay( type )` returns either `true` or `false` indicating whether the browser supports playing back audio of type `type`, which can be a string of `'mp3'`, `'ogg'`, `'wav'`, or `'aac'`.
* `setOptions( options )` takes a set of key-value pairs in an object for options. Options below.
* `version` not a method, but a property of the Dancer object to return a string of the current Dancer version

### Dancer Options

* `flashSWF` The path to soundmanager2.swf. Required for flash fallback.
* `flashJS` The path to soundmanager2.js. Required for flash fallback.



Kick Instance Methods
---

These methods can be called on a kick instance to turn on and off the registered callbacks

* `on()` turns on the kick instance's callbacks and detections
* `off()` turns off the kick instance's callbacks and detections
* `set( options )` can pass in an object literal with the 5 kick options, similar to creating a new kick option

Example
---

For simple examples, check out the `examples/` folder -- both the FFT and waveform examples are straight forward, leveraging the corresponding plugins for visualizations.

```javascript
  // To enable flash fallback, specify the paths for the flashSWF and flashJS
  Dancer.setOptions({
    flashJS  : '../../lib/soundmanager2.js',
    flashSWF : '../../lib/soundmanager2.swf'
  });

  var
    audio  = document.getElementsByTagName('audio')[0],
    dancer = new Dancer(),
    kick = dancer.createKick({
      onKick: function ( mag ) {
        console.log('Kick!');
      },
      offKick: function ( mag ) {
        console.log('no kick :(');
      }
    });

  // Let's turn this kick on right away
  kick.on();

  dancer.onceAt( 10, function() {
    // Let's set up some things once at 10 seconds
  }).between( 10, 60, function() {
    // After 10s, let's do something on every frame for the first minute
  }).after( 60, function() {
    // After 60s, let's get this real and map a frequency to an object's y position
    // Note that the instance of dancer is bound to "this"
    object.y = this.getFrequency( 400 );
  }).onceAt( 120, function() {
    // After 120s, we'll turn the kick off as another object's y position is still being mapped from the previous "after" method
    kick.off();
  }).load( audio ); // And finally, lets pass in our Audio element to load

  dancer.play();
```

Requirements
----

**HTML5 Playback with Web Audio or Audio Data** Chrome and Firefox are both supported out of the box -- other browsers will need to leverage the flash fallback until either of these APIs are implemented.

**Safari 6 Web Audio API** While Safari 6 does have the Web Audio API, it doesn't currently support processing audio from a media element source. Falls back to flash.

**To enable flash** You must set Dancer's defaults for `flashSWF` with the path to the `soundmanager2.swf` and `flashJS` to the path to `soundmanager2.js`, both found in `lib/`. Flash player 9 is required, and you must provide an mp3 option. Waveform data in Flash is a 1024 Float32Array, but only the first 512 elements have values due to flash's computeSpectrum method.

**Uint32Array and Float32Array are required** Include a shim if you'd like to support browsers that do not have these typed arrays.

Dependencies
---

* [dsp.js](https://github.com/corbanbrook/dsp.js/) - A subset of dsp.js (fft) is used for Fast Fourier Transformations ( Included in packaged Dancer )
* [flash_detect](http://www.featureblend.com/javascript-flash-detection-library.html) - flash detect is used for immediate flash detection ( Included in packaged Dancer )
* [soundmanager2](https://github.com/scottschiller/SoundManager2) - soundmanager2 is used for flash fallback ( found in `lib/`, asynchronously loaded )

Extending/Plugins
---

You can extend the Dancer prototype by calling the static method `addPlugin( name, fn )`, which extends the Dancer prototype. A Dancer instance then can call the function provided in its context and subscribe to a preexisting event like `update`, or make your own. Look in the `plugins/` directory for examples. 

Development
---
This project uses [grunt](https://github.com/cowboy/grunt) to build and [jasmine](http://pivotal.github.com/jasmine/) for testing. Run `grunt` from the project root to lint and build files. A CLI for testing would be awesome, but Mozilla and WebKit implementations differ greatly -- go to `spec/index.html` in Mozilla/WebKit browsers to test. All tests should pass in Chrome and Firefox (95% of the time) -- Flash implementations are much more annoying, need to have cleaned up tests.

Change Logs
----
**v0.4.0 (1/28/2014)**
* Update to work with new Web Audio function names. Dancer now uses Web Audio in Firefox 25+.

**v0.3.2 (9/29/2012)**
* Change build process to using grunt.js

**v0.3.1 (8/13/2012)**
* Renamed `beat` to `kick` for future, true kick-detection
* Added `getProgress()` to track progress of downloaded audio file (#20)
* Added `setVolume()` and `getVolume()` as instance methods (#21)
* Added `set()` method to `kick` instance (#16), fixed ability to assign 0 to a `kick` attribute

**v0.3.0 (8/9/2012)**

* Added ability to provide an audio element as a source -- can control audio via the element, or accessed through instance's `audio` property, or through Dancer's helper controls (`play`, `pause`)
* Pulled out loading from the constructor to the instance method `load`. Can use the above mentioned audio element, or a config object with path information.
* Changed instance method `stop` to `pause`, to be more in line with audio elements
* Added example of using the audio element in `examples/audio\_element`.

**v0.2.1 (6/16/2012)**

* Added getWaveform() method and a corresponding visualization for waveforms

**v0.2.0 (6/14/2012)**

* Added flash support with soundmanager2 -- flash_detect now included in build
* Added static methods `isSupported`, `canPlay` and `setOptions`
* Added multiple audio codecs support (#7)
* Added a new simple FFT examples, both examples having feature detection and controls (#10)
* Fixed several Webkit bugs (#4, #8)

**v0.1.0 (6/3/2012)**

* Initial Web Audio/ Audio Data release
