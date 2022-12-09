import { useMemo } from "react";
import { Vector2 } from "three";
import { useSettings } from "../state/useSettings";

const INTRINSIC_TERRAIN_MAX_SIZE = 500;
const VISIBLE_MAP_SIZE = 8;

export function useSquareSurface() {
  const resolution = useSettings((s) => s.generation.Resolution);
  const terrainSize = Math.max(INTRINSIC_TERRAIN_MAX_SIZE * resolution, 20);

  return useMemo(() => {
    const surface = [];
    const scale = VISIBLE_MAP_SIZE / terrainSize;

    for (let x = -terrainSize / 2; x < terrainSize / 2; x++) {
      for (let y = -terrainSize / 2; y < terrainSize / 2; y++) {
        surface.push(new Vector2(x, y));
      }
    }
    return { surface, scale };
  }, [terrainSize]);
}
