Dance.js
======

Audio visualizer, made in three hours for [MDN's](http://twitter.com/mozhacks) NYC Hack Day, 3/24/2011
http://jsantell.github.com/dance.js

TODO
---
* More streamlined example
* What methods should be added to the prototype? onFrequency?
* Should dance.js use its own render animation frame with events, or tie into an arbitrary render loop, exposing boolean methods instead of firing events?
* Better beat detection (configurable decay of highest 'beat', better threshold parameter, focuses on a range of normalized frequencies instead of one?)
* Shortcuts for frequency slicing, instead of abstract 0 - 1023?
* Tests!!!
* Royalty free music for examples
* Extend to use WebKit's Web Audio API as well

Methods
---
* `new Dance( source )` constructor to create a dance instance, source can be a path string to audio source, or an audio element (untested).
* `play()` plays the audio and runs the internal loop to fire events.
* `onBeat( frequency, threshold, onBeatCallback, offBeatCallback )` binds an event fired on every update to determine if the frequency is above a certain threshold. If so, the onBeatCallback is called; otherwise, offBeatCallback. The callbacks pass an argument with the current magnitude of the spectrum slice.

Properties
---
* `time` Current time of audio source.
* `channels` Number of channels of audio source.
* `isLoaded` Boolean property indicating whether or not the Mozilla `loadedmetadata` event has fired or not.
* `audio` The audio property bound to this dance instance.
* `rate` The sample rate of audio source.
* `frameBufferLength` Frame buffer length of audio source.
* `fft` The Fast Fourier Transform of the audio source (from dsp.js) -- can access the spectrum array member via this property, `fft.spectrum`

### Example

```javascript
  var dance = new Dance( "sickjams.ogg" );

  // When the 6th frequency (of 1024) has a magnitude greater than 3, call the first callback; otherwise, the second
  dance.onBeat( 5, 0.03, function( mag ) {
    console.log('BEAT! ' + mag);
    doCoolStuff();
  }, function( mag ) {
    console.log('...not a beat ' + mag);
    inverseCoolStuff();
  });

  dance.play();
```

### Dependencies 

* [dsp.js](https://github.com/corbanbrook/dsp.js)

Created
---------
Created by [Jordan Santell](https://github.com/jsantell) and [Brian Hassinger](https://github.com/brainss), special thanks to all the Mozillians and other jammers at the NYC Hack Day!
