import Kick from './kick';
import Utils from './Utils';


export default class Dancer extends Utils {
  static version = '0.3.2';

  constructor() {
    super()
    this.adapters = {};
    this.audioAdapter = this._getAdapter();
    this.events = {};
    this.sections = [];
    this.bind('update', this.update);
  }

  load(source) {
    let path;

    if (source instanceof HTMLElement) {
      // Loading an Audio element.
      this.source = source;
      if (this.isSupported() === 'flash') {
        this.source = {
          src: this._getMP3SrcFromAudio(source)
        };
      }
    } else {
      // Loading an object with src, [codecs].
      this.source = window.Audio ? new Audio() : {};
      this.source.src = this._makeSupportedPath(source.src, source.codecs);
    }

    this.audio = this.audioAdapter.load(this.source);
    return this;
  }


  /* Controls */
  play() {
    this.audioAdapter.play();
    return this;
  }

  pause() {
    this.audioAdapter.pause();
    return this;
  }

  setVolume(volume) {
    this.audioAdapter.setVolume(volume);
    return this;
  }


  /* Actions */
  createKick = options => {
    return new Kick(this, options);
  }

  bind = (name, callback) => {
    if (!this.events[name]) {
      this.events[name] = [];
    }
    this.events[name].push(callback);
    return this;
  }

  unbind = name => {
    if (this.events[name]) {
      delete this.events[name];
    }
    return this;
  }

  trigger = name => {
    const _this = this;
    if (this.events[name]) {
      this.events[name].forEach(callback => {
        callback.call(_this);
      });
    }
    return this;
  }


  /* Getters */
  getVolume() {
    return this.audioAdapter.getVolume();
  }

  getProgress() {
    return this.audioAdapter.getProgress();
  }

  getTime() {
    return this.audioAdapter.getTime();
  }

  getFrequency(freq, endFreq) {
    /*
      Returns the magnitude of a frequency or average over a range of
      frequencies.
    */
    let sum = 0;
    if (endFreq !== undefined) {
      for (let i = freq; i <= endFreq; i++) {
        sum += this.getSpectrum()[i];
      }
      return sum / (endFreq - freq + 1);
    } else {
      return this.getSpectrum()[freq];
    }
  }

  getWaveform() {
    return this.audioAdapter.getWaveform();
  }

  getSpectrum() {
    return this.audioAdapter.getSpectrum();
  }

  isLoaded() {
    return this.audioAdapter.isLoaded;
  }

  isPlaying() {
    return this.audioAdapter.isPlaying;
  }


  /* Sections */
  after(time, callback) {
    const _this = this;
    this.sections.push({
      condition: function() {
        return _this.getTime() > time;
      },
      callback: callback
    });
    return this;
  }

  before(time, callback) {
    const _this = this;
    this.sections.push({
      condition: function() {
        return _this.getTime() < time;
      },
      callback: callback
    });
    return this;
  }

  between(startTime, endTime, callback) {
    const _this = this;
    this.sections.push({
      condition: function() {
        return _this.getTime() > startTime && _this.getTime() < endTime;
      },
      callback: callback
    });
    return this;
  }

  onceAt(time, callback) {
    const _this = this;
    let thisSection = null;

    this.sections.push({
      condition: function() {
        return _this.getTime() > time && !this.called;
      },
      callback: function() {
        callback.call(this);
        thisSection.called = true;
      },
      called: false
    });

    // Baking the section in the closure due to callback's this being the
    // dancer instance.
    thisSection = this.sections[this.sections.length - 1];
    return this;
  }

  update() {
    for (let i in this.sections) {
      if (this.sections[i].condition()) {
        this.sections[i].callback.call(this);
      }
    }
  }
}
