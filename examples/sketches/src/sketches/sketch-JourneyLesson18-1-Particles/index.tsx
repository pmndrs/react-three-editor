import { OrbitControls } from '@react-three/drei'
import { useMemo } from 'react'
import { BufferAttribute, BufferGeometry } from 'three'
import { Canvas } from '../Canvas'

const App = () => {
    const bufferGeometry = useMemo(() => {
        const geo = new BufferGeometry();

        const count = 1500;
        const positions = new Float32Array(count * 3)
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] = (Math.random() - 0.5) * 10
            positions[i + 1] = (Math.random() - 0.5) * 10
            positions[i + 2] = (Math.random() - 0.5) * 10
        }

        geo.setAttribute("position", new BufferAttribute(positions, 3))

        return geo
    }, [])

    return (
        <points>
            <pointsMaterial size={0.05} sizeAttenuation={true} color="#ff8888" />
            <primitive attach="geometry" object={bufferGeometry}/>
        </points>
    )
}

export default () => (
    <>
        <h1>Journey 18.1 - Particles</h1>
        <Canvas camera={{ position: [3, 3, 3] }}>
            <App />
            <OrbitControls />
        </Canvas>
    </>
)
