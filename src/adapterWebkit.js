(function() {
  var
    SAMPLE_SIZE = 2048,
    SAMPLE_RATE = 44100;

  var adapter = function ( dancer ) {
    this.dancer = dancer;
    this.context = window.AudioContext ?
      new window.AudioContext() :
      new window.webkitAudioContext();
    this.audio = new Audio();
    this.isLoaded = this.isPlaying = this.isDisconnected = false;
  };

  function connectContext () {
    this.source = this.context.createMediaElementSource( this.audio );
    this.source.connect( this.proc );
    this.source.connect( this.context.destination );
    this.proc.connect( this.context.destination );
  }

  adapter.prototype = {

    load : function ( _source ) {
      var _this = this;
      if ( _source instanceof HTMLElement ) {
        this.audio = _source;
      } else {
        this.audio = new Audio();
        this.audio.src = _source;
      }
      this.proc = this.context.createJavaScriptNode( SAMPLE_SIZE / 2, 1, 1 );
      this.proc.onaudioprocess = function ( e ) {
        _this.update.call( _this, e );
      };

      this.fft = new FFT( SAMPLE_SIZE / 2, SAMPLE_RATE );
      this.signal = new Float32Array( SAMPLE_SIZE / 2 );
      if ( this.audio.readyState < 3 ) {
        this.audio.addEventListener( 'canplay', function () {
          connectContext.call( _this );
          _this.isLoaded = true;
          _this.dancer.trigger( 'loaded' );
        });
      } else {
        connectContext.call( _this );
        this.isLoaded = true;
        this.dancer.trigger( 'loaded' );
      }
    },

    play : function () {
      var _this = this;

      this.isLoaded ? play() : this.dancer.bind( 'loaded', play );

      function play () {
        if ( _this.isDisconnected ) {
          connectContext.call( _this );
        }
        _this.audio.play();
        _this.startTime = _this.context.currentTime;
        _this.isPlaying = true;
      }
    },

    stop : function () {
      if ( this.isPlaying ) {
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
      console.log(buffers[0][0]);
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
