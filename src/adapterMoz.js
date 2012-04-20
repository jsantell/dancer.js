(function() {
  var adapter = function ( dancer ) {
    this.dancer = dancer;
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

        // save this so we're not creating a new one on every frame
        _this.tempFloat = Float32Array( _this.fbLength / _this.channels );
        _this.dancer.trigger( 'loaded' );
      }, false);
      this.audio.addEventListener( 'MozAudioAvailable', function( e ) {
        _this.update( e );
      }, false);
    },
    play : function () { this.audio.play(); },
    stop : function () { this.audio.pause(); },
    getSpectrum : function () {
      // Modify spectrum to match WebKit's 0-255 range, Float32Array map
      for ( var i = 0, l = this.tempFloat.length; i < l; i++ ) {
        this.tempFloat[ i ] = this.fft.spectrum[ i ] * 2048; // Need a more precise modifier
      }
      return this.tempFloat;
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
      this.dancer.trigger( 'update' );
    }
  };

  Dancer.adapters.moz = adapter;

})();
