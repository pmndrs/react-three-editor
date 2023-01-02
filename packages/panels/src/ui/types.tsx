import { LevaPanel as Controls } from "leva"
import { ComponentProps } from "react"

export type PanelProps = {
  panel: string
  title: string
  width?: number
  collapsed?: boolean
  side: string
  reveal?: boolean
  floating?: boolean
  size?: {
    width: number
  }
} & Omit<ComponentProps<typeof Controls>, "store">
