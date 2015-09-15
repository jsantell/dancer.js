import FFT from '../lib/fft';


const SAMPLE_SIZE = 2048;
const SAMPLE_RATE = 44100;


export default class WebAudioAdapter {
  constructor(dancer) {
    this.dancer = dancer;
    this.audio = new Audio();
    this.context = window.AudioContext ?  new window.AudioContext() :
                                          new window.webkitAudioContext();
  }

  load(_source) {
    this.audio = _source;

    this.isLoaded = false;
    this.progress = 0;

    if (!this.context.createScriptProcessor) {
      this.context.createScriptProcessor = this.context.createJavascriptNode;
    }
    this.proc = this.context.createScriptProcessor(SAMPLE_SIZE / 2, 1, 1);

    this.proc.onaudioprocess = e => {
      this.update(e);
    };
    if (!this.context.createGain) {
      this.context.createGain = this.context.createGainNode;
    }

    this.gain = this.context.createGain();

    this.fft = new FFT(SAMPLE_SIZE / 2, SAMPLE_RATE);
    this.signal = new Float32Array(SAMPLE_SIZE / 2);

    if (this.audio.readyState < 3) {
      this.audio.addEventListener('canplay', () => {
        this.connectContext();
      });
    } else {
      this.connectContext();
    }

    this.audio.addEventListener('progress', e => {
      if (e.currentTarget.duration) {
        this.progress = e.currentTarget.seekable.end(0) /
        e.currentTarget.duration;
      }
    });

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
    this.gain.gain.value = volume;
  }

  getVolume() {
    return this.gain.gain.value;
  }

  getProgress() {
    return this.progress;
  }

  getWaveform() {
    return this.signal;
  }

  getSpectrum() {
    return this.fft.spectrum;
  }

  getTime() {
    return this.audio.currentTime;
  }

  update = e => {
    if (!this.isPlaying || !this.isLoaded) {
      return;
    }

    let buffers = [];
    const channels = e.inputBuffer.numberOfChannels;
    const resolution = SAMPLE_SIZE / channels;
    let i;

    function sum(prev, curr) {
      return prev[i] + curr[i];
    }

    for (i = channels; i--;) {
      buffers.push(e.inputBuffer.getChannelData(i));
    }

    for (i = 0; i < resolution; i++) {
      this.signal[ i ] = channels > 1 ?
        buffers.reduce(sum) / channels :
        buffers[ 0 ][ i ];
    }

    this.fft.forward(this.signal);
    this.dancer.trigger('update');
  }

  connectContext() {
    this.source = this.context.createMediaElementSource(this.audio);
    this.source.connect(this.proc);
    this.source.connect(this.gain);
    this.gain.connect(this.context.destination);
    this.proc.connect(this.context.destination);

    this.isLoaded = true;
    this.progress = 1;
    this.dancer.trigger('loaded');
  }
}
