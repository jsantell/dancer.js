/*
 * Dancer.js (c) 2012 Jordan Santell
 * MIT License
 * http://github.com/jsantell/dancer.js
 *
 * v0.2.1
 */

(function() {

  var Dancer = function ( source, codecs ) {
    this.audioAdapter = Dancer._getAdapter( this );
    this.events = {};
    this.sections = [];

    this.bind( 'update', update );
    this.source = Dancer._makeSupportedPath( source, codecs );
    this.audioAdapter.load( this.source );
  };

  Dancer.adapters = {};

  Dancer.prototype = {

    /* Controls */

    play : function () {
      this.audioAdapter.play();
      return this;
    },

    stop : function () {
      this.audioAdapter.stop();
      return this;
    },


    /* Actions */

    createBeat : function ( freq, threshold, decay, onBeat, offBeat ) {
      return new Dancer.Beat( this, freq, threshold, decay, onBeat, offBeat );
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
