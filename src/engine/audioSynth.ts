/**
 * TDJ NEXUS - Procedural Web Audio Engine
 * Generates local, real-time synthesized cosmic soundscapes, harmonic chimes, and shockwave pulses.
 * 100% Free, offline, zero-asset Web Audio API implementation.
 */

class NexusAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private isMuted: boolean = false;
  private isInitialized: boolean = false;

  public init() {
    if (this.isInitialized) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.isInitialized = true;
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  private ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.5, this.ctx.currentTime, 0.05);
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx && !this.isMuted) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Starts ambient cosmic resonance drone
   */
  public startAmbientDrone() {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.droneOsc1) return;

    try {
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.droneGain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 3);

      const filter = this.ctx.createBiquadFilter();
      this.droneFilter = filter;
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, this.ctx.currentTime);
      filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(55.0, this.ctx.currentTime); // A1 note

      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'triangle';
      this.droneOsc2.frequency.setValueAtTime(110.2, this.ctx.currentTime); // A2 + slight detune for cosmic beat frequency

      this.droneOsc1.connect(filter);
      this.droneOsc2.connect(filter);
      filter.connect(this.droneGain);
      this.droneGain.connect(this.masterGain);

      this.droneOsc1.start();
      this.droneOsc2.start();
    } catch {
      // Audio autoplay policy catch
    }
  }

  /**
   * Stops ambient cosmic drone
   */
  public stopAmbientDrone() {
    if (this.droneGain && this.ctx) {
      this.droneGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.5);
      setTimeout(() => {
        try {
          this.droneOsc1?.stop();
          this.droneOsc2?.stop();
          this.droneOsc1?.disconnect();
          this.droneOsc2?.disconnect();
          this.droneGain?.disconnect();
        } catch {
          // ignore
        }
        this.droneOsc1 = null;
        this.droneOsc2 = null;
        this.droneGain = null;
      }, 600);
    }
  }

  /**
   * Triggers a rich, resonant sci-fi energy shockwave sound with sub-bass impact and crystal harmonics
   */
  public playShockwave(intensity: number = 1.0) {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = 120 * Math.max(0.6, intensity);

      // 1. Sub-bass kinetic pulse
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(baseFreq, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.45);

      subGain.gain.setValueAtTime(0.4 * intensity, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(now);
      subOsc.stop(now + 0.55);

      // 2. Harmonic crystalline energy chime (Pentatonic chord cluster)
      const frequencies = [440, 659.25, 880, 1318.5]; // A4, E5, A5, E6
      frequencies.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const harmOsc = this.ctx.createOscillator();
        const harmGain = this.ctx.createGain();
        
        harmOsc.type = 'sine';
        harmOsc.frequency.setValueAtTime(freq * (1.0 + (Math.random() * 0.02 - 0.01)), now + idx * 0.02);
        harmOsc.frequency.exponentialRampToValueAtTime(freq * 0.96, now + 1.2);

        harmGain.gain.setValueAtTime(0.0001, now + idx * 0.02);
        harmGain.gain.exponentialRampToValueAtTime(0.12 * intensity, now + idx * 0.02 + 0.04);
        harmGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

        harmOsc.connect(harmGain);
        harmGain.connect(this.masterGain);
        harmOsc.start(now + idx * 0.02);
        harmOsc.stop(now + 1.45);
      });

      // 3. Modulated plasma noise sweep
      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(800, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(2400, now + 0.25);
      noiseFilter.Q.setValueAtTime(5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15 * intensity, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noise.start(now);
      noise.stop(now + 0.35);

    } catch {
      // Audio playback catch
    }
  }

  /**
   * Subtle click / interaction feedback tick
   */
  public playInteractiveTick() {
    if (this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.06);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // ignore
    }
  }
}

export const audioSynth = new NexusAudioEngine();
