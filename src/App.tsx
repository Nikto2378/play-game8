/**
 * Chrono Eclipse: Remnants of the Void
 * Atmospheric 2D Anime Horror Platformer
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, BookOpen, Volume2, VolumeX, Shield, Clock, Zap, Skull, RotateCcw } from 'lucide-react';
import { GameState, StageConfig, Projectile, GroundSpike, FloatingText } from './game/types.ts';
import { STAGES } from './game/levels.ts';
import { Player, Boss, PlayerInput } from './game/entities.ts';
import { ParticleSystem } from './game/particles.ts';
import { GameRenderer } from './game/renderer.ts';
import { soundEngine } from './game/audio.ts';
import { HUD } from './components/HUD.tsx';
import { TouchControls } from './components/TouchControls.tsx';
import { GameOverModal } from './components/GameOverModal.tsx';
import { StageVictoryModal } from './components/StageVictoryModal.tsx';
import { PauseModal } from './components/PauseModal.tsx';
import { LoreModal } from './components/LoreModal.tsx';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-level Game States
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showLore, setShowLore] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(1);
  const [timeStopsUsedTotal, setTimeStopsUsedTotal] = useState<number>(0);

  // Entities & Engine Singletons in refs for 60fps performance
  const stage = STAGES[currentStageIndex];
  const playerRef = useRef<Player>(new Player(stage.playerSpawn.x, stage.playerSpawn.y));
  const bossRef = useRef<Boss>(new Boss(stage));
  const particlesRef = useRef<ParticleSystem>(new ParticleSystem());
  const rendererRef = useRef<GameRenderer>(new GameRenderer());
  const projectilesRef = useRef<Projectile[]>([]);
  const spikesRef = useRef<GroundSpike[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  // Input State
  const inputRef = useRef<PlayerInput>({
    left: false,
    right: false,
    jump: false,
    attack: false,
    timeStop: false,
    dash: false,
    down: false
  });

  // Track time stops in current battle
  const stageTimeStopsRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());
  const animFrameIdRef = useRef<number | null>(null);

  // React state mirror for HUD rendering
  const [, setTick] = useState<number>(0);

  // Initialize or reload stage
  const loadStage = useCallback((index: number) => {
    const nextStage = STAGES[index];
    setCurrentStageIndex(index);
    playerRef.current.reset(nextStage.playerSpawn.x, nextStage.playerSpawn.y);
    bossRef.current = new Boss(nextStage);
    particlesRef.current.reset();
    projectilesRef.current = [];
    spikesRef.current = [];
    floatingTextsRef.current = [];
    stageTimeStopsRef.current = 0;
    rendererRef.current.loadBackground(nextStage.bgImage);
  }, []);

  // Handle Start / Resume Game
  const handleStartGame = () => {
    soundEngine.init();
    soundEngine.resume();
    soundEngine.startBattleMusic();
    loadStage(currentStageIndex);
    setGameState('PLAYING');
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundEngine.setMuted(next);
  };

  const handleRetryStage = () => {
    setAttempts(a => a + 1);
    loadStage(currentStageIndex);
    soundEngine.startBattleMusic();
    setGameState('PLAYING');
  };

  const handleNextStage = () => {
    const nextIndex = currentStageIndex + 1;
    if (nextIndex < STAGES.length) {
      loadStage(nextIndex);
      soundEngine.startBattleMusic();
      setGameState('PLAYING');
    } else {
      setGameState('GAME_COMPLETE');
    }
  };

  const handleRestartCampaign = () => {
    setAttempts(1);
    setTimeStopsUsedTotal(0);
    loadStage(0);
    soundEngine.startBattleMusic();
    setGameState('PLAYING');
  };

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;

      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        inputRef.current.left = true;
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        inputRef.current.right = true;
      }
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        inputRef.current.jump = true;
      }
      if (e.code === 'KeyJ' || e.code === 'KeyZ') {
        inputRef.current.attack = true;
      }
      if (e.code === 'KeyK' || e.code === 'KeyX' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        inputRef.current.timeStop = true;
        stageTimeStopsRef.current++;
        setTimeStopsUsedTotal(t => t + 1);
      }
      if (e.code === 'KeyL' || e.code === 'KeyC') {
        inputRef.current.dash = true;
      }
      if (e.code === 'Escape' || e.code === 'KeyP') {
        setGameState('PAUSED');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        inputRef.current.left = false;
      }
      if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        inputRef.current.right = false;
      }
      if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        inputRef.current.jump = false;
      }
      if (e.code === 'KeyJ' || e.code === 'KeyZ') {
        inputRef.current.attack = false;
      }
      if (e.code === 'KeyK' || e.code === 'KeyX' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        inputRef.current.timeStop = false;
      }
      if (e.code === 'KeyL' || e.code === 'KeyC') {
        inputRef.current.dash = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Touch Virtual Controls Bridge
  const handleTouchInputState = (key: keyof PlayerInput, val: boolean) => {
    inputRef.current[key] = val;
    if (key === 'timeStop' && val) {
      stageTimeStopsRef.current++;
      setTimeStopsUsedTotal(t => t + 1);
    }
  };

  // Main 60 FPS Game Loop
  useEffect(() => {
    let frameCount = 0;

    const gameLoop = (now: number) => {
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = now;

      const canvas = canvasRef.current;
      if (canvas && gameState === 'PLAYING') {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const currentStage = STAGES[currentStageIndex];
          const player = playerRef.current;
          const boss = bossRef.current;
          const particles = particlesRef.current;
          const projectiles = projectilesRef.current;
          const spikes = spikesRef.current;
          const floatingTexts = floatingTextsRef.current;

          // 1. Update Player
          player.update(dt, inputRef.current, currentStage.platforms, particles);

          // Consume instant attack/dash inputs
          if (inputRef.current.attack) inputRef.current.attack = false;
          if (inputRef.current.dash) inputRef.current.dash = false;
          if (inputRef.current.timeStop) inputRef.current.timeStop = false;

          // 2. Player Attack Hit Detection on Boss
          if (player.isAttacking && !player.hasHitInCurrentSwing) {
            const attackReach = 85;
            const attackHitboxX = player.facing > 0 ? player.x : player.x - attackReach + player.width;
            const attackHitboxW = attackReach;
            const attackHitboxY = player.y - 15;
            const attackHitboxH = player.height + 30;

            const bossX = boss.entity.x;
            const bossY = boss.entity.y;
            const bossW = boss.entity.width;
            const bossH = boss.entity.height;

            if (
              attackHitboxX + attackHitboxW > bossX &&
              attackHitboxX < bossX + bossW &&
              attackHitboxY + attackHitboxH > bossY &&
              attackHitboxY < bossY + bossH
            ) {
              player.hasHitInCurrentSwing = true;
              const baseDmg = player.comboStep === 3 ? 75 : player.comboStep === 2 ? 45 : 35;
              const dmgDealt = boss.takeHit(baseDmg, particles, player.isTimeStopActive);

              if (player.comboStep === 3) {
                rendererRef.current.triggerScreenShake(7);
              }

              // Floating damage text
              floatingTexts.push({
                id: `dmg_${Date.now()}_${Math.random()}`,
                x: bossX + bossW / 2 + (Math.random() - 0.5) * 30,
                y: bossY + 20,
                text: `${dmgDealt}`,
                color: player.isTimeStopActive ? '#facc15' : '#f43f5e',
                life: 0,
                maxLife: 0.65,
                scale: player.comboStep === 3 ? 1.4 : 1.0
              });
            }
          }

          // 3. Update Boss
          boss.update(dt, player, player.isTimeStopActive, projectiles, spikes, floatingTexts, particles);

          // 4. Update Projectiles
          for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];
            if (!player.isTimeStopActive) {
              p.x += p.vx;
              p.y += p.vy;
              p.life += dt;
            }

            // Collision with player
            if (
              player.x + player.width > p.x - p.radius &&
              player.x < p.x + p.radius &&
              player.y + player.height > p.y - p.radius &&
              player.y < p.y + p.radius
            ) {
              const damaged = player.takeDamage(p.damage, particles);
              if (damaged) {
                projectiles.splice(i, 1);
                continue;
              }
            }

            if (p.life >= p.maxLife || p.x < -50 || p.x > 1330) {
              projectiles.splice(i, 1);
            }
          }

          // 5. Update Ground Spikes
          for (let i = spikes.length - 1; i >= 0; i--) {
            const sp = spikes[i];
            if (!player.isTimeStopActive) {
              sp.timer -= dt;
              if (sp.stage === 'warning' && sp.timer <= 0) {
                sp.stage = 'erupting';
                sp.timer = 0.6;
              } else if (sp.stage === 'erupting') {
                sp.currentH = Math.min(sp.maxH, sp.currentH + dt * 450);
                if (sp.timer <= 0) {
                  sp.stage = 'fading';
                  sp.timer = 0.35;
                }
              } else if (sp.stage === 'fading') {
                sp.currentH = Math.max(0, sp.currentH - dt * 500);
                if (sp.currentH <= 0) {
                  spikes.splice(i, 1);
                  continue;
                }
              }
            }

            // Damage player if erupting
            if (sp.stage === 'erupting' && !sp.damageDealt) {
              if (
                player.x + player.width > sp.x - sp.w / 2 &&
                player.x < sp.x + sp.w / 2 &&
                player.y + player.height > sp.y - sp.currentH
              ) {
                player.takeDamage(sp.damage, particles);
                sp.damageDealt = true;
              }
            }
          }

          // 6. Update Floating Damage Texts
          for (let i = floatingTexts.length - 1; i >= 0; i--) {
            const t = floatingTexts[i];
            t.y -= dt * 40;
            t.life += dt;
            if (t.life >= t.maxLife) {
              floatingTexts.splice(i, 1);
            }
          }

          // 7. Ambient Particle Generation
          particles.emitAmbientMotes(1280, 720, currentStage.ambientColor);
          particles.update(dt, player.isTimeStopActive);

          // 8. Render Scene
          rendererRef.current.render(
            ctx,
            canvas.width,
            canvas.height,
            player,
            boss,
            projectiles,
            spikes,
            floatingTexts,
            particles,
            currentStage,
            dt
          );

          // 9. Check Win / Loss Conditions
          if (boss.entity.hp <= 0) {
            particles.emitBossDeathExplosion(boss.entity.x + boss.entity.width / 2, boss.entity.y + boss.entity.height / 2);
            soundEngine.stopBattleMusic();
            soundEngine.playVictoryFanfare();
            setGameState('STAGE_VICTORY');
          } else if (player.hp <= 0) {
            soundEngine.stopBattleMusic();
            soundEngine.playDefeat();
            setGameState('DEFEATED');
          }

          // Trigger HUD state update every 4 frames for smooth UI stats
          frameCount++;
          if (frameCount % 4 === 0) {
            setTick(t => (t + 1) % 1000);
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [gameState, currentStageIndex]);

  // Click on Canvas to Attack
  const handleCanvasClick = () => {
    if (gameState === 'PLAYING') {
      inputRef.current.attack = true;
    }
  };

  const nextStage = currentStageIndex + 1 < STAGES.length ? STAGES[currentStageIndex + 1] : null;

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center font-sans select-none">
      {/* 2D Canvas Viewport (1280x720 internal resolution scaled) */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        onClick={handleCanvasClick}
        className="w-full h-full object-contain max-h-screen cursor-crosshair bg-slate-950"
      />

      {/* In-Game Heads-Up Display */}
      {gameState === 'PLAYING' && (
        <>
          <HUD
            player={playerRef.current}
            boss={bossRef.current}
            stage={stage}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={() => setGameState('PAUSED')}
            onOpenLore={() => setShowLore(true)}
            attempts={attempts}
          />

          <TouchControls
            onInputState={handleTouchInputState}
            isTimeStopActive={playerRef.current.isTimeStopActive}
          />
        </>
      )}

      {/* TITLE SCREEN */}
      {gameState === 'TITLE' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-gradient-to-t from-black via-slate-950/90 to-purple-950/50 backdrop-blur-sm">
          <div className="max-w-2xl w-full bg-slate-950/95 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-[0_0_80px_rgba(124,58,237,0.25)] text-center relative overflow-hidden">
            {/* Top glowing ambient line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />

            {/* Character & Monster preview lockup */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="relative group">
                <img
                  src="/src/assets/images/hero_anime_swordsman_portrait_1791441004661.jpg"
                  alt="Скиталец"
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border-2 border-cyan-500/70 shadow-lg"
                />
                <span className="absolute -bottom-2 inset-x-0 text-[10px] bg-slate-900 border border-slate-700 py-0.5 rounded text-cyan-300 font-semibold uppercase">
                  Скиталец
                </span>
              </div>

              <div className="text-slate-600 font-display text-xl font-bold">VS</div>

              <div className="relative group">
                <img
                  src="/src/assets/images/boss_abyssal_monster_concept_1791441023072.jpg"
                  alt="Полый Повелитель"
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-2xl border-2 border-rose-600/70 shadow-lg"
                />
                <span className="absolute -bottom-2 inset-x-0 text-[10px] bg-slate-900 border border-slate-700 py-0.5 rounded text-rose-400 font-semibold uppercase">
                  Монстр
                </span>
              </div>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-200 to-purple-300 uppercase mb-2">
              Chrono Eclipse
            </h1>
            <p className="font-display text-xs sm:text-sm text-cyan-400 tracking-widest uppercase mb-4">
              Осколки Бездны · Атмосферный 2D Anime Horror
            </p>

            <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mb-8 font-serif italic leading-relaxed">
              «Оказавшись в забытых руинах мрачного магического мира, человек с руническим клинком бросает вызов единственному повелителю кошмара. Останови время, изучи его атаки и сокруши бездну.»
            </p>

            {/* Feature Pills-free list */}
            <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mb-8 text-left text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Способность</span>
                  <span className="font-semibold text-slate-200">Хроностазис</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Боевка</span>
                  <span className="font-semibold text-slate-200">3-удар комбо</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2">
                <Skull className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">Враг</span>
                  <span className="font-semibold text-slate-200">3 фазы титана</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={handleStartGame}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 text-white font-display text-sm tracking-widest font-bold uppercase flex items-center justify-center gap-3 shadow-xl shadow-cyan-950/80 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Войти в Бездну</span>
              </button>

              <button
                onClick={() => setShowLore(true)}
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 active:scale-95 text-slate-300 font-display text-xs tracking-wider font-semibold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Гримуар & Тактика</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER (DEFEAT) MODAL */}
      {gameState === 'DEFEATED' && (
        <GameOverModal
          stage={stage}
          bossHpRemaining={bossRef.current.entity.hp}
          bossMaxHp={bossRef.current.entity.maxHp}
          attempts={attempts}
          timeStopsUsed={stageTimeStopsRef.current}
          onRetry={handleRetryStage}
        />
      )}

      {/* STAGE VICTORY MODAL */}
      {gameState === 'STAGE_VICTORY' && (
        <StageVictoryModal
          stage={stage}
          nextStage={nextStage}
          timeStopsUsed={stageTimeStopsRef.current}
          attempts={attempts}
          onNextStage={handleNextStage}
          onRestartAll={handleRestartCampaign}
        />
      )}

      {/* PAUSE MODAL */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={() => setGameState('PLAYING')}
          onRestart={handleRetryStage}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* LORE & BESTIARY MODAL */}
      {showLore && <LoreModal onClose={() => setShowLore(false)} />}
    </div>
  );
}
