describe('Dancer', function () {

  var
    song  = 'lib/440hz_100amp.ogg',
    dancer = new Dancer(song);

/*
  beforeEach(function () {
    dancer = new Dancer(song);
  });

  afterEach(function () {
    dancer.stop();
  });
*/
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
    it("getTime() should return current time", function () {
      dancer.play();

      waitsFor(function () {
        return dancer.isLoaded() && dancer.getTime() > 1;
      }, 'Song was never loaded', 4000);
      
      // TODO should compare with audio file's time
      runs(function () {
      
      });
    });
    
    describe("getSpectrum()", function () {
      var s;
      waitsFor(function () {
        return dancer.isLoaded() && dancer.getTime() > 1;
      }, 'Song never progressed', 3000);

      runs(function () {
        it("should return a Float32Array(1024)", function () {
          s = dancer.getSpectrum();
          expect(s.length).toEqual(1024);
          expect(s instanceof Float32Array).toBeTruthy();
        });
    
        it("should return a correct amplitude for the 440hz pitch (11/1024)", function () {
          s= dancer.getSpectrum()[10];
          expect(s).toBeGreaterThan(0.5);
          expect(s).toBeLessThan(1);
        });
      
        it("should return a correct amplitude for the 440hz pitch (51/1024)", function () {
          s = dancer.getSpectrum()[50];
          expect(s).toBeLessThan(0.1);
        });
      });
    });

    describe("getFrequency()", function () {
      var f;
      waitsFor(function () {
        return dancer.isLoaded() && dancer.getTime() > 1;
      }, 'Song never progressed', 3000);
      
      runs(function () {
        it("should return a correct amplitude for the 440hz pitch (11/1024)", function () {
          f = dancer.getFrequency(10);
          expect(f).toBeGreaterThan(0.5);
        });
      
        it("should return a correct amplitude for the 440hz pitch (51/1024)", function () {
          f = dancer.getFrequency(50);
          expect(f).toBeLessThan(0.1);
        });

        it("Should return the average amplitude over a range of the 440hz pitch", function () {
          f = dancer.getFrequency(10, 50);
          expect(f).toBeGreaterThan(0.04);
          expect(f).toBeLessThan(0.07);
        });
      });
    });

    // Also tested implicitly via other tests
    it("Should call adapter's loaded boolean from isLoaded()", function () {
      dancer.audioAdapter.loaded = true;
      expect(dancer.isLoaded()).toBeTruthy();
      dancer.audioAdapter.loaded = false;
      expect(dancer.isLoaded()).toBeFalsy();
    });
  });

  // TODO async tests for sections
  describe('Sections', function () {

  });

  describe('Pub/Sub Bindings', function () {
    var
      fn1 = jasmine.createSpy(),
      fn2 = jasmine.createSpy(),
      fn3 = jasmine.createSpy(),
      fn4 = jasmine.createSpy();

    beforeEach(function () {
      dancer.bind('eventA', fn1);
      dancer.bind('eventA', fn2);
      dancer.bind('eventB', fn3);
      dancer.bind('update', fn4);
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

    describe('Update Trigger', function () {
      it('Should trigger update events as the audio plays', function () {
        expect(fn4).toHaveBeenCalled();
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
