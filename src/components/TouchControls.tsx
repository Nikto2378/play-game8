import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Zap, Clock, Shield } from 'lucide-react';
import { PlayerInput } from '../game/entities.ts';

interface TouchControlsProps {
  onInputState: (key: keyof PlayerInput, val: boolean) => void;
  isTimeStopActive: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ onInputState, isTimeStopActive }) => {
  return (
    <div className="absolute inset-x-0 bottom-4 px-6 flex justify-between items-end pointer-events-none select-none z-20 md:hidden">
      {/* D-Pad Left / Right */}
      <div className="pointer-events-auto flex items-center gap-3 bg-slate-950/70 p-2 rounded-2xl backdrop-blur-md border border-slate-800">
        <button
          onTouchStart={() => onInputState('left', true)}
          onTouchEnd={() => onInputState('left', false)}
          onMouseDown={() => onInputState('left', true)}
          onMouseUp={() => onInputState('left', false)}
          className="w-14 h-14 bg-slate-900 active:bg-slate-700 text-slate-200 rounded-xl flex items-center justify-center border border-slate-700 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button
          onTouchStart={() => onInputState('right', true)}
          onTouchEnd={() => onInputState('right', false)}
          onMouseDown={() => onInputState('right', true)}
          onMouseUp={() => onInputState('right', false)}
          className="w-14 h-14 bg-slate-900 active:bg-slate-700 text-slate-200 rounded-xl flex items-center justify-center border border-slate-700 active:scale-95 transition-transform"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Action Buttons: Jump, Dash, Attack, Time Stop */}
      <div className="pointer-events-auto grid grid-cols-2 gap-3 bg-slate-950/70 p-2.5 rounded-2xl backdrop-blur-md border border-slate-800">
        {/* Time Stop Button */}
        <button
          onClick={() => {
            onInputState('timeStop', true);
            setTimeout(() => onInputState('timeStop', false), 80);
          }}
          className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border active:scale-95 transition-all ${
            isTimeStopActive
              ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(250,204,21,0.6)]'
              : 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">ВРЕМЯ</span>
        </button>

        {/* Dash */}
        <button
          onClick={() => {
            onInputState('dash', true);
            setTimeout(() => onInputState('dash', false), 80);
          }}
          className="w-14 h-14 bg-purple-950/80 active:bg-purple-800 text-purple-300 border border-purple-700 rounded-xl flex flex-col items-center justify-center active:scale-95 transition-transform"
        >
          <Shield className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">РЫВОК</span>
        </button>

        {/* Jump */}
        <button
          onTouchStart={() => onInputState('jump', true)}
          onTouchEnd={() => onInputState('jump', false)}
          onMouseDown={() => onInputState('jump', true)}
          onMouseUp={() => onInputState('jump', false)}
          className="w-14 h-14 bg-slate-900 active:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl flex flex-col items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowUp className="w-6 h-6" />
          <span className="text-[9px] font-bold mt-0.5">ПРЫЖОК</span>
        </button>

        {/* Attack */}
        <button
          onClick={() => {
            onInputState('attack', true);
            setTimeout(() => onInputState('attack', false), 80);
          }}
          className="w-14 h-14 bg-rose-950/90 active:bg-rose-800 text-rose-200 border border-rose-700 rounded-xl flex flex-col items-center justify-center active:scale-95 transition-transform shadow-[0_0_12px_rgba(244,63,94,0.3)]"
        >
          <Zap className="w-5 h-5" />
          <span className="text-[9px] font-bold mt-0.5">УДАР</span>
        </button>
      </div>
    </div>
  );
};
