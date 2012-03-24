var options = {
  groups: 10
}

var container;
var camera, scene, renderer, group, particle;
var mouseX = 0, mouseY = 0;

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

group = []

for(var k = 0; k< options.groups; k++) {
  group[k] = new THREE.Object3D();
}

for ( var i = 0; i < 1000; i++ ) {

particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: Math.random() * 0x808008 + 0x808080, program: program } ) );
particle.position.x = Math.random() * 2000 - 1000;
particle.position.y = Math.random() * 2000 - 1000;
particle.position.z = Math.random() * 2000 - 1000;
particle.scale.x = particle.scale.y = Math.random() * 10 + 5;
group[random(0,9)].add( particle )
}

for(var j = 0; j < group.length; j++) {
scene.add(group[j])
}

renderer = new THREE.CanvasRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );

document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener( 'touchstart', onDocumentTouchStart, false );
document.addEventListener( 'touchmove', onDocumentTouchMove, false );
}

//

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

//

function animate() {

requestAnimationFrame( animate );

render();

}

function render() {

camera.position.x += ( mouseX - camera.position.x ) * 0.05;
camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
camera.lookAt( scene.position );

for(var i = 0;i<group.length;i++) {
  group[i].position.x += 100.01;
  group[i].position.y += 100.02;
  group[i].position.z += 100.03;
}


renderer.render( scene, camera );

}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
