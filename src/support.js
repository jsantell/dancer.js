(function ( Dancer ) {

  var CODECS = {
    'mp3' : 'audio/mpeg;',
    'ogg' : 'audio/ogg; codecs="vorbis"',
    'wav' : 'audio/wav; codecs="1"',
    'aac' : 'audio/mp4; codecs="mp4a.40.2"'
  },
  audioEl = document.createElement( 'audio' );

  Dancer.isSupported = function () {
    return !!( window.AudioContext ||
      window.webkitAudioContext ||
      window.Audio && ( new window.Audio() ).mozSetup );
  };

  Dancer.canPlay = function ( type ) {
    return !!( audioEl.canPlayType &&
      audioEl.canPlayType( CODECS[ type.toLowerCase() ] ).replace( /no/, '' ) );
  };
  
  Dancer.addPlugin = function ( name, fn ) {
    if ( Dancer.prototype[ name ] === undefined ) {
      Dancer.prototype[ name ] = fn;
    }
  };

})( window.Dancer );
