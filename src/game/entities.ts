import { Platform, Projectile, GroundSpike, FloatingText, BossEntity, StageConfig } from './types.ts';
import { ParticleSystem } from './particles.ts';
import { soundEngine } from './audio.ts';

export interface PlayerInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  attack: boolean;
  timeStop: boolean;
  dash: boolean;
  down: boolean;
}

export class Player {
  public x: number = 200;
  public y: number = 550;
  public vx: number = 0;
  public vy: number = 0;
  public width: number = 36;
  public height: number = 64;
  public facing: 1 | -1 = 1;

  public isGrounded: boolean = false;
  public canDoubleJump: boolean = true;
  public isDashing: boolean = false;
  public dashTimer: number = 0;
  public dashCooldownTimer: number = 0;

  // Combat
  public isAttacking: boolean = false;
  public attackTimer: number = 0;
  public comboStep: number = 0;
  public comboResetTimer: number = 0;
  public hasHitInCurrentSwing: boolean = false;

  // Hurt / i-frames
  public invulnerableTimer: number = 0;
  public isHurt: boolean = false;
  public hurtTimer: number = 0;

  // Stats
  public hp: number = 100;
  public maxHp: number = 100;
  public chronoEnergy: number = 100;
  public maxChronoEnergy: number = 100;
  public isTimeStopActive: boolean = false;

  // Timers
  private jumpBuffer: number = 0;
  private coyoteTimer: number = 0;
  private footstepTimer: number = 0;

  constructor(spawnX: number, spawnY: number) {
    this.reset(spawnX, spawnY);
  }

  public reset(spawnX: number, spawnY: number) {
    this.x = spawnX;
    this.y = spawnY;
    this.vx = 0;
    this.vy = 0;
    this.hp = this.maxHp;
    this.chronoEnergy = this.maxChronoEnergy;
    this.isTimeStopActive = false;
    this.isAttacking = false;
    this.isDashing = false;
    this.invulnerableTimer = 0;
    this.isHurt = false;
    this.comboStep = 0;
  }

  public update(
    dt: number,
    input: PlayerInput,
    platforms: Platform[],
    particles: ParticleSystem
  ) {
    // 1. Time Stop Management
    if (input.timeStop) {
      if (!this.isTimeStopActive && this.chronoEnergy >= 15) {
        this.isTimeStopActive = true;
        soundEngine.setTimeStopActive(true);
        particles.emitTimeStopBurst(this.x + this.width / 2, this.y + this.height / 2);
      } else if (this.isTimeStopActive) {
        this.isTimeStopActive = false;
        soundEngine.setTimeStopActive(false);
      }
    }

    if (this.isTimeStopActive) {
      this.chronoEnergy -= 24 * dt;
      if (this.chronoEnergy <= 0) {
        this.chronoEnergy = 0;
        this.isTimeStopActive = false;
        soundEngine.setTimeStopActive(false);
      }
    } else {
      if (this.chronoEnergy < this.maxChronoEnergy) {
        this.chronoEnergy = Math.min(this.maxChronoEnergy, this.chronoEnergy + 14 * dt);
      }
    }

    // 2. Dash Logic
    if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= dt;
    if (input.dash && !this.isDashing && this.dashCooldownTimer <= 0) {
      this.isDashing = true;
      this.dashTimer = 0.2;
      this.dashCooldownTimer = 0.65;
      this.invulnerableTimer = 0.25;
      this.vx = this.facing * 14;
      this.vy = 0;
      soundEngine.playDash();
      particles.emitDust(this.x + this.width / 2, this.y + this.height, 10);
    }

    if (this.isDashing) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.vx *= 0.5;
      }
    }

    // 3. Horizontal Movement (if not dashing)
    const moveSpeed = 6.2;
    const accel = 1.4;
    const friction = 0.82;

    if (!this.isDashing) {
      if (input.left && !input.right) {
        this.vx = Math.max(-moveSpeed, this.vx - accel);
        this.facing = -1;
      } else if (input.right && !input.left) {
        this.vx = Math.min(moveSpeed, this.vx + accel);
        this.facing = 1;
      } else {
        this.vx *= friction;
        if (Math.abs(this.vx) < 0.2) this.vx = 0;
      }
    }

    // Footstep audio
    if (this.isGrounded && Math.abs(this.vx) > 1.5) {
      this.footstepTimer += dt;
      if (this.footstepTimer > 0.26) {
        soundEngine.playFootstep();
        particles.emitDust(this.x + this.width / 2, this.y + this.height, 2);
        this.footstepTimer = 0;
      }
    }

    // 4. Jump & Physics
    const gravity = 0.72;
    const maxFall = 15;

    if (!this.isDashing) {
      this.vy = Math.min(maxFall, this.vy + gravity);
    }

    if (this.isGrounded) {
      this.coyoteTimer = 0.12;
      this.canDoubleJump = true;
    } else {
      this.coyoteTimer -= dt;
    }

    if (input.jump) {
      this.jumpBuffer = 0.14;
    } else if (this.jumpBuffer > 0) {
      this.jumpBuffer -= dt;
    }

    if (this.jumpBuffer > 0) {
      if (this.coyoteTimer > 0) {
        this.vy = -13.5;
        this.jumpBuffer = 0;
        this.coyoteTimer = 0;
        this.isGrounded = false;
        soundEngine.playJump();
        particles.emitDust(this.x + this.width / 2, this.y + this.height, 8);
      } else if (this.canDoubleJump) {
        this.vy = -12.5;
        this.canDoubleJump = false;
        this.jumpBuffer = 0;
        soundEngine.playJump();
        particles.emitDust(this.x + this.width / 2, this.y + this.height, 8);
      }
    }

    // 5. Attack Logic
    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= dt;
      if (this.comboResetTimer <= 0) {
        this.comboStep = 0;
      }
    }

    if (input.attack && !this.isAttacking) {
      this.isAttacking = true;
      this.comboStep = (this.comboStep % 3) + 1;
      this.attackTimer = this.comboStep === 3 ? 0.35 : 0.22;
      this.comboResetTimer = 0.8;
      this.hasHitInCurrentSwing = false;

      // Forward step on attack
      this.vx += this.facing * (this.comboStep === 3 ? 4 : 2);
      soundEngine.playSwordSlash(this.comboStep);
      particles.emitSlashArc(this.x + this.width / 2, this.y + this.height / 2, this.facing, this.comboStep);
    }

    if (this.isAttacking) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
      }
    }

    // 6. Hurt & Invulnerability Timers
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }
    if (this.hurtTimer > 0) {
      this.hurtTimer -= dt;
      if (this.hurtTimer <= 0) this.isHurt = false;
    }

    // 7. Platform Collision & Integration
    this.x += this.vx;
    this.y += this.vy;

    // Boundary constraints
    if (this.x < 10) this.x = 10;
    if (this.x + this.width > 1270) this.x = 1270 - this.width;

    this.isGrounded = false;
    for (const plat of platforms) {
      if (plat.type === 'pillar') {
        // Horizontal wall blocking
        if (
          this.y + this.height > plat.y &&
          this.y < plat.y + plat.h &&
          this.x + this.width > plat.x &&
          this.x < plat.x + plat.w
        ) {
          if (this.vx > 0) this.x = plat.x - this.width;
          else if (this.vx < 0) this.x = plat.x + plat.w;
          this.vx = 0;
        }
        continue;
      }

      // Vertical platform collision (one-way for platforms, solid for ground)
      const prevY = this.y - this.vy;
      if (
        this.x + this.width > plat.x + 4 &&
        this.x < plat.x + plat.w - 4 &&
        prevY + this.height <= plat.y + 12 &&
        this.y + this.height >= plat.y &&
        this.vy >= 0
      ) {
        this.y = plat.y - this.height;
        this.vy = 0;
        this.isGrounded = true;
      }
    }

    // Arena bottom pit safety
    if (this.y > 640) {
      this.y = 620 - this.height;
      this.vy = 0;
      this.isGrounded = true;
    }
  }

  public takeDamage(amount: number, particles: ParticleSystem): boolean {
    if (this.invulnerableTimer > 0 || this.hp <= 0) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.invulnerableTimer = 0.7;
    this.isHurt = true;
    this.hurtTimer = 0.35;
    this.vy = -5;
    this.vx = -this.facing * 4;
    soundEngine.playPlayerHurt();
    particles.emitHitSparks(this.x + this.width / 2, this.y + this.height / 2, '#ef4444', 18);
    return true;
  }
}

export class Boss {
  public entity: BossEntity;
  private config: StageConfig;
  private patternCooldown: number = 1.4;

  constructor(config: StageConfig) {
    this.config = config;
    this.entity = {
      x: config.bossSpawn.x,
      y: config.bossSpawn.y,
      vx: 0,
      vy: 0,
      width: 110,
      height: 140,
      facing: -1,
      hp: config.bossMaxHp,
      maxHp: config.bossMaxHp,
      stagger: 0,
      maxStagger: 100,
      currentAttack: 'IDLE',
      attackTimer: 0,
      attackDuration: 0,
      telegraphTimer: 0,
      isTelegraphing: false,
      invulnerable: false,
      targetX: config.bossSpawn.x,
      targetY: config.bossSpawn.y,
      chargeHits: 0,
      clones: []
    };
  }

  public update(
    dt: number,
    player: Player,
    isTimeStopped: boolean,
    projectiles: Projectile[],
    spikes: GroundSpike[],
    floatingTexts: FloatingText[],
    particles: ParticleSystem
  ) {
    // If time is stopped, the Boss is completely frozen!
    if (isTimeStopped) {
      // Particles still emit slightly frozen
      particles.emitVoidAura(this.entity.x + this.entity.width / 2, this.entity.y + this.entity.height / 2, 20);
      return;
    }

    const e = this.entity;

    // Face player
    const playerCenterX = player.x + player.width / 2;
    const bossCenterX = e.x + e.width / 2;
    e.facing = playerCenterX > bossCenterX ? 1 : -1;

    // Aura particles
    particles.emitVoidAura(bossCenterX, e.y + e.height / 2, 50);

    // Stagger recovery
    if (e.currentAttack === 'STAGGERED') {
      e.attackTimer -= dt;
      if (e.attackTimer <= 0) {
        e.currentAttack = 'IDLE';
        e.stagger = 0;
        this.patternCooldown = 1.0;
      }
      return;
    }

    // Telegraph Countdown
    if (e.isTelegraphing) {
      e.telegraphTimer -= dt;
      // Crimson eye glow & shake
      e.x += (Math.random() - 0.5) * 2;
      if (e.telegraphTimer <= 0) {
        e.isTelegraphing = false;
        this.executeAttackExecution(player, projectiles, spikes, particles);
      }
      return;
    }

    // Active Attack Duration
    if (e.currentAttack !== 'IDLE' && e.currentAttack !== 'STALK') {
      e.attackTimer -= dt;
      this.handleAttackPhysics(dt, player, particles);

      if (e.attackTimer <= 0) {
        e.currentAttack = 'IDLE';
        this.patternCooldown = 1.2 + Math.random() * 0.8;
      }
      return;
    }

    // Idle & Stalking AI
    this.patternCooldown -= dt;
    const dist = Math.abs(playerCenterX - bossCenterX);

    // Smooth hover / stalk
    const targetHoverY = 480;
    e.y += (targetHoverY - e.y) * 0.04;

    if (dist > 300) {
      e.vx = e.facing * this.config.bossSpeed;
    } else if (dist < 180) {
      e.vx = -e.facing * (this.config.bossSpeed * 0.8);
    } else {
      e.vx *= 0.85;
    }
    e.x += e.vx;

    // Boundary check
    if (e.x < 100) e.x = 100;
    if (e.x + e.width > 1180) e.x = 1180 - e.width;

    // Trigger next pattern
    if (this.patternCooldown <= 0) {
      this.selectNextPattern(player);
    }
  }

  private selectNextPattern(player: Player) {
    const attacks = this.config.availableAttacks.filter(a => a !== 'IDLE' && a !== 'STALK');
    const chosen = attacks[Math.floor(Math.random() * attacks.length)];
    this.entity.currentAttack = chosen;
    this.entity.isTelegraphing = true;
    this.entity.telegraphTimer = 0.65;
    soundEngine.playBossTelegraph();
  }

  private executeAttackExecution(
    player: Player,
    projectiles: Projectile[],
    spikes: GroundSpike[],
    particles: ParticleSystem
  ) {
    const e = this.entity;
    const bossCenterX = e.x + e.width / 2;
    const playerCenterX = player.x + player.width / 2;

    switch (e.currentAttack) {
      case 'TELEPORT_SLASH': {
        // Vanish & reappear next to player
        soundEngine.playBossTeleport();
        particles.emitBossDeathExplosion(bossCenterX, e.y + e.height / 2);
        
        // Target: opposite side of player or behind
        const offset = player.facing > 0 ? -120 : 120;
        e.x = Math.max(120, Math.min(1080, player.x + offset));
        e.y = player.y - 40;
        e.facing = playerCenterX > e.x ? 1 : -1;
        e.attackDuration = 0.55;
        e.attackTimer = 0.55;
        soundEngine.playSwordSlash(3);
        particles.emitHitSparks(e.x + e.width / 2, e.y + e.height / 2, '#dc2626', 20);
        break;
      }

      case 'VOID_SPIKES': {
        e.attackDuration = 0.9;
        e.attackTimer = 0.9;
        soundEngine.playBossSpikeErupt();
        // Spawn 5 spikes across the ground around player and arena
        const spikeCount = 5;
        for (let i = 0; i < spikeCount; i++) {
          const spawnX = Math.max(80, Math.min(1150, player.x - 240 + i * 120 + (Math.random() - 0.5) * 40));
          spikes.push({
            id: `spike_${Date.now()}_${i}`,
            x: spawnX,
            y: 620,
            w: 48,
            maxH: 190,
            currentH: 0,
            stage: 'warning',
            timer: 0.55,
            damageDealt: false,
            damage: 28 * this.config.bossDamageMultiplier
          });
        }
        break;
      }

      case 'ORB_BARRAGE': {
        e.attackDuration = 1.2;
        e.attackTimer = 1.2;
        // Fire 4 floating void orbs towards player
        for (let i = 0; i < 4; i++) {
          setTimeout(() => {
            const angle = Math.atan2(
              (player.y + player.height / 2) - (e.y + 40),
              (player.x + player.width / 2) - (e.x + e.width / 2)
            ) + (i - 1.5) * 0.18;
            const speed = 4.8;
            projectiles.push({
              id: `orb_${Date.now()}_${i}`,
              x: e.x + e.width / 2,
              y: e.y + 40,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              radius: 14,
              damage: 22 * this.config.bossDamageMultiplier,
              color: '#a855f7',
              life: 0,
              maxLife: 4.5,
              type: 'orb'
            });
          }, i * 200);
        }
        break;
      }

      case 'SPECTRAL_CHARGE': {
        e.attackDuration = 0.8;
        e.attackTimer = 0.8;
        e.clones = [
          { x: e.x, y: e.y, opacity: 0.8, dir: e.facing },
          { x: e.x, y: e.y - 60, opacity: 0.6, dir: e.facing }
        ];
        break;
      }

      case 'DOOM_NOVA': {
        e.attackDuration = 2.4;
        e.attackTimer = 2.4;
        e.chargeHits = 0;
        // Float to center of arena
        e.x = 640 - e.width / 2;
        e.y = 300;
        break;
      }
    }
  }

  private handleAttackPhysics(dt: number, player: Player, particles: ParticleSystem) {
    const e = this.entity;

    if (e.currentAttack === 'TELEPORT_SLASH') {
      // Forward scythe strike hitbox during the attack window
      if (e.attackTimer < 0.35 && e.attackTimer > 0.15) {
        const slashHitboxX = e.facing > 0 ? e.x + 30 : e.x - 70;
        const slashHitboxW = 140;
        const slashHitboxY = e.y - 20;
        const slashHitboxH = 160;

        if (
          player.x + player.width > slashHitboxX &&
          player.x < slashHitboxX + slashHitboxW &&
          player.y + player.height > slashHitboxY &&
          player.y < slashHitboxY + slashHitboxH
        ) {
          player.takeDamage(32 * this.config.bossDamageMultiplier, particles);
        }
      }
    } else if (e.currentAttack === 'SPECTRAL_CHARGE') {
      // Clones surge forward
      for (const clone of e.clones) {
        clone.x += clone.dir * 14;
        if (
          player.x + player.width > clone.x &&
          player.x < clone.x + 80 &&
          player.y + player.height > clone.y &&
          player.y < clone.y + 120
        ) {
          player.takeDamage(20 * this.config.bossDamageMultiplier, particles);
        }
      }
    } else if (e.currentAttack === 'DOOM_NOVA') {
      // Pulses expanding shockwave
      particles.emitVoidAura(e.x + e.width / 2, e.y + e.height / 2, 70);
      if (e.attackTimer <= 0.1 && e.chargeHits < 3) {
        // Lethal arena explosion!
        soundEngine.playBossSpikeErupt();
        player.takeDamage(45 * this.config.bossDamageMultiplier, particles);
      }
    }
  }

  public takeHit(damage: number, particles: ParticleSystem, isTimeStopped: boolean): number {
    const multiplier = isTimeStopped ? 1.4 : 1.0;
    const finalDamage = Math.round(damage * multiplier);
    this.entity.hp = Math.max(0, this.entity.hp - finalDamage);

    // Stagger buildup
    this.entity.stagger = Math.min(this.entity.maxStagger, this.entity.stagger + (isTimeStopped ? 25 : 12));
    if (this.entity.stagger >= this.entity.maxStagger && this.entity.currentAttack !== 'STAGGERED') {
      this.entity.currentAttack = 'STAGGERED';
      this.entity.attackTimer = 3.2; // 3.2s vulnerable window
      this.entity.isTelegraphing = false;
      soundEngine.playHitImpact();
    }

    if (this.entity.currentAttack === 'DOOM_NOVA') {
      this.entity.chargeHits++;
      if (this.entity.chargeHits >= 3) {
        // Interrupted!
        this.entity.currentAttack = 'IDLE';
        this.entity.attackTimer = 0;
        this.patternCooldown = 1.5;
      }
    }

    soundEngine.playHitImpact();
    particles.emitHitSparks(
      this.entity.x + this.entity.width / 2,
      this.entity.y + this.entity.height / 2,
      isTimeStopped ? '#38bdf8' : '#f43f5e',
      16
    );

    return finalDamage;
  }
}
