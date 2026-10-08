import { Platform, Projectile, GroundSpike, FloatingText, StageConfig } from './types.ts';
import { Player, Boss } from './entities.ts';
import { ParticleSystem } from './particles.ts';

export class GameRenderer {
  private bgImage: HTMLImageElement | null = null;
  private currentBgSrc: string = '';
  private cameraX: number = 0;
  private cameraY: number = 0;
  private shakeIntensity: number = 0;
  private clockRotation: number = 0;

  public loadBackground(src: string) {
    if (this.currentBgSrc === src && this.bgImage) return;
    this.currentBgSrc = src;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      this.bgImage = img;
    };
  }

  public triggerScreenShake(amount: number = 8) {
    this.shakeIntensity = Math.max(this.shakeIntensity, amount);
  }

  public render(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    player: Player,
    boss: Boss,
    projectiles: Projectile[],
    spikes: GroundSpike[],
    floatingTexts: FloatingText[],
    particles: ParticleSystem,
    stage: StageConfig,
    dt: number
  ) {
    // 1. Camera calculation with smoothing & screen shake
    const targetCamX = (player.x + player.width / 2) - width / 2;
    this.cameraX += (targetCamX - this.cameraX) * 0.08;
    // Bound camera within arena width (0 to 1280)
    this.cameraX = Math.max(0, Math.min(1280 - width, this.cameraX));

    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeIntensity > 0) {
      shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 25);
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // 2. Background Rendering (Parallax)
    this.renderBackground(ctx, width, height, stage);

    // 3. World Entities (Offset by Camera)
    ctx.save();
    ctx.translate(-this.cameraX, 0);

    // Ruined Arch Silhouettes / Parallax Midground
    this.renderMidgroundRuins(ctx, stage);

    // Stage Platforms & Pillars
    this.renderPlatforms(ctx, stage.platforms, stage.accentColor);

    // Ground Spikes
    this.renderSpikes(ctx, spikes);

    // Boss Shadow Aura & Entity
    this.renderBoss(ctx, boss, player.isTimeStopActive, dt);

    // Player Entity & Katana Slashing Trails
    this.renderPlayer(ctx, player, dt);

    // Projectiles
    this.renderProjectiles(ctx, projectiles, player.isTimeStopActive);

    // Particles
    particles.render(ctx);

    // Floating Damage Texts
    this.renderFloatingTexts(ctx, floatingTexts);

    ctx.restore(); // Restore Camera

    // 4. Foreground Atmospheric Overlays & Fog
    this.renderAtmosphere(ctx, width, height, stage, player.isTimeStopActive, dt);

    // 5. Time Stop Fullscreen Overlay
    if (player.isTimeStopActive) {
      this.renderTimeStopFX(ctx, width, height, dt);
    }

    ctx.restore(); // Restore Shake
  }

  // --- BACKGROUND & PARALLAX ---
  private renderBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    stage: StageConfig
  ) {
    ctx.fillStyle = '#06050b';
    ctx.fillRect(0, 0, width, height);

    if (this.bgImage && this.bgImage.complete) {
      // Parallax scroll factor 0.3
      const parallaxOffset = -this.cameraX * 0.25;
      const bgW = width * 1.35;
      const bgH = height;
      ctx.drawImage(this.bgImage, parallaxOffset, 0, bgW, bgH);
    }

    // Atmospheric color wash
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, 'rgba(5, 4, 10, 0.4)');
    grad.addColorStop(0.7, 'rgba(10, 8, 20, 0.6)');
    grad.addColorStop(1, 'rgba(4, 3, 8, 0.95)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  private renderMidgroundRuins(ctx: CanvasRenderingContext2D, stage: StageConfig) {
    ctx.save();
    ctx.fillStyle = 'rgba(12, 10, 22, 0.6)';

    // Distant Gothic Spires and Shattered Pillars
    const spires = [
      { x: 60, w: 70, h: 420 },
      { x: 260, w: 90, h: 360 },
      { x: 500, w: 120, h: 480 },
      { x: 780, w: 80, h: 390 },
      { x: 1040, w: 110, h: 450 },
      { x: 1180, w: 60, h: 380 }
    ];

    for (const sp of spires) {
      ctx.beginPath();
      ctx.moveTo(sp.x, 620);
      ctx.lineTo(sp.x + sp.w * 0.15, 620 - sp.h * 0.75);
      ctx.lineTo(sp.x + sp.w * 0.5, 620 - sp.h);
      ctx.lineTo(sp.x + sp.w * 0.85, 620 - sp.h * 0.75);
      ctx.lineTo(sp.x + sp.w, 620);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // --- PLATFORMS ---
  private renderPlatforms(ctx: CanvasRenderingContext2D, platforms: Platform[], accent: string) {
    for (const plat of platforms) {
      ctx.save();

      if (plat.type === 'ground') {
        // Deep gothic stonework with cracked pattern
        const groundGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.h);
        groundGrad.addColorStop(0, '#1c1926');
        groundGrad.addColorStop(0.1, '#110e1a');
        groundGrad.addColorStop(1, '#050308');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

        // Highlight top rim
        ctx.strokeStyle = 'rgba(140, 110, 180, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(plat.x, plat.y);
        ctx.lineTo(plat.x + plat.w, plat.y);
        ctx.stroke();

        // Stone blocks division
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 1.5;
        for (let bx = plat.x; bx < plat.x + plat.w; bx += 60) {
          ctx.beginPath();
          ctx.moveTo(bx, plat.y);
          ctx.lineTo(bx, plat.y + 35);
          ctx.stroke();
        }
      } else if (plat.type === 'pillar') {
        // Vertical gothic ruined column
        ctx.fillStyle = '#14121d';
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
        ctx.strokeStyle = 'rgba(100, 80, 140, 0.3)';
        ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
      } else {
        // Floating shattered platform
        ctx.fillStyle = '#1e1b2e';
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.w, plat.h, [4, 4, 2, 2]);
        ctx.fill();

        // Platform top glow rim
        ctx.strokeStyle = plat.rune ? accent : 'rgba(140, 120, 190, 0.5)';
        ctx.lineWidth = plat.rune ? 2 : 1.5;
        ctx.beginPath();
        ctx.moveTo(plat.x, plat.y);
        ctx.lineTo(plat.x + plat.w, plat.y);
        ctx.stroke();

        // Glowing runic markings on rune platforms
        if (plat.rune) {
          ctx.fillStyle = accent;
          ctx.globalAlpha = 0.5;
          for (let rx = plat.x + 20; rx < plat.x + plat.w - 15; rx += 45) {
            ctx.fillRect(rx, plat.y + 6, 8, 3);
            ctx.fillRect(rx + 3, plat.y + 3, 2, 9);
          }
        }
      }

      ctx.restore();
    }
  }

  // --- PLAYER RENDERING ---
  private renderPlayer(ctx: CanvasRenderingContext2D, player: Player, dt: number) {
    ctx.save();

    // Invulnerability blink
    if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 20) % 2 === 0) {
      ctx.globalAlpha = 0.35;
    }

    const px = player.x;
    const py = player.y;
    const dir = player.facing;
    const isMoving = Math.abs(player.vx) > 0.5;

    // Afterimage ghost trails on Dash
    if (player.isDashing) {
      ctx.save();
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(px - dir * 16, py + 8, player.width, player.height - 8);
      ctx.restore();
    }

    ctx.translate(px + player.width / 2, py + player.height / 2);
    ctx.scale(dir, 1);

    // 1. Cape / Cloak (Flowing physics)
    ctx.fillStyle = '#1e1b29';
    ctx.beginPath();
    const capeWiggle = isMoving ? Math.sin(Date.now() * 0.015) * 8 : Math.sin(Date.now() * 0.003) * 3;
    ctx.moveTo(-6, -14);
    ctx.lineTo(-24 - (player.vx * dir * 1.5), 18 + capeWiggle);
    ctx.lineTo(-12, 28);
    ctx.lineTo(4, -10);
    ctx.closePath();
    ctx.fill();

    // 2. Traveler Body & Robes
    ctx.fillStyle = '#2d273d';
    ctx.beginPath();
    ctx.roundRect(-10, -12, 20, 34, 4);
    ctx.fill();

    // 3. Legs / Boots
    ctx.fillStyle = '#171422';
    const legSwing = isMoving ? Math.sin(Date.now() * 0.02) * 6 : 0;
    ctx.fillRect(-8 + legSwing, 18, 6, 14);
    ctx.fillRect(2 - legSwing, 18, 6, 14);

    // 4. Wanderer Hood & Shadow Face
    ctx.fillStyle = '#191624';
    ctx.beginPath();
    ctx.arc(0, -20, 12, 0, Math.PI * 2);
    ctx.fill();

    // Glowing intense anime eyes under hood
    ctx.fillStyle = player.isTimeStopActive ? '#facc15' : '#38bdf8';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 8;
    ctx.fillRect(2, -21, 5, 2.5);
    ctx.shadowBlur = 0;

    // 5. Luminescent Katana & Slashing Stance
    ctx.save();
    if (player.isAttacking) {
      // Slashing motion
      const slashAngle = (1 - player.attackTimer / 0.3) * Math.PI;
      ctx.rotate(slashAngle - 0.5);
      // Sword blade
      ctx.strokeStyle = player.isTimeStopActive ? '#fbbf24' : '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(38, -6);
      ctx.stroke();

      // Glowing Slash Arc ribbon
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, 42, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
    } else {
      // Sheathed / Rest stance at side
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(14, 18);
      ctx.stroke();
    }
    ctx.restore();

    ctx.restore();
  }

  // --- BOSS RENDERING ---
  private renderBoss(ctx: CanvasRenderingContext2D, boss: Boss, isTimeStopped: boolean, dt: number) {
    const e = boss.entity;
    ctx.save();

    const bx = e.x + e.width / 2;
    const by = e.y + e.height / 2;
    const dir = e.facing;

    ctx.translate(bx, by);
    ctx.scale(dir, 1);

    // Dark Eldritch Hover Sway
    const timeVal = isTimeStopped ? 0 : Date.now() * 0.003;
    const hoverY = Math.sin(timeVal) * 6;

    // Spectral Clones if active
    if (e.clones.length > 0) {
      for (const clone of e.clones) {
        ctx.save();
        ctx.translate(clone.x - bx, clone.y - by);
        ctx.globalAlpha = clone.opacity;
        ctx.fillStyle = '#7c3aed';
        ctx.beginPath();
        ctx.arc(0, 0, 45, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // 1. Shadow Tendril Wings (Procedural sine oscillation)
    ctx.fillStyle = 'rgba(15, 10, 25, 0.9)';
    ctx.strokeStyle = '#4c1d95';
    ctx.lineWidth = 3;

    for (let w = 0; w < 4; w++) {
      ctx.save();
      const wingSpread = (w - 1.5) * 0.4;
      ctx.rotate(wingSpread + Math.sin(timeVal + w) * 0.1);
      ctx.beginPath();
      ctx.moveTo(-10, -20);
      ctx.bezierCurveTo(-50, -80, -90, -40, -110, hoverY - 10 + w * 18);
      ctx.bezierCurveTo(-80, 20, -40, 10, -10, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 2. Main Towering Body Silhouette
    const bodyGrad = ctx.createRadialGradient(0, -10, 10, 0, 0, 70);
    bodyGrad.addColorStop(0, '#2e1065');
    bodyGrad.addColorStop(0.6, '#0f0a1c');
    bodyGrad.addColorStop(1, '#05020a');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-36, -60, 72, 120, [30, 30, 20, 20]);
    ctx.fill();

    // 3. Demonic Curved Horns
    ctx.fillStyle = '#170f2b';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    // Left horn
    ctx.beginPath();
    ctx.moveTo(-20, -55);
    ctx.quadraticCurveTo(-45, -95, -30, -115);
    ctx.quadraticCurveTo(-15, -85, -10, -58);
    ctx.fill();
    ctx.stroke();
    // Right horn
    ctx.beginPath();
    ctx.moveTo(10, -58);
    ctx.quadraticCurveTo(25, -95, 42, -110);
    ctx.quadraticCurveTo(25, -75, 18, -55);
    ctx.fill();
    ctx.stroke();

    // 4. Multiple Glowing Eyes & Menacing Glare
    const eyeColors = e.isTelegraphing ? ['#ef4444', '#dc2626', '#f87171'] : ['#a855f7', '#ec4899', '#f43f5e'];
    ctx.shadowBlur = e.isTelegraphing ? 20 : 10;
    ctx.shadowColor = eyeColors[0];

    // Main central eye
    ctx.fillStyle = eyeColors[0];
    ctx.beginPath();
    ctx.ellipse(8, -35, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Upper demonic eyes
    ctx.fillStyle = eyeColors[1];
    ctx.beginPath();
    ctx.ellipse(4, -45, 4, 2.5, -0.2, 0, Math.PI * 2);
    ctx.ellipse(14, -44, 4, 2.5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 5. Giant Void Scythe / Armament
    ctx.save();
    const scytheSwing = e.currentAttack === 'TELEPORT_SLASH' ? Math.sin((1 - e.attackTimer / 0.5) * Math.PI) * 1.5 : 0;
    ctx.rotate(-0.3 + scytheSwing);
    // Shaft
    ctx.strokeStyle = '#312e81';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(25, -70);
    ctx.lineTo(25, 65);
    ctx.stroke();
    // Curved blade
    ctx.fillStyle = '#dc2626';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(25, -70);
    ctx.quadraticCurveTo(70, -110, 110, -60);
    ctx.quadraticCurveTo(60, -75, 25, -55);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // 6. Telegraph Indicator Flare
    if (e.isTelegraphing) {
      ctx.save();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
      ctx.beginPath();
      ctx.arc(8, -35, 14 + Math.sin(Date.now() * 0.03) * 6, 0, Math.PI * 2);
      ctx.fill();
      // Ominous Warning Crosshair
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(-25, -60, 50, 50);
      ctx.restore();
    }

    // 7. Staggered / Vulnerable Crystalline Shards
    if (e.currentAttack === 'STAGGERED') {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      const ringSpin = Date.now() * 0.005;
      ctx.beginPath();
      ctx.arc(0, -10, 65, ringSpin, ringSpin + Math.PI * 1.5);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  // --- PROJECTILES ---
  private renderProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[], isTimeStopped: boolean) {
    for (const p of projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);

      // Outer void glow
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;

      // Swirling Void Orb
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner dark singularity core
      ctx.fillStyle = '#05020a';
      ctx.beginPath();
      ctx.arc(0, 0, p.radius * 0.55, 0, Math.PI * 2);
      ctx.fill();

      // If time stopped, draw frozen stasis ring around projectile
      if (isTimeStopped) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // --- GROUND SPIKES ---
  private renderSpikes(ctx: CanvasRenderingContext2D, spikes: GroundSpike[]) {
    for (const sp of spikes) {
      ctx.save();
      if (sp.stage === 'warning') {
        // Red glowing indicator on the ground
        ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.fillRect(sp.x - sp.w / 2, sp.y - 6, sp.w, 6);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(sp.x - sp.w / 2, sp.y - 6, sp.w, 6);
      } else {
        // Obsidian Spikes erupting upwards
        ctx.fillStyle = '#1c0b2b';
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(sp.x - sp.w / 2, sp.y);
        ctx.lineTo(sp.x, sp.y - sp.currentH);
        ctx.lineTo(sp.x + sp.w / 2, sp.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // --- FLOATING TEXTS ---
  private renderFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
    ctx.save();
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';

    for (const t of texts) {
      const alpha = Math.max(0, 1 - t.life / t.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = t.color;
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 4;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.restore();
  }

  // --- ATMOSPHERE & FOG ---
  private renderAtmosphere(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    stage: StageConfig,
    isTimeStopped: boolean,
    dt: number
  ) {
    ctx.save();

    // Creeping ground mist
    const mistGrad = ctx.createLinearGradient(0, height - 140, 0, height);
    mistGrad.addColorStop(0, 'rgba(0,0,0,0)');
    mistGrad.addColorStop(1, stage.fogColor);
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, height - 140, width, 140);

    // Deep Vignette
    const vignette = ctx.createRadialGradient(width / 2, height / 2, width * 0.35, width / 2, height / 2, width * 0.72);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(3, 2, 8, 0.75)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }

  // --- TIME STOP VISUAL EFFECTS ---
  private renderTimeStopFX(ctx: CanvasRenderingContext2D, width: number, height: number, dt: number) {
    ctx.save();
    this.clockRotation += dt * 0.2;

    // 1. Inverted desaturation wash
    ctx.fillStyle = 'rgba(20, 24, 45, 0.35)';
    ctx.globalCompositeOperation = 'difference';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'source-over';

    // 2. Massive stopped Celestial Clock dial in sky
    ctx.save();
    ctx.translate(width / 2, height * 0.4);
    ctx.rotate(this.clockRotation);
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;

    // Outer roman dial
    ctx.beginPath();
    ctx.arc(0, 0, 180, 0, Math.PI * 2);
    ctx.stroke();

    for (let h = 0; h < 12; h++) {
      const angle = (h / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 160, Math.sin(angle) * 160);
      ctx.lineTo(Math.cos(angle) * 180, Math.sin(angle) * 180);
      ctx.stroke();
    }

    // Stopped clock hands
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -110);
    ctx.moveTo(0, 0);
    ctx.lineTo(75, 0);
    ctx.stroke();
    ctx.restore();

    // 3. Chromatic aberration border pulse
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, width, height);

    ctx.restore();
  }
}
