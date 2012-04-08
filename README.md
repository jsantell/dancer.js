Dance.js
======

A JavaScript audio visualization library.
http://jsantell.github.com/dance.js

Features
---
* Use real-time audio frequency data and map it to any arbitrary visualization
* Leverage beat detection into your visualizations
* Simple API to time callbacks and events to any section of a song
* Extensible framework supporting plugins and custom behaviours

TODO
---
* Tests
  * Finish tests for core, beats, adapters, plugins
  * Get AudioContext deletion in WebKit is not yet implemented, so running the tests in Chrome/Safari leads to errors. [WebAudio issue](http://www.w3.org/2011/audio/track/issues/3)
* Map the frequency data for Mozilla's Audio Data API (via lib/fft.js) to WebKit's getByteFrequencyData audioContext method more accurately.

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
* `isLoaded()` returns a boolean value for the dance instance's song load state.

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

Example
---

```javascript
  var
    dance = new Dance( "sickjams.ogg" ),
    beat = dance.createBeat( 5, 240, 0.2, function( mag ) {
      console.log('Beat!');
    }, function( mag ) {
      console.log('no beat :(');
    });

  // Let's turn this beat on right away
  beat.on();

  dance.onceAt( 10, function() {
    // Let's set up some things once at 10 seconds
  }).between( 10, 60, function() {
    // After 10s, let's do something on every frame for the first minute
  }).after( 60, function() {
    // After 60s, let's get this real and map a frequency to an object's y position
    // Note that the instance of dance is bound to "this"
    object.y = this.frequency( 400 );
  }).onceAt( 120, function() {
    // After 120s, we'll turn the beat off as another object's y position is still being mapped from the previous "after" method
    beat.off();
  });

  dance.play();
```

Extending/Plugins
---

You can extend the Dance prototype by calling the static method `addPlugin( name, fn )`, which extends the Dance prototype. A Dance instance then can call the function provided in its context and subscribe to a preexisting event like `update`, or make your own. Look in the `plugins/` directory for examples. 

Development
---
This project uses [smoosh](https://github.com/fat/smoosh) to build and [jasmine](http://pivotal.github.com/jasmine/) for testing. A CLI for testing would be awesome, but Mozilla and WebKit implementations differ greatly -- go to `spec/SpecRunner.html` in Mozilla/WebKit browsers to test.
