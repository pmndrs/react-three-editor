import { OrbitControls, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { BufferAttribute, BufferGeometry, Points } from 'three'
import { Canvas } from '../Canvas'
import particleTextureImage from './particle.png'

const COUNT = 15000

const App = () => {
    const points = useRef<Points>(null!)

    const particleTexture = useTexture(particleTextureImage)

    const bufferGeometry = useMemo(() => {
        const geo = new BufferGeometry()

        const positions = new Float32Array(COUNT * 3)
        const colors = new Float32Array(COUNT * 3)

        for (let i = 0; i < positions.length; i += 3) {
            positions[i] = (Math.random() - 0.5) * 20
            positions[i + 1] = (Math.random() - 0.5) * 20
            positions[i + 2] = (Math.random() - 0.5) * 20

            colors[i] = Math.random() / 255
            colors[i + 1] = Math.random() / 255
            colors[i + 2] = Math.random() / 255
        }

        geo.setAttribute('position', new BufferAttribute(positions, 3))
        geo.setAttribute('color', new BufferAttribute(positions, 3))

        return geo
    }, [])

    useFrame(({ clock: { elapsedTime } }) => {
        const positions = bufferGeometry.attributes.position
            .array as Float32Array

        for (let i = 0; i < COUNT * 3; i += 3) {
            const x = positions[i] + 7.5
            positions[i + 1] = Math.sin(elapsedTime + x)
        }

        bufferGeometry.attributes.position.needsUpdate = true
    })

    return (
        <points ref={points as never}>
            <pointsMaterial
                size={0.2}
                sizeAttenuation={true}
                map={particleTexture}
                alphaMap={particleTexture}
                transparent
                alphaTest={0.001}
                vertexColors
            />
            <primitive attach="geometry" object={bufferGeometry} />
        </points>
    )
}

export default () => (
    <>
        <h1>Journey 18.2 - Particles</h1>
        <Canvas camera={{ position: [3, 5, 7] }}>
            <App />
            <OrbitControls target={[0, -2, 0]} />
        </Canvas>
    </>
)
