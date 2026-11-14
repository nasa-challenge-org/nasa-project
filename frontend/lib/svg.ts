/** Stable SVG numbers so SSR and the client do not drift on trig floats. */
export function svgN(n: number): string {
  return n.toFixed(3);
}
