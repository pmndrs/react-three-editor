import { PropsWithChildren } from "react";

export type Props = PropsWithChildren<any>

export type Tunnel = {
    In: ({ children }: Props) => null;
    Out: () => JSX.Element;
}

export type ElementType<K extends keyof JSX.IntrinsicElements = keyof JSX.IntrinsicElements> = React.FC<
JSX.IntrinsicElements[K] & {
  ref?: React.Ref<any>
}
>

export type Elements = {
    [K in keyof JSX.IntrinsicElements]: ElementType
  }
