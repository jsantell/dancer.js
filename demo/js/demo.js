(function() {
  var
    audio = new Audio(),
    dance;
  
  audio.src = "lib/setmeonfire.ogg";
  dance = new Dance( audio );

  dance.onBeat( 0, 50, function( mag ) {
    console.log( "On beat!", mag );
  }, function( mag ) {
    console.log( mag );
  });

})();
