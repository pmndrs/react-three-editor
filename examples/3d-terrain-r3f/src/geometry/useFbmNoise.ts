import { useCallback, useMemo } from "react";
import { MathUtils, Vector2 } from "three";
import { FBM } from "../lib/three-noise.module";
import { useSettings } from "../state/useSettings";

export function useFbmNoise() {
  const generation = useSettings((s) => s.generation);

  const fbm = useMemo(
    () =>
      new FBM({
        seed: generation.Seed,
        lacunarity: generation.Detail * 4,
        persistance: generation.Fuzzyness * 2
      }),
    [generation]
  );

  return useCallback(
    (vector: Vector2) =>
      Math.pow(
        MathUtils.mapLinear(
          fbm.get2(vector),
          -1, //
          1,
          0,
          1
        ),
        2
      ),
    [fbm]
  );
}
