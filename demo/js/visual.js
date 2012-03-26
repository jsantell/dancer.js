(function() {
  var container;
  var camera, scene, renderer, particle;
  var mouseX = 0, mouseY = 0;
  window.group = new THREE.Object3D();
  window.rotateSpeed = 1;

  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2;

  init();
  animate();

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
    camera.position.z = 1000;

    scene = new THREE.Scene();

    scene.add( camera );

    var PI2 = Math.PI * 2;
    var program = function ( context ) {
      context.beginPath();
      context.arc( 0, 0, 1, 0, PI2, true );
      context.closePath();
      context.fill();
    }


    for ( var i = 0; i < 500; i++ ) {
      var colors = [0xaaee22, 0x04dbe5, 0xff0077, 0xffb412, 0xf6c83d];
      particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: colors[random(0,colors.length-1)], program: program } ) );
      particle.position.x = Math.random() * 2000 - 1000;
      particle.position.y = Math.random() * 2000 - 1000;
      particle.position.z = Math.random() * 2000 - 1000;
      particle.scale.x = particle.scale.y = Math.random() * 10 + 5;
      group.add( particle );
    }

    scene.add(group);

    renderer = new THREE.CanvasRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );
  }

  function onDocumentMouseMove( event ) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
  }

  function onDocumentTouchStart( event ) {
    if ( event.touches.length == 1 ) {
      event.preventDefault();
      mouseX = event.touches[ 0 ].pageX - windowHalfX;
      mouseY = event.touches[ 0 ].pageY - windowHalfY;
    }
  }

  function onDocumentTouchMove( event ) {
    if ( event.touches.length == 1 ) { 
      event.preventDefault();
      mouseX = event.touches[ 0 ].pageX - windowHalfX;
      mouseY = event.touches[ 0 ].pageY - windowHalfY;
    }
  }

  function animate() {
    requestAnimationFrame( animate );
    render();
  }

  var t = 0;
  function render() {
    camera.position.x = Math.sin(t * 0.005 * rotateSpeed) * 100;
    camera.position.z = Math.cos(t * 0.005 * rotateSpeed) * 100;
    camera.position.y += ( - mouseY - camera.position.y ) * 0.01;
    camera.lookAt( scene.position );
    t++;
    renderer.render( scene, camera );
  }

  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
})();
