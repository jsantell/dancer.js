(function() {
  var
    SAMPLE_SIZE = 2048,
    SAMPLE_RATE = 44100;

  var adapter = function ( dancer ) {
    this.dancer = dancer;
    this.context = window.AudioContext ?
      new window.AudioContext() :
      new window.webkitAudioContext();
    this.isLoaded       = false;
    this.isPlaying      = false;
    this.isDisconnected = false;
  };

  function connectContext () {
    this.source = this.context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.connect( this.context.destination );
    this.source.connect( this.proc );
    this.source.connect( this.context.destination );
  }

  adapter.prototype = {

    load : function ( path ) {
      var
        req = new XMLHttpRequest(),
        _this = this;

      req.open( 'GET', path, true );
      req.responseType = 'arraybuffer';

      req.onload = function () {
        if ( _this.context.decodeAudioData ) {
          _this.context.decodeAudioData( req.response, function( buffer ) {
            _this.buffer = buffer;
            connectContext.call( _this );
            _this.isLoaded = true;
            _this.dancer.trigger( 'loaded' );
          }, function( e ) {
            console.log( e );
          });
        } else {
          _this.buffer = _this.context.createBuffer( req.response, false );
          connectContext.call( _this );
          _this.isLoaded = true;
          _this.dancer.trigger( 'loaded' );
        }
      };
      req.send();

      this.proc = this.context.createJavaScriptNode( SAMPLE_SIZE / 2, 1, 1 );
      this.proc.onaudioprocess = function ( e ) {
        _this.update.call( _this, e );
      };
      this.proc.connect( this.context.destination );

      this.fft = new FFT( SAMPLE_SIZE / 2, SAMPLE_RATE );
      this.signal = new Float32Array( SAMPLE_SIZE / 2 );
    },

    play : function () {
      var _this = this;

      this.isLoaded ? play() : this.dancer.bind( 'loaded', play );

      function play () {
        if ( _this.isDisconnected ) {
          connectContext.call( _this );
        }
        _this.source.noteOn( 0.0 );
        _this.startTime = _this.context.currentTime;
        _this.isPlaying = true;
      }
    },

    stop : function () {
      if ( this.isPlaying ) {
        this.source.noteOff( 0.0 );
        this.isDisconnected = true;
        this.endTime = this.getTime();
      }
      this.isPlaying = false;
    },

    getWaveform : function () {
      return this.signal;
    },

    getSpectrum : function () {
      return this.fft.spectrum;
    },

    getTime : function () {
      return this.isPlaying ?
        this.context.currentTime - ( this.startTime || 0 ) :
        this.endTime || 0;
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

  Dancer.adapters.webkit = adapter;

})();
