(function() {

  var dance = new Dance('songs/zircon_devils_spirit.ogg');
  var beat = dance.createBeat( 3, 150, 8, function () {
    for (var i = 0, l = group.children.length; i < l; i++) {
      var t = Math.random()*2 + 1;
      //t = isWebkit ? t * 0.5 : t;
      group.children[ i ].scale.y = t; 
    }
  }, function() {
    for (var i = 0, l = group.children.length; i < l; i++) {
      if ( group.children[ i ].scale.y > 1 )
        group.children[ i ].scale.y -= 0.05; 
    }
  });
  
  var isWebkit = !!navigator.userAgent.match(/WebKit/);
  dance.onceAt( 0, function() {
    beat.on();
  }).after( 5, function() {
    var
      spectrum = this.spectrum(),
      skip = 1024 / (planeSize * planeSize),
      t, y;
 /*   for (var i = 0, l = group.children.length; i < l; i++) {
      t = spectrum[ i * 4 ] * 0.1;
      t = isWebkit ? t * 0.1 : t;
      y = group.children[ i ].scale.y;
      if ( t > y )
        group.children[ i ].scale.y = t;
      else if ( y > 1 )
        group.children[ i ].scale.y -= 0.05;
    }*/
  });
  dance.fft( document.getElementById('fft') );




  var
    columnSize = 30,
    planeSize  = 16; // sqrt(1024)

  function on() {
    var
      geo = new THREE.CubeGeometry( columnSize, columnSize, columnSize ),
      mat = new THREE.MeshBasicMaterial(),
      displacement = columnSize * planeSize / 2,
      column;
    for ( var i = 0; i < planeSize; i++ ) {
      for ( var j = 0; j < planeSize; j++ ) {
        column = new THREE.Mesh( geo, mat );
        column.position.x = (i * columnSize) - displacement;
        column.position.z = (j * columnSize) - displacement;
        group.add( column );
      }
    }
    dance.play();
  }

  function off() {
    group.children.length = 0;
    dance.stop();
  }

  new Song( 0, dance, beat, on, off );

})();
