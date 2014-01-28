describe('Dancer', function () {

  /* expose globally for other tests */
  song      = 'lib/440hz_100amp';
  dancer    = new Dancer();
  songReady = function () { return dancer.isLoaded(); };
  isWebkit = !!window.webkitAudioContext;
  waitForLoadTime = 4000;

  var audio = new Audio();
  audio.src = song + '.ogg';
  
  // To test loading with config object
  // var loadReturn = dancer.load({ src: song, codecs: ['ogg', 'mp3']});
  
  var loadReturn = dancer.load( audio );
  

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


  describe('Core', function () {
    it('Should bind an update event', function () {
      expect(dancer.events.update).toBeDefined();
    });
    
    // Load tested implicitly throughout tests
    it("load() should return a dancer instance", function () {
      expect(loadReturn).toBe(dancer);
    });

    it('should have an audio property with the audio element', function () {
      if ( Dancer.isSupported() !== 'flash' ) {
        expect(dancer.audio instanceof HTMLElement).toBeTruthy();
        expect(dancer.audio.src.match(new RegExp(song))).toBeTruthy();
      } else {
        waitsFor(songReady, 'Song was never loaded', waitForLoadTime);
        runs(function () {
          expect(dancer.audio).toBeTruthy();
          expect(dancer.audio.url.match(new RegExp(song))).toBeTruthy();
        });
      }
    });
  });

  describe('Controls', function () {
    // TODO Should probably check audio output via adapter, similar to getTime();
    it("Should call adapter's play/pause method via dancer.play(), dancer.pause()", function () {
      spyOn(dancer.audioAdapter, 'play');
      spyOn(dancer.audioAdapter, 'pause');
      waitsFor(songReady, 'Song was never loaded', waitForLoadTime);
      runs(function () {
        dancer.play();
        expect(dancer.audioAdapter.play).toHaveBeenCalled();
        dancer.pause();
        expect(dancer.audioAdapter.pause).toHaveBeenCalled();
      });
    });

    it("Should return dancer instance when calling dancer.play(), dancer.pause()", function() {
      var
        playReturn = dancer.play(),
        pauseReturn = dancer.pause();
      expect(playReturn).toBe(dancer);
      expect(pauseReturn).toBe(dancer);
    });

    it("The volume should default to 1", function () {
      expect(dancer.getVolume()).toEqual(1);
    });
    
    it("Should change the volume with setVolume() and return `this`", function () {
      expect(dancer.setVolume(0.5)).toBe(dancer);
      expect(dancer.getVolume()).toBeWithin(0.5, 0.0001);
      dancer.setVolume(0.1);
      expect(dancer.getVolume()).toBeWithin(0.1, 0.0001);
      dancer.setVolume(1);
    });

    it("Should return version from .version", function () {
      expect(Dancer.version.match(/\d+\.\d+\.\d+/)).toBeTruthy();
    });
  });

  describe('createKick()', function () {
    var kick = dancer.createKick();
    it("Should return a Dancer.Kick instance", function () {
      expect(kick instanceof Dancer.Kick).toBeTruthy();
    });
  });

  describe('Getters', function () {

    describe('getProgress()', function () {

      it( "getProgress() should return a value from 0 to 1", function() {
        runs( function () {
          var checkProgress = setInterval(function () {
            if ( expect( dancer.getProgress() ).toBeWithin ) {
              expect( dancer.getProgress() ).toBeWithin( 0.5, 0.5 );
            }
          }, 1);
          setTimeout( function () { clearInterval(checkProgress); }, waitForLoadTime );
        });
      });

    });

    describe('getTime()', function () {

      var currentTime;

      it("getTime() should increment by 1 second after 1 second", function () {
        currentTime = 0;
        waitsFor(songReady, 'Song was never loaded', waitForLoadTime);
        runs(function () {
          dancer.play();
          currentTime = dancer.getTime();
          waits( 1000 );
          runs(function () {
            expect(dancer.getTime()).toBeWithin(currentTime + 1.0, 0.1);
            dancer.pause();
          });
        });
      });

      it("getTime() should pause incrementing when pause()'d", function () {
        waitsFor(songReady, 'Song was never loaded', waitForLoadTime);
        runs(function () {
          currentTime = dancer.getTime();
          dancer.pause();
          waits( 1000 );
          runs(function () {
            expect(dancer.getTime()).toBeWithin(currentTime, 0.05);
          });
        });
      });
    });

    describe("getSpectrum()", function () {
      var s;

      it("should return a Float32Array(512)", function () {
        waitsFor(songReady, 'Song was never loaded', waitForLoadTime);
        runs(function () {
          dancer.play();
          s = dancer.getSpectrum();
          expect(s.length).toEqual(512);
          expect(s instanceof Float32Array).toBeTruthy();
        });
      });

      it("should return a correct amplitude for the 440hz pitch (11/1024)", function () {
        waitsFor(songReady, 'Song was never loaded', waitForLoadTime);
        runs(function () {
          s= dancer.getSpectrum()[10];
          expect(s).toBeWithin(0.8, 0.2);
        });
      });

      it("should return a correct amplitude for the 440hz pitch (51/1024)", function () {
        waitsFor(songReady, 'Song was never loaded', waitForLoadTime);
        runs(function () {
          s = dancer.getSpectrum()[50];
          expect(s).toBeLessThan(0.1);
        });
      });
    });

    describe("getWaveform()", function () {
      it("should return a Float32Array(1024)", function () {
        waitsFor(songReady, 'Song was never loaded', waitForLoadTime);
        runs(function () {
          expect(dancer.getWaveform().length).toBe(1024);
          expect(dancer.getWaveform() instanceof Float32Array ).toBeTruthy();
        });
      });

      // This sine has 5 elements of -1 followed by 45 elements until
      // 5 elements of ~0.9999 and 45 elements back down..
      it("Should return a sine wave", function () {
        waitsFor(songReady, 'Song was never loaded', waitForLoadTime);
        runs(function () {
          var
            valley = null, last = -1, savedWave = [], wf = dancer.getWaveform();
          for ( var i = 0; i < 200; i++ ) {
            savedWave.push(wf[i]);
            if ( last > -0.99 && wf[i] <= -0.99 && valley === null) {
              valley = i;
            }
            last = wf[i];
          }
          // Check valley range
          expect(savedWave[valley]).toBeWithin(-1, 0.05);
          expect(savedWave[valley+3]).toBeWithin(-1, 0.05);

          expect(savedWave[valley+24]).toBeLessThan(savedWave[valley+28]);
          expect(savedWave[valley+28]).toBeWithin(0, 0.07);
          expect(savedWave[valley+32]).toBeGreaterThan(savedWave[valley+28]);

          // Check peak
          expect(savedWave[valley+51]).toBeWithin(1, 0.05);
          expect(savedWave[valley+54]).toBeWithin(1, 0.05);
          expect(savedWave[valley+58]).toBeLessThan(savedWave[valley+54]);
        });
      });
    });

    describe("getFrequency()", function () {
      var f;

      it("should return a correct amplitude for the 440hz pitch (11/1024)", function () {
        waitsFor(songReady, 'Song was never loaded', waitForLoadTime);
        runs(function () {
          f = dancer.getFrequency(10);
          expect(f).toBeGreaterThan(0.5);
        });
      });

      it("should return a correct amplitude for the 440hz pitch (51/1024)", function () {
        waitsFor(songReady, 'Song was never loaded', waitForLoadTime);
        runs(function () {
          f = dancer.getFrequency(50);
          expect(f).toBeLessThan(0.1);
        });
      });

      it("Should return the average amplitude over a range of the 440hz pitch", function () {
        waitsFor(songReady, 'Song was never loaded', waitForLoadTime);
        runs(function () {
          f = dancer.getFrequency(10, 50);
          expect(f).toBeWithin(0.06, 0.02);
        });
      });
    });

    describe("isLoaded()", function () {
      // Also tested implicitly via other tests
      it("Should return adapter's loaded boolean from isLoaded()", function () {
        // Wait for song being loaded before messing with the adapter's load status
        waitsFor(songReady, 'Song was never loaded', waitForLoadTime);
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
        dancer.pause();
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
        var pauseCounting;
        waitsFor(function () {
          pauseCounting = f2Count;
          return dancer.getTime() > t + 1.2;
        });
        runs(function () {
          waits(200);
          runs(function () {
            expect(f2Count).toBe(pauseCounting);
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
        var pauseCounting;
        waitsFor(function () {
          pauseCounting = f3Count;
          return dancer.getTime() > t + 3.1;
        });
        runs(function () {
          waits(200);
          runs(function () {
            expect(f3Count).toBe(pauseCounting);
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

  it("Should pause the goddamn beeping", function() {
    dancer.pause();
    runs(function () {
      expect(0).toBe(0);
    });
  });
});
