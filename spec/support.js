describe('Support', function () {

  describe('addPlugin()', function () {
    it('Should add a method to the prototype if not in the chain', function () {
      var fn = jasmine.createSpy();
      Dancer.addPlugin('pluginname', fn);
      dancer.pluginname('arggg');
      expect(fn).toHaveBeenCalledWith('arggg');
    });

    it('Should pass the dancer instance as the "this" context', function () {
      Dancer.addPlugin('pluginname2', function() { return this; });
      expect(dancer.pluginname2()).toBe(dancer);
    });

    it('Should not allow a rebinding of a preexisting prototype method or plugin', function () {
      var
        origMethod = Dancer.prototype.play,
        newMethod = function() { };
      Dancer.addPlugin('play', newMethod);
      Dancer.addPlugin('pluginname', newMethod); // Used in previous test
      expect(dancer.play).toBe(origMethod);
      expect(dancer.pluginname).not.toBe(newMethod);
    });
  });

  describe('isSupported()', function () {
    var webAudio = window.webkitAudioContext || window.AudioContext,
      audioData  = window.Audio && (new window.Audio()).mozSetup ? window.Audio : null;

    it('Should return null if typed arrays are not present', function () {
      var
        f32 = window.Float32Array,
        u32 = window.Uint32Array;
      expect( !f32 || !u32 ).toBe( !Dancer.isSupported() );
      window.Float32Array = null;
      window.Uint32Array = null;
      expect( Dancer.isSupported() ).toBeFalsy();
      window.Float32Array = f32;
      window.Uint32Array = u32;
    });
    
    it('Should test whether or not the browser supports Web Audio or Audio Data or flash', function () {
      expect(Dancer.isSupported()).toBeTruthy();
      expect(!!webAudio).toBe(Dancer.isSupported()==='webaudio');
      expect(!!audioData).toBe(Dancer.isSupported()==='audiodata');
      expect(!!webAudio && !!audioData && FlashDetect.versionAtLeast(9)).toBe(Dancer.isSupported()==='flash');
    });
  });

  describe('canPlay()', function () {
    it('Should return the correct support for current browser', function () {
      var audio = document.createElement('audio'),
      canMp3 = audio.canPlayType && audio.canPlayType('audio/mpeg;').replace(/no/,''),
      canOgg = audio.canPlayType && audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/,''),
      canWav = audio.canPlayType && audio.canPlayType('audio/wav; codecs="1"').replace(/no/,''),
      canAac = audio.canPlayType && audio.canPlayType('audio/mp4; codecs="mp4a.40.2"').replace(/no/,'');
      if ( Dancer.isSupported() === 'flash' ) {
        expect(Dancer.canPlay('MP3')).toBeTruthy();
        expect(Dancer.canPlay('oGg')).toBeFalsy();
        expect(Dancer.canPlay('WaV')).toBeFalsy();
        expect(Dancer.canPlay('aac')).toBeFalsy();
      } else {
        expect(Dancer.canPlay('MP3')).toEqual(!!canMp3);
        expect(Dancer.canPlay('oGg')).toEqual(!!canOgg);
        expect(Dancer.canPlay('WaV')).toEqual(!!canWav);
        expect(Dancer.canPlay('aac')).toEqual(!!canAac);
      }
    });
  });

  describe('_makeSupportedPath', function () {
    var
      pathWithExt = '/path/to/audio.ogg',
      pathWithoutExt = '/path/to/audio';
    it('Should return a path unmodified if no codecs given', function () {
      expect(Dancer._makeSupportedPath( pathWithExt )).toEqual(pathWithExt);
    });
    it('Should return a path with first usable codec when codecs given', function () {
      var otherValidCodec = Dancer.canPlay('wav') ? 'wav' : ( Dancer.canPlay('mp3') ? 'mp3' : 'ogg' );
      if ( Dancer.isSupported() === 'flash' ) {
        expect(Dancer._makeSupportedPath( pathWithoutExt, [ 'ogg', 'wav', 'mp3' ] )).toEqual(pathWithoutExt + '.mp3')
      } else {
        expect(Dancer._makeSupportedPath( pathWithoutExt, [ 'bogus', 'codec', 'ogg' ] )).toEqual(pathWithoutExt + '.ogg');
        expect(Dancer._makeSupportedPath( pathWithoutExt, [ otherValidCodec, 'ogg' ] )).toEqual(pathWithoutExt + '.' + otherValidCodec);
      }
    });
  });
  
  describe('setOptions()', function () {
    it('Should set options correctly', function () {
      Dancer.setOptions({ test1: 'cheeseburger', test2: 'megaman' });
      Dancer.setOptions({ test1: 'cheeseburger' });
      expect(Dancer.options.test1).toBe('cheeseburger');
      expect(Dancer.options.test2).toBe('megaman');
    });
  });
});
