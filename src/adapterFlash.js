(function() {
  var
    CONVERSION_COEFFICIENT = 0.75,
    SAMPLE_SIZE = 512,
    SAMPLE_RATE = 44100,
    smLoaded    = false;

  var adapter = function ( dancer ) {
    this.dancer = dancer;
    this.isLoaded = this.isPlaying = false;
    this.wave_L = [];
    this.wave_R = [];
    this.spectrum = [];

    !window.soundManager && loadSM();
  };

  adapter.prototype = {
    load : function ( path ) {
      var _this = this;
      loadSMAudio = function () {
        _this.audio = soundManager.createSound({
          id       : 'dancer' + Math.random() + '',
          url      : path,
          stream   : true,
          autoPlay : false,
          autoLoad : true,
          whileplaying : function () {
            _this.update();
          },
          onload   : function () {
            _this.fft = new FFT( SAMPLE_SIZE, SAMPLE_RATE );
            _this.signal = new Float32Array( SAMPLE_SIZE );
            _this.isLoaded = true;
            _this.dancer.trigger( 'loaded' );
          }
        });
      };
      smLoaded ? loadSMAudio() : setTimeout(function () {
        _this.load( path );
      }, 100 );
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

      for ( var i = 0, j = this.wave_L.length; i < j; i++ ) {
        this.signal[ i ] = (( parseFloat(this.wave_L[ i ]) + parseFloat(this.wave_R[ i ])) * CONVERSION_COEFFICIENT );
      }

      this.fft.forward( this.signal );
      this.dancer.trigger( 'update' );
    }
  };

  function loadSM () {
    var
      script   = document.createElement( 'script' ),
      appender = document.getElementsByTagName( 'script' )[0];
    script.type = 'text/javascript';
    script.src = Dancer.options.flash + 'soundmanager2-nodebug.js';
    appender.parentNode.insertBefore( script, appender );
    script.onload = function () {
      soundManager.flashVersion = 9;
      soundManager.flash9Options.useWaveformData = true;
      soundManager.useWaveformData = true;
      soundManager.useHighPerformance = true;
      soundManager.url = Dancer.options.flash;
      soundManager.multiShot = false;
      soundManager.debugMode = false;
      soundManager.debugFlash = false;
      soundManager.onready(function () {
        smLoaded = true;
      });
      soundManager.beginDelayedInit();
    };
  }

  Dancer.adapters.flash = adapter;

})();
