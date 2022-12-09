import { PropsWithChildren } from "react";

export type Props = PropsWithChildren<any>

export type Tunnel = {
    In: ({ children }: Props) => null;
    Out: () => JSX.Element;
}
