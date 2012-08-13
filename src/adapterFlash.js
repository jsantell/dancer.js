(function() {
  var
    SAMPLE_SIZE  = 1024,
    SAMPLE_RATE  = 44100,
    smLoaded     = false,
    smLoading    = false,
    CONVERSION_COEFFICIENT = 0.93;

  var adapter = function ( dancer ) {
    this.dancer = dancer;
    this.wave_L = [];
    this.wave_R = [];
    this.spectrum = [];
    window.SM2_DEFER = true;
  };

  adapter.prototype = {
    // `source` can be either an Audio element, if supported, or an object
    // either way, the path is stored in the `src` property
    load : function ( source ) {
      var _this = this;
      this.path = source ? source.src : this.path;

      this.isLoaded = false;
      this.progress = 0;

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
          whileloading : function () {
            _this.progress = this.bytesLoaded / this.bytesTotal;
          },
          onload   : function () {
            _this.fft = new FFT( SAMPLE_SIZE, SAMPLE_RATE );
            _this.signal = new Float32Array( SAMPLE_SIZE );
            _this.waveform = new Float32Array( SAMPLE_SIZE );
            _this.isLoaded = true;
            _this.progress = 1;
            _this.dancer.trigger( 'loaded' );
          }
        });
        this.dancer.audio = this.audio;
      }

      // Returns audio if SM already loaded -- otherwise,
      // sets dancer instance's audio property after load
      return this.audio;
    },

    play : function () {
      this.audio.play();
      this.isPlaying = true;
    },

    pause : function () {
      this.audio.pause();
      this.isPlaying = false;
    },

    setVolume : function ( volume ) {
      this.audio.setVolume( volume * 100 );
    },

    getVolume : function () {
      return this.audio.volume / 100;
    },

    getProgress : function () {
      return this.progress;
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
      if ( !this.isPlaying && !this.isLoaded ) return;
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
