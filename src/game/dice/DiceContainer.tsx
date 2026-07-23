import React from 'react';
import { DiceComponent } from './DiceComponent';

interface DiceContainerProps {
  dice: [number, number];
  rolling: boolean;
  onRoll: () => void;
  disabled: boolean;
}

export const DiceContainer: React.FC<DiceContainerProps> = ({
  dice,
  rolling,
  onRoll,
  disabled,
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Dice visualizer */}
      <div className="flex gap-4 md:gap-6 justify-center py-2">
        <DiceComponent value={dice[0]} rolling={rolling} />
        <DiceComponent value={dice[1]} rolling={rolling} />
      </div>

      {/* Supercell Yellow Glossy roll button */}
      <button
        onClick={onRoll}
        disabled={disabled || rolling}
        className={`w-40 py-3.5 btn-supercell text-xs font-black tracking-widest uppercase transition-all duration-150 ${
          disabled || rolling
            ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed shadow-none active:scale-100'
            : 'btn-supercell-yellow shadow-[0_4px_0_#b45309,0_8px_16px_rgba(245,158,11,0.25)]'
        }`}
      >
        {rolling ? 'Rolling...' : 'Roll Dice'}
      </button>
    </div>
  );
};
export default DiceContainer;
