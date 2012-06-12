(function() {
  var
    SAMPLE_SIZE = 1024,
    SAMPLE_RATE = 44100,
    smLoaded    = false;

  var adapter = function ( dancer ) {
    this.dancer = dancer;
    this.isLoaded = this.isPlaying = false;
    this.eq_L = [];
    this.eq_R = [];
    this.spectrum = [];

    !smLoaded && loadSM();
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
            _this.fft = new FFT( SAMPLE_SIZE / 2, SAMPLE_RATE );
            _this.signal = new Float32Array( SAMPLE_SIZE / 2 );
            _this.isLoaded = true;
            _this.dancer.trigger( 'loaded' );
          }
        });
      };
      smLoaded ? loadSMAudio() : setTimeout(function () {
        _this.load( path );
      }, 50);
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
      this.eq_L = this.audio.eqData.left;
      this.eq_R = this.audio.eqData.right;

      for ( var i = 0, j = this.eq_L.length; i < j; i++ ) {
        this.signal[ i ] = ( parseFloat(this.eq_L[ i ]) + parseFloat(this.eq_R[ i ]) ) / 2;
        if ( this.spectrum[ i ] > window.max ) {
            window.max = this.eq_L[ i ];
        }
        if ( this.spectrum[ i ] < window.min ) {
            window.min = this.eq_L[ i ];
        }
      }
      this.fft.forward( this.signal );
      this.dancer.trigger( 'update' );
    }
  };

  function loadSM () {
    soundManager.flashVersion = 9;
    soundManager.flash9Options.useEQData = true;
    soundManager.useEQData = true;
    soundManager.useWaveformData = true;
    soundManager.useHighPerformance = true;
    soundManager.url = Dancer.options.flash;
    soundManager.multiShot = false;
    soundManager.onready(function () {
      smLoaded = true;
    });

    soundManager.debugMode = false;
    soundManager.debugFlash = false;

  }

  Dancer.adapters.flash = adapter;

})();
