export const eq = {
  array: (a: number[], b: number[]) => a.every((i, index) => i === b[index]),
  angles: (a: number[], b: number[]) =>
    a.every((i, index) => Math.round(i) === Math.round(b[index]))
}
