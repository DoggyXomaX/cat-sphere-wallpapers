export function lerp(a: number, b: number, t: number) {
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  return a + (b - a) * t;
}