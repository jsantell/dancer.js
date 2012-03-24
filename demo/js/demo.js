(function() {

  var
    dance     = new Dance( "lib/setmeonfire.ogg" ),
    particles = group[0].children,
    pLength   = particles.length,
    canvas    = document.getElementsByTagName('canvas')[0];

  canvas.getContext('2d').globalCompositeOperation = 'lighter';

  dance.onBeat( 0, 0.003, function( mag ) {
    displacement( mag * 300 );
  }, function( mag ) {
    displacement( mag * -100 );
  });
  dance.play();

  function displacement ( mag ) {
    for ( var i = 0; i < pLength; i++ ) {
        particles[ i ].scale = (new THREE.Vector3( mag, mag, mag));
    }
  }
})();
