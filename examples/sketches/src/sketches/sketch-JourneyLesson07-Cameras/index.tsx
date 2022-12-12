import { CameraShake } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import { PCFSoftShadowMap } from 'three'
import { Canvas } from '../Canvas'

const Cube = () => (
    <mesh position-y={-0.5} receiveShadow castShadow>
        <boxBufferGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ff8888" />
    </mesh>
)

const Ground = () => (
    <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeBufferGeometry args={[100, 100]} />
        <meshStandardMaterial color="white" />
    </mesh>
)

const Lights = () => {
    const directionalLight = useRef<THREE.DirectionalLight>(null!)

    useEffect(() => {
        directionalLight.current.lookAt(0, 0, 0)
    }, [])

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight
                ref={directionalLight}
                intensity={1}
                position={[3, 2, 3]}
                castShadow
                shadow-camera-near={2}
                shadow-camera-far={10}
                shadow-camera-top={8}
                shadow-camera-right={8}
                shadow-camera-bottom={-8}
                shadow-camera-left={-8}
                shadow-mapSize-height={2048}
                shadow-mapSize-width={2048}
            />
        </>
    )
}

const App = () => {
    return (
        <>
            <CameraShake />
            <Cube />
            <Ground />
            <Lights />
        </>
    )
}

export default () => (
    <>
        <h1>Journey 07 - Cameras</h1>
        <Canvas
            camera={{ position: [0, 1, 5], fov: 50 }}
            shadows={{ type: PCFSoftShadowMap }}
        >
            <App />
        </Canvas>
    </>
)
