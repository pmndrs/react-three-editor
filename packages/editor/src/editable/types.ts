import { JSXSource } from "~/types"

export type PropsWithSource<P = unknown> = P & {
  __source: JSXSource
}
