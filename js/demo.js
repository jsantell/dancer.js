(function() {

  var
    dance       = new Dance( "lib/setmeonfire.ogg" ),
    particles   = group.children,
    pLength     = particles.length,
    canvas      = document.getElementsByTagName('canvas')[0],
    ctx         = canvas.getContext('2d'),
    decayScalar = 3,
    limit       = 40,
    growScalar  = 200,
    growVector  = new THREE.Vector3(10, 10, 10),
    decayVector = new THREE.Vector3(decayScalar, decayScalar, decayScalar),
    currentSection = 0,
    colors = [ 0xff0077, 0xAAEE22, 0x04DBE5, 0xFFB412 ];

  dance.onBeat( 5, 0.03, function( mag ) {
    setSize( mag * growScalar );
    changeSection();
  }, function( mag ) {
    decay();
    changeSection();
  });

  dance.play();

  function setSize ( mag ) {
    if ( particles[ 0 ].scale.x + mag > limit) {
      decay();
      return;
    }
    growVector.set( mag, mag, mag );
    for ( var i = 0; i < pLength; i++ ) {
      particles[ i ].scale.addSelf( growVector );
    }
  }

  function decay () {
    if ( particles[ 0 ].scale.x - decayScalar < 0 ) return;
    for ( var i = 0; i < pLength; i++ ) {
      particles[ i ].scale.subSelf( decayVector );
    }
  }

  function changeSection () {
    var i;
    switch ( currentSection ) {
      case 0:
        rotateSpeed = -1;
        if ( dance.time > 13.2 ) { currentSection = 1; }
        break;
      case 1:
        if (rotateSpeed < 1) rotateSpeed += 0.1;
        if ( dance.time > 27.2 ) { currentSection = 2; }
        break;
      case 2: // Buildup
        rotateSpeed = dance.time < 40.3 ? rotateSpeed + 0.003 : 0;
        for (i = 0; i < pLength; i++) { particles[i].material.color.setRGB(0.9,0.9,0.9); }
        if ( dance.time > 41.2 ) { currentSection = 3; }
        break;
      case 3: // Breakdown
        rotateSpeed = 1.5;
        growScalar = 400;
        limit = 60;
        for (i = 0; i < pLength; i++) { particles[i].material.color.setHex( colors[i%4] ); }
        break;
    }
  }

  // Something about THREE.js canvas creation timing, no callback, slopppyyyy fix
  (function composite () {
    setTimeout(function() {
      ctx.globalCompositeOperation = 'lighter';
      if ( ctx.globalCompositeOperation != 'lighter' ) { composite(); }
    }, 100);
  })();
})();
