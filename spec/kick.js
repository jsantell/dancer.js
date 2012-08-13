describe('Dancer.Kick', function () {
  
  var random    = function (min, max) { return Math.random() * (max-min) + min };

  describe('Init', function () {
    var kick;

    it('Should have correct defaults', function () {
      kick = dancer.createKick();
      expect(kick.frequency.length).toEqual(2);
      expect(kick.frequency[0]).toEqual(0);
      expect(kick.frequency[1]).toEqual(10);
      expect(kick.threshold).toEqual(0.3);
      expect(kick.decay).toEqual(0.02);
      expect(kick.onKick).toBe(undefined);
      expect(kick.offKick).toBe(undefined);
    });

    it('Should set options correctly', function () {
      var
        freqLow   = ~~random(1, 5),
        freqHigh  = ~~random(6, 15),
        threshold = random(0.2, 0.4),
        decay     = random(0.01, 0.03),
        onKick    = function () { },
        offKick   = function () { };

      kick = dancer.createKick({
        frequency : [ freqLow, freqHigh ],
        threshold : threshold,
        decay     : decay,
        onKick    : onKick,
        offKick   : offKick
      });

      expect(kick.frequency[0]).toEqual(freqLow);
      expect(kick.frequency[1]).toEqual(freqHigh);
      expect(kick.threshold).toEqual(threshold);
      expect(kick.decay).toEqual(decay);
      expect(kick.onKick).toBe(onKick);
      expect(kick.offKick).toBe(offKick);
    });

    it('Should correctly set 0 attributes', function () {
      kick = dancer.createKick({
        frequency: 0,
        threshold: 0,
        decay: 0
      });
      expect(kick.frequency).toEqual(0);
      expect(kick.threshold).toEqual(0);
      expect(kick.decay).toEqual(0);
    });

    it('Should have an internal reference to the dancer instance', function () {
      expect(kick.dancer).toBe(dancer);
    });
  });

  describe('Dancer.Kick.maxAmplitude() utility', function () {
    var
      kick = dancer.createKick(),
      fft  = [ 0.95, 0.95, 0.9, 0.85, 1, 0.75, 0.7, 0.65, 0.6, 0.55 ],
      stubCtx = { dancer: { getSpectrum: function() { return fft; } } },
      maxAmplitude = function ( freq ) {
        return kick.maxAmplitude.call( stubCtx, freq );
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
    var kick = dancer.createKick();

    it('Should be off by default', function () {
      expect(kick.isOn).toBeFalsy();
    });

    it('Should turn on with on()', function () {
      kick.on();
      expect(kick.isOn).toBeTruthy();
    });

    it('Should turn off with off()', function () {
      kick.off();
      expect(kick.isOn).toBeFalsy();
    });
  });

  describe('onUpdate()', function () {
    var kick, _onUpdate, registeredCallback;

    kick       = dancer.createKick();
    registered = dancer.events.update[ dancer.events.update.length - 1 ];
    _onUpdate  = kick.onUpdate;

    it('Should register a bridge update event in the dancer instance', function () {
      kick.onUpdate = jasmine.createSpy();
      registered();
      expect(kick.onUpdate).toHaveBeenCalled();
    });

    describe('onKick(), offKick() callbacks', function () {
      var
        fft = [ 0.5, 0.5, 0.5, 0.1, 0.35 ];
      kick.dancer    = { getSpectrum: function () { return fft } };
      kick.frequency = 0;
      kick.threshold = 0.3;
      kick.decay     = 0.01;
      kick.off();

      beforeEach(function () {
        kick.onKick    = jasmine.createSpy();
        kick.offKick   = jasmine.createSpy();
      });

      it('Should not call either onKick or offKick if kick is not "on"', function () {
        kick.onUpdate = _onUpdate;
        kick.onUpdate();

        expect(kick.onKick).not.toHaveBeenCalled();
        expect(kick.offKick).not.toHaveBeenCalled();
      });

      it('Should call onKick when amplitude > threshold and pass magnitude', function () {
        kick.on().onUpdate();

        expect(kick.onKick).toHaveBeenCalledWith( fft[ kick.frequency ] );
        expect(kick.offKick).not.toHaveBeenCalled();
      });

      it('Should call offKick when amplitude < threshold and pass magnitude', function () {
        kick.frequency = 3;
        kick.onUpdate();

        expect(kick.onKick).not.toHaveBeenCalled();
        expect(kick.offKick).toHaveBeenCalledWith( fft[ kick.frequency ] );
      });

      it('Should set currentThreshold to previous kick\'s amplitude', function () {
        kick.frequency = 0;
        kick.onUpdate();

        expect(kick.currentThreshold).toEqual( fft[ kick.frequency ] );
      });

      it('Should call onKick when amplitude > threshold and current thresh w/ decay', function () {
        var
          updates    = 0,
          kickCalled = false;

        kick.frequency = 4;
        kick.currentThreshold = 0.5;
        kick.onKick = function () { kickCalled = true; };

        // currentThreshold should decay 15 times (0.01 decay)
        // at currentThreshold is 0.50 and the frequency is 0.35
        waitsFor(function () {
          kick.onUpdate();
          if (!kickCalled) { updates++; }
          return kickCalled;
        }, 'Kick frequency was never > than decaying current threshold', 1000);
        runs(function () {
          expect(updates).toEqual(15);
        });
      });
    });
  });
});
