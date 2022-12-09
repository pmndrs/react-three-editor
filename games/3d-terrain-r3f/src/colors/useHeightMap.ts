import { Color } from "three";

export function useHeightMap() {
  const floorColor = new Color().setHSL(0.75, 1, 0.5);
  const ceilingColor = new Color().setHSL(0, 1, 0.5);
  const zmin = 0.05;
  const zmax = 0.5;

  return (height: number): Color => {
    const percent = (height - zmin) / (zmax - zmin);
    return floorColor.clone().lerpHSL(ceilingColor, percent);
  };
}
