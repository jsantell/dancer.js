(function() {
  var adapter = function ( dancer ) {
    this.dancer = dancer;
    this.isLoaded = this.isPlaying = false;
    !smLoaded && loadSM();
  },
  smLoaded = false;

  adapter.prototype = {

    load : function ( path ) {
      var _this = this;
      loadSMAudio = function () {
        _this.audio = soundManager.createSound({
          id       : 'dancer' + Math.random() + '',
          url      : path,
          stream   : true,
          autoPlay : true,
          whileplaying : _this.update,
          onload   : function () {
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
      this.audio.play();
      this.isPlaying = true;
    },

    stop : function () {
      this.audio.pause();
      this.isPlaying = false;
    },

    getSpectrum : function () {
      return this.fft.spectrum;
    },

    getTime : function () {
      return this.audio.currentTime;
    },

    update : function ( e ) {
      if ( !this.isLoaded ) return;
console.log( this, e);
      /*
      for ( var i = 0, j = this.fbLength / 2; i < j; i++ ) {
        this.signal[ i ] = ( e.frameBuffer[ 2 * i ] + e.frameBuffer[ 2 * i + 1 ] ) / 2;
      }

      this.fft.forward( this.signal );
  */    this.dancer.trigger( 'update' );
    }
  };

  function loadSM () {
    soundManager.flashVersion = 9;
    soundManager.flash9Options.useEQData = true;
    soundManager.flash9Options.useWaveformData = true;
    soundManager.url = './';
    soundManager.onload = function () {
      smLoaded = true;
    };
  }

  Dancer.adapters.flash = adapter;

})();
