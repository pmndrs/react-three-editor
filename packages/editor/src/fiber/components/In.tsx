import React, { FC, PropsWithChildren, useId } from "react";
import tunnel from "tunnel-rat";
import { useTunnels } from "../stores";

export type InProps = PropsWithChildren<{}>

export const In: FC<InProps> = ( { children } ) => {
    const id = useId()
    let OldTunnel = useTunnels( ( state ) => state[id] )
    if ( !OldTunnel ) {
        OldTunnel = tunnel()
        useTunnels.setState( {
            [id]: OldTunnel
        } )
    }

    return <OldTunnel.In>{ children }</OldTunnel.In>
}
