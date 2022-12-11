import { OrbitControls, useHelper, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { BufferAttribute } from 'three'
import { Canvas } from '../Canvas'
import bricksAmbientOcclusionImage from './textures/bricks/ambientOcclusion.jpg'
import bricksColorImage from './textures/bricks/color.jpg'
import bricksNormalImage from './textures/bricks/normal.jpg'
import bricksRoughnessImage from './textures/bricks/roughness.jpg'
import doorAlphaImage from './textures/door/alpha.jpg'
import doorAmbientOcclusionImage from './textures/door/ambientOcclusion.jpg'
import doorColorImage from './textures/door/color.jpg'
import doorHeightImage from './textures/door/height.jpg'
import doorMetalnessImage from './textures/door/metalness.jpg'
import doorNormalImage from './textures/door/normal.jpg'
import doorRoughnessImage from './textures/door/roughness.jpg'
import grassAmbientOcclusionImage from './textures/grass/ambientOcclusion.jpg'
import grassColorImage from './textures/grass/color.jpg'
import grassNormalImage from './textures/grass/normal.jpg'
import grassRoughnessImage from './textures/grass/roughness.jpg'

const CONTROLS_FOLDER = 'journey-17-haunted-house'

const BACKGROUND_COLOR = 0x262837

const House = (props: JSX.IntrinsicElements['group']) => {
    const { debug } = useControls(CONTROLS_FOLDER, {
        debug: false,
    })

    const lightRef = useRef<THREE.PointLight>(null!)
    useHelper(debug ? lightRef : undefined, THREE.PointLightHelper, 0.1)

    const bricksTextureProps = useTexture({
        map: bricksColorImage,
        aoMap: bricksAmbientOcclusionImage,
        normalMap: bricksNormalImage,
        roughnessMap: bricksRoughnessImage,
    })

    const doorTextureProps = useTexture({
        map: doorColorImage,
        alphaMap: doorAlphaImage,
        normalMap: doorNormalImage,
        metalnessMap: doorMetalnessImage,
        roughnessMap: doorRoughnessImage,
        displacementMap: doorHeightImage,
        aoMap: doorAmbientOcclusionImage,
    })

    const wallsBoxGeometryRef = useRef<THREE.BoxGeometry>(null)
    const doorPlaneGeometryRef = useRef<THREE.PlaneGeometry>(null)

    useLayoutEffect(() => {
        if (wallsBoxGeometryRef.current) {
            wallsBoxGeometryRef.current.setAttribute(
                'uv2',
                new BufferAttribute(
                    wallsBoxGeometryRef.current.attributes.uv.array,
                    2
                )
            )
        }

        if (doorPlaneGeometryRef.current) {
            doorPlaneGeometryRef.current.setAttribute(
                'uv2',
                new BufferAttribute(
                    doorPlaneGeometryRef.current.attributes.uv.array,
                    2
                )
            )
        }
    }, [])

    return (
        <>
            <group {...props}>
                {/* Walls */}
                <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
                    <boxGeometry ref={wallsBoxGeometryRef} args={[4, 2.5, 4]} />
                    <meshStandardMaterial
                        {...bricksTextureProps}
                        normalMap-encoding={THREE.LinearEncoding}
                        normalScale={new THREE.Vector2(0.01, 0.01)}
                    />
                </mesh>

                {/* Roof */}
                <mesh
                    castShadow
                    receiveShadow
                    position={[0, 2.5 + 0.5, 0]}
                    rotation={[0, Math.PI / 4, 0]}
                >
                    <coneGeometry args={[3.5, 1, 4]} />
                    <meshStandardMaterial color={0xb35f45} />
                </mesh>

                {/* Door */}
                <mesh position={[0, 1, 2.001]}>
                    <planeGeometry
                        ref={doorPlaneGeometryRef}
                        args={[2.2, 2.2, 100, 100]}
                    />
                    <meshStandardMaterial
                        transparent
                        {...doorTextureProps}
                        aoMapIntensity={2}
                        displacementScale={0.2}
                        normalScale={new THREE.Vector2(0.2, 0.2)}
                    />
                </mesh>

                {/* Door light */}
                <pointLight
                    ref={lightRef}
                    position={[0, 2, 2.3]}
                    color={0xff7d67}
                    intensity={1}
                    distance={12}
                    castShadow
                    shadow-mapSize-width={256}
                    shadow-mapSize-height={256}
                    shadow-camera-near={0.01}
                    shadow-camera-far={10}
                />
            </group>
        </>
    )
}

const Bush = (props: JSX.IntrinsicElements['mesh']) => {
    return (
        <mesh {...props} receiveShadow castShadow>
            <sphereGeometry args={[1, 16, 16]} />
            <meshStandardMaterial color={0x89c854} />
        </mesh>
    )
}

const Grave = (props: JSX.IntrinsicElements['group']) => {
    return (
        <group {...props}>
            <mesh position={[0, 0.3, 1]} receiveShadow castShadow>
                <boxGeometry args={[0.6, 0.8, 0.2]} />
                <meshStandardMaterial color={0xb2b6b1} />
            </mesh>
        </group>
    )
}

const Ghost = (props: { color: string; offset: number }) => {
    const { debug } = useControls(CONTROLS_FOLDER, {
        debug: false,
    })

    const pointLightRef = useRef<THREE.PointLight>(null!)

    useHelper(debug ? pointLightRef : undefined, THREE.PointLightHelper)

    useFrame(({ clock: { elapsedTime } }) => {
        const ghostAngle = elapsedTime * 0.5
        pointLightRef.current.position.x =
            Math.cos(ghostAngle + props.offset) *
            (7 + Math.sin(elapsedTime * 2) * 2)

        pointLightRef.current.position.z =
            Math.sin(ghostAngle + props.offset) *
            (7 + Math.sin(elapsedTime * 2) * 2)

        pointLightRef.current.position.y = Math.sin(ghostAngle * 2) + 1

        pointLightRef.current.intensity = (Math.sin(ghostAngle) + 1) * 1.2
    })

    return (
        <pointLight
            ref={pointLightRef as never}
            color={props.color}
            distance={4}
            castShadow
            shadow-mapSize-width={256}
            shadow-mapSize-height={256}
            shadow-camera-far={4}
        />
    )
}

const Grass = () => {
    const planeGeometryRef = useRef<THREE.PlaneGeometry>(null)

    const grassTextureProps = useTexture({
        map: grassColorImage,
        aoMap: grassAmbientOcclusionImage,
        normalMap: grassNormalImage,
        roughnessMap: grassRoughnessImage,
    })

    useLayoutEffect(() => {
        if (planeGeometryRef.current) {
            planeGeometryRef.current.setAttribute(
                'uv2',
                new BufferAttribute(
                    planeGeometryRef.current.attributes.uv.array,
                    2
                )
            )
        }
    }, [])

    return (
        <mesh rotation={[-Math.PI * 0.5, 0, 0]} receiveShadow>
            <planeGeometry ref={planeGeometryRef} args={[50, 50]} />
            <meshStandardMaterial
                {...grassTextureProps}
                map-repeat={[20, 20]}
                map-wrapS={THREE.RepeatWrapping}
                map-wrapT={THREE.RepeatWrapping}
                aoMap-repeat={[20, 20]}
                aoMap-wrapS={THREE.RepeatWrapping}
                aoMap-wrapT={THREE.RepeatWrapping}
                normalMap-repeat={[20, 20]}
                normalMap-wrapS={THREE.RepeatWrapping}
                normalMap-wrapT={THREE.RepeatWrapping}
                normalMap-encoding={THREE.LinearEncoding}
                roughnessMap-repeat={[20, 20]}
                roughnessMap-wrapS={THREE.RepeatWrapping}
                roughnessMap-wrapT={THREE.RepeatWrapping}
            />
        </mesh>
    )
}

const ghosts = [
    { color: '#ff0000', offset: (Math.PI * 2) / 3 },
    { color: '#00ff00', offset: ((Math.PI * 2) / 3) * 2 },
    { color: '#0000ff', offset: Math.PI * 2 },
]

const App = () => {
    const graves = useMemo(() => {
        return Array.from({ length: 50 })
            .fill(0)
            .map(() => {
                const angle = Math.random() * Math.PI * 2
                const radius = 3 + Math.random() * 10
                const x = Math.sin(angle) * radius
                const z = Math.cos(angle) * radius
                const position = [x, 0, z] as [number, number, number]
                const rotation = [
                    0,
                    (Math.random() - 0.5) * 0.4,
                    (Math.random() - 0.5) * 0.4,
                ] as [number, number, number]

                return {
                    angle,
                    radius,
                    position,
                    rotation,
                }
            })
    }, [])

    return (
        <>
            <color attach="background" args={[BACKGROUND_COLOR]} />
            <fog attach="fog" args={[BACKGROUND_COLOR, 12, 24]} />

            <ambientLight color={0xb5b5ff} intensity={0.2} />

            <Grass />
            <House />

            {/* right bushes */}
            <Bush position={[1, 0.2, 2.2]} scale={[0.5, 0.5, 0.5]} />
            <Bush position={[1.6, 0.1, 2.1]} scale={[0.25, 0.25, 0.25]} />

            {/* left bushes */}
            <Bush position={[-0.8, 0.1, 2.2]} scale={[0.4, 0.4, 0.4]} />
            <Bush position={[-1, 0.05, 2.7]} scale={[0.15, 0.15, 0.15]} />

            {/* ghosts */}
            {ghosts.map((ghost, idx) => (
                <Ghost key={idx} {...ghost} />
            ))}

            {/* graves */}
            {graves.map((grave, idx) => (
                <Grave
                    key={idx}
                    position={grave.position}
                    rotation={grave.rotation}
                />
            ))}
        </>
    )
}

export default () => (
    <>
        <h1>Journey 17 - Haunted House</h1>
        <Canvas
            camera={{ position: [6, 6, 12], fov: 50 }}
            shadows={{ type: THREE.PCFSoftShadowMap }}
        >
            <App />
            <OrbitControls />
        </Canvas>
    </>
)
