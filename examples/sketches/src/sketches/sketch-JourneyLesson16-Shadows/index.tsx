import { Float, OrbitControls, Stats, useHelper } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { DirectionalLight, PointLight, SpotLight } from 'three'
import { Canvas } from '../Canvas'

const floatProps = {
    floatIntensity: 2,
}

const Shapes = () => (
    <>
        <Float {...floatProps}>
            <mesh position={[-2, 2, 0]} castShadow receiveShadow>
                <boxBufferGeometry args={[1, 1, 1]} />
                <meshStandardMaterial />
            </mesh>
        </Float>
        <Float {...floatProps}>
            <mesh position={[0, 2, 0]} castShadow receiveShadow>
                <sphereBufferGeometry args={[0.7]} />
                <meshStandardMaterial />
            </mesh>
        </Float>
        <Float {...floatProps}>
            <mesh position={[2, 2, 0]} castShadow receiveShadow>
                <torusKnotBufferGeometry args={[0.5, 0.2, 64, 64]} />
                <meshStandardMaterial />
            </mesh>
        </Float>
    </>
)

const Ground = () => (
    <mesh
        receiveShadow
        rotation={[-1.5707963267948966, 0, 0]}
        position={[0.273, 1.143, 1.113]}
    >
        <planeBufferGeometry args={[10, 10]} />
        <meshStandardMaterial color="white" />
    </mesh>
)

const Lights = () => {
    const directionalLight = useRef<DirectionalLight>(null!)
    const spotLight = useRef<SpotLight>(null!)
    const pointLight = useRef<PointLight>(null)

    useHelper(directionalLight, THREE.DirectionalLightHelper, 1, 'hotpink')
    useHelper(spotLight, THREE.SpotLightHelper, 'blue')
    useHelper(pointLight, THREE.PointLightHelper, 0.5, 'green')

    useEffect(() => {
        directionalLight.current.lookAt(0, 0, 0)
        spotLight.current.lookAt(0, 0, 0)
    }, [])

    return (
        <>
            <ambientLight intensity={0.1} />
            <directionalLight ref={directionalLight} castShadow intensity={0.3} color={0xffffff} position={[0, 3, 1]} shadow-camera-top={4} shadow-camera-right={4} shadow-camera-bottom={-4} shadow-camera-left={-4} shadow-mapSize-height={2048} shadow-mapSize-width={2048} rotation={[-1.2490457723982542, 0, 0]} />
            <spotLight
                ref={spotLight}
                args={[0xffffff, 0.3, 10, Math.PI * 0.3]}
                castShadow
                position={[-1.371, 5.039, 4.102]}
                shadow-camera-near={2}
                shadow-camera-far={10}
                shadow-camera-top={8}
                shadow-camera-right={8}
                shadow-camera-bottom={-8}
                shadow-camera-left={-8}
                shadow-mapSize-height={2048}
                shadow-mapSize-width={2048}
                rotation={[
                    -0.8230718631348966, -0.7548889264620773,
                    -0.6363488112378832,
                ]}
            />
            <pointLight
                ref={pointLight}
                args={[0xffffff, 0.3, 10, Math.PI * 0.3]}
                castShadow
                position={[2.273, 5.313, 1.344]}
                shadow-camera-top={8}
                shadow-camera-right={8}
                shadow-camera-bottom={-8}
                shadow-camera-left={-8}
                shadow-mapSize-height={2048}
                shadow-mapSize-width={2048}
            />
        </>
    );
}

const App = () => {
    return (
        <>
            <Stats />
            <Shapes />
            <Ground />
            <Lights />
        </>
    )
}

export default () => (
    <>
        <h1>Journey 16 - Shadows</h1>
        <Canvas
            camera={{ position: [0, 5, 6], fov: 50 }}
            shadows={{ type: THREE.PCFSoftShadowMap }}
        >
            <App />
            <OrbitControls target={[0, 2, 0]} makeDefault />
        </Canvas>
    </>
)
