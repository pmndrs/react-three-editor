export const eq = {
  array: (a, b) => a.every((i, index) => i === b[index]),
  angles: (a, b) =>
    a.every((i, index) => Math.round(i) === Math.round(b[index]))
}
