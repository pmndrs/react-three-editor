import { useFBO, PerspectiveCamera } from '@react-three/drei'
import { createPortal, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'

// see: https://codesandbox.io/s/magic-mirror-ddk57

export function MagicMirror({
    children,
    fov = 50,
    size = [5, 5],
    ...props
}: {
    fov?: number
    size?: [number, number]
    children: JSX.Element | JSX.Element[]
}) {
    const cam = useRef<THREE.PerspectiveCamera>(null!)

    // useFBO creates a WebGL2 buffer for us, it's a helper from the "drei" library
    const fbo = useFBO()

    // The is a separate scene that we create, React will portal into that
    const [scene] = useState(() => new THREE.Scene())

    // Tie this component into the render-loop
    useFrame((state) => {
        // Our portal has its own camera, but we copy the originals world matrix
        cam.current!.matrixWorldInverse.copy(state.camera.matrixWorldInverse)

        // Then we set the render-target to the buffer that we have created
        state.gl.setRenderTarget(fbo)

        // We render the scene into it, using the local camera that is clamped to the planes aspect ratio
        state.gl.render(scene, cam.current)

        // And flip the render-target to the default again
        state.gl.setRenderTarget(null)
    })
    return (
        <>
            <mesh {...props}>
                <planeGeometry args={size} />
                {/* The "mirror" is just a boring plane, but it receives the buffer texture */}
                <meshBasicMaterial map={fbo.texture} />
            </mesh>
            <PerspectiveCamera
                manual
                ref={cam}
                fov={fov}
                aspect={size[0] / size[1]} // using plane geometry size args
                onUpdate={(c) => c.updateProjectionMatrix()}
            />
            {/* This is React being awesome, we portal this components children into the separate scene above */}
            {createPortal(children, scene)}
        </>
    )
}
