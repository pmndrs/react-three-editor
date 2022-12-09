import { Color, MathUtils } from "three";
import { useSettings } from "../state/useSettings";

export function useNaturalColor() {
  const colors = useSettings((s) => s.colors);

  return (height: number): Color => {
    const assetType = (() => {
      if (height <= colors.Water.value) {
        return "Water";
      } else if (height <= colors.Water.value + colors.Shore.value) {
        return "Shore";
      } else if (height <= colors.Water.value + colors.Beach.value) {
        return "Beach";
      } else if (height <= colors.Water.value + colors.Shrub.value) {
        return "Shrub";
      } else if (height <= colors.Water.value + colors.Forest.value) {
        return "Forest";
      } else if (height <= colors.Water.value + colors.Stone.value) {
        return "Stone";
      } else {
        return "Snow";
      }
    })();
    const color = new Color(colors[assetType].color);
    const hsl = color.getHSL({ h: 0, s: 1, l: 1 });

    color.setHSL(
      hsl.h,
      hsl.s * 1.7,
      hsl.l *
        (height <= colors.Water.value
          ? MathUtils.mapLinear(
              Math.pow(1 - (colors.Water.value - height) * 1.3, 6),
              0,
              1,
              0,
              1.4
            )
          : 1)
    );

    return color;
  };
}
