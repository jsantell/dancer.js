(function() {
  var Beat = function ( dance, freq, threshold, decay, onBeat, offBeat ) {
    this.dance     = dance;
    this.freq      = freq;
    this.threshold = threshold;
    this.decay     = decay;
    this.onBeat    = onBeat;
    this.offBeat   = offBeat;
    this.isOn      = false;
    
    var _this = this;
    this.dance.bind( 'update', function() {
      if ( !_this.isOn ) { return; }
      var magnitude = _this.dance.spectrum()[ _this.freq ];
      magnitude >= _this.threshold ?
        onBeat.call( _this.dance, magnitude ) :
        offBeat.call( _this.dance, magnitude );
    });
  };

  Beat.prototype = {
    on  : function () { this.isOn = true; },
    off : function () { this.isOn = false; }
  };

  window.Dance.Beat = Beat;
})();
