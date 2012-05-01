dancer.js
======

A JavaScript audio visualization library.
http://jsantell.github.com/dancer.js
_v0.0.1_
**Under heavy development until release at end of April 2012, fork with caution (and love)**

Features
---
* Use real-time audio frequency data and map it to any arbitrary visualization
* Leverage beat detection into your visualizations
* Simple API to time callbacks and events to any section of a song
* Extensible framework supporting plugins and custom behaviours

TODO
---
* Finish tests for beats, plugin(s)
* Streamline beat detection?
* Expose additional audio controls (repeat/loop, reset, volume)

Prototype Methods
---

### Controls

All controls return `this`.

* `play()` plays the audio and begins the dance.
* `stop()` stops the madness.

### Getters

* `getTime()` returns the current time.
* `getSpectrum()` returns the frequency data array. 
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

### Beats

Beats are detected when the amplitude (normalized values between 0 and 1) of a specified frequency, or the max amplitude over a range, is greater than the minimum threshold, as well as greater than the previously registered beat's amplitude, which is decreased by the decay rate per frame.

* `createBeat( options )` creates a new beat instance tied to the dancer instance, with an options object passed as an argument. Options listed below.
  * `frequency` the frequency (element of the spectrum) to check for a spike. Can be a single frequency (number) or a range (2 element array) that uses the frequency with highest amplitude. Default: `[ 0, 10 ]`
  * `threshold` the minimum amplitude of the frequency range in order for a beat to occur. Default: `0.3`
  * `decay` the rate that the previously registered beat's amplitude is reduced by on every frame. Default: `0.02`
  * `onBeat` the callback to be called when a beat is detected.
  * `offBeat` the callback to be called when there is no beat on the current frame.

#### Beat Methods

These methods can be called on a beat instance to turn on and off the registered callbacks

* `on()` turns on the beat instance's callbacks and detections
* `off()` turns off the beat instance's callbacks and detections

Example
---

```javascript
  var
    dancer = new Dancer( "sickjams.ogg" ),
    beat = dancer.createBeat({
      onBeat: function ( mag ) {
        console.log('Beat!');
      },
      offBeat: function ( mag ) {
        console.log('no beat :(');
      }
    });

  // Let's turn this beat on right away
  beat.on();

  dancer.onceAt( 10, function() {
    // Let's set up some things once at 10 seconds
  }).between( 10, 60, function() {
    // After 10s, let's do something on every frame for the first minute
  }).after( 60, function() {
    // After 60s, let's get this real and map a frequency to an object's y position
    // Note that the instance of dancer is bound to "this"
    object.y = this.frequency( 400 );
  }).onceAt( 120, function() {
    // After 120s, we'll turn the beat off as another object's y position is still being mapped from the previous "after" method
    beat.off();
  });

  dancer.play();
```

Extending/Plugins
---

You can extend the Dancer prototype by calling the static method `addPlugin( name, fn )`, which extends the Dancer prototype. A Dancer instance then can call the function provided in its context and subscribe to a preexisting event like `update`, or make your own. Look in the `plugins/` directory for examples. 

Development
---
This project uses [smoosh](https://github.com/fat/smoosh) to build and [jasmine](http://pivotal.github.com/jasmine/) for testing. A CLI for testing would be awesome, but Mozilla and WebKit implementations differ greatly -- go to `spec/index.html` in Mozilla/WebKit browsers to test.
