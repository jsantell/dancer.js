(function() {
  var
    SAMPLE_SIZE = 2048,
    SAMPLE_RATE = 44100;

  var adapter = function ( dancer ) {
    this.dancer = dancer;
    this.context = window.audioContext ?
      new window.AudioContext() :
      new window.webkitAudioContext();
    this.isLoaded = false;
    this.isPlaying= false;
  };

  adapter.prototype = {

    load : function ( path, callback ) {
      var
        req = new XMLHttpRequest(),
        _this = this;

      this.source = this.context.createBufferSource();

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
        _this.source.connect( _this.proc );
        _this.proc.connect( _this.context.destination );
        _this.isLoaded = true;
        _this.dancer.trigger( 'loaded' );
      };
      req.send();

      this.proc = this.context.createJavaScriptNode( SAMPLE_SIZE / 2, 1, 1 );
      this.proc.onaudioprocess = function ( e ) {
        _this.update.call( _this, e );
      };
      this.source.connect( this.context.destination );
      this.fft = new FFT( SAMPLE_SIZE / 2, SAMPLE_RATE );
      this.signal = new Float32Array( SAMPLE_SIZE / 2 );
    },

    play : function () {
      var _this = this;

      this.isLoaded ?
        play() :
        this.dancer.bind( 'loaded', play );

      function play () {
        _this.source.noteOn( 0.0 );
        _this.isPlaying = true;
      }
    },

    stop : function () {
      this.source.noteOff(0);
      this.isPlaying = false;
    },

    getSpectrum : function () {
      return this.fft.spectrum;
    },

    getTime : function () {
      return this.context.currentTime;
    },

    update : function ( e ) {
      if ( !this.isPlaying ) { return; }
      var
        bufferL = e.inputBuffer.getChannelData(0),
        bufferR = e.inputBuffer.getChannelData(1);

      for ( var i = 0, j = SAMPLE_SIZE / 2; i < j; i++ ) {
        this.signal[ i ] = ( bufferL[ i ] + bufferR[ i ] ) / 2;
      }

      this.fft.forward( this.signal );
      this.dancer.trigger( 'update' );
    }
  };

  Dancer.adapters.webkit = adapter;

})();
