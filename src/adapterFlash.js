(function() {
  var
    SAMPLE_SIZE  = 1024,
    SAMPLE_RATE  = 44100,
    smLoaded     = false,
    smLoading    = false,
    CONVERSION_COEFFICIENT = 0.93;

  var adapter = function ( dancer ) {
    this.dancer = dancer;
    this.isLoaded = this.isPlaying = false;
    this.wave_L = [];
    this.wave_R = [];
    this.spectrum = [];
    window.SM2_DEFER = true;
  };

  adapter.prototype = {
    load : function ( path ) {
      var _this = this;
      this.path = path || this.path;

      !window.soundManager && !smLoading && loadSM.call( this );

      if ( window.soundManager ) {
        this.audio = soundManager.createSound({
          id       : 'dancer' + Math.random() + '',
          url      : this.path,
          stream   : true,
          autoPlay : false,
          autoLoad : true,
          whileplaying : function () {
            _this.update();
          },
          onload   : function () {
            _this.fft = new FFT( SAMPLE_SIZE, SAMPLE_RATE );
            _this.signal = new Float32Array( SAMPLE_SIZE );
            _this.waveform = new Float32Array( SAMPLE_SIZE );
            _this.isLoaded = true;
            _this.dancer.trigger( 'loaded' );
          }
        });
      }
    },

    play : function () {
      if ( !this.isPlaying && this.isLoaded ) {
        this.audio.play();
        this.isPlaying = true;
      }
    },

    stop : function () {
      this.audio.stop();
      this.isPlaying = false;
    },

    getWaveform : function () {
      return this.waveform;
    },

    getSpectrum : function () {
      return this.fft.spectrum;
    },

    getTime : function () {
      return this.audio.position / 1000;
    },

    update : function () {
      if ( !this.isLoaded ) return;
      this.wave_L = this.audio.waveformData.left;
      this.wave_R = this.audio.waveformData.right;
      var avg;
      for ( var i = 0, j = this.wave_L.length; i < j; i++ ) {
        avg = parseFloat(this.wave_L[ i ]) + parseFloat(this.wave_R[ i ]);
        this.waveform[ 2 * i ]     = avg / 2;
        this.waveform[ i * 2 + 1 ] = avg / 2;
        this.signal[ 2 * i ]       = avg * CONVERSION_COEFFICIENT;
        this.signal[ i * 2 + 1 ]   = avg * CONVERSION_COEFFICIENT;
      }

      this.fft.forward( this.signal );
      this.dancer.trigger( 'update' );
    }
  };

  function loadSM () {
    var adapter = this;
    smLoading = true;
    loadScript( Dancer.options.flashJS, function () {
      soundManager = new SoundManager();
      soundManager.flashVersion = 9;
      soundManager.flash9Options.useWaveformData = true;
      soundManager.useWaveformData = true;
      soundManager.useHighPerformance = true;
      soundManager.useFastPolling = true;
      soundManager.multiShot = false;
      soundManager.debugMode = false;
      soundManager.debugFlash = false;
      soundManager.url = Dancer.options.flashSWF;
      soundManager.onready(function () {
        smLoaded = true;
        adapter.load();
      });
      soundManager.ontimeout(function(){
        console.error( 'Error loading SoundManager2.swf' );
      });
      soundManager.beginDelayedInit();
    });
  }

  function loadScript ( url, callback ) {
    var
      script   = document.createElement( 'script' ),
      appender = document.getElementsByTagName( 'script' )[0];
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    appender.parentNode.insertBefore( script, appender );
  }

  Dancer.adapters.flash = adapter;

})();
