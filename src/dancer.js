(function() {

  var Dancer = function () {
    this.audioAdapter = Dancer._getAdapter( this );
    this.events = {};
    this.sections = [];
    this.bind( 'update', update );
  };

  Dancer.version = '0.3.2';
  Dancer.adapters = {};

  Dancer.prototype = {

    load : function ( source ) {
      var path;

      // Loading an Audio element
      if ( source instanceof HTMLElement ) {
        this.source = source;
        if ( Dancer.isSupported() === 'flash' ) {
          this.source = { src: Dancer._getMP3SrcFromAudio( source ) };
        }

      // Loading an object with src, [codecs]
      } else {
        this.source = window.Audio ? new Audio() : {};
        this.source.src = Dancer._makeSupportedPath( source.src, source.codecs );
      }

      this.audio = this.audioAdapter.load( this.source );
      return this;
    },

    /* Controls */

    play : function () {
      this.audioAdapter.play();
      return this;
    },

    pause : function () {
      this.audioAdapter.pause();
      return this;
    },

    setVolume : function ( volume ) {
      this.audioAdapter.setVolume( volume );
      return this;
    },


    /* Actions */

    createKick : function ( options ) {
      return new Dancer.Kick( this, options );
    },

    bind : function ( name, callback ) {
      if ( !this.events[ name ] ) {
        this.events[ name ] = [];
      }
      this.events[ name ].push( callback );
      return this;
    },

    unbind : function ( name ) {
      if ( this.events[ name ] ) {
        delete this.events[ name ];
      }
      return this;
    },

    trigger : function ( name ) {
      var _this = this;
      if ( this.events[ name ] ) {
        this.events[ name ].forEach(function( callback ) {
          callback.call( _this );
        });
      }
      return this;
    },


    /* Getters */

    getVolume : function () {
      return this.audioAdapter.getVolume();
    },

    getProgress : function () {
      return this.audioAdapter.getProgress();
    },

    getTime : function () {
      return this.audioAdapter.getTime();
    },

    // Returns the magnitude of a frequency or average over a range of frequencies
    getFrequency : function ( freq, endFreq ) {
      var sum = 0;
      if ( endFreq !== undefined ) {
        for ( var i = freq; i <= endFreq; i++ ) {
          sum += this.getSpectrum()[ i ];
        }
        return sum / ( endFreq - freq + 1 );
      } else {
        return this.getSpectrum()[ freq ];
      }
    },

    getWaveform : function () {
      return this.audioAdapter.getWaveform();
    },

    getSpectrum : function () {
      return this.audioAdapter.getSpectrum();
    },

    isLoaded : function () {
      return this.audioAdapter.isLoaded;
    },

    isPlaying : function () {
      return this.audioAdapter.isPlaying;
    },


    /* Sections */

    after : function ( time, callback ) {
      var _this = this;
      this.sections.push({
        condition : function () {
          return _this.getTime() > time;
        },
        callback : callback
      });
      return this;
    },

    before : function ( time, callback ) {
      var _this = this;
      this.sections.push({
        condition : function () {
          return _this.getTime() < time;
        },
        callback : callback
      });
      return this;
    },

    between : function ( startTime, endTime, callback ) {
      var _this = this;
      this.sections.push({
        condition : function () {
          return _this.getTime() > startTime && _this.getTime() < endTime;
        },
        callback : callback
      });
      return this;
    },

    onceAt : function ( time, callback ) {
      var
        _this = this,
        thisSection = null;
      this.sections.push({
        condition : function () {
          return _this.getTime() > time && !this.called;
        },
        callback : function () {
          callback.call( this );
          thisSection.called = true;
        },
        called : false
      });
      // Baking the section in the closure due to callback's this being the dancer instance
      thisSection = this.sections[ this.sections.length - 1 ];
      return this;
    }
  };

  function update () {
    for ( var i in this.sections ) {
      if ( this.sections[ i ].condition() )
        this.sections[ i ].callback.call( this );
    }
  }

  window.Dancer = Dancer;
})();
