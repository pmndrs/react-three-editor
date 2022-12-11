import { OrbitControls, useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas } from '../Canvas'
import colorImage from './color.jpg'
import LeePerrySmithModelPath from './LeePerrySmith.glb?url'
import normalImage from './normal.jpg'

type LeePerrySmithGLTF = {
    nodes: {
        LeePerrySmith: THREE.Mesh
    }
}

function LeePerrySmith(props: JSX.IntrinsicElements['group']) {
    const { nodes } = useGLTF(LeePerrySmithModelPath) as unknown as LeePerrySmithGLTF

    const map = useTexture(colorImage)
    const normal = useTexture(normalImage)

    const uTime = useRef({ value: 0 })

    useFrame(({ clock: { elapsedTime } }) => {
        uTime.current.value = elapsedTime
    })

    const materials = useMemo(() => {
        const material = new THREE.MeshStandardMaterial({ color: 'salmon' })

        material.map = map
        material.normalMap = normal

        const depthMaterial = new THREE.MeshDepthMaterial({
            depthPacking: THREE.RGBADepthPacking,
        })

        material.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = uTime.current

            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                `
                    #include <common>

                    uniform float uTime;

                    mat2 get2dRotateMatrix(float _angle)
                    {
                        return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
                    }
                `
            )

            shader.vertexShader = shader.vertexShader.replace(
                '#include <beginnormal_vertex>',
                `
                    #include <beginnormal_vertex>

                    float angle = (sin(position.y + uTime)) * 0.4;
                    mat2 rotateMatrix = get2dRotateMatrix(angle);

                    objectNormal.xz = rotateMatrix * objectNormal.xz;
                `
            )
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                    #include <begin_vertex>

                    transformed.xz = rotateMatrix * transformed.xz;
                `
            )
        }

        depthMaterial.onBeforeCompile = (shader) => {
            shader.uniforms.uTime = uTime.current
            shader.vertexShader = shader.vertexShader.replace(
                '#include <common>',
                `
                    #include <common>

                    uniform float uTime;

                    mat2 get2dRotateMatrix(float _angle)
                    {
                        return mat2(cos(_angle), - sin(_angle), sin(_angle), cos(_angle));
                    }
                `
            )
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                    #include <begin_vertex>

                    float angle = (sin(position.y + uTime)) * 0.4;
                    mat2 rotateMatrix = get2dRotateMatrix(angle);

                    transformed.xz = rotateMatrix * transformed.xz;
                `
            )
        }

        return { material, depthMaterial }
    }, [])

    return (
        <group {...props} dispose={null}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.LeePerrySmith.geometry}
                material={materials.material}
                customDepthMaterial={materials.depthMaterial}
            />
        </group>
    )
}

const Wall = (props: JSX.IntrinsicElements['mesh']) => (
    <mesh {...props} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color={0xffffff} />
    </mesh>
)

const App = () => {
    const directionalLight = useRef<THREE.DirectionalLight>(null!)

    useEffect(() => {
        directionalLight.current.lookAt(0, 0, 0)
    }, [])

    return (
        <>
            <LeePerrySmith />

            <Wall rotation-y={Math.PI / 2} position={[-6, -1.2, -3]} />

            <ambientLight intensity={0.1} />
            <directionalLight
                ref={directionalLight}
                intensity={1}
                position={[5, 1, 2]}
                shadow-normalBias={0.05}
                shadow-camera-far={15}
                shadow-mapSize={[1024, 1024]}
                castShadow
            />
        </>
    )
}

export default () => (
    <>
        <h1>Journey 30 - Modified Materials</h1>
        <Canvas
            gl={{ antialias: true }}
            camera={{ position: [3, 2, 11] }}
            shadows={{ type: THREE.PCFSoftShadowMap }}
        >
            <App />
            <OrbitControls />
        </Canvas>
    </>
)
