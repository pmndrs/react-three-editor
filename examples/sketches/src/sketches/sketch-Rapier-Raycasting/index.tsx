import Rapier from '@dimforge/rapier3d-compat'
import { Line, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Debug, Physics, RigidBody, useRapier } from '@react-three/rapier'
import { useControls as useLevaControls } from 'leva'
import { useRef, useState } from 'react'
import { Group } from 'three'
import { Line2 } from 'three-stdlib'
import { Canvas } from '../Canvas'

const Shapes = {
    TORUS: 'TORUS',
    CUBE: 'CUBE',
    CYLINDER: 'CYLINDER',
} as const

type ShapeRapierUserData = {
    shape: typeof Shapes[keyof typeof Shapes]
}

const Scene = () => {
    const rapier = useRapier()

    const laserRef = useRef<Group>(null)
    const lineRef = useRef<Line2>(null)

    const [raycastHit, setRaycastHit] = useState<
        ShapeRapierUserData['shape'] | null
    >(null)

    useFrame(({ clock: { elapsedTime } }, delta) => {
        const laser = laserRef.current
        const line = lineRef.current
        if (!laser || !line) return

        laser.position.set(-2, Math.sin(elapsedTime * 1.2) * 2, 0)
        line.position.copy(laser.position)

        const world = rapier.world.raw()

        const raycastResult = world.castRay(
            new Rapier.Ray(laser.position, { x: 1, y: 0, z: 0 }),
            100,
            false
        )

        if (!raycastResult) {
            line.scale.x = 100
            if (raycastHit !== null) {
                setRaycastHit(null)
            }
        } else {
            line.scale.x = raycastResult.toi

            const rigidBody = raycastResult.collider.parent()
            if (!rigidBody) return

            const shape = (rigidBody.userData as ShapeRapierUserData)?.shape
            if (raycastHit !== shape) {
                setRaycastHit(shape)
            }
        }

        line.position.set(laser.position.x, laser.position.y, 0)
    })

    return (
        <>
            <group
                ref={laserRef}
                position={[-2, 0, 0]}
                rotation={[0, 0, -Math.PI / 2]}
            >
                <mesh>
                    <cylinderGeometry args={[0.15, 0.15, 1, 32]} />
                    <meshStandardMaterial color="#fff" />
                </mesh>
                <mesh position={[0, 0.6, 0]}>
                    <cylinderGeometry args={[0.15, 0.15, 0.2, 32]} />
                    <meshStandardMaterial color="#aaa" />
                </mesh>
                <pointLight intensity={1} />
            </group>

            <Line
                ref={lineRef}
                points={[
                    [0, 0, 0],
                    [1, 0, 0],
                ]}
                lineWidth={1}
                color="red"
            />

            <RigidBody
                colliders="cuboid"
                type="fixed"
                position={[1, 1.5, 0]}
                rotation={[Math.PI / 4, 0, 0]}
                userData={{ shape: Shapes.CUBE } as ShapeRapierUserData}
            >
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial
                        color={raycastHit === Shapes.CUBE ? 'red' : '#666'}
                    />
                </mesh>
            </RigidBody>

            <RigidBody
                colliders="trimesh"
                type="fixed"
                position={[2.5, 0, 0]}
                rotation={[0, -Math.PI / 3, 0]}
                userData={{ shape: Shapes.TORUS } as ShapeRapierUserData}
            >
                <mesh>
                    <torusGeometry args={[0.6, 0.25, 64, 64]} />
                    <meshStandardMaterial
                        color={raycastHit === Shapes.TORUS ? 'red' : '#666'}
                    />
                </mesh>
            </RigidBody>

            <RigidBody
                colliders="hull"
                type="fixed"
                position={[1, -1.5, 0]}
                rotation={[-Math.PI / 4, 0, -Math.PI / 3]}
                userData={{ shape: Shapes.CYLINDER } as ShapeRapierUserData}
            >
                <mesh>
                    <cylinderGeometry args={[0.5, 0.5, 1, 64]} />
                    <meshStandardMaterial
                        color={raycastHit === Shapes.CYLINDER ? 'red' : '#666'}
                    />
                </mesh>
            </RigidBody>
        </>
    )
}

export default () => {
    const { debug } = useLevaControls('rapier-raycasting', {
        debug: false,
    })
    return (
        <>
            <h1>Rapier - Raycasting</h1>
            <Canvas>
                <PerspectiveCamera
                    makeDefault
                    position={[-5, 0, 10]}
                    fov={60}
                />
                <OrbitControls />

                <ambientLight intensity={0.5} />

                <Physics gravity={[0, 0, 0]}>
                    <Scene />
                    {debug && <Debug />}
                </Physics>
            </Canvas>
        </>
    )
}
