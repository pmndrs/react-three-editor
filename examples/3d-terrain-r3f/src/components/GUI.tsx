import { button, Leva, useControls } from "leva";
import { useSettings, Settings } from "../state/useSettings";

export function GUI() {
  const colors = useSettings((s) => s.colors);
  const generation = useSettings((s) => s.generation);
  const display = useSettings((s) => s.display);
  const setColorValue = useSettings((s) => s.setColorValue);
  const setColor = useSettings((s) => s.setColor);
  const setGeneration = useSettings((s) => s.setGeneration);
  const setDisplay = useSettings((s) => s.setDisplay);

  useControls("Colors", () => {
    const res = {} as any;
    Object.keys(colors).forEach((color) => {
      res[color] = {
        value: colors[color].value,
        min: 0,
        max: 1,
        onChange: (v: number) => setColorValue(color, v)
      };

      res[color] = {
        value: colors[color].color,
        onChange: (v: string) => setColor(color, v)
      };
    });

    return res;
  });

  useControls("Display", () => ({
    HeightMap: {
      value: display === "height",
      onChange: (v: boolean) => setDisplay(v ? "height" : "color")
    }
  }));

  const [_, set] = useControls("Generation", () => {
    const res = {} as any;
    (Object.keys(generation) as Array<keyof Settings["generation"]>).forEach((param) => {
      res[param] = {
        value: generation[param],
        min: 0.01,
        max: 1,
        onChange: (v: number) => setGeneration(param, v)
      };
    });
    res["Sea Level"] = {
      value: colors.Water.value,
      min: 0,
      max: 1,
      onChange: (v: number) => setColorValue("Water", v / 2)
    };

    return res;
  });

  useControls({
    Regenerate: button(() => set({ Seed: Math.random() }))
  });

  return null;
}
