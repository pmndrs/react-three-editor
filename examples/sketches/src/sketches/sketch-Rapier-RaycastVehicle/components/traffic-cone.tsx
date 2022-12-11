import { RigidBody } from '@react-three/rapier'

export const TrafficCone = (props: JSX.IntrinsicElements['group']) => {
    return (
        <group {...props}>
            <RigidBody colliders="cuboid">
                <mesh position-y={-0.5} castShadow receiveShadow>
                    <boxGeometry args={[0.8, 0.1, 0.8]} />
                    <meshStandardMaterial color="orange" />
                </mesh>
                <mesh castShadow receiveShadow>
                    <cylinderGeometry args={[0.1, 0.3, 1, 32]} />
                    <meshStandardMaterial color="orange" />
                </mesh>
                <mesh position-y={-0.1} castShadow receiveShadow>
                    <cylinderGeometry args={[0.215, 0.235, 0.1, 32]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            </RigidBody>
        </group>
    )
}
