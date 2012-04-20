// Particle system inspired by
// http://mrdoob.github.com/three.js/examples/canvas_particles_sprites.html
(function() {

  var dance = new Dance('songs/dainsaint-chandrasekharlimit.ogg');
  var beat = dance.createBeat( 0, 180, 3, function () {
    group.children.forEach(function (p) {
      p.material = pMaterial[ ~~(Math.random() * 4) ]; 
    });
  }, function () {
      
  });
  beat.on();
 
  dance.fft( document.getElementById('fft') );

  var
    pSize = 10,
    pCount = 1000,
    pMaterial = [];

  for (var i = 0; i < 4; i++) {
    pMaterial.push(
      new THREE.ParticleBasicMaterial({
        map: new THREE.Texture( generateSprite('color'+i) )
      })
    );
  }
  window.pMaterial = pMaterial;

  function on () {
    var p;
    for ( var i = 0; i < pCount; i++ ) {
      p = new THREE.Particle( pMaterial[0] );
      initParticle( p, i * 10 ); 
      group.add( p );
    }
    dance.play();
  }

  function off () {
    group.children.length = 0;
    dance.stop();
  }

  function initParticle ( particle, delay ) {
    particle = this instanceof THREE.Particle ? this : particle;
    particle.position.x = particle.position.y = particle.position.z = 0;
    particle.scale.x = particle.scale.y = Math.random() * 5 + 1;
    
    delay = delay !== undefined ? delay : 0;

    new TWEEN.Tween( particle )
      .delay( delay )
      .to( {}, 8000 )
      .onComplete( initParticle )
      .start();
    
    new TWEEN.Tween( particle.position )
      .delay( delay )
      .to( { x: Math.random() * 4000 - 2000, y: Math.random() * 4000 - 2000, z: Math.random() * 4000 - 2000 }, 8000 )
      .start();

    new TWEEN.Tween( particle.scale )
      .delay( delay )
      .to( { x: 0, y: 0 }, 8000 )
      .start();
  }
  function generateSprite(color) {

      var canvas = document.createElement( 'canvas' );
      canvas.width = 16;
      canvas.height = 16;

      var context = canvas.getContext( '2d' );
     /* var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
      gradient.addColorStop( 0, '#fff' );
      gradient.addColorStop( 0.2, 'rgba(0,255,255,1)' );
      gradient.addColorStop( 0.4, 'rgba(0,0,64,1)' );
      gradient.addColorStop( 1, '#212426' );
*/
      context.fillStyle = Demo[ color ]; 
      context.fillRect( 0, 0, canvas.width, canvas.height );
      return canvas;
  }

  var song = new Song( 2, dance, beat, on, off );
})();
