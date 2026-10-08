import React from 'react';
import { Trophy, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { StageConfig } from '../game/types.ts';

interface StageVictoryModalProps {
  stage: StageConfig;
  nextStage: StageConfig | null;
  timeStopsUsed: number;
  attempts: number;
  onNextStage: () => void;
  onRestartAll: () => void;
}

export const StageVictoryModal: React.FC<StageVictoryModalProps> = ({
  stage,
  nextStage,
  timeStopsUsed,
  attempts,
  onNextStage,
  onRestartAll
}) => {
  const isFinalVictory = !nextStage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="max-w-md w-full bg-slate-950 border border-cyan-900/80 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(56,189,248,0.25)] text-center relative overflow-hidden">
        {/* Glowing cyan top accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        <div className="mx-auto w-12 h-12 rounded-full bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400 mb-4 shadow-lg">
          {isFinalVictory ? <Trophy className="w-6 h-6 animate-bounce" /> : <Sparkles className="w-6 h-6" />}
        </div>

        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-widest text-cyan-100 uppercase mb-2">
          {isFinalVictory ? 'Истинная Победа' : 'Печать Разрушена'}
        </h2>

        <p className="text-sm text-slate-300 mb-6 font-serif italic">
          {isFinalVictory
            ? '«Тень пала. Осколки времени соединились воедино. Ты преодолел кошмар и освободил этот мир от вечной скверны.»'
            : `«${stage.bossTitle} повержен в этой форме, но его сущность отступила глубже в разлом...»`}
        </p>

        {/* Run stats */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 block mb-1">Пройденный Этап</span>
            <span className="font-display text-sm font-semibold text-cyan-300">{stage.title}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 block mb-1">Попыток Затрачено</span>
            <span className="font-mono-nums text-lg font-bold text-slate-200">#{attempts}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 block mb-1">Сдвигов Времени</span>
            <span className="font-mono-nums text-lg font-bold text-amber-300">{timeStopsUsed}</span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3">
            <span className="text-[11px] text-slate-400 block mb-1">Статус Монстра</span>
            <span className="text-xs font-semibold text-rose-400">
              {isFinalVictory ? 'Уничтожен навеки' : 'Трансформация'}
            </span>
          </div>
        </div>

        {/* Narrative Next Stage info if available */}
        {nextStage && (
          <div className="text-xs text-slate-400 mb-6 bg-slate-900/50 border border-slate-800/60 rounded-xl p-3 text-left">
            <span className="text-cyan-400 font-semibold block mb-1">Следующее испытание: {nextStage.title}</span>
            <span>{nextStage.description}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2.5">
          {nextStage ? (
            <button
              onClick={onNextStage}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.98] text-white font-display text-sm tracking-widest font-semibold uppercase flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition-all cursor-pointer"
            >
              <span>Спуститься глубже (Этап {nextStage.id})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onRestartAll}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 active:scale-[0.98] text-white font-display text-sm tracking-widest font-semibold uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-950 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Пройти испытание заново</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
