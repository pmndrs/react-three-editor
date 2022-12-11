import { OrbitControls } from '@react-three/drei'
import { Box, Flex } from '@react-three/flex'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Canvas } from '../Canvas'

const padding = 1
const color = '#ff8888'

const Item = ({ children }: { children: JSX.Element }) => (
    <Box padding={padding} centerAnchor>
        <mesh>
            <meshStandardMaterial color={color} wireframe />
            {children}
        </mesh>
    </Box>
)

const App = () => {
    const directionalLight = useRef<THREE.DirectionalLight>(null!)

    useEffect(() => {
        directionalLight.current.lookAt(0, 0, 0)
    }, [])

    return (
        <>
            <directionalLight
                ref={directionalLight}
                intensity={0.5}
                position={[-3, 0, 5]}
            />
            <ambientLight intensity={0.5} />
            <Flex
                width={6}
                height={6}
                centerAnchor
                flexDirection="row"
                flexWrap="wrap"
            >
                <Item>
                    <sphereBufferGeometry args={[0.6]} />
                </Item>
                <Item>
                    <boxBufferGeometry args={[1, 1, 1]} />
                </Item>
                <Item>
                    <coneGeometry args={[0.7, 1, 5, 5]} />
                </Item>
                <Item>
                    <torusKnotBufferGeometry args={[0.4, 0.1]} />
                </Item>
                <Item>
                    <ringGeometry args={[0.3, 0.7]} />
                </Item>
                <Item>
                    <dodecahedronBufferGeometry args={[0.7]} />
                </Item>
                <Item>
                    <octahedronBufferGeometry args={[0.7]} />
                </Item>
                <Item>
                    <tetrahedronBufferGeometry args={[0.7]} />
                </Item>
                <Item>
                    <icosahedronBufferGeometry args={[0.7]} />
                </Item>
            </Flex>
        </>
    )
}

export default () => (
    <>
        <h1>Journey 09 - Geometries</h1>
        <Canvas
            camera={{ position: [0, 0, 10], fov: 60 }}
            gl={{ outputEncoding: THREE.sRGBEncoding }}
        >
            <App />
            <OrbitControls />
        </Canvas>
    </>
)
