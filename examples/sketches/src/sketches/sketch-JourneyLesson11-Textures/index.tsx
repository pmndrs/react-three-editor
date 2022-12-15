import { OrbitControls, useTexture } from '@react-three/drei'
import { useLoader } from '@react-three/fiber'
import * as THREE from 'three'
import { TextureLoader } from 'three'
import { Canvas } from '../Canvas'
import doorImage from './textures/door/color.jpg'
import minecraftImage from './textures/minecraft.png'

const App = () => {
    const doorTexture = useTexture(doorImage)
    const minecraftTexture = useTexture(minecraftImage)

    return (
        <>
            <mesh
                position={[2.161, -0.236, -6.091]}
                material-wireframe={true}
                rotation={[0, 0, 0]}
                scale={[1, 1, 1]}
            >
                <boxBufferGeometry args={[3, 3, 3]} />
                <meshBasicMaterial
                    map={doorTexture}
                    map-wrapS={THREE.MirroredRepeatWrapping}
                    map-wrapT={THREE.MirroredRepeatWrapping}
                    map-offset-x={-0.2}
                    map-offset-y={0.5}
                    map-rotation={Math.PI / 4}
                    wireframe={false}
                    color={'rgb(144, 96, 96)'}
                />
            </mesh>
            <mesh
                position={[6.899, 0, 0]}
                rotation={[0, -1.315, 0]}
                scale={[1, 1, 1]}
            >
                <boxBufferGeometry args={[3, 3, 3]} />
                <meshBasicMaterial
                    map={useLoader(
                        TextureLoader,
                        '/textures/9A446DEC-020D-4148-B17D-E0D89969511E.jpg'
                    )}
                    map-magFilter={THREE.NearestFilter}
                />
            </mesh>
        </>
    )
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
