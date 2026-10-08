import React from 'react';
import { Volume2, VolumeX, Pause, BookOpen, Clock, ShieldAlert } from 'lucide-react';
import { Player, Boss } from '../game/entities.ts';
import { StageConfig } from '../game/types.ts';

interface HUDProps {
  player: Player;
  boss: Boss;
  stage: StageConfig;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenLore: () => void;
  attempts: number;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  boss,
  stage,
  isMuted,
  onToggleMute,
  onPause,
  onOpenLore,
  attempts
}) => {
  const hpPercent = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const chronoPercent = Math.max(0, Math.min(100, (player.chronoEnergy / player.maxChronoEnergy) * 100));
  const bossHpPercent = Math.max(0, Math.min(100, (boss.entity.hp / boss.entity.maxHp) * 100));
  const bossStaggerPercent = Math.max(0, Math.min(100, (boss.entity.stagger / boss.entity.maxStagger) * 100));

  return (
    <div className="absolute inset-x-0 top-0 pointer-events-none p-4 flex flex-col justify-between select-none z-10">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4">
        {/* Player Vitality Block */}
        <div className="pointer-events-auto bg-slate-950/80 backdrop-blur-md border border-slate-800/80 p-3.5 rounded-xl shadow-2xl min-w-[280px]">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-slate-400 mb-1.5">
            <span className="font-display tracking-widest text-slate-200 uppercase">Скиталец Времени</span>
            <span className="font-mono-nums text-slate-400">{Math.ceil(player.hp)} / {player.maxHp} HP</span>
          </div>

          {/* Health Bar */}
          <div className="w-full h-3.5 bg-slate-900 rounded-sm overflow-hidden border border-slate-800 relative mb-2.5">
            <div
              className="h-full bg-gradient-to-r from-rose-700 via-rose-500 to-red-400 transition-all duration-150 ease-out"
              style={{ width: `${hpPercent}%` }}
            />
          </div>

          {/* Chrono Stasis Gauge */}
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1.5 text-cyan-300">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span className="font-display text-[11px] tracking-wider uppercase">Остановка Времени</span>
            </div>
            <span className="font-mono-nums text-[11px] text-cyan-400">
              {player.isTimeStopActive ? 'АКТИВНА' : `${Math.floor(player.chronoEnergy)}%`}
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-900 rounded-sm overflow-hidden border border-slate-800 relative">
            <div
              className={`h-full transition-all duration-75 ${
                player.isTimeStopActive
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(250,204,21,0.8)]'
                  : 'bg-gradient-to-r from-cyan-600 via-cyan-400 to-sky-300'
              }`}
              style={{ width: `${chronoPercent}%` }}
            />
          </div>
          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
            <span>Клавиша: [K] / [Shift]</span>
            <span>Попытка: #{attempts}</span>
          </div>
        </div>

        {/* Boss HP Vitality Display (Center) */}
        <div className="flex-1 max-w-xl mx-auto px-2">
          <div className="bg-slate-950/85 backdrop-blur-md border border-red-950/70 p-3 rounded-xl shadow-2xl">
            <div className="flex items-baseline justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm md:text-base font-bold text-red-100 tracking-wider">
                  {stage.bossTitle}
                </span>
                <span className="text-xs text-rose-400/80 font-medium">· {stage.bossForm}</span>
              </div>
              <span className="font-mono-nums text-xs font-semibold text-rose-400">
                {Math.ceil(boss.entity.hp)} / {boss.entity.maxHp}
              </span>
            </div>

            {/* Boss Main Health Bar */}
            <div className="w-full h-3 bg-neutral-950 rounded-sm overflow-hidden border border-red-900/60 relative">
              <div
                className="h-full bg-gradient-to-r from-purple-700 via-rose-600 to-red-500 transition-all duration-150 ease-out"
                style={{ width: `${bossHpPercent}%` }}
              />
            </div>

            {/* Stagger / Posture Break Bar */}
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-[10px] text-slate-400 tracking-wider font-mono">ОГЛУШЕНИЕ</span>
              <div className="flex-1 h-1.5 bg-slate-900 rounded-sm overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-cyan-400 transition-all duration-100"
                  style={{ width: `${bossStaggerPercent}%` }}
                />
              </div>
              {boss.entity.currentAttack === 'STAGGERED' && (
                <span className="text-[10px] font-bold text-amber-300 animate-pulse flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> УЯЗВИМ!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Controls & Modals Actions (Right) */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 p-2 rounded-xl">
          <button
            onClick={onOpenLore}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
            title="Гримуар и тактика"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleMute}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
            title={isMuted ? 'Включить звук' : 'Выключить звук'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
          <button
            onClick={onPause}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
            title="Пауза"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
