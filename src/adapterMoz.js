(function() {
  var adapter = function ( dancer ) {
    this.dancer = dancer;
    this.audio = new Audio();
    this.isLoaded = this.isPlaying = false;
  };

  adapter.prototype = {

    load : function ( _source ) {
      var _this = this;
      // Check if source is a path or an audio element
      if ( _source instanceof HTMLElement ) {
        this.audio = _source;
      } else {
        this.audio.src = _source;
      }

      if ( this.audio.readyState < 3 ) {
        this.audio.addEventListener( 'loadedmetadata', function () {
          getMetadata.call( _this );
        }, false);
      } else {
        getMetadata.call( _this );
      }

      this.audio.addEventListener( 'MozAudioAvailable', function( e ) {
        _this.update( e );
      }, false);
    },

    play : function () {
      this.audio.play();
      this.isPlaying = true;
    },

    stop : function () {
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
      if ( !this.isLoaded ) return;

      for ( var i = 0, j = this.fbLength / 2; i < j; i++ ) {
        this.signal[ i ] = ( e.frameBuffer[ 2 * i ] + e.frameBuffer[ 2 * i + 1 ] ) / 2;
      }

      this.fft.forward( this.signal );
      this.dancer.trigger( 'update' );
    }
  };

  function getMetadata () {
    this.fbLength = this.audio.mozFrameBufferLength;
    this.channels = this.audio.mozChannels;
    this.rate     = this.audio.mozSampleRate;
    this.fft      = new FFT( this.fbLength / this.channels, this.rate );
    this.signal   = new Float32Array( this.fbLength / this.channels );
    this.isLoaded = true;
    this.dancer.trigger( 'loaded' );
  }

  Dancer.adapters.moz = adapter;

})();
