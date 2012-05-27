(function() {
  var Beat = function ( dancer, options ) {
    options = options || {};
    this.dancer    = dancer;
    this.frequency = options.frequency || [ 0, 10 ];
    this.threshold = options.threshold || 0.3;
    this.decay     = options.decay     || 0.02;
    this.onBeat    = options.onBeat;
    this.offBeat   = options.offBeat;
    this.isOn      = false;
    this.currentThreshold = this.threshold;

    var _this = this;
    this.dancer.bind( 'update', function () {
      _this.onUpdate();
    });
  };

  Beat.prototype = {
    on  : function () { 
      this.isOn = true;
      return this;
    },
    off : function () {
      this.isOn = false;
      return this;
    },
    onUpdate : function () {
      if ( !this.isOn ) { return; }
      var magnitude = this.maxAmplitude( this.frequency );
      if ( magnitude >= this.currentThreshold &&
          magnitude >= this.threshold ) {
        this.currentThreshold = magnitude;
        this.onBeat && this.onBeat.call( this.dancer, magnitude );
      } else {
        this.offBeat && this.offBeat.call( this.dancer, magnitude );
        this.currentThreshold -= this.decay;
      }
    },
    maxAmplitude : function ( frequency ) {
      var
        max = 0,
        fft = this.dancer.getSpectrum();

      // Sloppy array check
      if ( !frequency.length ) {
        return frequency < fft.length ?
          fft[ ~~frequency ] :
          null;
      }

      for ( var i = frequency[ 0 ], l = frequency[ 1 ]; i <= l; i++ ) {
        if ( fft[ i ] > max ) { max = fft[ i ]; }
      }
      return max;
    }
  };

  window.Dancer.Beat = Beat;
})();
