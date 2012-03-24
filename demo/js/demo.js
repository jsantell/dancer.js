(function() {
    
  var audio = new Dance( (new Audio()).src = "lib/setmeonfire.ogg" );
  audio.onBeat( 0, 50, function( mag ) {
    console.log( "On beat!", mag );
  }, function( mag ) {
    console.log( mag );
  });

})();
