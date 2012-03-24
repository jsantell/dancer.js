(function() {

  var Dance = function ( audio ) {
    this.audio = audio;
    this.channels = this.rate = this.frameBufferLength = null;
    init.apply( this );
  }

  Dance.prototype = {
    onBeat : function( freq, sensitivity, onBeatCallback, offBeatCallback ) {
      
    }
  }

  function init () {
      console.log(this);
    var _this = this;
    _this.audio.addEventListener( 'MozAudioAvailable', function() {
      audioAvailable.call( _this ); 
    }, false);
    _this.audio.addEventListener( 'loadedmetadata', function() {
      loadedMetadata.call( _this );
    }, false);
  }

  function audioAvailable ( e ) {
    var
      fb = e.frameBuffer,
      t  = e.time,
      signal = new Float32Array( fb.length, this.channels ),
      magnitude;

    for ( var i = 0, j = this.fbLength / 2; i < j; i++ ) {
      signal[ i ] = ( fb[ 2 * i ] + fb[ 2 * i + 1 ] ) / 2;
    }
    this.fft.forward( signal );
  }

  function loadedMetadata () {
    this.fbLength = this.audio.mozFrameBufferLength;
    this.channels = this.audio.mozChannels;
    this.rate     = this.audio.mozSampleRate;
    this.fft      = new FFT( this.fbLength / this.channels, this.rate );
  }

  window.Dance = Dance;
})();
