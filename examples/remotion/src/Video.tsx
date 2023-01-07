import { useCurrentFrame } from "remotion"
import { Centered } from "./Centered"

export function Video() {
  const frame = useCurrentFrame()
  return (
    <Centered style={{"color":"rgb(91, 52, 181)"}}>
      <h1>It's a React Video</h1>
      <h2>Frame: {frame}</h2>
    </Centered>
  )
}
