import type { MutableRefObject, Ref } from "react"

export const hasRef = (Component: any) => {
  return (
    typeof Component === "string" ||
    (Component as any).$$typeof === Symbol.for("react.forward_ref") ||
    ((Component as any).$$typeof === Symbol.for("react.memo") &&
      Component["type"]?.["$$typeof"] === Symbol.for("react.forward_ref"))
  )
}

type PossibleRef<T> = Ref<T> | undefined

/**
 * Set a given ref to a given value
 * This utility takes care of different types of refs: callback refs and RefObject(s)
 */
function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === "function") {
    ref(value)
  } else if (ref !== null && ref !== undefined) {
    ;(ref as MutableRefObject<T>).current = value
  }
}

export function composeRefs<T>(...refs: PossibleRef<T>[]) {
  return (node: T) => refs.forEach((ref) => setRef(ref, node))
}

type TreeItemType = {
  children: TreeItemType[]
  [key: string]: any
}

export const findInTree = <T extends TreeItemType>(
  tree: T[],
  predicate: string | ((item: T) => boolean),
  prop: string = "name"
): T | undefined => {
  return tree.find((item) => {
    if (typeof predicate === "function") return predicate(item)
    if (predicate === item[prop]) return true
    if (Array.isArray(item.children)) {
      return findInTree(item.children, predicate, prop)
    }
    return false
  })
}
