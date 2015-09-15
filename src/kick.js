export default class Kick {
  constructor(dancer, o={}) {
    this.dancer    = dancer;
    this.frequency = o.frequency !== undefined ? o.frequency : [0, 10];
    this.threshold = o.threshold !== undefined ? o.threshold :  0.3;
    this.decay     = o.decay     !== undefined ? o.decay     :  0.02;
    this.onKick    = o.onKick;
    this.offKick   = o.offKick;
    this.isOn      = false;
    this.currentThreshold = this.threshold;

    this.dancer.bind('update', () => {
      this.onUpdate();
    });
  }

  on() {
    this.isOn = true;
    return this;
  }

  off() {
    this.isOn = false;
    return this;
  }

  set(o={}) {
    this.frequency = o.frequency !== undefined ? o.frequency : this.frequency;
    this.threshold = o.threshold !== undefined ? o.threshold : this.threshold;
    this.decay     = o.decay     !== undefined ? o.decay : this.decay;
    this.onKick    = o.onKick    || this.onKick;
    this.offKick   = o.offKick   || this.offKick;
  }

  onUpdate() {
    if (!this.isOn) {
      return;
    }
    const magnitude = this.maxAmplitude( this.frequency );
    if (magnitude >= this.currentThreshold && magnitude >= this.threshold) {
      this.currentThreshold = magnitude;
      this.onKick && this.onKick.call(this.dancer, magnitude);
    } else {
      this.offKick && this.offKick.call(this.dancer, magnitude);
      this.currentThreshold -= this.decay;
    }
  }

  maxAmplitude(frequency) {
    let max = 0;
    const fft = this.dancer.getSpectrum();

    // Sloppy array check
    if (!frequency.length) {
      if (frequency < fft.length) {
        return fft[~~frequency];
      }
      return null;
    }

    for (let i = frequency[0], l = frequency[1]; i <= l; i++) {
      if (fft[i] > max) {
        max = fft[i];
      }
    }
    return max;
  }
}
