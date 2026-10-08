export type GameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'DEFEATED' | 'STAGE_VICTORY' | 'GAME_COMPLETE';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'ground' | 'platform' | 'pillar';
  rune?: boolean;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  color: string;
  life: number;
  maxLife: number;
  frozen?: boolean;
  type: 'orb' | 'blade' | 'beam';
}

export interface GroundSpike {
  id: string;
  x: number;
  y: number;
  w: number;
  maxH: number;
  currentH: number;
  stage: 'warning' | 'erupting' | 'lingering' | 'fading';
  timer: number;
  damageDealt: boolean;
  damage: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  scale: number;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  chronoEnergy: number;
  maxChronoEnergy: number;
  attackPower: number;
  deaths: number;
  timeStopsUsed: number;
  damageDealtTotal: number;
}

export type BossPhase = 1 | 2 | 3;
export type BossAttack = 
  | 'IDLE' 
  | 'STALK' 
  | 'TELEPORT_SLASH' 
  | 'VOID_SPIKES' 
  | 'ORB_BARRAGE' 
  | 'SPECTRAL_CHARGE' 
  | 'DOOM_NOVA'
  | 'RECOVERY'
  | 'STAGGERED';

export interface BossEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1;
  hp: number;
  maxHp: number;
  stagger: number;
  maxStagger: number;
  currentAttack: BossAttack;
  attackTimer: number;
  attackDuration: number;
  telegraphTimer: number;
  isTelegraphing: boolean;
  invulnerable: boolean;
  targetX: number;
  targetY: number;
  chargeHits: number;
  clones: Array<{ x: number; y: number; opacity: number; dir: number }>;
}

export interface StageConfig {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  bgImage: string;
  ambientColor: string;
  fogColor: string;
  accentColor: string;
  platforms: Platform[];
  playerSpawn: Vector2D;
  bossSpawn: Vector2D;
  bossMaxHp: number;
  bossSpeed: number;
  bossDamageMultiplier: number;
  bossTitle: string;
  bossForm: string;
  availableAttacks: BossAttack[];
}
