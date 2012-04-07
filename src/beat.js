(function() {
  var Beat = function ( dance, freq, threshold, decay, onBeat, offBeat ) {
    this.dance     = dance;
    this.freq      = freq;
    this.threshold = threshold;
    this.decay     = decay;
    this.onBeat    = onBeat;
    this.offBeat   = offBeat;
    this.isOn      = false;
    this.currentThreshold = threshold;

    var _this = this;
    this.dance.bind( 'update', function() {
      if ( !_this.isOn ) { return; }
      var magnitude = _this.dance.spectrum()[ _this.freq ];
      if ( magnitude >= _this.currentThreshold &&
          magnitude >= _this.threshold ) {
        _this.currentThreshold = magnitude;
        onBeat.call( _this.dance, magnitude );
      } else {
        offBeat.call( _this.dance, magnitude );
        _this.currentThreshold -= _this.decay;
      }
    });
  };

  Beat.prototype = {
    on  : function () { this.isOn = true; },
    off : function () { this.isOn = false; }
  };

  window.Dance.Beat = Beat;
})();
