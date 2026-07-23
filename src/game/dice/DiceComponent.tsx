import React from 'react';

interface DiceComponentProps {
  value: number;
  rolling: boolean;
}

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

export const DiceComponent: React.FC<DiceComponentProps> = ({ value, rolling }) => {
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
