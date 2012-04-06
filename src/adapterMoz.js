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
        _this.signal   = new Float32Array( _this.fbLength / _this.channels ),
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
