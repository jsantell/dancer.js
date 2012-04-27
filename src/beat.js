(function() {
  var Beat = function ( dancer, options ) {
    options = options || {};
    this.dancer    = dancer;
    this.range     = options.range     || [ 0, 20 ];
    this.threshold = options.threshold || 0.15;
    this.decay     = options.decay     || 0.025;
    this.onBeat    = options.onBeat;
    this.offBeat   = options.offBeat;
    this.isOn      = false;
    this.currentThreshold = this.threshold;

    var _this = this;
    this.dancer.bind( 'update', function() {
      if ( !_this.isOn ) { return; }
      var magnitude = maxAmplitude( _this.dancer.getSpectrum(), _this.range );
      if ( magnitude >= _this.currentThreshold &&
          magnitude >= _this.threshold ) {
        _this.currentThreshold = magnitude;
        _this.onBeat && _this.onBeat.call( _this.dancer, magnitude );
      } else {
        _this.offBeat && _this.offBeat.call( _this.dancer, magnitude );
        _this.currentThreshold -= _this.decay;
      }
    });
  };

  Beat.prototype = {
    on  : function () { this.isOn = true; },
    off : function () { this.isOn = false; }
  };

  function maxAmplitude ( fft, range ) {
    var max = 0;
    // Not robust at all array detection, but fast
    if ( !range.length ) {
      return fft[ range ];
    }
    for ( var i = range[ 0 ], l = range[ 1 ]; i <= l; i++ ) {
      if ( fft[ i ] > max ) { max = fft[ i ]; }
    }
    return max;
  }

  window.Dancer.Beat = Beat;
})();
