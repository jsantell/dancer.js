(function() {
  var dance = new Dance( "lib/setmeonfire.ogg" );

  dance.onBeat( 0, 0.01, function( mag ) {
    console.log( "On beat!", mag );
  }, function( mag ) {
    console.log( mag );
  });
  dance.play();
})();
