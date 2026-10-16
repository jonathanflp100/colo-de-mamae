/**
 * Web Audio API procedural sound synthesizer for "Acalmar o bebê".
 * Generates White Noise, Pink Noise, rhythmic Shhh, and Heartbeat (womb pulse)
 * with zero audio assets, 100% offline, and low memory footprint.
 */

export type SoundType = 'heartbeat' | 'rain' | 'pink' | 'lullaby' | 'white' | 'shhh';

class SoundSynthesizer {
  private audioCtx: AudioContext | null = null;
  private currentSource: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isRunning: boolean = false;
  private timerId: any = null;
  private currentSoundType: SoundType | null = null;
  private intervalIds: any[] = [];

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public play(type: SoundType, volume: number = 0.5, durationMinutes: number = 0) {
    this.stop();
    this.initContext();
    if (!this.audioCtx) return;

    this.currentSoundType = type;
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(volume, this.audioCtx.currentTime);
    this.gainNode.connect(this.audioCtx.destination);

    if (type === 'white') {
      this.startWhiteNoise();
    } else if (type === 'pink') {
      this.startPinkNoise();
    } else if (type === 'shhh') {
      this.startShhh();
    } else if (type === 'heartbeat') {
      this.startHeartbeat();
    } else if (type === 'rain') {
      this.startRain();
    } else if (type === 'lullaby') {
      this.startLullaby();
    }

    this.isRunning = true;

    // Optional duration timer with smooth fade out
    if (durationMinutes > 0) {
      const durationMs = durationMinutes * 60 * 1000;
      this.timerId = setTimeout(() => {
        this.fadeOutAndStop(10); // 10s smooth fade out
      }, Math.max(1000, durationMs - 10000));
    }
  }

  private startWhiteNoise() {
    if (!this.audioCtx || !this.gainNode) return;
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    // Gentle low-pass filter to soften harsh treble
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3500;

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    whiteNoise.start(0);
    this.currentSource = whiteNoise;
  }

  private startPinkNoise() {
    if (!this.audioCtx || !this.gainNode) return;
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const pinkNoise = this.audioCtx.createBufferSource();
    pinkNoise.buffer = buffer;
    pinkNoise.loop = true;
    pinkNoise.connect(this.gainNode);
    pinkNoise.start(0);
    this.currentSource = pinkNoise;
  }

  private startShhh() {
    if (!this.audioCtx || !this.gainNode) return;
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Bandpass filter to isolate soothing human "shhh" frequencies
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 1.2;

    // LFO modulator to gently swell and soften every ~2.5 seconds (human shhh cadence)
    const lfo = this.audioCtx.createOscillator();
    lfo.frequency.value = 0.4; // 0.4 Hz = 2.5s cycle

    const lfoGain = this.audioCtx.createGain();
    lfoGain.gain.value = 0.4;

    const shhhGain = this.audioCtx.createGain();
    shhhGain.gain.value = 0.5;

    lfo.connect(lfoGain);
    lfoGain.connect(shhhGain.gain);

    noise.connect(filter);
    filter.connect(shhhGain);
    shhhGain.connect(this.gainNode);

    lfo.start(0);
    noise.start(0);
    this.currentSource = noise;
  }

  private startHeartbeat() {
    if (!this.audioCtx || !this.gainNode) return;

    // Generate repetitive gentle lub-dub pulse every ~900ms (~66 BPM)
    const osc = this.audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 55; // deep warm thud

    const pulseGain = this.audioCtx.createGain();
    pulseGain.gain.setValueAtTime(0.01, this.audioCtx.currentTime);

    // Schedule rhythmic lub-dub pulses
    const bpm = 66;
    const beatInterval = 60 / bpm;
    const now = this.audioCtx.currentTime;

    // Pre-schedule pulse envelopes
    for (let t = 0; t < 60; t++) {
      const beatTime = now + t * beatInterval;
      // Lub
      pulseGain.gain.setValueAtTime(0.01, beatTime);
      pulseGain.gain.exponentialRampToValueAtTime(0.8, beatTime + 0.05);
      pulseGain.gain.exponentialRampToValueAtTime(0.01, beatTime + 0.22);
      // Dub (slightly softer)
      pulseGain.gain.setValueAtTime(0.01, beatTime + 0.3);
      pulseGain.gain.exponentialRampToValueAtTime(0.55, beatTime + 0.35);
      pulseGain.gain.exponentialRampToValueAtTime(0.01, beatTime + 0.52);
    }

    osc.connect(pulseGain);
    pulseGain.connect(this.gainNode);
    osc.start(0);
    this.currentSource = osc;
  }

  private startRain() {
    if (!this.audioCtx || !this.gainNode) return;
    const bufferSize = this.audioCtx.sampleRate * 2;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = buffer.getChannelData(0);

    // Filtered noise with soft rain droplets character
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.4;
    }

    const rainSource = this.audioCtx.createBufferSource();
    rainSource.buffer = buffer;
    rainSource.loop = true;

    const filter1 = this.audioCtx.createBiquadFilter();
    filter1.type = 'lowpass';
    filter1.frequency.value = 1400;

    const filter2 = this.audioCtx.createBiquadFilter();
    filter2.type = 'peaking';
    filter2.frequency.value = 800;
    filter2.gain.value = 4;

    rainSource.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(this.gainNode);
    rainSource.start(0);
    this.currentSource = rainSource;
  }

  private startLullaby() {
    if (!this.audioCtx || !this.gainNode) return;

    // Pentatonic scale frequencies for gentle music box
    // C4, D4, E4, G4, A4, C5, D5, E5
    const notes = [261.63, 329.63, 392.00, 440.00, 523.25, 440.00, 392.00, 329.63];
    let noteIndex = 0;

    const playNextNote = () => {
      if (!this.audioCtx || !this.gainNode || !this.isRunning) return;

      const osc = this.audioCtx.createOscillator();
      const noteGain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(notes[noteIndex % notes.length], this.audioCtx.currentTime);
      noteIndex++;

      const now = this.audioCtx.currentTime;
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.3, now + 0.08); // soft gentle chime
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc.connect(noteGain);
      noteGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + 2.0);
    };

    // Play first note immediately and loop softly every 1.5 seconds
    playNextNote();
    const interval = setInterval(playNextNote, 1500);
    this.intervalIds.push(interval);
  }

  public setVolume(vol: number) {
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(vol, this.audioCtx.currentTime);
    }
  }

  public fadeOutAndStop(fadeSeconds: number = 5) {
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + fadeSeconds);
      setTimeout(() => {
        this.stop();
      }, fadeSeconds * 1000);
    } else {
      this.stop();
    }
  }

  public stop() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.intervalIds.forEach((id) => clearInterval(id));
    this.intervalIds = [];

    if (this.currentSource) {
      try {
        (this.currentSource as any).stop?.();
      } catch {
        // already stopped
      }
      this.currentSource.disconnect();
      this.currentSource = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    this.isRunning = false;
    this.currentSoundType = null;
  }

  public getStatus() {
    return {
      isPlaying: this.isRunning,
      soundType: this.currentSoundType,
    };
  }
}

export const soundSynthesizer = new SoundSynthesizer();
