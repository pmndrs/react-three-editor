import { OrbitControls, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { Canvas } from '../Canvas'
import doorImage from './textures/door/color.jpg'
import minecraftImage from './textures/minecraft.png'

const App = () => {
    const doorTexture = useTexture(doorImage)
    const minecraftTexture = useTexture(minecraftImage)

    return (
        <>
            <mesh position={[-3.834, -1.099, 0]} material-wireframe={true}>
                <boxBufferGeometry args={[3, 3, 3]} />
                <meshBasicMaterial map={doorTexture} map-wrapS={THREE.MirroredRepeatWrapping} map-wrapT={THREE.MirroredRepeatWrapping} map-offset-x={-0.2} map-offset-y={0.5} map-rotation={Math.PI / 4} wireframe={false} color={"rgb(144, 96, 96)"} />
            </mesh>
            <mesh position={[6.899, 0, 0]}>
                <boxBufferGeometry args={[3, 3, 3]} />
                <meshBasicMaterial
                    map={minecraftTexture}
                    map-magFilter={THREE.NearestFilter}
                />
            </mesh>
        </>
    );
}

export default () => (
    <>
        <h1>Journey 11 - Textures</h1>
        <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
            <App />
            <OrbitControls makeDefault={true} />
        </Canvas>
    </>
)
