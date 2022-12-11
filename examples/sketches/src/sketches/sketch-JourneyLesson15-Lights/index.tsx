import { Float, OrbitControls, Text } from '@react-three/drei'
import { Box, Flex } from '@react-three/flex'
import { useRef, useEffect } from 'react'
import { MagicMirror } from '../../components/MagicMirror'
import { Canvas } from '../Canvas'

const MIRROR_SIZE = [3, 3] as [number, number]

const Label = ({ children }: { children: string }) => (
    <Text color="white" position={[0, -2, 0]} fontSize={0.2}>
        {children}
    </Text>
)

const Scene = () => (
    <>
        <Float rotationIntensity={5}>
            <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </Float>
        <mesh rotation={[-(Math.PI / 2), 0, 0]} position={[0, -2, 0]}>
            <planeBufferGeometry args={[6, 6]} />
            <meshStandardMaterial color="white" />
        </mesh>
    </>
)

const AmbientLight = () => {
    return (
        <group>
            <MagicMirror fov={50} size={MIRROR_SIZE}>
                <Scene />
                <ambientLight color={0xff9999} intensity={0.5} />
            </MagicMirror>
            <Label>ambient light</Label>
        </group>
    )
}

const DirectionalLight = () => {
    const directionalLight = useRef<THREE.DirectionalLight>(null!)

    useEffect(() => {
        directionalLight.current.lookAt(0, 0, 0)
    }, [])

    return (
        <group>
            <MagicMirror fov={50} size={MIRROR_SIZE}>
                <Scene />
                <ambientLight intensity={0.05} />
                <directionalLight
                    ref={directionalLight}
                    position={[-3, 1, 2]}
                    intensity={0.5}
                    color={0xff9999}
                />
            </MagicMirror>
            <Label>directional light</Label>
        </group>
    )
}

const HemisphereLight = () => {
    return (
        <group>
            <MagicMirror fov={50} size={MIRROR_SIZE}>
                <Scene />
                <hemisphereLight intensity={0.5} color={0xff9999} />
            </MagicMirror>
            <Label>hemisphere light</Label>
        </group>
    )
}

const App = () => {
    return (
        <>
            <Flex
                width={9}
                height={5}
                centerAnchor
                flexDirection="row"
                flexWrap="wrap"
                justifyContent="center"
                alignItems="center"
            >
                <Box centerAnchor>
                    <AmbientLight />
                </Box>
                <Box centerAnchor>
                    <DirectionalLight />
                </Box>
                <Box centerAnchor>
                    <HemisphereLight />
                </Box>
            </Flex>
        </>
    )
}

export default () => (
    <>
        <h1>Journey 15 - Lights</h1>
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            <App />
            <OrbitControls />
        </Canvas>
    </>
)
