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
    } else if ( !isUnsupportedSafari() && ( window.AudioContext || window.webkitAudioContext )) {
      return 'webaudio';
    } else if ( audioEl && audioEl.mozSetup ) {
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
        return new Dancer.adapters.webaudio( instance );
      case 'audiodata':
        return new Dancer.adapters.moz( instance );
      case 'flash':
        return new Dancer.adapters.flash( instance );
      default:
        return null;
    }
  };

  Dancer._getMP3SrcFromAudio = function ( audioEl ) {
    var sources = audioEl.children;
    if ( audioEl.src ) { return audioEl.src; }
    for ( var i = sources.length; i--; ) {
      if (( sources[ i ].type || '' ).match( /audio\/mpeg/ )) return sources[ i ].src;
    }
    return null;
  };

  // Browser detection is lame, but Safari 6 has Web Audio API,
  // but does not support processing audio from a Media Element Source
  // https://gist.github.com/3265344
  function isUnsupportedSafari () {
    var
      isApple = !!( navigator.vendor || '' ).match( /Apple/ ),
      version = navigator.userAgent.match( /Version\/([^ ]*)/ );
    version = version ? parseFloat( version[ 1 ] ) : 0;
    return isApple && version <= 6;
  }

})( window.Dancer );
