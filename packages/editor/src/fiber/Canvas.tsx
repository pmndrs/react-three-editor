import { Canvas as FiberCanvas, Props } from '@react-three/fiber';
import React, { ElementType, forwardRef, Fragment, useMemo } from "react";
import { Outs } from "./components";
import { EditorContext } from "./contexts";
import { EditorPanel } from "./EditorPanel";
import { createEditorStore } from "./stores";

export type CanvasProps = Props & {
    Editor?: ElementType
}

export const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(( {
    Editor = EditorPanel,
    children,
    ...props
}, forwardedRef ) => {
    const store = useMemo( ( ) => createEditorStore(), [] )
    return (
        <Fragment>
            <FiberCanvas {...props} ref={forwardedRef}>
                <EditorContext.Provider value={store}>
                    { children }
                    { Editor && <Editor />}
                </EditorContext.Provider>
            </FiberCanvas>
            <Outs />
        </Fragment>
    )
})
