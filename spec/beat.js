describe('Dancer.Beat', function () {
  var
    song      = 'lib/440hz_100amp.ogg',
    beatTrack = 'lib/beatTrack.ogg',
    dancer    = new Dancer( beatTrack ),
    random    = function (min, max) { return Math.random() * (max-min) + min };

  describe('Init', function () {
    var beat;

    it('Should have correct defaults', function () {
      beat = dancer.createBeat();
      expect(beat.frequency.length).toEqual(2);
      expect(beat.frequency[0]).toEqual(0);
      expect(beat.frequency[1]).toEqual(10);
      expect(beat.threshold).toEqual(0.3);
      expect(beat.decay).toEqual(0.02);
      expect(beat.onBeat).toBe(undefined);
      expect(beat.offBeat).toBe(undefined);
    });

    it('Should set options correctly', function () {
      var
        freqLow   = ~~random(1, 5),
        freqHigh  = ~~random(6, 15),
        threshold = random(0.2, 0.4),
        decay     = random(0.01, 0.03),
        onBeat    = function () { },
        offBeat   = function () { };

      beat = dancer.createBeat({
        frequency : [ freqLow, freqHigh ],
        threshold : threshold,
        decay     : decay,
        onBeat    : onBeat,
        offBeat   : offBeat
      });

      expect(beat.frequency[0]).toEqual(freqLow);
      expect(beat.frequency[1]).toEqual(freqHigh);
      expect(beat.threshold).toEqual(threshold);
      expect(beat.decay).toEqual(decay);
      expect(beat.onBeat).toBe(onBeat);
      expect(beat.offBeat).toBe(offBeat);
    });

    it('Should have an internal reference to the dancer instance', function () {
      expect(beat.dancer).toBe(dancer);
    });
  });

  describe('Dancer.Beat.maxAmplitude() utility', function () {
    var
      beat = dancer.createBeat(),
      fft  = [ 0.95, 0.95, 0.9, 0.85, 1, 0.75, 0.7, 0.65, 0.6, 0.55 ],
      stubCtx = { dancer: { getSpectrum: function() { return fft; } } },
      maxAmplitude = function ( freq ) {
        return beat.maxAmplitude.call( stubCtx, freq );
      };

    it('Should return frequency amplitude when single frequency given', function () {
      expect(maxAmplitude(5)).toEqual(0.75);
      expect(maxAmplitude(5.45)).toEqual(0.75);
      expect(maxAmplitude(0)).toEqual(0.95);
      expect(maxAmplitude(9)).toEqual(0.55);
    });

    it('Should return null when passing out of range frequency', function () {
      expect(maxAmplitude(13)).toBeNull();
      expect(maxAmplitude(20)).toBeNull();
      expect(maxAmplitude(11)).toBeNull();
    });

    it('Should return the max amplitude within a frequency range', function () {
      expect(maxAmplitude([0, 10])).toEqual(1);
      expect(maxAmplitude([1, 3])).toEqual(0.95);
      expect(maxAmplitude([5, 8])).toEqual(0.75);
    });
  });

  describe('on() and off()', function () {
    var beat = dancer.createBeat();

    it('Should be off by default', function () {
      expect(beat.isOn).toBeFalsy();
    });

    it('Should turn on with on()', function () {
      beat.on();
      expect(beat.isOn).toBeTruthy();
    });

    it('Should turn off with off()', function () {
      beat.off();
      expect(beat.isOn).toBeFalsy();
    });
  });

  describe('onUpdate()', function () {
    // Empty out dancer's current update events
    dancer.events.update = [];

    var
      beat      = dancer.createBeat(),
      _onUpdate = beat.onUpdate;

    it('Should register a bridge update event in the dancer instance', function () {
      beat.onUpdate = jasmine.createSpy();
      dancer.events.update[0]();
      expect(beat.onUpdate).toHaveBeenCalled();
    });

    describe('onBeat(), offBeat() callbacks', function () {
      var
        fft = [ 0.5, 0.5, 0.5, 0.1, 0.35 ];
      beat.dancer    = { getSpectrum: function () { return fft } };
      beat.frequency = 0;
      beat.threshold = 0.3;
      beat.decay     = 0.01;
      beat.off();

      beforeEach(function () {
        beat.onBeat    = jasmine.createSpy();
        beat.offBeat   = jasmine.createSpy();
      });

      it('Should not call either onBeat or offBeat if beat is not "on"', function () {
        beat.onUpdate = _onUpdate;
        beat.onUpdate();

        expect(beat.onBeat).not.toHaveBeenCalled();
        expect(beat.offBeat).not.toHaveBeenCalled();
      });

      it('Should call onBeat when amplitude > threshold and pass magnitude', function () {
        beat.on().onUpdate();

        expect(beat.onBeat).toHaveBeenCalledWith( fft[ beat.frequency ] );
        expect(beat.offBeat).not.toHaveBeenCalled();
      });

      it('Should call offBeat when amplitude < threshold and pass magnitude', function () {
        beat.frequency = 3;
        beat.onUpdate();

        expect(beat.onBeat).not.toHaveBeenCalled();
        expect(beat.offBeat).toHaveBeenCalledWith( fft[ beat.frequency ] );
      });

      it('Should set currentThreshold to previous beat\'s amplitude', function () {
        beat.frequency = 0;
        beat.onUpdate();

        expect(beat.currentThreshold).toEqual( fft[ beat.frequency ] );
      });

      it('Should call onBeat when amplitude > threshold and current thresh w/ decay', function () {
        var
          updates    = 0,
          beatCalled = false;

        beat.frequency = 4;
        beat.currentThreshold = 0.5;
        beat.onBeat = function () { beatCalled = true; };

        // currentThreshold should decay 15 times (0.01 decay)
        // at currentThreshold is 0.50 and the frequency is 0.35
        waitsFor(function () {
          beat.onUpdate();
          if (!beatCalled) { updates++; }
          return beatCalled;
        }, 'Beat frequency was never > than decaying current threshold', 1000);
        runs(function () {
          expect(updates).toEqual(15);
        });
      });
    });
  });
});
