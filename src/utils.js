import FlashDetect from 'flash-detect';

import FlashAdapter from './adapters/flash';
import MozAdapter from './adapters/moz';
import WebAudioAdapter from './adapters/webAudio';


export default class Utils {
  static CODECS = {
    mp3: 'audio/mpeg;',
    ogg: 'audio/ogg; codecs="vorbis"',
    wav: 'audio/wav; codecs="1"',
    aac: 'audio/mp4; codecs="mp4a.40.2"'
  };

  constructor() {
    this.audioEl = document.createElement('audio');
    this.options = {};
  }

  setOptions(o) {
    for (var option in o) {
      if (o.hasOwnProperty(option)) {
        Dancer.options[option] = o[option];
      }
    }
  }

  isSupported() {
    if (!window.Float32Array || !window.Uint32Array) {
      return null;
    } else if (!this.isUnsupportedSafari() &&
               (window.AudioContext || window.webkitAudioContext)) {
      return 'webaudio';
    } else if (audioEl && audioEl.mozSetup) {
      return 'audiodata';
    } else if (FlashDetect.versionAtLeast( 9 )) {
      return 'flash';
    } else {
      return '';
    }
  }

  canPlay(type) {
    const canPlay = audioEl.canPlayType;
    return !!(
      Dancer.isSupported() === 'flash' ?
        type.toLowerCase() === 'mp3' :
        audioEl.canPlayType &&
        audioEl.canPlayType(CODECS[type.toLowerCase()]).replace(/no/, ''));
  }

  addPlugin(name, fn) {
    if (Dancer.prototype[name] === undefined) {
      Dancer.prototype[name] = fn;
    }
  }

  _makeSupportedPath(source, codecs) {
    if (!codecs) {
      return source;
    }

    for (let i = 0; i < codecs.length; i++) {
      if (Dancer.canPlay(codecs[i])) {
        return source + '.' + codecs[i];
      }
    }
    return source;
  }

  _getAdapter() {
    switch (this.isSupported()) {
      case 'webaudio':
        return new WebAudioAdapter(this);
      case 'audiodata':
        return new MozAdapter(this);
      case 'flash':
        return new FlashAdapter(this);
    }
  }

  _getMP3SrcFromAudio(audioEl) {
    const sources = audioEl.children;
    if (audioEl.src) {
      return audioEl.src;
    }
    for (let i = sources.length; i--;) {
      if ((sources[i].type || '').match( /audio\/mpeg/)) {
        return sources[ i ].src;
      }
    }
  }

  isUnsupportedSafari() {
    /*
      Browser detection is lame, but Safari 6 has Web Audio API,
      but does not support processing audio from a Media Element Source
      https://gist.github.com/3265344
    */
    const isApple = !!( navigator.vendor || '' ).match( /Apple/ );
    let version = navigator.userAgent.match( /Version\/([^ ]*)/ );
    version = version ? parseFloat( version[ 1 ] ) : 0;
    return isApple && version <= 6;
  }
}
