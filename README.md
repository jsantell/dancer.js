Dance.js
======

Audio visualizer, started at [MDN's](http://twitter.com/mozhacks) NYC Hack Day, 3/24/2011
http://jsantell.github.com/dance.js

TODO
---
* Tests!!!
* Normalized frequency magnitudes (0-255 from WebKit/W3Cs standard? Very different peaks than the dsp.js's FFT in Moz)
* More streamlined example
* Better beat detection (configurable decay of highest 'beat', better threshold parameter, focuses on a range of normalized frequencies instead of one?)
* Shortcuts for frequency slicing, instead of abstract 0 - 1023?
* Clean up adapters
* Modules/Plugins - For things like drag & drop loading audio, displaying a FFT, FPS, etc
* Make script once things stablize a bit

Methods
---
* `new Dance( source )` constructor to create a dance instance, passing in a string path to the sound file.
* `play()` plays the audio and begins the dance.
* `stop()` stops the madness.
* `time()` returns the current time.
* `frequency( freq [, endFreq ] )` returns the magnitude of a frequency or average over a range of frequencies.
* `after( t, callback )` fires callback on every frame after time `t`. Returns `this`.
* `before( t, callback )` fires callback on every frame before time `t`. Returns `this`.
* `between( t0, t1, callback )` fires callback on every frame between time `t0` and `t1`. Returns `this`.
* `onceAt( t, callback )` fires callback once at time `t`. Returns `this`.
* `onBeat( frequency, threshold, onBeatCallback [, offBeatCallback ] )` fires either the onBeatCallback if the frequency's magnitude is greater than the threshold, otherwise, the offBeatCallback is fired.

### Example

```javascript
  var dance = new Dance( "sickjams.ogg" );

  // The after callback is fired on every frame after 0s, so onBeat is checked on every frame
  dance.after( 0, function() {
    dance.onBeat( 5, 0.03, function( mag ) {
      console.log('Beat!');
    }, function( mag ) {
      console.log('no beat :(');
    });
  });

  dance.onceAt( 10, function() {
    // Let's set up some things once at 10 seconds
  }).between( 10, 60, function() {
    // After 10s, let's do something on every frame for the first minute
  }).after( 60, function() {
    // After 60s, let's get this real and map a frequency to an object's y position
    object.y = dance.frequency( 400 );
  }).after( 120, function() {
    // After 120s, this will be called every frame. Keep in mind, the previous 'after' will also still be called every frame, since we did not place an ending time on it
  });

  dance.play();
```

### Dependencies 

* [fft.js](https://github.com/corbanbrook/dsp.js) (only for Mozilla support, stripped out FFT functions from dsp.js)
