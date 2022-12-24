import { createProp } from "./createProp"
import { PropInput } from "./types"

type PropTypes<K> = {
  [k in keyof K]: (props: PropInput) => any
}

export let createProps = function <K extends object>(types: K): PropTypes<K> {
  return Object.fromEntries(
    Object.entries(types).map(([k, v]) => [
      k,
      (props: PropInput) => createProp(v, props)
    ])
  ) as any
}
