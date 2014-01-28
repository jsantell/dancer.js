(function() {
  var
    SAMPLE_SIZE = 2048,
    SAMPLE_RATE = 44100;

  var adapter = function ( dancer ) {
    this.dancer = dancer;
    this.audio = new Audio();
    this.context = window.AudioContext ?
      new window.AudioContext() :
      new window.webkitAudioContext();
  };

  adapter.prototype = {

    load : function ( _source ) {
      var _this = this;
      this.audio = _source;

      this.isLoaded = false;
      this.progress = 0;

      if (!this.context.createScriptProcessor) {
        this.context.createScriptProcessor = this.context.createJavascriptNode;
      }
      this.proc = this.context.createScriptProcessor( SAMPLE_SIZE / 2, 1, 1 );

      this.proc.onaudioprocess = function ( e ) {
        _this.update.call( _this, e );
      };
      if (!this.context.createGain) {
        this.context.createGain = this.context.createGainNode;
      }

      this.gain = this.context.createGain();

      this.fft = new FFT( SAMPLE_SIZE / 2, SAMPLE_RATE );
      this.signal = new Float32Array( SAMPLE_SIZE / 2 );

      if ( this.audio.readyState < 3 ) {
        this.audio.addEventListener( 'canplay', function () {
          connectContext.call( _this );
        });
      } else {
        connectContext.call( _this );
      }

      this.audio.addEventListener( 'progress', function ( e ) {
        if ( e.currentTarget.duration ) {
          _this.progress = e.currentTarget.seekable.end( 0 ) / e.currentTarget.duration;
        }
      });

      return this.audio;
    },

    play : function () {
      this.audio.play();
      this.isPlaying = true;
    },

    pause : function () {
      this.audio.pause();
      this.isPlaying = false;
    },

    setVolume : function ( volume ) {
      this.gain.gain.value = volume;
    },

    getVolume : function () {
      return this.gain.gain.value;
    },

    getProgress : function() {
      return this.progress;
    },

    getWaveform : function () {
      return this.signal;
    },

    getSpectrum : function () {
      return this.fft.spectrum;
    },

    getTime : function () {
      return this.audio.currentTime;
    },

    update : function ( e ) {
      if ( !this.isPlaying || !this.isLoaded ) return;

      var
        buffers = [],
        channels = e.inputBuffer.numberOfChannels,
        resolution = SAMPLE_SIZE / channels,
        sum = function ( prev, curr ) {
          return prev[ i ] + curr[ i ];
        }, i;

      for ( i = channels; i--; ) {
        buffers.push( e.inputBuffer.getChannelData( i ) );
      }

      for ( i = 0; i < resolution; i++ ) {
        this.signal[ i ] = channels > 1 ?
          buffers.reduce( sum ) / channels :
          buffers[ 0 ][ i ];
      }

      this.fft.forward( this.signal );
      this.dancer.trigger( 'update' );
    }
  };

  function connectContext () {
    this.source = this.context.createMediaElementSource( this.audio );
    this.source.connect( this.proc );
    this.source.connect( this.gain );
    this.gain.connect( this.context.destination );
    this.proc.connect( this.context.destination );

    this.isLoaded = true;
    this.progress = 1;
    this.dancer.trigger( 'loaded' );
  }

  Dancer.adapters.webaudio = adapter;

})();
