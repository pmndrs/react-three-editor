import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Ref, RefObject, useRef } from 'react'
import { Group } from 'three'
import { Canvas } from '../Canvas'

const App = () => {
    const group = useRef(null) as RefObject<Group>
    const time = useRef(0)

    useFrame((_, delta) => {
        time.current += delta * 3

        if (group.current) {
            group.current.rotation.z = Math.sin(time.current) / 6
        }
    })

    return (
        <group ref={group as Ref<never>}>
            <Html
                transform
                style={{
                    fontSize: '2em',
                }}
            >
                👋
            </Html>
        </group>
    )
}

export default () => (
    <>
        <h1>Select a sketch...</h1>
        <Canvas>
            <App />
        </Canvas>
    </>
)
