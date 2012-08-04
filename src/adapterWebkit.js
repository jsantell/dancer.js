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
      if ( _source instanceof HTMLElement ) {
        this.audio = _source;
      } else {
        this.audio.src = _source;
      }

      this.isLoaded = false;

      this.proc = this.context.createJavaScriptNode( SAMPLE_SIZE / 2, 1, 1 );
      this.proc.onaudioprocess = function ( e ) {
        _this.update.call( _this, e );
      };

      this.fft = new FFT( SAMPLE_SIZE / 2, SAMPLE_RATE );
      this.signal = new Float32Array( SAMPLE_SIZE / 2 );

      if ( this.audio.readyState < 3 ) {
        this.audio.addEventListener( 'canplay', function () {
          connectContext.call( _this );
        });
      } else {
        connectContext.call( _this );
      }

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
      if ( !this.isPlaying ) { return; }

      var
        buffers = [],
        channels = e.inputBuffer.numberOfChannels,
        resolution = SAMPLE_SIZE / channels,
        i;

      for ( i = channels; i--; ) {
        buffers.push( e.inputBuffer.getChannelData( i ) );
      }
//      console.log(buffers[0][0]);
      for ( i = 0; i < resolution; i++ ) {
        this.signal[ i ] = channels > 1 ?
          buffers.reduce(function ( prev, curr ) {
            return prev[ i ] + curr[ i ];
          }) / channels :
          buffers[ 0 ][ i ];
      }

      this.fft.forward( this.signal );
      this.dancer.trigger( 'update' );
    }
  };

  function connectContext () {
    this.source = this.context.createMediaElementSource( this.audio );
    this.source.connect( this.proc );
    this.source.connect( this.context.destination );
    this.proc.connect( this.context.destination );

    this.isLoaded = true;
    this.dancer.trigger( 'loaded' );
  }

  Dancer.adapters.webkit = adapter;

})();
