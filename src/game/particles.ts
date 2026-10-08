/**
 * High-performance 2D Particle Engine for Chrono Eclipse
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxSize: number;
  color: string;
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  type: 'ember' | 'ash' | 'spark' | 'void' | 'slash' | 'chrono' | 'dust';
  rotation?: number;
  vRot?: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number = 400;

  public reset() {
    this.particles = [];
  }

  public update(dt: number, isTimeStopped: boolean = false) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // If time stopped, non-chrono particles slow down by 95% or freeze
      const timeFactor = isTimeStopped && p.type !== 'chrono' ? 0.05 : 1.0;

      p.x += p.vx * dt * 60 * timeFactor;
      p.y += p.vy * dt * 60 * timeFactor;

      if (p.vRot) {
        p.rotation = (p.rotation || 0) + p.vRot * dt * 60 * timeFactor;
      }

      // Physics behavior per type
      if (p.type === 'ash' || p.type === 'void') {
        p.vy += Math.sin(p.life * 0.1) * 0.05 * timeFactor;
        p.vx += Math.cos(p.life * 0.08) * 0.05 * timeFactor;
      } else if (p.type === 'spark') {
        p.vy += 0.25 * timeFactor; // gravity
      } else if (p.type === 'dust') {
        p.vx *= 0.95;
        p.vy *= 0.95;
      }

      p.life += dt * timeFactor;
      p.alpha = Math.max(0, p.maxAlpha * (1 - p.life / p.maxLife));

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'spark') {
        // High-velocity elongated spark
        ctx.translate(p.x, p.y);
        const angle = Math.atan2(p.vy, p.vx);
        ctx.rotate(angle);
        ctx.fillRect(-p.size * 2, -p.size * 0.5, p.size * 4, p.size);
      } else if (p.type === 'chrono') {
        // Glowing runic diamond
        ctx.translate(p.x, p.y);
        if (p.rotation) ctx.rotate(p.rotation);
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size, 0);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'slash') {
        // Ethereal slash streak
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillRect(-p.size * 1.5, -p.size * 0.3, p.size * 3, p.size * 0.6);
      } else {
        // Circular soft ember/ash/void
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // --- SPAWN HELPERS ---

  public emitAmbientMotes(areaW: number, areaH: number, color: string = '#8b5cf6') {
    if (this.particles.length > this.maxParticles - 50) return;
    if (Math.random() < 0.3) {
      this.particles.push({
        x: Math.random() * areaW,
        y: Math.random() * areaH,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.3 - Math.random() * 0.5,
        size: 1 + Math.random() * 2.5,
        maxSize: 3,
        color,
        alpha: 0.1,
        maxAlpha: 0.4 + Math.random() * 0.4,
        life: 0,
        maxLife: 3 + Math.random() * 4,
        type: 'ash'
      });
    }
  }

  public emitHitSparks(x: number, y: number, color: string = '#38bdf8', count: number = 14) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1.5 + Math.random() * 2,
        maxSize: 3,
        color,
        alpha: 1,
        maxAlpha: 1,
        life: 0,
        maxLife: 0.3 + Math.random() * 0.4,
        type: 'spark'
      });
    }
  }

  public emitSlashArc(x: number, y: number, dir: number, combo: number) {
    const colors = ['#38bdf8', '#818cf8', '#c084fc'];
    const chosenColor = colors[combo % colors.length];
    for (let i = 0; i < 8; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const spread = (i - 4) * 6;
      this.particles.push({
        x: x + dir * (20 + i * 4),
        y: y + spread,
        vx: dir * (1 + Math.random() * 2),
        vy: (Math.random() - 0.5) * 2,
        size: 3 + Math.random() * 3,
        maxSize: 5,
        color: chosenColor,
        alpha: 0.9,
        maxAlpha: 0.9,
        life: 0,
        maxLife: 0.25 + Math.random() * 0.2,
        type: 'slash',
        rotation: dir > 0 ? (i - 4) * 0.15 : -(i - 4) * 0.15
      });
    }
  }

  public emitDust(x: number, y: number, count: number = 6) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + 2,
        vx: (Math.random() - 0.5) * 2.5,
        vy: -0.5 - Math.random() * 1.5,
        size: 2 + Math.random() * 3,
        maxSize: 4,
        color: 'rgba(160, 150, 180, 0.4)',
        alpha: 0.5,
        maxAlpha: 0.5,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.3,
        type: 'dust'
      });
    }
  }

  public emitTimeStopBurst(x: number, y: number) {
    for (let i = 0; i < 35; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = (i / 35) * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 4,
        maxSize: 6,
        color: i % 2 === 0 ? '#38bdf8' : '#a855f7',
        alpha: 1,
        maxAlpha: 1,
        life: 0,
        maxLife: 1.2 + Math.random() * 0.8,
        type: 'chrono',
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.1
      });
    }
  }

  public emitBossDeathExplosion(x: number, y: number) {
    for (let i = 0; i < 100; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 10;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 6,
        maxSize: 8,
        color: Math.random() > 0.4 ? '#dc2626' : '#7c3aed',
        alpha: 1,
        maxAlpha: 1,
        life: 0,
        maxLife: 1.5 + Math.random() * 1.5,
        type: 'void'
      });
    }
  }

  public emitVoidAura(x: number, y: number, radius: number = 40) {
    if (this.particles.length >= this.maxParticles) return;
    if (Math.random() < 0.6) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * radius;
      this.particles.push({
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -0.8 - Math.random() * 1.2,
        size: 2 + Math.random() * 3.5,
        maxSize: 4.5,
        color: '#dc2626',
        alpha: 0.6,
        maxAlpha: 0.7,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.5,
        type: 'void'
      });
    }
  }
}
