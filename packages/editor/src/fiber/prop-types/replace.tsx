export function replace(path: string[], replace: string, with_: string) {
  return path.map((p) => (p === replace ? with_ : p))
}
