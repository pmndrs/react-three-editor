import { forwardRef, useEffect, FC } from "react"

export type RigProps = {}
export const Rig: FC<RigProps> = () => {
  return <group>{/*  */}</group>
}

export function Rigged() {
  return 0
}

export function RiggedComp() {
  return <group></group>
}

export function RiggedEffects() {
  useEffect(() => {}, [])
  return null
}

export const ForwadedRig = forwardRef(function ForwardedRigged() {
  return null
})

export default function DefaultComp() {
  return null
}
