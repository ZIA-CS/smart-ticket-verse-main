/**
 * Lightweight pseudo-QR visualization.
 * Generates a deterministic "data matrix" pattern from a string — gives the
 * unmistakable QR aesthetic without an external library. Staff verify entry by
 * the readable code below it (manual entry chosen for this project).
 */
export default function QrCode({ value, size = 180 }: { value: string; size?: number }) {
  const cells = 21;
  // hash each cell deterministically
  const hash = (i: number, j: number) => {
    let h = 2166136261;
    const s = `${value}|${i}|${j}`;
    for (let k = 0; k < s.length; k++) {
      h ^= s.charCodeAt(k);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) % 2;
  };
  const isFinder = (i: number, j: number) => {
    const inSquare = (oi: number, oj: number) =>
      i >= oi && i < oi + 7 && j >= oj && j < oj + 7 &&
      (i === oi || i === oi + 6 || j === oj || j === oj + 6 ||
        (i >= oi + 2 && i <= oi + 4 && j >= oj + 2 && j <= oj + 4));
    return inSquare(0, 0) || inSquare(0, cells - 7) || inSquare(cells - 7, 0);
  };
  const isFinderArea = (i: number, j: number) =>
    (i < 8 && j < 8) || (i < 8 && j >= cells - 8) || (i >= cells - 8 && j < 8);

  const cellSize = size / cells;
  const rects: JSX.Element[] = [];
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      let on = false;
      if (isFinder(i, j)) on = true;
      else if (!isFinderArea(i, j)) on = hash(i, j) === 1;
      if (on) {
        rects.push(
          <rect key={`${i}-${j}`} x={j * cellSize} y={i * cellSize} width={cellSize} height={cellSize} fill="currentColor" />
        );
      }
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="text-foreground bg-background rounded-lg p-2">
      {rects}
    </svg>
  );
}
