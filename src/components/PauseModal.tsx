import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Keyboard } from 'lucide-react';
import { soundEngine } from '../game/audio.ts';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  isMuted,
  onToggleMute
}) => {
  const [musicVol, setMusicVol] = React.useState(soundEngine.getMusicVolume());
  const [sfxVol, setSfxVol] = React.useState(soundEngine.getSfxVolume());

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMusicVol(val);
    soundEngine.setMusicVolume(val);
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVol(val);
    soundEngine.setSfxVolume(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center relative">
        <h2 className="font-display text-2xl font-bold tracking-widest text-slate-100 uppercase mb-4">
          Пауза
        </h2>

        {/* Audio Volume Controls */}
        <div className="space-y-4 mb-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-left">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Звуковые Эффекты</span>
            <span className="font-mono-nums">{Math.round(sfxVol * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={sfxVol}
            onChange={handleSfxChange}
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />

          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Музыка и Эмбиент</span>
            <span className="font-mono-nums">{Math.round(musicVol * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={musicVol}
            onChange={handleMusicChange}
            className="w-full accent-purple-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />

          <div className="pt-2 flex justify-end">
            <button
              onClick={onToggleMute}
              className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isMuted ? 'Включить звук' : 'Заглушить все'}</span>
            </button>
          </div>
        </div>

        {/* Keybinding Reference */}
        <div className="mb-6 bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-left text-xs text-slate-300 space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <Keyboard className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-200">Управление:</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Движение:</span>
            <span className="font-mono text-cyan-300">[A] [D] / Стрелки</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Прыжок (х2):</span>
            <span className="font-mono text-cyan-300">[W] / [Space]</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Атака (комбо 3):</span>
            <span className="font-mono text-rose-300">[J] / [Z] / ЛКМ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Остановка времени:</span>
            <span className="font-mono text-amber-300">[K] / [X] / [Shift]</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Рывок / Уворот:</span>
            <span className="font-mono text-purple-300">[L] / [C]</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-[0.98] text-white font-display text-sm tracking-wider font-semibold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-950"
          >
            <Play className="w-4 h-4" />
            <span>Продолжить</span>
          </button>
          <button
            onClick={onRestart}
            className="w-full py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 active:scale-[0.98] text-slate-200 text-xs font-semibold uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Перезапустить Этап</span>
          </button>
        </div>
      </div>
    </div>
  );
};
