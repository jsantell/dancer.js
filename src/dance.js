(function() {

  var Dance = function ( source ) {
    this.audioAdapter = window.webkitAudioContext ?
      new Dance.adapters.webkit( this ) :
      new Dance.adapters.moz( this );
    this.events = {};
    this.sections = [];

    this.bind( 'update', update );
    this.audioAdapter.load( source );
  };
  Dance.adapters = {};

  Dance.prototype = {
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
      return new Dance.Beat( this, freq, threshold, decay, onBeat, offBeat );
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

    time : function () {
      return this.audioAdapter.getTime();
    },

    // Returns the magnitude of a frequency or average over a range of frequencies
    frequency : function ( freq, endFreq ) {
      var subFreq;
      if ( endFreq !== undefined ) {
        subFreq = this.spectrum().slice( freq, endFreq + 1 );
        return subFreq.reduce(function( a, b ) {
          return a + b;
        }) / subFreq.length;
      } else {
        return this.spectrum()[ freq ];
      }
    },

    spectrum : function () {
      return this.audioAdapter.getSpectrum();
    },


    /* Sections */

    after : function ( time, callback ) {
      var _this = this;
      this.sections.push({
        condition : function () {
          return _this.time() > time;
        },
        callback : callback
      });
      return this;
    },

    before : function ( time, callback ) {
      var _this = this;
      this.sections.push({
        condition : function () {
          return _this.time() < time;
        },
        callback : callback
      });
      return this;
    },

    between : function ( startTime, endTime, callback ) {
      var _this = this;
      this.sections.push({
        condition : function () {
          return _this.time() > startTime && _this.time() < endTime;
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
          return _this.time() > time && !this.called;
        },
        callback : function () {
          callback.call( this );
          thisSection.called = true;
        },
        called : false
      });
      // Baking the section in the closure due to callback's this being the dance instance
      thisSection = this.sections[ this.sections.length - 1 ];
      return this;
    }
  };
  
  Dance.addPlugin = function ( name, fn ) {
    if ( Dance.prototype[ name ] === undefined ) {
      Dance.prototype[ name ] = fn;
    }
  }

  function update () {
    for ( var i in this.sections ) {
      if ( this.sections[ i ].condition() )
        this.sections[ i ].callback.call( this );
    }
  }

  window.Dance = Dance;
})();

