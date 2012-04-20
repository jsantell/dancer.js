(function() {
  var Song = function( id, dancer, beat, on, off ) {
    this.id = id;
    this.dancer = dancer;
    this.beat = beat;
    this.on = on;
    this.off = off;
    Song.songs[ id ] = this;
  };

  Song.songs = {};
  Song.current = null;

  Song.changeSong = function( to ) {
    if ( Song.current !== null ) {
      Song.songs[ Song.current ].off();
    }
    Song.songs[ to ].on();
    Song.current = to;
  };

  window.Song = Song;
})();
