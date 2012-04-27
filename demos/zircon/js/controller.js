(function() {
  var Demo = {
    speed         : 0,
    beatFrequency : 0,//3,
    beatThreshold : 0.8,//150,
    beatDecay     : 2,//8,
    showFFT       : false,
    song          : 0,
    color0        : '#ff0077',
    color1        : '#aaee22',
    color2        : '#04dbe5',
    color3        : '#ffb412'
  };

  var gui = new dat.GUI();

  var beatFolder = gui.addFolder( 'Beat' );
  beatFolder.add( Demo, 'beatFrequency', 0, 1023, 1 ).onChange( changeBeatData );
  beatFolder.add( Demo, 'beatThreshold', 0, 1, 0.05 ).onChange( changeBeatData );
  beatFolder.add( Demo, 'beatDecay', 0, 1 ).onChange( changeBeatData );
  beatFolder.open();

  function changeBeatData () {
    var beat = Song.songs[ Song.current ].beat;
    // dat.gui only constrains steps if using text field; ensure freq is an int
    beat.frequency = ~~Demo.beatFrequency;
    beat.threshold = Demo.beatThreshold;
    beat.decay = Demo.beatDecay;
  }

  var colorFolder = gui.addFolder( 'Colors' );
  colorFolder.addColor( Demo, 'color0' );
  colorFolder.addColor( Demo, 'color1' );
  colorFolder.addColor( Demo, 'color2' );
  colorFolder.addColor( Demo, 'color3' );

  gui.add( Demo, 'showFFT' ).onChange(function (newVal) {
    document.getElementById( 'fft' ).style.display = newVal ? 'block' : 'none';
  });

  gui.add( Demo, 'song', {
    'Zircon - Devil\'s Spirit' : 0,
    'Anosou - Magicite' : 1,
    'Dain Saint - ssdfasdf' : 2
  }).onChange(function (newVal) {
    Song.changeSong( newVal );
  });

  window.Demo = Demo;
})();
