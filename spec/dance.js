describe('Dance', function () {

  var
    dance = null,
    song  = 'lib/test.ogg';

  beforeEach(function () {
    dance = new Dance(song);
  });

  afterEach(function () {
    dance.stop();
  });

  // TODO WTF http://www.w3.org/2011/audio/track/issues/3?changelog
  it('WEBKIT CANNOT DELETE AUDIO CONTEXTS?', function () {
    expect(navigator.userAgent.match(/WebKit/)).toBeFalsy();
  });

  describe('Init', function () {
    it('Should use the correct audio adapter', function () {
      var adapter = navigator.userAgent.match(/WebKit/) ?
        Dance.adapters.webkit :
        Dance.adapters.moz;
      expect(dance.audioAdapter instanceof adapter).toBeTruthy();
    });

    it('Should bind an update event', function () {
      expect(dance.events.update).toBeDefined();
    });
  });

  describe('Controls', function () {
    it("Should call adapter's play/stop method via dance.play(), dance.stop()", function () {
      spyOn(dance.audioAdapter, 'play');
      spyOn(dance.audioAdapter, 'stop');
      dance.play();
      expect(dance.audioAdapter.play).toHaveBeenCalled();
      dance.stop();
      expect(dance.audioAdapter.stop).toHaveBeenCalled();
    });

    it("Should return dance instance when calling dance.play(), dance.stop()", function() {
      var
        playReturn = dance.play(),
        stopReturn = dance.stop();
      expect(playReturn).toBe(dance);
      expect(stopReturn).toBe(dance);
    });
  });

  describe('Create Beat', function () {

  });

  // TODO async test for getTime();
  describe('Getters', function () {
    it("Should call adapter's getTime() function from time()", function () {
      dance.play();
      spyOn(dance.audioAdapter, 'getTime');

      waitsFor(function () {
        return dance.isLoaded();
      }, 'Song was never loaded', 3000);

      runs(function () {
        var t = dance.time();
        expect(dance.audioAdapter.getTime).toHaveBeenCalled();
        expect(t).toBeGreaterThan(0);
      });
    });

    it("Should call audioAdapter's getSpectrum() method from spectrum()", function () {
      spyOn(dance.audioAdapter, 'getSpectrum');
      dance.spectrum();
      expect(dance.audioAdapter.getSpectrum).toHaveBeenCalled();
    });

    it("Should call adapter's loaded boolean from isLoaded()", function () {
      dance.audioAdapter.loaded = true;
      expect(dance.isLoaded()).toBeTruthy();
      dance.audioAdapter.loaded = false;
      expect(dance.isLoaded()).toBeFalsy();
    });

    it("Should return the magnitude of the spectrum via frequency(x), and average for frequency(x,y)", function () {
      var mockSpectrum = [ 5, 6, 7, 8, 9, 10, 11, 12, 13, 14 ];
      dance.spectrum = function() { return mockSpectrum; };
      expect(dance.frequency(3)).toEqual(8);
      expect(dance.frequency(3, 7)).toEqual(10);
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
        dance.bind('eventA', fn1);
        dance.bind('eventA', fn2);
        dance.bind('eventB', fn3);
    });

    describe('Bind', function () {
      it('Should bind several events under the same name and different names', function () {
        expect(dance.events.eventA[0]).toBe(fn1);
        expect(dance.events.eventA[1]).toBe(fn2);
        expect(dance.events.eventB[0]).toBe(fn3);
      });
    });

    describe('Unbind', function () {
      it('Should unbind all events of a shared name', function () {
        dance.unbind('eventA');
        expect(dance.events.eventA).toBeFalsy();
        expect(dance.events.eventB[0]).toBe(fn3);
      });
    });

    describe('Trigger', function () {
      it('Should call all events of a shared name, and no others', function () {
        dance.trigger('eventA');
        expect(fn1).toHaveBeenCalled();
        expect(fn2).toHaveBeenCalled();
        expect(fn3).not.toHaveBeenCalled();
      });
    });
  });

  describe('Add Plugin', function () {
    it('Should add a method to the prototype if not in the chain', function () {
      var fn = jasmine.createSpy();
      Dance.addPlugin('pluginname', fn); 
      dance.pluginname('arggg');
      expect(fn).toHaveBeenCalledWith('arggg');
    });

    it('Should pass the dance instance as the "this" context', function () {
      Dance.addPlugin('pluginname2', function() { return this; }); 
      expect(dance.pluginname2()).toBe(dance);
    });

    it('Should not allow a rebinding of a preexisting prototype method or plugin', function () {
      var
        origMethod = Dance.prototype.play,
        newMethod = function() { };
      Dance.addPlugin('play', newMethod);
      Dance.addPlugin('pluginname', newMethod); // Used in previous test
      expect(dance.play).toBe(origMethod);
      expect(dance.pluginname).not.toBe(newMethod);
    });
  });
});
