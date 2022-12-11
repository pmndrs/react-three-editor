import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Mesh } from 'three'
import { Canvas } from '../Canvas'

const App = () => {
    const ref = useRef<Mesh>(null!)

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime()
        const mesh = ref.current
        
        mesh.position.y = Math.sin(time)
        mesh.position.x = Math.cos(time)
    })

    return (
        <mesh ref={ref as never}>
            <meshBasicMaterial color="#ff8888" />
            <boxGeometry args={[1, 1, 1]} />
        </mesh>
    )
}

export default () => (
    <>
        <h1>Journey 06 - Animations</h1>
        <Canvas>
            <App />
        </Canvas>
    </>
)
