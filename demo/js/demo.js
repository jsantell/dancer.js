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

  dance.play();

  dance.after( 0, function() {
    dance.onBeat( 5, 0.03, function( mag ) {
      setSize( mag * growScalar );
    }, function( mag ) {
      decay();
    });
  });

  dance.onceAt( 0, function() {
    rotateSpeed = -1;
  }).between( 13.2, 27.2, function() {
    if (rotateSpeed < 1) rotateSpeed += 0.1;
  }).onceAt( 27.2, function() {
    for (i = 0; i < pLength; i++) {
      particles[i].material.color.setRGB(0.9,0.9,0.9);
    }
  }).between( 27.2, 40.3, function() {
    rotateSpeed = dance.time() < 40.3 ? rotateSpeed + 0.003 : 0;
  }).onceAt( 40.3, function() {
    rotateSpeed = 1.5;
    growScalar = 400;
    limit = 60;
    for (i = 0; i < pLength; i++) {
      particles[i].material.color.setHex( colors[i%4] );
    }
  });
  
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

  // Something about THREE.js canvas creation timing, no callback, slopppyyyy fix
  (function composite () {
    setTimeout(function() {
      ctx.globalCompositeOperation = 'lighter';
      if ( ctx.globalCompositeOperation != 'lighter' ) { composite(); }
    }, 100);
  })();
})();
