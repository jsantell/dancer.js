(function() {

  var
    //dance       = new Dance( "lib/zircon_devils_spirit.ogg" ),
    dance       = new Dance( "lib/anosou_ffvi.ogg" ),
    //dance       = new Dance( "lib/test.ogg" ),
    particles   = group.children,
    pLength     = particles.length,
    canvas      = document.getElementsByTagName('canvas')[0],
    ctx         = canvas.getContext('2d'),
    decayScalar = 2,
    limit       = 40,
    growScalar  = 0.05,
    growVector  = new THREE.Vector3(10, 10, 10),
    decayVector = new THREE.Vector3(decayScalar, decayScalar, decayScalar),
    currentSection = 0,
    colors = [ 0xff0077, 0xAAEE22, 0x04DBE5, 0xFFB412 ];
    colorsStrings = [ '#ff0077', '#AAEE22', '#04DBE5', '#FFB412' ];


  /* FFT for debugging */
  var
    fft = document.getElementById('fft'),
    ctx = fft.getContext('2d');

  var beat = dance.createBeat( 0, 200, 0.5, function( mag ) {
    setSize( mag * growScalar );
  }, function( mag ) {
    decay();
  });

  var bgBeat = dance.createBeat( 0, 240, 0.5, function( mag ) {
      document.getElementsByTagName('body')[0].style.backgroundColor=colorsStrings[ ~~(Math.random() * 4) ];
    }, function( mag ) {
      document.getElementsByTagName('body')[0].style.backgroundColor='#212426';
    });
  dance.onceAt( 0, function() {
    beat.on();
    bgBeat.on();
  });
  
  dance.fft( fft ).onceAt( 0, function() {
    rotateSpeed += 0.5
    for (i = 0; i < pLength; i++) {
      particles[i].material.color.setRGB(0.9,0.9,0.9);
    }
  }).onceAt( 16.2, function() {
    if (rotateSpeed < 1.5) rotateSpeed += 0.05;
  }).between( 16.8, 27.2, function() {
    for (i = 0; i < pLength; i++) {
      particles[i].material.color.setHex( colors[i%4] );
    }
  }).onceAt( 49, function() {
    rotateSpeed = 0.5;
    growScalar = 0.15;
    limit = 60;
  }).onceAt( 66.5, function() {
      
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

  // Something about THREE.js canvas creation timing, no callback, slopppyyyy fix
  (function composite () {
    setTimeout(function() {
      ctx.globalCompositeOperation = 'lighter';
      if ( ctx.globalCompositeOperation != 'lighter' ) { composite(); }
    }, 100);
  })();
})();
