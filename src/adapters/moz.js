import FFT from '../lib/fft';


export default class MozAdapter {
  constructor(dancer) {
    this.dancer = dancer;
    this.audio = new Audio();
  }

  load(_source) {
    this.audio = _source;

    this.isLoaded = false;
    this.progress = 0;

    if ( this.audio.readyState < 3 ) {
      this.audio.addEventListener('loadedmetadata', () => {
        this.getMetadata();
      }, false);
    } else {
      this.getMetadata();
    }

    this.audio.addEventListener('MozAudioAvailable', e => {
      this.update(e);
    }, false);

    this.audio.addEventListener( 'progress', e => {
      if (e.currentTarget.duration) {
        this.progress = e.currentTarget.seekable.end( 0 ) /
                        e.currentTarget.duration;
      }
    }, false);

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
    this.audio.volume = volume;
  }

  getVolume() {
    return this.audio.volume;
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

    for (let i = 0, j = this.fbLength / 2; i < j; i++) {
      this.signal[i] = (e.frameBuffer[2 * i] + e.frameBuffer[2 * i + 1]) / 2;
    }

    this.fft.forward(this.signal);
    this.dancer.trigger('update');
  }

  getMetadata() {
    this.fbLength = this.audio.mozFrameBufferLength;
    this.channels = this.audio.mozChannels;
    this.rate     = this.audio.mozSampleRate;
    this.fft      = new FFT( this.fbLength / this.channels, this.rate );
    this.signal   = new Float32Array( this.fbLength / this.channels );
    this.isLoaded = true;
    this.progress = 1;
    this.dancer.trigger('loaded');
  }
}
