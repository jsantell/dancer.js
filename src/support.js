(function ( Dancer ) {

  var CODECS = {
    'mp3' : 'audio/mpeg;',
    'ogg' : 'audio/ogg; codecs="vorbis"',
    'wav' : 'audio/wav; codecs="1"',
    'aac' : 'audio/mp4; codecs="mp4a.40.2"'
  },
  audioEl = document.createElement( 'audio' );

  Dancer.options = {};

  Dancer.setOptions = function ( o ) {
    for ( var option in o ) {
      if ( o.hasOwnProperty( option ) ) {
        Dancer.options[ option ] = o[ option ];
      }
    }
  };

  Dancer.isSupported = function () {
    if ( !window.Float32Array || !window.Uint32Array ) {
      return null;
    } else if ( window.AudioContext || window.webkitAudioContext ) {
      return 'webaudio';
    } else if ( window.Audio && ( new window.Audio() ).mozSetup ) {
      return 'audiodata';
    } else if ( FlashDetect.versionAtLeast( 9 ) ) {
      return 'flash';
    } else {
      return '';
    }
  };

  Dancer.canPlay = function ( type ) {
    var canPlay = audioEl.canPlayType;
    return !!(
      Dancer.isSupported() === 'flash' ?
        type.toLowerCase() === 'mp3' :
        audioEl.canPlayType &&
        audioEl.canPlayType( CODECS[ type.toLowerCase() ] ).replace( /no/, ''));
  };

  Dancer.addPlugin = function ( name, fn ) {
    if ( Dancer.prototype[ name ] === undefined ) {
      Dancer.prototype[ name ] = fn;
    }
  };

  Dancer._makeSupportedPath = function ( source, codecs ) {
    if ( !codecs ) { return source; }

    for ( var i = 0; i < codecs.length; i++ ) {
      if ( Dancer.canPlay( codecs[ i ] ) ) {
        return source + '.' + codecs[ i ];
      }
    }
    return source;
  };

  Dancer._getAdapter = function ( instance ) {
    switch ( Dancer.isSupported() ) {
      case 'webaudio':
        return new Dancer.adapters.webkit( instance );
      case 'audiodata':
        return new Dancer.adapters.moz( instance );
      case 'flash':
        return new Dancer.adapters.flash( instance );
      default:
        return null;
    }
  };

})( window.Dancer );
