import React from 'react';
import { X, ShieldAlert, Sparkles, Clock, Skull, Zap } from 'lucide-react';

interface LoreModalProps {
  onClose: () => void;
}

export const LoreModal: React.FC<LoreModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'monster' | 'hero' | 'tactics'>('monster');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="max-w-2xl w-full max-h-[85vh] bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold text-slate-100 tracking-wider">
              Гримуар Бездны
            </span>
            <span className="text-xs text-slate-500 font-mono">· Свитки Забвения</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons (Segmented Controls) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl mb-4 border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('monster')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'monster'
                ? 'bg-rose-950/80 text-rose-200 border border-rose-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Skull className="w-3.5 h-3.5 text-rose-400" />
            <span>Главный Монстр</span>
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'hero'
                ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Скиталец</span>
          </button>
          <button
            onClick={() => setActiveTab('tactics')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'tactics'
                ? 'bg-amber-950/80 text-amber-200 border border-amber-800/60 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Тактика Хроностазиса</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 text-xs text-slate-300">
          {activeTab === 'monster' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-900/60 p-4 rounded-xl border border-rose-950/60">
                <img
                  src="/src/assets/images/boss_abyssal_monster_concept_1791441023072.jpg"
                  alt="Морват, Полый Повелитель"
                  className="w-28 h-28 object-cover rounded-xl border border-rose-900 shadow-md shrink-0"
                />
                <div>
                  <h3 className="font-display text-base font-bold text-rose-300 mb-1">
                    Морват, Полый Повелитель (The Void Sovereign)
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    Древняя сущность первозданной энтропии, сплетенная из останков погибших звездных хроник. Единственный владыка этого застывшего мира. Он не просто атакует — он адаптируется, меняя фазы и призывая орудия погибели.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-rose-400 block mb-1">Телепорт и Рассечение косой</span>
                  <p className="text-slate-400">
                    Его глаза вспыхивают кровавым светом за полсекунды до удара. Он материализуется за спиной героя и наносит сокрушительный дуговой взмах.
                  </p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-rose-400 block mb-1">Шипы Бездны</span>
                  <p className="text-slate-400">
                    На полу арены возникают мерцающие разломы. Спустя мгновение из них вырываются смертоносные обсидиановые колонны.
                  </p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-purple-400 block mb-1">Сферы Пустоты</span>
                  <p className="text-slate-400">
                    Град сгустков темной материи, летящих к герою. Остановка времени позволяет застыть сферам в воздухе и безопасно пройти сквозь них.
                  </p>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  <span className="font-semibold text-amber-400 block mb-1">Вспышка Рока (Doom Nova)</span>
                  <p className="text-slate-400">
                    Босс парит в центре арены и заряжает разрушительную волну. Прервите ее 3 быстрыми ударами меча или используйте неуязвимость рывка.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hero' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-900/60 p-4 rounded-xl border border-cyan-950/60">
                <img
                  src="/src/assets/images/hero_anime_swordsman_portrait_1791441004661.jpg"
                  alt="Скиталец Времени"
                  className="w-28 h-28 object-cover rounded-xl border border-cyan-900 shadow-md shrink-0"
                />
                <div>
                  <h3 className="font-display text-base font-bold text-cyan-300 mb-1">
                    Человек в Магическом Мире (Скиталец)
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    Попав в расколотую вселенную через звездный портал, смертный странник сохранил единственную реликвию — рунический клинок времени. Каждая смерть возвращает его память, делая движения точнее.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                  <Zap className="w-4 h-4" />
                  <span>3-ударное фехтование:</span>
                </div>
                <p className="text-slate-400">
                  1-й и 2-й удары быстры и позволяют быстро реагировать, а 3-й завершающий удар наносит колоссальный урон и пробивает шкалу оглушения босса.
                </p>
              </div>

              <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-semibold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Призрачный рывок (Dash):</span>
                </div>
                <p className="text-slate-400">
                  Предоставляет 0.25 секунды полной неуязвимости, позволяя проскользнуть сквозь рассекающие удары и шипы.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'tactics' && (
            <div className="space-y-3">
              <div className="bg-amber-950/30 border border-amber-900/60 p-4 rounded-xl">
                <h4 className="font-display text-sm font-bold text-amber-300 mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Искусство Хроностазиса (Остановка времени)
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Нажатие <span className="text-amber-400 font-bold">[K]</span>, <span className="text-amber-400 font-bold">[X]</span> или <span className="text-amber-400 font-bold">[Shift]</span> замораживает все происходящее в мире на несколько секунд:
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 font-semibold block mb-0.5">1. Заморозка снарядов и шипов</span>
                  <p className="text-slate-400">
                    Сферы пустоты и поднимающиеся шипы застывают на месте. Вы можете пробежать мимо них, не получив урона.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                  <span className="text-rose-400 font-semibold block mb-0.5">2. Контратака за спину</span>
                  <p className="text-slate-400">
                    Когда босс начинает тяжелый замах косой, активируйте стазис, сделайте рывок за спину и выполните полное комбо из 3 ударов. Урон в стазисе увеличен на 40%!
                  </p>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-800">
                  <span className="text-emerald-400 font-semibold block mb-0.5">3. Экономия энергии</span>
                  <p className="text-slate-400">
                    Не держите время остановленным впустую — отключайте стазис повторным нажатием сразу после маневра, чтобы сохранить заряд на экстренный случай.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 mt-2 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Закрыть гримуар
          </button>
        </div>
      </div>
    </div>
  );
};
