(function() {

  var Dance = function ( source ) {
    this.audioAdapter = window.webkitAudioContext ?
      new Dance.adapters.webkit( this ) :
      new Dance.adapters.moz( this );
    this.sections = [];
    this.audioAdapter.load( source );
  };
  Dance.adapters = {};
  
  Dance.prototype = {
    /* Controls */
  
    play : function () {
      this.audioAdapter.play();
      return this;
    },

    stop : function () {
      this.audioAdapter.stop();
      return this;
    },


    /* Actions */

    onBeat : function ( freq, threshold, onBeatCallback, offBeatCallback ) {
      var magnitude = this.spectrum()[ freq ];
      magnitude >= threshold ?
        onBeatCallback( magnitude ) :
        offBeatCallback( magnitude );
      return this;
    },


    /* Getters */

    time : function () {
      return this.audioAdapter.getTime();
    },

    // Returns the magnitude of a frequency or average over a range of frequencies
    frequency : function ( freq, endFreq ) {
      var subFreq;
      if ( endFreq !== undefined ) {
        subFreq = this.spectrum().slice( freq, endFreq + 1 );
        return subFreq.reduce(function( a, b ) {
          return a + b;
        }) / subFreq.length;
      } else {
        return this.spectrum()[ freq ];
      }
    },

    spectrum : function () {
      return this.audioAdapter.getSpectrum();
    },


    /* Sections */
    
    after : function ( time, callback ) {
      var _this = this;
      this.sections.push({
        condition : function () {
          return _this.time() > time;
        },
        callback : callback
      });
      return this;
    },

    before : function ( time, callback ) {
      var _this = this;
      this.sections.push({
        condition : function () {
          return _this.time() < time;
        },
        callback : callback
      });
      return this;
    },

    between : function ( startTime, endTime, callback ) {
      var _this = this;
      this.sections.push({
        condition : function () {
          return _this.time() > startTime && _this.time() < endTime;
        },
        callback : callback
      });
      return this;
    },

    onceAt : function ( time, callback ) {
      var
        _this = this,
        thisSection = null;
      this.sections.push({
        condition : function () {
          return _this.time() > time && !this.called;
        },
        callback : function () {
          callback.call( this );
          thisSection.called = true;
        },
        called : false
      });
      // Baking the section in the closure due to callback's this being the dance instance
      thisSection = this.sections[ this.sections.length - 1 ];
      return this;
    },


    /* Internal */

    // _update is called on every update via the audio adapter
    _update : function () {
      for ( var i in this.sections ) {
        if ( this.sections[ i ].condition() )
          this.sections[ i ].callback.call( this );
      }
    }
  };

  window.Dance = Dance;
})();


/* 
 *  DSP.js - a comprehensive digital signal processing  library for javascript
 * 
 *  Created by Corban Brook <corbanbrook@gmail.com> on 2010-01-01.
 *  Copyright 2010 Corban Brook. All rights reserved.
 *
 */

// Fourier Transform Module used by DFT, FFT, RFFT
function FourierTransform(bufferSize, sampleRate) {
  this.bufferSize = bufferSize;
  this.sampleRate = sampleRate;
  this.bandwidth  = 2 / bufferSize * sampleRate / 2;

  this.spectrum   = new Float32Array(bufferSize/2);
  this.real       = new Float32Array(bufferSize);
  this.imag       = new Float32Array(bufferSize);

  this.peakBand   = 0;
  this.peak       = 0;

  /**
   * Calculates the *middle* frequency of an FFT band.
   *
   * @param {Number} index The index of the FFT band.
   *
   * @returns The middle frequency in Hz.
   */
  this.getBandFrequency = function(index) {
    return this.bandwidth * index + this.bandwidth / 2;
  };

  this.calculateSpectrum = function() {
    var spectrum  = this.spectrum,
        real      = this.real,
        imag      = this.imag,
        bSi       = 2 / this.bufferSize,
        sqrt      = Math.sqrt,
        rval, 
        ival,
        mag;

    for (var i = 0, N = bufferSize/2; i < N; i++) {
      rval = real[i];
      ival = imag[i];
      mag = bSi * sqrt(rval * rval + ival * ival);

      if (mag > this.peak) {
        this.peakBand = i;
        this.peak = mag;
      }

      spectrum[i] = mag;
    }
  };
}

/**
 * FFT is a class for calculating the Discrete Fourier Transform of a signal
 * with the Fast Fourier Transform algorithm.
 *
 * @param {Number} bufferSize The size of the sample buffer to be computed. Must be power of 2
 * @param {Number} sampleRate The sampleRate of the buffer (eg. 44100)
 *
 * @constructor
 */
function FFT(bufferSize, sampleRate) {
  FourierTransform.call(this, bufferSize, sampleRate);
   
  this.reverseTable = new Uint32Array(bufferSize);

  var limit = 1;
  var bit = bufferSize >> 1;

  var i;

  while (limit < bufferSize) {
    for (i = 0; i < limit; i++) {
      this.reverseTable[i + limit] = this.reverseTable[i] + bit;
    }

    limit = limit << 1;
    bit = bit >> 1;
  }

  this.sinTable = new Float32Array(bufferSize);
  this.cosTable = new Float32Array(bufferSize);

  for (i = 0; i < bufferSize; i++) {
    this.sinTable[i] = Math.sin(-Math.PI/i);
    this.cosTable[i] = Math.cos(-Math.PI/i);
  }
}

/**
 * Performs a forward transform on the sample buffer.
 * Converts a time domain signal to frequency domain spectra.
 *
 * @param {Array} buffer The sample buffer. Buffer Length must be power of 2
 *
 * @returns The frequency spectrum array
 */
FFT.prototype.forward = function(buffer) {
  // Locally scope variables for speed up
  var bufferSize      = this.bufferSize,
      cosTable        = this.cosTable,
      sinTable        = this.sinTable,
      reverseTable    = this.reverseTable,
      real            = this.real,
      imag            = this.imag,
      spectrum        = this.spectrum;

  var k = Math.floor(Math.log(bufferSize) / Math.LN2);

  if (Math.pow(2, k) !== bufferSize) { throw "Invalid buffer size, must be a power of 2."; }
  if (bufferSize !== buffer.length)  { throw "Supplied buffer is not the same size as defined FFT. FFT Size: " + bufferSize + " Buffer Size: " + buffer.length; }

  var halfSize = 1,
      phaseShiftStepReal,
      phaseShiftStepImag,
      currentPhaseShiftReal,
      currentPhaseShiftImag,
      off,
      tr,
      ti,
      tmpReal,
      i;

  for (i = 0; i < bufferSize; i++) {
    real[i] = buffer[reverseTable[i]];
    imag[i] = 0;
  }

  while (halfSize < bufferSize) {
    //phaseShiftStepReal = Math.cos(-Math.PI/halfSize);
    //phaseShiftStepImag = Math.sin(-Math.PI/halfSize);
    phaseShiftStepReal = cosTable[halfSize];
    phaseShiftStepImag = sinTable[halfSize];
    
    currentPhaseShiftReal = 1;
    currentPhaseShiftImag = 0;

    for (var fftStep = 0; fftStep < halfSize; fftStep++) {
      i = fftStep;

      while (i < bufferSize) {
        off = i + halfSize;
        tr = (currentPhaseShiftReal * real[off]) - (currentPhaseShiftImag * imag[off]);
        ti = (currentPhaseShiftReal * imag[off]) + (currentPhaseShiftImag * real[off]);

        real[off] = real[i] - tr;
        imag[off] = imag[i] - ti;
        real[i] += tr;
        imag[i] += ti;

        i += halfSize << 1;
      }

      tmpReal = currentPhaseShiftReal;
      currentPhaseShiftReal = (tmpReal * phaseShiftStepReal) - (currentPhaseShiftImag * phaseShiftStepImag);
      currentPhaseShiftImag = (tmpReal * phaseShiftStepImag) + (currentPhaseShiftImag * phaseShiftStepReal);
    }

    halfSize = halfSize << 1;
  }

  return this.calculateSpectrum();
};

(function() {
  SAMPLE_SIZE = 2048;

  var adapter = function ( danceInstance ) {
    this.danceInstance = danceInstance;
    this.context = window.audioContext ?
      new window.AudioContext() :
      new window.webkitAudioContext();
  };

  adapter.prototype = {
    load : function ( path, callback ) {
      var
        req = new XMLHttpRequest(),
        _this = this;

      this.source = this.context.createBufferSource();
      this.loaded = false;

      req.open( 'GET', path, true );
      req.responseType = 'arraybuffer';

      req.onload = function () {
        if ( _this.context.decodeAudioData ) {
          _this.context.decodeAudioData( req.response, function( buffer ) {
            _this.source.buffer = buffer;
          }, function( e ) {
            console.log( e );
          });
        } else {
          _this.source.buffer = _this.context.createBuffer( req.response, false );
        }
        _this.source.connect( _this.context.destination );
        _this.source.connect( _this.fft );
        _this.fft.connect( _this.proc );
        _this.proc.connect( _this.context.destination );
        _this.loaded = true;
      };
      req.send();

      this.proc = this.context.createJavaScriptNode( SAMPLE_SIZE / 2, 1, 1 );
      this.proc.onaudioprocess = function() { _this.update.call( _this ); };
      this.source.connect( this.context.destination );

      this.fft    = this.context.createAnalyser();
      this.data   = new Uint8Array( this.fft.frequencyBinCount );
    },
    play : function () {
      var _this = this;
      (function play() {
        setTimeout(function() {
          _this.loaded ? _this.source.noteOn( 0.0 ) : play();
        }, 10);
      })();
    },
    stop : function () { this.source.noteOff(0); },
    getSpectrum : function () { return this.data; },
    getTime : function () { return this.context.currentTime; },
    update : function ( e ) {
      this.fft.getByteFrequencyData( this.data );
      this.danceInstance._update();
    }
  };

  Dance.adapters.webkit = adapter;

})();

(function() {
  var adapter = function ( danceInstance ) {
    this.dance = danceInstance;
    this.audio = new Audio();
    this.loaded = false;
  };

  adapter.prototype = {
    load : function ( path ) {
      var _this = this;
      this.audio.src = path;
      this.audio.addEventListener( 'loadedmetadata', function( e ) {
        _this.fbLength = _this.audio.mozFrameBufferLength;
        _this.channels = _this.audio.mozChannels;
        _this.rate     = _this.audio.mozSampleRate;
        _this.fft      = new FFT( _this.fbLength / _this.channels, _this.rate );
        _this.signal   = new Float32Array( _this.fbLength / _this.channels );
        _this.loaded = true;
      }, false);
      this.audio.addEventListener( 'MozAudioAvailable', function( e ) {
        _this.update( e );
      }, false);
    },
    play : function () { this.audio.play(); },
    stop : function () { this.audio.pause(); },
    // TODO refactor so we're not creating a Float32Array on every frame
    getSpectrum : function () {
      // Modify spectrum to match WebKit's 0-255 range, Float32Array map
      var spectrumMod = Float32Array( this.fft.spectrum.length );
      for ( var i = 0, l = spectrumMod.length; i < l; i++ ) {
        spectrumMod[ i ] = this.fft.spectrum[ i ] * 2048; // Need a more precise modifier
      }
      return spectrumMod;
    },
    getTime : function () { return this.time; },
    update : function ( e ) {
      if ( !this.loaded ) return;
      
      for ( var i = 0, j = this.fbLength / 2; i < j; i++ ) {
        this.signal[ i ] = ( e.frameBuffer[ 2 * i ] + e.frameBuffer[ 2 * i + 1 ] ) / 2;
      }

      this.time = e.time;
      // Use dsp.js's FFT to convert time-domain data to frequency spectrum
      this.fft.forward( this.signal );
      this.dance._update();
    }
  };

  Dance.adapters.moz = adapter;

})();
