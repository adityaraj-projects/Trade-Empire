export const getTileGridPosition = (index: number): { gridRow: number; gridColumn: number } => {
  if (index >= 0 && index <= 10) {
    // Top side: Left-to-Right (Col 1 to 11, Row 1)
    return { gridRow: 1, gridColumn: index + 1 };
  } else if (index >= 11 && index <= 20) {
    // Right side: Top-to-Bottom (Col 11, Row 2 to 11)
    return { gridRow: index - 9, gridColumn: 11 };
  } else if (index >= 21 && index <= 30) {
    // Bottom side: Right-to-Left (Col 10 to 1, Row 11)
    return { gridRow: 11, gridColumn: 11 - (index - 20) };
  } else {
    // Left side: Bottom-to-Top (Col 1, Row 10 to 2)
    return { gridRow: 11 - (index - 30), gridColumn: 1 };
  }
};

export const GROUP_COLOR_MAP: { [key: string]: string } = {
  brown: 'bg-amber-800 border-amber-900 text-white',
  cyan: 'bg-cyan-500 border-cyan-600 text-slate-900',
  pink: 'bg-fuchsia-500 border-fuchsia-600 text-white',
  orange: 'bg-orange-500 border-orange-600 text-white',
  red: 'bg-red-500 border-red-600 text-white',
  yellow: 'bg-yellow-400 border-yellow-500 text-slate-900',
  green: 'bg-emerald-600 border-emerald-700 text-white',
  blue: 'bg-blue-600 border-blue-700 text-white',
  railway: 'bg-slate-700 border-slate-800 text-white',
  utility: 'bg-sky-700 border-sky-800 text-white',
};
