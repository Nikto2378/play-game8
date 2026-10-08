/**
 * Procedural Web Audio API sound generator for Chrono Eclipse
 * Ambient dark horror drone, combat music loops, boss motif & SFX.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  private isMuted: boolean = false;
  private musicVolume: number = 0.5;
  private sfxVolume: number = 0.7;

  // Music state
  private ambientOscillators: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private battleInterval: number | null = null;
  private clockInterval: number | null = null;
  private isBattlePlaying: boolean = false;
  private isTimeStopActive: boolean = false;
  private stepCounter: number = 0;

  constructor() {
    // Lazy initialized on first user interaction
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.startAmbientDrone();
    } catch (e) {
      console.warn('AudioContext failed to initialize', e);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public getMusicVolume() {
    return this.musicVolume;
  }

  public getSfxVolume() {
    return this.sfxVolume;
  }

  // --- AMBIENT DRONE ---
  private startAmbientDrone() {
    if (!this.ctx || !this.musicGain) return;
    this.stopAmbientDrone();

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0.25;
    this.ambientGain.connect(this.musicGain);

    // Deep sub drone
    const droneFreqs = [55, 110, 164.81]; // A1, A2, E3
    droneFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.ambientGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === 0 ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Low pass filter
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, this.ctx.currentTime);

      gain.gain.value = idx === 0 ? 0.35 : 0.08;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ambientGain);

      osc.start();
      this.ambientOscillators.push(osc);
    });
  }

  private stopAmbientDrone() {
    this.ambientOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.ambientOscillators = [];
    if (this.ambientGain) {
      this.ambientGain.disconnect();
      this.ambientGain = null;
    }
  }

  // --- BATTLE THEME & BOSS MOTIF ---
  public startBattleMusic() {
    if (this.isBattlePlaying || !this.ctx) return;
    this.isBattlePlaying = true;
    this.stepCounter = 0;

    // Haunting boss motif: C3 -> Eb3 -> D3 -> Ab2, repeating with dark pulsing sub-bass
    const bassScale = [65.41, 65.41, 77.78, 73.42, 65.41, 65.41, 51.91, 58.27]; // C2, C2, Eb2, D2, C2, C2, Ab1, Bb1
    const motifNotes = [261.63, 311.13, 293.66, 207.65, 261.63, 329.63, 311.13, 246.94]; // C4, Eb4, D4, Ab3...

    const tick = () => {
      if (!this.ctx || !this.isBattlePlaying || !this.musicGain) return;

      const now = this.ctx.currentTime;
      const step = this.stepCounter % 8;
      const bar = Math.floor(this.stepCounter / 8) % 4;

      // Dark pulsing bass kick / thud on beats
      if (step % 2 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'triangle';
        const bassFreq = bassScale[step] * (this.isTimeStopActive ? 0.6 : 1);
        kickOsc.frequency.setValueAtTime(bassFreq * 1.5, now);
        kickOsc.frequency.exponentialRampToValueAtTime(bassFreq * 0.5, now + 0.18);

        kickGain.gain.setValueAtTime(this.isTimeStopActive ? 0.08 : 0.22, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        kickOsc.connect(kickGain);
        kickGain.connect(this.musicGain);

        kickOsc.start(now);
        kickOsc.stop(now + 0.22);
      }

      // Menacing Boss Motif Chime (every 4 steps, muted during time stop)
      if (!this.isTimeStopActive && (step === 0 || step === 3 || step === 5 || step === 7)) {
        const bellOsc = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        bellOsc.type = 'sine';
        const note = motifNotes[(step + bar) % motifNotes.length];
        bellOsc.frequency.setValueAtTime(note, now);

        bellGain.gain.setValueAtTime(0.09, now);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        bellOsc.connect(bellGain);
        bellGain.connect(this.musicGain);

        bellOsc.start(now);
        bellOsc.stop(now + 0.52);
      }

      this.stepCounter++;
    };

    // ~140 BPM (16th notes around 107ms)
    this.battleInterval = window.setInterval(tick, 140);
  }

  public stopBattleMusic() {
    this.isBattlePlaying = false;
    if (this.battleInterval !== null) {
      clearInterval(this.battleInterval);
      this.battleInterval = null;
    }
  }

  // --- TIME STOP TICKING LOOP ---
  public setTimeStopActive(active: boolean) {
    if (this.isTimeStopActive === active) return;
    this.isTimeStopActive = active;

    if (active) {
      this.playTimeStopShatter();
      this.startClockTicking();
    } else {
      this.playTimeResumeWhoosh();
      this.stopClockTicking();
    }
  }

  private startClockTicking() {
    this.stopClockTicking();
    if (!this.ctx) return;

    let isTick = true;
    this.clockInterval = window.setInterval(() => {
      if (!this.ctx || !this.sfxGain || !this.isTimeStopActive) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isTick ? 900 : 700, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.06);

      isTick = !isTick;
    }, 280);
  }

  private stopClockTicking() {
    if (this.clockInterval !== null) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
  }

  // --- SOUND EFFECTS ---
  public playFootstep() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playJump() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.12);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playDash() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    // White-noise whoosh
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start(now);
  }

  public playSwordSlash(comboIndex: number = 1) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const startFreq = 480 + comboIndex * 150;
    const endFreq = 220;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.14);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playHitImpact() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Bass crunch
    const bass = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bass.type = 'triangle';
    bass.frequency.setValueAtTime(150, now);
    bass.frequency.exponentialRampToValueAtTime(30, now + 0.18);
    bassGain.gain.setValueAtTime(0.4, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    bass.connect(bassGain);
    bassGain.connect(this.sfxGain);
    bass.start(now);
    bass.stop(now + 0.18);

    // High metal snap
    const snap = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snap.type = 'sine';
    snap.frequency.setValueAtTime(1100, now);
    snap.frequency.exponentialRampToValueAtTime(450, now + 0.08);
    snapGain.gain.setValueAtTime(0.25, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    snap.connect(snapGain);
    snapGain.connect(this.sfxGain);
    snap.start(now);
    snap.stop(now + 0.09);
  }

  public playPlayerHurt() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playTimeStopShatter() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Resonant glass ring + descending pitch sweep
    const chime = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(1600, now);
    chime.frequency.exponentialRampToValueAtTime(120, now + 0.6);

    chimeGain.gain.setValueAtTime(0.45, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    chime.connect(chimeGain);
    chimeGain.connect(this.sfxGain);
    chime.start(now);
    chime.stop(now + 0.65);
  }

  public playTimeResumeWhoosh() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.35);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playBossTelegraph() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(70, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.45);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.52);
  }

  public playBossSpikeErupt() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.33);
  }

  public playBossTeleport() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.22);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  public playVictoryFanfare() {
    if (!this.ctx || !this.sfxGain) return;
    const chords = [261.63, 329.63, 392.00, 523.25]; // C major ethereal
    chords.forEach((note, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const now = this.ctx.currentTime + i * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 1.2);
    });
  }

  public playDefeat() {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 1.2);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 1.25);
  }
}

export const soundEngine = new SoundEngine();
