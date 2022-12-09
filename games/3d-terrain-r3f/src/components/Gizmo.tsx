import { GizmoHelper, GizmoViewport } from "@react-three/drei";

export const Gizmo = () => {
  return (
    <GizmoHelper alignment="bottom-left" margin={[60, 80]} onUpdate={() => {}}>
      <GizmoViewport
        hideNegativeAxes
        axisColors={["#f00", "#398400", "#00f"]}
        labelColor="#fff"
      />
    </GizmoHelper>
  );
};
