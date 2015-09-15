import SoundManager from 'soundmanager2';

import FFT from '../lib/fft';


const SAMPLE_SIZE = 1024;
const SAMPLE_RATE = 44100;
const CONVERSION_COEFFICIENT = 0.93;


export default class FlashAdapter {

  constructor(dancer) {
    this.dancer = dancer;

    this.smLoaded = false;
    this.smLoading = false;

    this.wave_L = [];
    this.wave_R = [];
    this.spectrum = [];
    window.SM2_DEFER = true;
  }

  load(source) {
    /*
      `source` can be either an Audio element, if supported, or an object
      either way, the path is stored in the `src` property.
    */
    this.path = source ? source.src : this.path;

    this.isLoaded = false;
    this.progress = 0;

    !window.soundManager && !smLoading && this.loadSM();

    if (window.soundManager) {
      this.audio = window.soundManager.createSound({
        id: 'dancer' + Math.random() + '',
        url: this.path,
        stream: true,
        autoPlay: false,
        autoLoad: true,
        whileplaying: function() {
          _this.update();
        },
        whileloading: function() {
          _this.progress = this.bytesLoaded / this.bytesTotal;
        },
        onload: () => {
          this.fft = new FFT(SAMPLE_SIZE, SAMPLE_RATE);
          this.signal = new Float32Array(SAMPLE_SIZE);
          this.waveform = new Float32Array(SAMPLE_SIZE);
          this.isLoaded = true;
          this.progress = 1;
          this.dancer.trigger('loaded');
        }
      });
      this.dancer.audio = this.audio;
    }

    // Returns audio if SM already loaded -- otherwise,
    // sets dancer instance's audio property after load
    return this.audio;
  }

  play() {
    this.audio.play();
    this.isPlaying = true;
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
  }

  setVolume(volume) {
    this.audio.setVolume(volume * 100);
  }

  getVolume() {
    return this.audio.volume / 100;
  }

  getProgress() {
    return this.progress;
  }

  getWaveform() {
    return this.waveform;
  }

  getSpectrum() {
    return this.fft.spectrum;
  }

  getTime() {
    return this.audio.position / 1000;
  }

  update() {
    if (!this.isPlaying && !this.isLoaded) {
      return;
    }
    this.wave_L = this.audio.waveformData.left;
    this.wave_R = this.audio.waveformData.right;

    let avg;
    for (let i = 0, j = this.wave_L.length; i < j; i++) {
      avg = parseFloat(this.wave_L[i]) + parseFloat(this.wave_R[i]);
      this.waveform[2 * i] = avg / 2;
      this.waveform[i * 2 + 1] = avg / 2;
      this.signal[2 * i] = avg * CONVERSION_COEFFICIENT;
      this.signal[i * 2 + 1] = avg * CONVERSION_COEFFICIENT;
    }

    this.fft.forward(this.signal);
    this.dancer.trigger('update');
  }

  loadSM() {
    const adapter = this;
    smLoading = true;
    this.loadScript(Dancer.options.flashJS, function() {
      soundManager = new SoundManager();
      soundManager.flashVersion = 9;
      soundManager.flash9Options.useWaveformData = true;
      soundManager.useWaveformData = true;
      soundManager.useHighPerformance = true;
      soundManager.useFastPolling = true;
      soundManager.multiShot = false;
      soundManager.debugMode = false;
      soundManager.debugFlash = false;
      soundManager.url = Dancer.options.flashSWF;
      soundManager.onready(function() {
        smLoaded = true;
        adapter.load();
      });
      soundManager.ontimeout(function() {
        console.error('Error loading SoundManager2.swf');
      });
      soundManager.beginDelayedInit();
    });
  }

  loadScript(url, callback) {
    const script = document.createElement('script');
    const appender = document.getElementsByTagName('script')[0];
    script.type = 'text/javascript';
    script.src = url;
    script.onload = callback;
    appender.parentNode.insertBefore(script, appender);
  }
}
