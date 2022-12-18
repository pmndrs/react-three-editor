import { ThreeElements } from "@react-three/fiber"
import { createElement, forwardRef } from "react"
import * as THREE from "three"

export const cache = {}

export const memo: {
  [k in keyof ThreeElements]: React.FC<React.PropsWithRef<ThreeElements[k]>>
} = new Proxy(
  {} as unknown as {
    [k in keyof ThreeElements]: React.PropsWithRef<ThreeElements[k]>
  },
  {
    get: (obj: any, prop: string) => {
      if (obj[prop]) {
        return obj[prop]
      }

      obj[prop] = function ({ name, args, ...props }: any, ref) {
        let cachedKey = `${prop}:${name}`
        if (!cache[cachedKey]) {
          let className = prop.charAt(0).toUpperCase() + prop.slice(1)
          cache[cachedKey] = new THREE[className](...(args ?? []))
        }
        return createElement("primitive", {
          object: cache[cachedKey],
          name: name,
          ...props,
          ref: ref
        })
      }

      obj[prop] = forwardRef(obj[prop])
      obj[prop].displayName = prop

      return obj[prop]
    }
  }
)
