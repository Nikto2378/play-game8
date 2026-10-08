import React from 'react';
import { RotateCcw, Skull, Hourglass, ShieldAlert } from 'lucide-react';
import { StageConfig } from '../game/types.ts';

interface GameOverModalProps {
  stage: StageConfig;
  bossHpRemaining: number;
  bossMaxHp: number;
  attempts: number;
  timeStopsUsed: number;
  onRetry: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stage,
  bossHpRemaining,
  bossMaxHp,
  attempts,
  timeStopsUsed,
  onRetry
}) => {
  const percentTaken = Math.round(((bossMaxHp - bossHpRemaining) / bossMaxHp) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="max-w-md w-full bg-slate-950 border border-red-950/80 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(220,38,38,0.25)] text-center relative overflow-hidden">
        {/* Dark crimson aura */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />

        <div className="mx-auto w-12 h-12 rounded-full bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-500 mb-4 shadow-lg">
          <Skull className="w-6 h-6 animate-pulse" />
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-widest text-red-100 uppercase mb-2">
          Тьма Поглотила Вас
        </h2>

        <p className="text-sm text-slate-400 mb-6 font-serif italic">
          «Смерть в разломе времени — не конец пути. Твоя воля острее его когтей. Изучи его взмах и нанеси ответный удар.»
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 block mb-1">Урон Монстру</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono-nums text-lg font-bold text-rose-400">{percentTaken}%</span>
              <span className="text-[10px] text-slate-500">HP сбито</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 block mb-1">Осталось у босса</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono-nums text-lg font-bold text-slate-200">{Math.ceil(bossHpRemaining)}</span>
              <span className="text-[10px] text-slate-500">/ {bossMaxHp}</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 block mb-1">Сдвигов Времени</span>
            <div className="flex items-center gap-1.5">
              <Hourglass className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono-nums text-lg font-bold text-cyan-300">{timeStopsUsed}</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 block mb-1">Попытка</span>
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono-nums text-lg font-bold text-amber-300">#{attempts}</span>
            </div>
          </div>
        </div>

        {/* Hint Pill-free clean typography */}
        <div className="text-xs text-slate-400 mb-6 bg-slate-900/40 border border-slate-800/50 rounded-lg p-2.5">
          <span className="text-amber-400 font-medium">Совет: </span>
          Когда глаза босса вспыхивают алым, он готовит рывок за спину. В этот миг останови время и уклонись!
        </div>

        {/* Retry Button */}
        <button
          onClick={onRetry}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-800 to-rose-700 hover:from-red-700 hover:to-rose-600 active:scale-[0.98] text-white font-display text-sm tracking-widest font-semibold uppercase flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Восстать вновь (Рестарт)</span>
        </button>
      </div>
    </div>
  );
};
