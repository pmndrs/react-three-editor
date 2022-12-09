import { useEffect, useRef } from "react";
import { Object3D, InstancedMesh } from "three";
import { useProceduralTerrain } from "../geometry/useProceduralTerrain";
import { TerrainStats } from "./TerrainStats";
import { useDisplay } from "../colors/useDisplay";

const emptyObject = new Object3D();

export function Terrain() {
  const ref = useRef<InstancedMesh>(null);

  const { dataBlocks, scale } = useProceduralTerrain();
  const getColor = useDisplay();

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;

    dataBlocks.forEach(({ x, y, z, height }, i) => {
      const color = getColor(height);

      emptyObject.position.set(x, y, z);
      emptyObject.updateMatrix();

      mesh.setMatrixAt?.(i, emptyObject.matrix);
      mesh.setColorAt?.(i, color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor!.needsUpdate = true;
  }, [dataBlocks, getColor]);

  return (
    <>
      <group rotation-x={-Math.PI / 2} scale={[0.05333333333333334, 0.05333333333333334, 0.05333333333333334]} position={[5.598, 3.227, 0]} rotation={[-1.5707963267948966, 0, 0]}>
        <instancedMesh castShadow receiveShadow ref={ref} args={[, , dataBlocks.length]}>
          <boxGeometry />
          <meshPhongMaterial />
        </instancedMesh>
      </group>

      <TerrainStats blockCount={dataBlocks.length} />
    </>
  );
}
