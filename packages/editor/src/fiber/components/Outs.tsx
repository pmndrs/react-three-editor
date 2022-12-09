import React, { FC, Fragment } from "react";
import { useTunnels } from "../stores";

export type OutsProps = {}

export const Outs: FC<OutsProps> = ( ) => {
    const tunnels = useTunnels()
    return (
        <Fragment>
            { Object.entries( tunnels ).map( ( [key, { Out }] ) => <Out key={key} /> ) }
        </Fragment>
    )
}
