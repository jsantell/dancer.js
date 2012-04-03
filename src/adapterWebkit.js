(function() {
  SAMPLE_SIZE = 2048;

  var adapter = function ( danceInstance ) {
    this.context = new ( window.AudioContext || window.webkitAudioContext )();
    this.source = this.context.createBufferSource();
    this.analyser = this.context.createAnalyser();
    this.loaded = false;
    this.data   = new Uint8Array( this.analyser.frequencyBinCount );
    this.analyser.fftSize = SAMPLE_SIZE / 2;
    this.source.connect( this.analyser );
    this.analyser.connect( this.context.destination );
  }

  adapter.prototype = {
    init : function ( path, callback ) {
      var
        req = new XMLHttpRequest(),
        _this = this;

      req.open( 'GET', path, true );
      req.responseType = 'arraybuffer';

      req.onload = function () {
        if ( _this.context.decodeAudioData ) {
          _this.context.decodeAudioData( req.response, function( buffer ) {
            _this.source.buffer = buffer;
          }, function( e ) {
            console.log( e );
          });
        } else {
          _this.source.buffer = _this.context.createBuffer( req.response, false );
        }
        _this.loaded = true;
      };
      req.send();

      this.proc = this.context.createJavaScriptNode( SAMPLE_SIZE, 1, 1 );
      this.proc.onaudioprocess = this.update;
    },
    play : function () {
      var _this = this;
      (function play() {
        setTimeout(function() {
          _this.loaded ? _this.source.noteOn( 0.0 ) : play();
        }, 10);
      })();
    },
    stop : function () { },
    getSpectrum : function () { return this.data; },
    update : function ( e ) {
      this.analyser.getByteFrequencyData( this.data );
    }
  };

  Dance.adapters.webkit = adapter;

})();
