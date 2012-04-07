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
* Modules/Plugins - For things like drag & drop loading audio, displaying a FFT, FPS, etc

Prototype Methods
---

### Controls

All controls return `this`.

* `play()` plays the audio and begins the dance.
* `stop()` stops the madness.

### Getters

* `time()` returns the current time.
* `spectrum()` returns the frequency data array. 
* `frequency( freq [, endFreq ] )` returns the magnitude of a frequency or average over a range of frequencies.

### Sections

All section methods return `this` (CHAIN IT UP) and callbacks executed with dance instance as `this`.

* `after( t, callback )` fires callback on every frame after time `t`.
* `before( t, callback )` fires callback on every frame before time `t`.
* `between( t0, t1, callback )` fires callback on every frame between time `t0` and `t1`.
* `onceAt( t, callback )` fires callback once at time `t`.

### Bindings

Basic pub/sub to tie into the dance instance. `update` and `loaded` are predefined events called within the framework that are published on every frame (update) and on audio file load (loaded). All callbacks executed with dance instance as `this`.

* `bind( name, callback )` subscribes a callback of `name`. Can call this method several times to bind several callbacks of the same name.
* `unbind( name )` unsubscribes all callbacks of `name`.
* `trigger( name )` calls all callbacks of `name`.

### Beats

* `createBeat( frequency, threshold, decay, onBeatCallback [, offBeatCallback ] )`  creates and returns a new Dance.Beat instance. Can be toggled with the beat's `on()` and `off()` methods. Fires the `onBeatCallback` when `frequency` has a magnitude greater than the `threshold` and greater than the last beat's magnitude that decreases at the rate of `decay` on every frame. Otherwise, `offBeatCallback` is called if specified.

### Example

```javascript
  var
    dance = new Dance( "sickjams.ogg" ),
    beat = dance.createBeat( 5, 240, 0.2, function( mag ) {
      console.log('Beat!');
    }, function( mag ) {
      console.log('no beat :(');
    });

  // The onceAt callback is fired only once, at 0s in this case. This turns on our beat detection.
  dance.onceAt( 0, function() {
    beat.on();
  });

  dance.onceAt( 10, function() {
    // Let's set up some things once at 10 seconds
  }).between( 10, 60, function() {
    // After 10s, let's do something on every frame for the first minute
  }).after( 60, function() {
    // After 60s, let's get this real and map a frequency to an object's y position
    // Note that the instance of dance is bound to "this"
    object.y = this.frequency( 400 );
  }).after( 120, function() {
    // After 120s, this will be called every frame. Keep in mind, the previous 'after' will also still be called every frame, since we did not place an ending time on it
  });

  dance.play();
```

### Dependencies 

* [fft.js](https://github.com/corbanbrook/dsp.js) (only for Mozilla support for converting time-domain data to frequency data, FFT subset from dsp.js)
