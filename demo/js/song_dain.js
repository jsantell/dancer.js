(function() {

  var dance = new Dance('songs/dainsaint-chandrasekharlimit.ogg');
  var beat;
  var song = new Song( 2, dance, beat, on, off );

  function on() {
    for ( var i = 0; i < 500; i++ ) {
      var colors = [0xaaee22, 0x04dbe5, 0xff0077, 0xffb412, 0xf6c83d];
      particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: colors[Math.random()*4], program: program } ) );
      particle.position.x = Math.random() * 2000 - 1000;
      particle.position.y = Math.random() * 2000 - 1000;
      particle.position.z = Math.random() * 2000 - 1000;
      particle.scale.x = particle.scale.y = Math.random() * 10 + 5;
      group.add( particle );
    }
    scene.add(group);
    
    dance.play();
  }

  function off() {
    group.children.length = 0;
    dance.stop();
  }

})();
