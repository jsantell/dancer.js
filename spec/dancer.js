describe('Dancer', function () {

  var
    song     = 'lib/440hz_100amp.ogg',
    dancer   = new Dancer(song),
    isWebkit = !!window.webkitAudioContext,
    songReady = function () { return dancer.isLoaded() && dancer.getTime() > 1; };

  // Define custom matcher
  beforeEach(function () {
    this.addMatchers({
      toBeWithin : function (expected, tolerance) {
        var actual = this.actual;
        this.message = function () {
          return "Expected " + actual + " to be within " + tolerance + " of " + expected;
        };
        return actual <= expected + tolerance && actual >= expected - tolerance;
      }
    });
  });


  describe('Init', function () {
    it('Should use the correct audio adapter', function () {
      var adapter = Dancer.adapters[ isWebkit ? 'webkit' : 'moz' ];
      expect(dancer.audioAdapter instanceof adapter).toBeTruthy();
    });

    it('Should bind an update event', function () {
      expect(dancer.events.update).toBeDefined();
    });
  });

  describe('Controls', function () {
    // TODO Should probably check audio output via adapter, similar to getTime();
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

  describe('createBeat()', function () {
    var beat = dancer.createBeat();
    it("Should return a Dancer.Beat instance", function () {
      expect(beat instanceof Dancer.Beat).toBeTruthy();
    });
  });

  describe('Getters', function () {

    describe('getTime()', function () {
      it("getTime() should return current time", function () {
        dancer.play();

        waitsFor(songReady, 'Song was never loaded', 4000);
        runs(function () {
          expect(dancer.getTime()).toBeWithin(dancer.audioAdapter[ isWebkit ? 'context' : 'audio' ].currentTime, 0.1);
        });
      });
    });

    describe("getSpectrum()", function () {
      var s;
      dancer.play();

      it("should return a Float32Array(512)", function () {
        waitsFor(songReady, 'Song was never loaded', 4000);
        runs(function () {
          s = dancer.getSpectrum();
          expect(s.length).toEqual(512);
          expect(s instanceof Float32Array).toBeTruthy();
        });
      });

      it("should return a correct amplitude for the 440hz pitch (11/1024)", function () {
        waitsFor(songReady, 'Song was never loaded', 4000);
        runs(function () {
          s= dancer.getSpectrum()[10];
          expect(s).toBeWithin(0.75, 0.2);
        });
      });

      it("should return a correct amplitude for the 440hz pitch (51/1024)", function () {
        waitsFor(songReady, 'Song was never loaded', 4000);
        runs(function () {
          s = dancer.getSpectrum()[50];
          expect(s).toBeLessThan(0.1);
        });
      });
    });

    describe("getFrequency()", function () {
      var f;

      it("should return a correct amplitude for the 440hz pitch (11/1024)", function () {
        waitsFor(songReady, 'Song was never loaded', 4000);
        runs(function () {
          f = dancer.getFrequency(10);
          expect(f).toBeGreaterThan(0.5);
        });
      });

      it("should return a correct amplitude for the 440hz pitch (51/1024)", function () {
        waitsFor(songReady, 'Song was never loaded', 4000);
        runs(function () {
          f = dancer.getFrequency(50);
          expect(f).toBeLessThan(0.1);
        });
      });

      it("Should return the average amplitude over a range of the 440hz pitch", function () {
        waitsFor(songReady, 'Song was never loaded', 4000);
        runs(function () {
          f = dancer.getFrequency(10, 50);
          expect(f).toBeWithin(0.055, 0.015);
        });
      });
    });

    describe("isLoaded()", function () {
      // Also tested implicitly via other tests
      it("Should return adapter's loaded boolean from isLoaded()", function () {
        // Wait for song being loaded before messing with the adapter's load status
        waitsFor(songReady, 'Song was never loaded', 4000);
        runs(function () {
          dancer.audioAdapter.isLoaded = false;
          expect(dancer.isLoaded()).toBeFalsy();
          dancer.audioAdapter.isLoaded = true;
          expect(dancer.isLoaded()).toBeTruthy();
        });
      });
    });

    describe("isPlaying()", function () {
      // Relying on adapter implementation, possibly better way to spec
      it("Should be true if playing, false otherwise", function () {
        dancer.play();
        expect(dancer.isPlaying()).toBeTruthy();
        dancer.stop();
        expect(dancer.isPlaying()).toBeFalsy();
        dancer.play();
        expect(dancer.isPlaying()).toBeTruthy();
      });
    });
  });

  describe('Sections', function () {
    var
      f1Count, f2Count, f3Count, f4Count,
      ret1, ret2, ret3, ret4,
      ctx1, ctx2, ctx3, ctx4, t,
      fn1 = function () { f1Count++; ctx1 = this; },
      fn2 = function () { f2Count++; ctx2 = this; },
      fn3 = function () { f3Count++; ctx3 = this; },
      fn4 = function () { f4Count++; ctx4 = this; };
    f1Count = f2Count = f3Count = f4Count = 0;
    ret1 = ret2 = ret3 = ret4 = ctx1 = ctx2 = ctx3 = ctx4 = null;

    describe('after()', function () {
      it("Should not call 'after' callback before time t", function () {
        t = dancer.getTime();
        ret1 = dancer.after(t+1, fn1);
        waits(100);
        runs(function () {
          expect(f1Count).toBe(0);
        });
      });

      it("Should call 'after' callback after time t, repeatedly", function () {
        waitsFor(function () {
          return dancer.getTime() > t + 1.2;
        }, 'Wait for time to elapse 2s', 2000);
        runs(function () {
          expect(f1Count).toBeGreaterThan(1);
        });
      });

      it("Should return dance instance", function () {
        expect(ret1).toBe(dancer);
      });

      it("Should have dance instance as the 'this' context in callback", function () {
        expect(ctx1).toBe(dancer);
      });
    });

    describe('before()', function () {
      it("Should call 'before' callback before time t, repeatedly", function () {
        t = dancer.getTime();
        ret2 = dancer.before(t+1, fn2);
        waits(200);
        runs(function () {
          expect(f2Count).toBeGreaterThan(1);
        });
      });

      it("Should not call 'before' callback after time t", function () {
        var stopCounting;
        waitsFor(function () {
          stopCounting = f2Count;
          return dancer.getTime() > t + 1.2;
        });
        runs(function () {
          waits(200);
          runs(function () {
            expect(f2Count).toBe(stopCounting);
          });
        });
      });

      it("Should return dance instance", function () {
        expect(ret2).toBe(dancer);
      });

      it("Should have dance instance as the 'this' context in callback", function () {
        expect(ctx2).toBe(dancer);
      });
    });

    describe('between()', function () {
      it("Should not call 'between' callback before time t1", function () {
        t = dancer.getTime();
        ret3 = dancer.between(t+1, t+3, fn3);
        waits(100);
        runs(function () {
          expect(f3Count).toBe(0);
        });
      });

      it("Should repeatedly call 'between' callback between time t1,t2", function () {
        waitsFor(function () {
          return dancer.getTime() > t + 1.05;
        });
        runs(function () {
          waits(100);
          runs(function () {
            expect(f3Count).toBeGreaterThan(1);
          });
        });
      });

      it("Should not call 'between' callback after time t2", function () {
        var stopCounting;
        waitsFor(function () {
          stopCounting = f3Count;
          return dancer.getTime() > t + 3.1;
        });
        runs(function () {
          waits(200);
          runs(function () {
            expect(f3Count).toBe(stopCounting);
          });
        });
      });

      it("Should return dance instance", function () {
        expect(ret3).toBe(dancer);
      });

      it("Should have dance instance as the 'this' context in callback", function () {
        expect(ctx3).toBe(dancer);
      });
    });

    describe('onceAt()', function () {
      it("Should only call 'onceAt' callback one time at time t", function () {
        t = dancer.getTime();
        ret4 = dancer.onceAt(t+1, fn4);
        waits(100);
        runs(function () {
          expect(f4Count).toBe(0);
        });
        waitsFor(function () {
          return dancer.getTime() > t+1.2;
        });
        runs(function () {
          expect(f4Count).toBe(1);
        });
      });

      it("Should return dance instance", function () {
        expect(ret4).toBe(dancer);
      });

      it("Should have dance instance as the 'this' context in callback", function () {
        expect(ctx4).toBe(dancer);
      });

    });
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

    describe('bind()', function () {
      it('Should bind several events under the same name and different names', function () {
        expect(dancer.events.eventA[0]).toBe(fn1);
        expect(dancer.events.eventA[1]).toBe(fn2);
        expect(dancer.events.eventB[0]).toBe(fn3);
      });
    });

    describe('unbind()', function () {
      it('Should unbind all events of a shared name', function () {
        dancer.unbind('eventA');
        expect(dancer.events.eventA).toBeFalsy();
        expect(dancer.events.eventB[0]).toBe(fn3);
      });
    });

    describe('trigger()', function () {
      it('Should call all events of a shared name, and no others', function () {
        dancer.trigger('eventA');
        expect(fn1).toHaveBeenCalled();
        expect(fn2).toHaveBeenCalled();
        expect(fn3).not.toHaveBeenCalled();
      });
    });

    describe('Update Trigger', function () {
      it('Should trigger update events as the audio plays', function () {
        waits(100);
        runs(function () {
          expect(fn4).toHaveBeenCalled();
        });
      });
    });
  });

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

  it("Should stop the goddamn beeping", function() {
    dancer.stop();
    runs(function () {
      expect(0).toBe(0);
    });
  });
});
