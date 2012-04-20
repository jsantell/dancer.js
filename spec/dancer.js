describe('Dancer', function () {

  var
    dancer = null,
    song  = 'lib/test.ogg';

  beforeEach(function () {
    dancer = new Dancer(song);
  });

  afterEach(function () {
    dancer.stop();
  });

  // TODO WTF http://www.w3.org/2011/audio/track/issues/3?changelog
  it('WEBKIT CANNOT DELETE AUDIO CONTEXTS?', function () {
    expect(navigator.userAgent.match(/WebKit/)).toBeFalsy();
  });

  describe('Init', function () {
    it('Should use the correct audio adapter', function () {
      var adapter = navigator.userAgent.match(/WebKit/) ?
        Dancer.adapters.webkit :
        Dancer.adapters.moz;
      expect(dancer.audioAdapter instanceof adapter).toBeTruthy();
    });

    it('Should bind an update event', function () {
      expect(dancer.events.update).toBeDefined();
    });
  });

  describe('Controls', function () {
    it("Should call adapter's play/stop method via dancer.play(), dancer.stop()", function () {
      spyOn(dancer.audioAdapter, 'play');
      spyOn(dancer.audioAdapter, 'stop');
      dancer.play();
      expect(dancer.audioAdapter.play).toHaveBeenCalled();
      dancer.stop();
      expect(dancer.audioAdapter.stop).toHaveBeenCalled();
    });

    it("Should return dancer instance when calling dancer.play(), dancer.stop()", function() {
      var
        playReturn = dancer.play(),
        stopReturn = dancer.stop();
      expect(playReturn).toBe(dancer);
      expect(stopReturn).toBe(dancer);
    });
  });

  describe('Create Beat', function () {

  });

  // TODO async test for getTime();
  describe('Getters', function () {
    it("Should call adapter's getTime() function from time()", function () {
      dancer.play();
      spyOn(dancer.audioAdapter, 'getTime');

      waitsFor(function () {
        return dancer.isLoaded();
      }, 'Song was never loaded', 3000);

      runs(function () {
        var t = dancer.time();
        expect(dancer.audioAdapter.getTime).toHaveBeenCalled();
        expect(t).toBeGreaterThan(0);
      });
    });

    it("Should call audioAdapter's getSpectrum() method from spectrum()", function () {
      spyOn(dancer.audioAdapter, 'getSpectrum');
      dancer.spectrum();
      expect(dancer.audioAdapter.getSpectrum).toHaveBeenCalled();
    });

    it("Should call adapter's loaded boolean from isLoaded()", function () {
      dancer.audioAdapter.loaded = true;
      expect(dancer.isLoaded()).toBeTruthy();
      dancer.audioAdapter.loaded = false;
      expect(dancer.isLoaded()).toBeFalsy();
    });

    it("Should return the magnitude of the spectrum via frequency(x), and average for frequency(x,y)", function () {
      var mockSpectrum = [ 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ];
      dancer.spectrum = function() { return mockSpectrum; };
      expect(dancer.frequency(3)).toEqual(8);
      expect(dancer.frequency(3, 7)).toEqual(10);
    });

  });

  // TODO async tests for sections
  describe('Sections', function () {

  });

  // TODO test the prebindings of 'update' and 'loaded'
  describe('Pub/Sub Bindings', function () {
    var
      fn1 = jasmine.createSpy(),
      fn2 = jasmine.createSpy(),
      fn3 = jasmine.createSpy();

    beforeEach(function () {
        dancer.bind('eventA', fn1);
        dancer.bind('eventA', fn2);
        dancer.bind('eventB', fn3);
    });

    describe('Bind', function () {
      it('Should bind several events under the same name and different names', function () {
        expect(dancer.events.eventA[0]).toBe(fn1);
        expect(dancer.events.eventA[1]).toBe(fn2);
        expect(dancer.events.eventB[0]).toBe(fn3);
      });
    });

    describe('Unbind', function () {
      it('Should unbind all events of a shared name', function () {
        dancer.unbind('eventA');
        expect(dancer.events.eventA).toBeFalsy();
        expect(dancer.events.eventB[0]).toBe(fn3);
      });
    });

    describe('Trigger', function () {
      it('Should call all events of a shared name, and no others', function () {
        dancer.trigger('eventA');
        expect(fn1).toHaveBeenCalled();
        expect(fn2).toHaveBeenCalled();
        expect(fn3).not.toHaveBeenCalled();
      });
    });
  });

  describe('Add Plugin', function () {
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
});
