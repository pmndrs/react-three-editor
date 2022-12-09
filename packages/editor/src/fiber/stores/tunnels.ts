import create from "zustand/react";
import { Tunnel } from "../types";

export type TunnelsStateType = Record<string, Tunnel>

export const useTunnels = create<TunnelsStateType>( () => ({}) )
