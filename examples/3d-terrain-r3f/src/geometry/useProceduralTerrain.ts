import { useMemo } from "react";
import { useSettings } from "../state/useSettings";
import { useFbmNoise } from "./useFbmNoise";
import { useSquareSurface } from "./useSquareSurface";

/**
 * Generate a square procedural terrain using a noise function for the relief
 */
export function useProceduralTerrain() {
  const { surface, scale } = useSquareSurface();

  const waterLevel = useSettings((s) => s.colors.Water.value);
  const generationScale = useSettings((s) => s.generation.Scale);
  const generationHeight = useSettings((s) => s.generation.Height);
  const display = useSettings((s) => s.display);

  const getNoiseValue = useFbmNoise();

  const dataBlocks = useMemo(
    () =>
      surface.map((point) => {
        const scaledVector = point.clone().multiplyScalar(scale * generationScale);
        const realHeight = getNoiseValue(scaledVector) * generationHeight;
        let visibleHeight = realHeight;

        if (display === "color" && realHeight < waterLevel) {
          visibleHeight = waterLevel;
        }

        return {
          x: point.x,
          y: point.y,
          z: (visibleHeight / scale) * 3,
          height: realHeight
        };
      }),
    [
      surface,
      scale,
      generationScale,
      generationHeight,
      waterLevel,
      getNoiseValue,
      display
    ]
  );

  return { dataBlocks, scale };
}
