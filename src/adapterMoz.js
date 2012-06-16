(function() {
  var adapter = function ( dancer ) {
    this.dancer = dancer;
    this.audio = new Audio();
    this.isLoaded = this.isPlaying = false;
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
        _this.isLoaded = true;
        _this.dancer.trigger( 'loaded' );
      }, false);
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

  Dancer.adapters.moz = adapter;

})();
