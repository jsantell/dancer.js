(function() {
  var Beat = function ( dancer, frequency, threshold, decay, onBeat, offBeat ) {
    this.dancer     = dancer;
    this.frequency = frequency;
    this.threshold = threshold;
    this.decay     = decay;
    this.onBeat    = onBeat;
    this.offBeat   = offBeat;
    this.isOn      = false;
    this.currentThreshold = threshold;

    var _this = this;
    this.dancer.bind( 'update', function() {
      if ( !_this.isOn ) { return; }
      var magnitude = _this.dancer.spectrum()[ _this.frequency ];
      if ( magnitude >= _this.currentThreshold &&
          magnitude >= _this.threshold ) {
        _this.currentThreshold = magnitude;
        onBeat.call( _this.dancer, magnitude );
      } else {
        offBeat.call( _this.dancer, magnitude );
        _this.currentThreshold -= _this.decay;
      }
    });
  };

  Beat.prototype = {
    on  : function () { this.isOn = true; },
    off : function () { this.isOn = false; }
  };

  window.Dancer.Beat = Beat;
})();
