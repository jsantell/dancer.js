(function() {
  var container;
  var renderer, particle;
  var mouseX = 0, mouseY = 0;

  var stats = new Stats();
  stats.domElement.id = 'stats';
  document.getElementById('info').insertBefore( stats.domElement, document.getElementById('fft') );

  var windowHalfX = window.innerWidth / 2;
  var windowHalfY = window.innerHeight / 2;
  
  // Expose these for the demo
  window.rotateSpeed = 1;
  window.scene = new THREE.Scene();
  window.group = new THREE.Object3D();
  window.program, window.camera;
  init();
  animate();

  function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
    camera.position.z = 1000;

    scene.add( camera );
    scene.add( group );

    var PI2 = Math.PI * 2;
    program = function ( context ) {
      context.beginPath();
      context.arc( 0, 0, 1, 0, PI2, true );
      context.closePath();
      context.fill();
    }

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
    stats.update();
  }

  var t = 0;
  function render() {
    camera.position.x = Math.sin(t * 0.005 * rotateSpeed) * 1000;
    camera.position.z = Math.cos(t * 0.005 * rotateSpeed) * 1000;
//    camera.position.y += ( - mouseY - camera.position.y ) * 0.01;
    camera.lookAt( scene.position );
    t++;
    renderer.render( scene, camera );
  }
})();
