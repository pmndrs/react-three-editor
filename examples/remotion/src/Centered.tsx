import { AbsoluteFill } from "remotion"

export function Centered({ children, style = {} }) {
  return <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", ...style }}>{children}</AbsoluteFill>
}
