(function() {
  var
    fft = document.getElementById( 'fft' ),
    ctx = fft.getContext( '2d' ),
    dancer, kick;

  /*
   * Dancer.js magic
   */
  Dancer.setOptions({
    flashSWF : '../../lib/soundmanager2.swf',
    flashJS  : '../../lib/soundmanager2.js'
  });

  dancer = new Dancer();
  kick = dancer.createKick({
    onKick: function () {
      ctx.fillStyle = '#ff0077';
    },
    offKick: function () {
      ctx.fillStyle = '#666';
    }
  }).on();

  dancer
    .fft( fft, { fillStyle: '#666' })
    .load({microphone: true});

  Dancer.isSupported() || loaded();
  !dancer.isLoaded() ? dancer.bind( 'loaded', loaded ) : loaded();

  /*
   * Loading
   */

  function loaded () {
    var
      loading = document.getElementById( 'loading' ),
      supported = Dancer.isSupported(),
      p;

    if ( !supported ) {
      p = document.createElement('P');
      p.appendChild( document.createTextNode( 'Your browser does not currently support either Web Audio API or Audio Data API. The audio may play, but the visualizers will not move to the music; check out the latest Chrome or Firefox browsers!' ) );
      loading.appendChild( p );
    } else {
      loading.parentNode.removeChild(loading);
    }

  }

  // For debugging
  window.dancer = dancer;

})();
