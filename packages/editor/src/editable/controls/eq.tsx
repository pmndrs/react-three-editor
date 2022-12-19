export const eq = {
  array: (a: number[], b: number[]) =>
    a.every((i, index) => Math.abs(i - b[index]) < 0.0001),
  angles: (a: number[], b: number[]) =>
    a.every((i, index) => Math.abs(i - b[index]) < 0.0001)
}
