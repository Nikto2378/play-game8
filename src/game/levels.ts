import { StageConfig } from './types.ts';

export const STAGES: StageConfig[] = [
  {
    id: 1,
    title: 'Затонувшее Святилище',
    subtitle: 'Этап I: Пробуждение в Тени',
    description: 'Древний готический собор, полузатопленный в магических водах забвения. В небе мерцает расколотая луна, а впереди рыщет единственный страж погибели.',
    bgImage: '/src/assets/images/ruins_moonlit_sanctuary_bg_1791441041866.jpg',
    ambientColor: '#3b82f6',
    fogColor: 'rgba(30, 27, 75, 0.45)',
    accentColor: '#38bdf8',
    platforms: [
      // Main arena floor
      { x: 0, y: 620, w: 1280, h: 100, type: 'ground' },
      // Elevated gothic stone ruins
      { x: 120, y: 490, w: 220, h: 24, type: 'platform', rune: true },
      { x: 940, y: 490, w: 220, h: 24, type: 'platform', rune: true },
      { x: 440, y: 390, w: 400, h: 24, type: 'platform', rune: true },
      // Ruined pillars for atmosphere / wall bounce
      { x: 20, y: 280, w: 40, h: 340, type: 'pillar' },
      { x: 1220, y: 280, w: 40, h: 340, type: 'pillar' },
    ],
    playerSpawn: { x: 180, y: 550 },
    bossSpawn: { x: 1050, y: 520 },
    bossMaxHp: 800,
    bossSpeed: 2.2,
    bossDamageMultiplier: 1.0,
    bossTitle: 'Морват, Полый Повелитель',
    bossForm: 'Фаза I: Тень Астрала',
    availableAttacks: ['STALK', 'TELEPORT_SLASH', 'VOID_SPIKES']
  },
  {
    id: 2,
    title: 'Катакомбы Падших Душ',
    subtitle: 'Этап II: Шепот Кровавой Луны',
    description: 'Глубины забвения, где гравитация искажается темной материей. Монстр почувствовал опасность и призвал запретные сферы пустоты.',
    bgImage: '/src/assets/images/ruins_moonlit_sanctuary_bg_1791441041866.jpg',
    ambientColor: '#a855f7',
    fogColor: 'rgba(67, 10, 60, 0.5)',
    accentColor: '#c084fc',
    platforms: [
      // Arena floor with side pits
      { x: 0, y: 620, w: 1280, h: 100, type: 'ground' },
      // Asymmetric floating obsidian spires
      { x: 160, y: 480, w: 200, h: 22, type: 'platform', rune: true },
      { x: 920, y: 480, w: 200, h: 22, type: 'platform', rune: true },
      { x: 340, y: 360, w: 240, h: 22, type: 'platform' },
      { x: 700, y: 360, w: 240, h: 22, type: 'platform' },
      { x: 520, y: 250, w: 240, h: 20, type: 'platform', rune: true },
      { x: 20, y: 200, w: 30, h: 420, type: 'pillar' },
      { x: 1230, y: 200, w: 30, h: 420, type: 'pillar' },
    ],
    playerSpawn: { x: 200, y: 550 },
    bossSpawn: { x: 1000, y: 520 },
    bossMaxHp: 1250,
    bossSpeed: 2.7,
    bossDamageMultiplier: 1.25,
    bossTitle: 'Морват, Полый Повелитель',
    bossForm: 'Фаза II: Пожиратель Душ',
    availableAttacks: ['STALK', 'TELEPORT_SLASH', 'VOID_SPIKES', 'ORB_BARRAGE']
  },
  {
    id: 3,
    title: 'Шпиль Бездны Затмения',
    subtitle: 'Этап III: Разлом Вечности',
    description: 'Финальный рубеж реальности. Черное солнце затмения пылает над троном. Монстр обрел истинную демоническую мощь.',
    bgImage: '/src/assets/images/catacombs_abyssal_throne_bg_1791441061175.jpg',
    ambientColor: '#dc2626',
    fogColor: 'rgba(50, 0, 10, 0.55)',
    accentColor: '#ef4444',
    platforms: [
      // Main shattered throne dais
      { x: 80, y: 620, w: 1120, h: 100, type: 'ground' },
      // Shattered cosmic ruins
      { x: 100, y: 470, w: 260, h: 24, type: 'platform', rune: true },
      { x: 920, y: 470, w: 260, h: 24, type: 'platform', rune: true },
      { x: 420, y: 380, w: 440, h: 24, type: 'platform', rune: true },
      { x: 250, y: 260, w: 200, h: 20, type: 'platform' },
      { x: 830, y: 260, w: 200, h: 20, type: 'platform' },
      { x: 540, y: 170, w: 200, h: 20, type: 'platform', rune: true },
    ],
    playerSpawn: { x: 220, y: 550 },
    bossSpawn: { x: 980, y: 520 },
    bossMaxHp: 1800,
    bossSpeed: 3.2,
    bossDamageMultiplier: 1.45,
    bossTitle: 'Морват, Истинный Архидемон Бездны',
    bossForm: 'Фаза III: Пробужденное Затмение',
    availableAttacks: ['STALK', 'TELEPORT_SLASH', 'VOID_SPIKES', 'ORB_BARRAGE', 'SPECTRAL_CHARGE', 'DOOM_NOVA']
  }
];
