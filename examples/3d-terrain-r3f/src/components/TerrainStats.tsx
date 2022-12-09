import { Html } from "@react-three/drei";
import type { FC } from "react";

const numberFormatter = new Intl.NumberFormat();

export const TerrainStats: FC<{ blockCount: number }> = ({ blockCount }) => (
  <Html calculatePosition={() => [40, 40, 0]} style={{ color: "white" }}>
    <strong>{numberFormatter.format(blockCount)}</strong>&nbsp;
    <small>blocks</small>
    <br />
    <small>
      ({Math.sqrt(blockCount)}x{Math.sqrt(blockCount)})
    </small>
  </Html>
);
