(function() {
  var
    SAMPLE_SIZE = 2048,
    SAMPLE_RATE = 44100;

  var adapter = function ( dancer ) {
    this.dancer = dancer;
    this.context = window.AudioContext ?
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
        buffers = [],
        channels = e.inputBuffer.numberOfChannels,
        resolution = SAMPLE_SIZE / channels;
      
      for ( i = channels; i--; ) {
        buffers.push( e.inputBuffer.getChannelData( i ) );
      }

      for ( i = 0; i < resolution; i++ ) {
        this.signal[ i ] = channels > 1 ?
          buffers.reduce( bufferReduce ) / channels :
          buffers[ 0 ][ i ];
      }

      this.fft.forward( this.signal );
      this.dancer.trigger( 'update' );
    }
  };

  function bufferReduce ( prev, curr ) {
    return prev[ i ] + curr[ i ];
  }

  Dancer.adapters.webkit = adapter;

})();
