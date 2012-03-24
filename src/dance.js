(function() {

  var Dance = function ( source ) {
    this.channels = this.rate = this.frameBufferLength = this.fft = null;
    this.isLoaded = this.isPlaying = false;
    this.audio = source && source.tagName === "AUDIO" ? source : new Audio();
    if ( typeof source === 'string' ) this.audio.src = source;
    init.apply( this );
  };

  Dance.prototype = {
    play : function () { 
      this.audio.play();
      this.isPlaying = true;
      this.animate();
    },
    stop : function () {
      this.audio.stop();
      this.isPlaying = false;
    },
    animate : function () {
      var _this = this;
      (function trigger() {
        requestAnimFrame(trigger);
        if ( !_this.isPlaying ) return;
        _this.audio.dispatchEvent( _this.events.onBeat );
        _this.audio.dispatchEvent( _this.events.onFreq );
      })();
    },
    onBeat : function( freq, threshold, onBeatCallback, offBeatCallback ) {
      var _this = this;
      this.audio.addEventListener( 'onBeat', function() {
        var magnitude = _this.fft.spectrum[ freq ];
        magnitude >= threshold ?
          onBeatCallback( magnitude ) :
          offBeatCallback( magnitude );
      }, false);
    }
  };

  function init () {
    var _this = this;
    _this.events = {
      onBeat : document.createEvent( 'Event' ),
      onFreq : document.createEvent( 'Event' )
    };
    _this.events.onBeat.initEvent( 'onBeat', true, true );
    _this.events.onFreq.initEvent( 'onFreq', true, true );
    
    _this.audio.addEventListener( 'loadedmetadata', function( e ) {
      loadedMetadata.call( _this, e );
    }, false);

    _this.audio.addEventListener( 'MozAudioAvailable', function( e ) {
      audioAvailable.call( _this, e ); 
    }, false);
  }

  function audioAvailable ( e ) {
    if ( !this.isLoaded ) return;
    var
      fb = e.frameBuffer,
      t  = e.time,
      signal = new Float32Array( fb.length / this.channels ),
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
    this.isLoaded = true;
  }

  window.Dance = Dance;
})();

