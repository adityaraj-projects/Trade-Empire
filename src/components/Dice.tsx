import React from 'react';

interface DiceProps {
  dice: [number, number];
  rolling: boolean;
  onRoll: () => void;
  disabled: boolean;
}

// Dot positions for standard dice faces
const DOT_POSITIONS: { [key: number]: string[] } = {
  1: ['col-start-2 row-start-2'],
  2: ['col-start-1 row-start-1', 'col-start-3 row-start-3'],
  3: ['col-start-1 row-start-1', 'col-start-2 row-start-2', 'col-start-3 row-start-3'],
  4: [
    'col-start-1 row-start-1',
    'col-start-3 row-start-1',
    'col-start-1 row-start-3',
    'col-start-3 row-start-3',
  ],
  5: [
    'col-start-1 row-start-1',
    'col-start-3 row-start-1',
    'col-start-2 row-start-2',
    'col-start-1 row-start-3',
    'col-start-3 row-start-3',
  ],
  6: [
    'col-start-1 row-start-1',
    'col-start-3 row-start-1',
    'col-start-1 row-start-2',
    'col-start-3 row-start-2',
    'col-start-1 row-start-3',
    'col-start-3 row-start-3',
  ],
};

const DiceFace: React.FC<{ value: number; rolling: boolean }> = ({ value, rolling }) => {
  return (
    <div
      className={`w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_8px_16px_rgba(0,0,0,0.5)] grid grid-cols-3 grid-rows-3 p-2.5 items-center justify-items-center transform transition-transform duration-300 ${
        rolling ? 'dice-spinning' : ''
      }`}
    >
      {DOT_POSITIONS[value]?.map((pos, idx) => (
        <div
          key={idx}
          className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 shadow-[0_0_8px_#a855f7] ${pos}`}
        ></div>
      ))}
    </div>
  );
};

export const Dice: React.FC<DiceProps> = ({ dice, rolling, onRoll, disabled }) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Dice Faces Wrapper */}
      <div className="flex gap-4 md:gap-6 justify-center py-2">
        <DiceFace value={dice[0]} rolling={rolling} />
        <DiceFace value={dice[1]} rolling={rolling} />
      </div>

      {/* Roll Button */}
      <button
        onClick={onRoll}
        disabled={disabled || rolling}
        className={`w-40 py-2.5 rounded-xl font-extrabold text-sm tracking-wider uppercase transition-all duration-300 ${
          disabled || rolling
            ? 'bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] active:scale-[0.97]'
        }`}
      >
        {rolling ? 'Rolling...' : 'Roll Dice'}
      </button>
    </div>
  );
};
