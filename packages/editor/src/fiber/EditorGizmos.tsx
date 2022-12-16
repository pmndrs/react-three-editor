import { GizmoHelper, GizmoViewcube, GizmoViewport } from "@react-three/drei"

export function CameraGizmos() {
  return (
    <GizmoHelper alignment="bottom-right" margin={[100, 100]}>
      <group scale={0.85}>
        <GizmoViewcube />
      </group>
      <group scale={1.75} position={[-30, -30, -30]}>
        <GizmoViewport
          labelColor="white"
          axisHeadScale={0.525}
          hideNegativeAxes
        />
      </group>
    </GizmoHelper>
  )
}
