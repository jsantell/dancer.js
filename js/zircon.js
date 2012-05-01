(function () {

  var
    P_COUNT = 400,
    LIMIT = 50,
    GROWTH_RATE = 10,
    DECAY_RATE = 1.5,
    GROWTH_VECTOR = new THREE.Vector3( GROWTH_RATE, GROWTH_RATE, GROWTH_RATE ),
    DECAY_VECTOR = new THREE.Vector3( DECAY_RATE, DECAY_RATE, DECAY_RATE ),
    t, particles = group.children,
    BEAM_RATE = 0.5,
    BEAM_COUNT = 20,
    beamGroup = new THREE.Object3D(),
    colors = [ 0xaaee22, 0x04dbe5, 0xff0077, 0xffb412, 0xf6c83d ];

  var dancer = new Dancer('./songs/zircon_devils_spirit.ogg');
  var beat = dancer.createBeat({
    onBeat: function () {
      if ( particles[ 0 ].scale.x > LIMIT ) {
        decay();
        return;
      }
      for ( var i = 0; i < P_COUNT; i++ ) {
        particles[ i ].scale.addSelf( GROWTH_VECTOR );
      }
      for ( i = 0; i < BEAM_COUNT; i++ ) {
        beamGroup.children[ i ].visible = true;
      }
    },
    offBeat: decay
  });

  dancer.onceAt( 0, function () {
    beat.on();
  }).onceAt( 8.2, function () {
    scene.add( beamGroup );
  }).after( 8.2, function () {
    beamGroup.rotation.x += BEAM_RATE;
    beamGroup.rotation.y += BEAM_RATE;
  }).fft( document.getElementById( 'fft' ) );

  if ( !dancer.isLoaded() ) {
    dancer.bind( 'loaded', function () {
      document.getElementById('loading').style.display = 'none';
    });
  } else {
    document.getElementById('loading').style.display = 'none';
  }

  function on () {
    for ( var i = 0; i < P_COUNT; i++ ) {
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

    // Beam idea from http://www.airtightinteractive.com/demos/js/nebula/

    var
      beamGeometry = new THREE.PlaneGeometry( 5000, 50, 1, 1 ),
      beamMaterial, beam;

    for ( i = 0; i < BEAM_COUNT; i++ ) {
      beamMaterial = new THREE.MeshBasicMaterial({
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        color: colors[ ~~( Math.random() * 5 )]
      });
      beam = new THREE.Mesh( beamGeometry, beamMaterial );
      beam.doubleSided = true;
      beam.rotation.x = Math.random() * Math.PI;
      beam.rotation.y = Math.random() * Math.PI;
      beam.rotation.z = Math.random() * Math.PI;
      beamGroup.add( beam );
    }

    dancer.play();

    var ctx = document.getElementsByTagName( 'canvas' )[1].getContext( '2d' );

    // Sloppy fix for creation of THREE.js auto canvas, whatev
  /*  (function composite () {
      setTimeout(function () {
        ctx.globalCompositeOperation = 'lighter';
        if ( ctx.globalCompositeOperation != 'lighter' ) composite();
      }, 100);
    })();*/
  }

  function decay () {
    if ( particles[ 0 ].scale.x - DECAY_RATE < 0 ) return;
    for ( var i = 0; i < P_COUNT; i++ ) {
      particles[ i ].scale.subSelf( DECAY_VECTOR );
    }
    if ( !beamGroup.children[ 0 ].visible ) return;
    for ( i = 0; i < BEAM_COUNT; i++ ) {
      beamGroup.children[ i ].visible = false;
    }
  }

  on();
})();
