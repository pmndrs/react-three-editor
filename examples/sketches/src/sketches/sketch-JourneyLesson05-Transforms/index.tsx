import { TransformControls } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import { AxesHelper } from 'three'
import { Canvas } from '../Canvas'

extend(AxesHelper)

const App = () => {
    return (
        <TransformControls>
            <mesh>
                <meshBasicMaterial color="#ff8888" />
                <boxGeometry args={[1, 1, 1]} />
            </mesh>
        </TransformControls>
    )
}

export default () => (
    <>
        <h1>Journey 05 - Transforms</h1>
        <Canvas camera={{ position: [3, 3, 3] }}>
            <App />
            <axesHelper scale={2} />
        </Canvas>
    </>
)
