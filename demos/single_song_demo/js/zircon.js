(function () {

  var
    P_COUNT = 500,
    LIMIT = 40,
    GROWTH_RATE = 5,
    DECAY_RATE = 5,
    GROWTH_VECTOR = new THREE.Vector3( GROWTH_RATE, GROWTH_RATE, GROWTH_RATE ),
    DECAY_VECTOR = new THREE.Vector3( DECAY_RATE, DECAY_RATE, DECAY_RATE ),
    t, particles = group.children;

  var dancer = new Dancer('../songs/zircon_devils_spirit.ogg');
  var beat = dancer.createBeat({
    onBeat: function () {
      if ( particles[ 0 ].scale.x > LIMIT ) {
        decay();
        return;
      }
      for ( var i = 0; i < P_COUNT; i++ ) {
        particles[ i ].scale.addSelf( GROWTH_VECTOR );
      }
    },
    offBeat: decay
  });

  dancer.onceAt( 0, function () {
    beat.on();
  }).after( 5, function () {
  
  });
  dancer.fft( document.getElementById('fft') );

  function on () {
    for ( var i = 0; i < P_COUNT; i++ ) {
      var colors = [ 0xaaee22, 0x04dbe5, 0xff0077, 0xffb412, 0xf6c83d ];
      particle = new THREE.Particle(
        new THREE.ParticleCanvasMaterial({
          color: colors[ ~~( Math.random() * 5 )],
          program: program
        })
      );
      particle.position.x = Math.random() * 2000 - 1000;
      particle.position.y = Math.random() * 2000 - 1000;
      particle.position.z = Math.random() * 2000 - 1000;
      particle.scale.x = particle.scale.y = Math.random() * 10 + 5;
      group.add( particle );
    }
    scene.add( group );

    dancer.play();
  }

  function decay () {
    if ( particles[ 0 ].scale.x - DECAY_RATE < 0 ) return;
    for ( var i = 0; i < P_COUNT; i++ ) {
      particles[ i ].scale.subSelf( DECAY_VECTOR );
    }
  }

  on();
})();
