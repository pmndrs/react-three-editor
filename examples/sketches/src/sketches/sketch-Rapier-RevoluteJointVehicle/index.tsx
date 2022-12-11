import Rapier from '@dimforge/rapier3d-compat'
import { useFrame, useThree } from '@react-three/fiber'
import {
    CuboidCollider,
    CylinderCollider,
    Debug,
    Physics,
    RigidBody,
    RigidBodyApi,
    RigidBodyProps,
    useRapier,
    Vector3Array,
} from '@react-three/rapier'
import { useControls as useLevaControls } from 'leva'
import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react'
import styled from 'styled-components'
import { Vector3, Vector3Tuple } from 'three'
import { DEG2RAD } from 'three/src/math/MathUtils'
import { Canvas } from '../Canvas'
import { useControls } from './use-controls'

const Controls = styled.div`
    position: absolute;
    bottom: 4em;
    left: 0;
    width: 100%;
    text-align: center;
    font-size: 2em;
    color: white;
    font-family: monospace;
    text-shadow: 2px 2px black;
`

const RAPIER_UPDATE_PRIORITY = -50
const BEFORE_RAPIER_UPDATE = RAPIER_UPDATE_PRIORITY + 1
const AFTER_RAPIER_UPDATE = RAPIER_UPDATE_PRIORITY - 1

const WHEEL_TO_CHASSIS_JOINT_STIFFNESS = 50000
const WHEEL_TO_CHASSIS_JOINT_DAMPING = 2500

type RevoluteJointVehicleWheelInfo = {
    /**
     * Whether the wheel is turned when steering
     */
    steered: boolean

    /**
     * Whether torque is applied to the wheel on accelerating
     */
    torque: boolean

    /**
     * Wheel rigid body
     */
    wheelRigidBody: RigidBodyApi

    /**
     * The joint to the axle if the wheel is steered, or the chassis if not
     */
    wheelJoint: Rapier.RevoluteImpulseJoint

    /**
     * Axle rigid body, or null if the wheel is not steered
     */
    axleRigidBody: RigidBodyApi | null

    /**
     * The joint from the wheel axle to the chassis, or null if the wheel is not steered
     */
    axleToChassisJoint: Rapier.RevoluteImpulseJoint | null
}

type RevoluteJointVehicleContext = {
    chassisRigidBody?: RigidBodyApi
    wheels: RevoluteJointVehicleWheelInfo[]
    steeredWheels: RevoluteJointVehicleWheelInfo[]
    torqueWheels: RevoluteJointVehicleWheelInfo[]
    registerChassis: (value: RigidBodyApi) => void
    unregisterChassis: () => void
    registerWheel: (value: RevoluteJointVehicleWheelInfo) => void
    unregisterWheel: (value: RevoluteJointVehicleWheelInfo) => void
}

const revoluteJointVehicleContext = createContext<RevoluteJointVehicleContext>(
    null!
)

type RevoluteJointVehicleProps = JSX.IntrinsicElements['group'] & {
    children: React.ReactNode
}

const RevoluteJointVehicle = ({
    children,
    ...groupProps
}: RevoluteJointVehicleProps) => {
    const [chassisRigidBody, setChassisRigidBody] = useState<RigidBodyApi>()
    const [wheels, setWheels] = useState<RevoluteJointVehicleWheelInfo[]>([])
    const [steeredWheels, setSteeredWheels] = useState<
        RevoluteJointVehicleWheelInfo[]
    >([])
    const [torqueWheels, setTorqueWheels] = useState<
        RevoluteJointVehicleWheelInfo[]
    >([])

    const camera = useThree((state) => state.camera)
    const currentCameraPosition = useRef(new Vector3(15, 15, 0))
    const currentCameraLookAt = useRef(new Vector3())

    const controls = useControls()

    useFrame(() => {
        // input
        let forward = 0
        let right = 0

        if (controls.current.forward) {
            forward += 50
        }
        if (controls.current.backward) {
            forward -= 50
        }

        if (controls.current.left) {
            right -= 15
        }
        if (controls.current.right) {
            right += 15
        }

        // wake wheels if input
        if (
            (chassisRigidBody?.raw().isSleeping && right !== 0) ||
            forward !== 0
        ) {
            wheels.forEach((wheel) => {
                wheel.wheelRigidBody.raw().wakeUp()
            })
        }

        // steering
        steeredWheels.forEach((wheel) => {
            const { axleToChassisJoint } = wheel
            if (axleToChassisJoint) {
                axleToChassisJoint.configureMotorPosition(
                    right * -1 * DEG2RAD,
                    WHEEL_TO_CHASSIS_JOINT_STIFFNESS,
                    WHEEL_TO_CHASSIS_JOINT_DAMPING
                )
            }
        })

        // acceleration
        torqueWheels.forEach((wheel) => {
            const { wheelJoint } = wheel
            wheelJoint.configureMotorVelocity(forward, 10)
        })
    }, BEFORE_RAPIER_UPDATE)

    useFrame((_, delta) => {
        if (!chassisRigidBody) {
            return
        }

        const t = 1.0 - Math.pow(0.01, delta)

        const idealOffset = new Vector3(0, 5, -10)
        idealOffset.applyQuaternion(chassisRigidBody.rotation())
        idealOffset.add(chassisRigidBody.translation())
        if (idealOffset.y < 0) {
            idealOffset.y = 0
        }

        const idealLookAt = new Vector3(0, 1, 0)
        idealLookAt.applyQuaternion(chassisRigidBody.rotation())
        idealLookAt.add(chassisRigidBody.translation())

        currentCameraPosition.current.lerp(idealOffset, t)
        currentCameraLookAt.current.lerp(idealLookAt, t)

        camera.position.copy(currentCameraPosition.current)
        camera.lookAt(currentCameraLookAt.current)
    }, AFTER_RAPIER_UPDATE)

    const registerChassis = (chassis: RigidBodyApi) =>
        setChassisRigidBody(chassis)

    const unregisterChassis = () => setChassisRigidBody(undefined)

    const registerWheel = (wheel: RevoluteJointVehicleWheelInfo) => {
        setWheels((v) => [...v, wheel])
        if (wheel.torque) {
            setTorqueWheels((v) => [...v, wheel])
        }
        if (wheel.steered) {
            setSteeredWheels((v) => [...v, wheel])
        }
    }

    const unregisterWheel = (wheel: RevoluteJointVehicleWheelInfo) => {
        setWheels((v) => v.filter((w) => w !== wheel))
        setTorqueWheels((v) => v.filter((w) => w !== wheel))
        setSteeredWheels((v) => v.filter((w) => w !== wheel))
    }

    return (
        <>
            <revoluteJointVehicleContext.Provider
                value={{
                    chassisRigidBody,
                    wheels,
                    steeredWheels,
                    torqueWheels,
                    registerChassis,
                    unregisterChassis,
                    registerWheel,
                    unregisterWheel,
                }}
            >
                <group {...groupProps}>{children}</group>
            </revoluteJointVehicleContext.Provider>
        </>
    )
}

const WheelColliderAndMesh: React.FC = () => (
    <>
        <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.3, 0.3, 0.3, 32]} />
            <meshStandardMaterial color="#666" />
        </mesh>

        <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.301, 0.301, 0.3, 8]} />
            <meshStandardMaterial color="#000" wireframe />
        </mesh>

        <CylinderCollider
            mass={1}
            friction={1.5}
            args={[0.15, 0.3]}
            rotation={[0, 0, Math.PI / 2]}
        />
    </>
)

const vectorArrayToVector3 = ([x, y, z]: Vector3Tuple): Rapier.Vector3 =>
    new Rapier.Vector3(x, y, z)

const addVector3Arrays = (a: Vector3Array, b: Vector3Array): Vector3Array => [
    a[0] + b[0],
    a[1] + b[1],
    a[2] + b[2],
]

type RevoluteJointVehicleWheelProps = RigidBodyProps & {
    side: 'left' | 'right'
    anchor: Vector3Array
    children?: React.ReactNode
    steered?: boolean
    torque?: boolean
}

const RevoluteJointVehicleWheel = ({
    children,
    side,
    anchor,
    steered = false,
    torque = false,
    ...rigidBodyProps
}: RevoluteJointVehicleWheelProps) => {
    const { world, rapier } = useRapier()
    const vehicleContext = useContext(revoluteJointVehicleContext)

    const wheelRigidBody = useRef<RigidBodyApi | null>(null)
    const axleRigidBody = useRef<RigidBodyApi | null>(null)

    useEffect(() => {
        if (!wheelRigidBody.current || !vehicleContext.chassisRigidBody) {
            return
        }

        // wheel joint - to axle if steered, otherwise to chassis
        const wheelJoint = world.createImpulseJoint(
            rapier.JointData.revolute(
                vectorArrayToVector3(
                    steered ? axleOffset : addVector3Arrays(anchor, axleOffset)
                ),
                vectorArrayToVector3([0, 0, 0]),
                vectorArrayToVector3([1, 0, 0])
            ),
            world.getRigidBody(
                steered
                    ? axleRigidBody.current!.handle
                    : vehicleContext.chassisRigidBody!.handle
            )!,
            world.getRigidBody(wheelRigidBody.current.handle)!
        ) as Rapier.RevoluteImpulseJoint

        wheelJoint.setContactsEnabled(false)
        wheelJoint.configureMotorModel(Rapier.MotorModel.AccelerationBased)

        // axle joint, if wheel is steered
        let axleToChassisJoint: Rapier.RevoluteImpulseJoint | null = null
        if (steered) {
            axleToChassisJoint = world.createImpulseJoint(
                rapier.JointData.revolute(
                    vectorArrayToVector3(anchor),
                    vectorArrayToVector3([0, 0, 0]),
                    vectorArrayToVector3([0, 1, 0])
                ),
                world.getRigidBody(vehicleContext.chassisRigidBody!.handle)!,
                world.getRigidBody(axleRigidBody.current!.handle)!
            ) as Rapier.RevoluteImpulseJoint

            axleToChassisJoint.setContactsEnabled(false)
            axleToChassisJoint.configureMotorModel(Rapier.MotorModel.ForceBased)
        }

        const wheel: RevoluteJointVehicleWheelInfo = {
            steered,
            torque,
            wheelRigidBody: wheelRigidBody.current,
            wheelJoint,
            axleRigidBody: axleRigidBody.current,
            axleToChassisJoint,
        }

        vehicleContext.registerWheel(wheel)

        return () => {
            vehicleContext.unregisterWheel(wheel)

            world.removeImpulseJoint(wheelJoint)
            if (axleToChassisJoint) {
                world.removeImpulseJoint(axleToChassisJoint)
            }
        }
    }, [wheelRigidBody, axleRigidBody, vehicleContext.chassisRigidBody])

    const axleOffset: Vector3Array = [0.2 * (side === 'left' ? -1 : 1), 0, 0]

    return (
        <>
            {/* wheel rigid body */}
            <RigidBody
                {...rigidBodyProps}
                ref={wheelRigidBody}
                colliders={false}
                position={
                    !steered ? anchor : addVector3Arrays(anchor, axleOffset)
                }
            >
                {/* wheel colliders */}
                {children}
            </RigidBody>

            {/* wheel axle */}
            {steered ? (
                <RigidBody
                    ref={axleRigidBody}
                    colliders={false}
                    position={addVector3Arrays(anchor, axleOffset)}
                >
                    <CuboidCollider mass={1} args={[0.03, 0.03, 0.03]} />
                </RigidBody>
            ) : undefined}
        </>
    )
}

type RevoluteJointVehicleChassisProps = RigidBodyProps & {
    children?: React.ReactNode
}

const RevoluteJointVehicleChassis = ({
    children,
    ...rigidBodyProps
}: RevoluteJointVehicleChassisProps) => {
    const vehicleContext = useContext(revoluteJointVehicleContext)
    const [chassisRigidBody, setChassisRigidBody] =
        useState<RigidBodyApi | null>()

    useEffect(() => {
        if (!chassisRigidBody) return

        vehicleContext.registerChassis(chassisRigidBody!)

        return () => {
            vehicleContext.unregisterChassis()
        }
    }, [chassisRigidBody])

    return (
        <>
            <RigidBody
                {...rigidBodyProps}
                ref={setChassisRigidBody}
                type="dynamic"
                colliders={false}
            >
                {children}
            </RigidBody>
        </>
    )
}

const Scene = () => (
    <>
        {/* boxes */}
        {Array.from({ length: 6 }).map((_, idx) => (
            <RigidBody key={idx} colliders="cuboid" mass={0.2}>
                <mesh position={[Math.floor(idx / 2) - 1, 3 + idx * 2.5, 20]}>
                    <boxGeometry args={[1, 2, 1]} />
                    <meshNormalMaterial />
                </mesh>
            </RigidBody>
        ))}

        {/* ramp */}
        <RigidBody type="fixed">
            <mesh rotation-x={-0.2} position={[0, -1, 15]}>
                <boxGeometry args={[5, 1, 5]} />
                <meshStandardMaterial color="#888" />
            </mesh>
        </RigidBody>

        {/* ground */}
        <RigidBody type="fixed" friction={2} position-y={-2}>
            <mesh>
                <boxGeometry args={[150, 2, 150]} />
                <meshStandardMaterial color="#ccc" />
            </mesh>
        </RigidBody>
        <gridHelper args={[150, 15]} position-y={-0.99} />

        {/* lights */}
        <ambientLight intensity={1} />
        <pointLight intensity={0.5} position={[0, 5, 5]} />
    </>
)

const RapierConfiguration = () => {
    const rapier = useRapier()

    useEffect(() => {
        const world = rapier.world.raw()

        if (!world) return

        world.maxStabilizationIterations = 100
        world.maxVelocityFrictionIterations = 100
        world.maxVelocityIterations = 100
    }, [])

    return null
}

export default () => {
    const { debug } = useLevaControls('rapier-revolute-joint-vehicle', {
        debug: false,
    })
    return (
        <>
            <h1>Rapier - Revolute Joint Vehicle</h1>
            <Canvas camera={{ fov: 60, position: [30, 30, 0] }}>
                <Physics
                    gravity={[0, -9.81, 0]}
                    updatePriority={RAPIER_UPDATE_PRIORITY}
                >
                    <RevoluteJointVehicle position={[0, 3, 0]}>
                        <RevoluteJointVehicleChassis>
                            <mesh>
                                <boxGeometry args={[1, 0.8, 2.5]} />
                                <meshStandardMaterial color="#333" />
                            </mesh>
                            <CuboidCollider mass={1} args={[0.5, 0.4, 1.25]} />
                        </RevoluteJointVehicleChassis>

                        {/* top left wheel */}
                        <RevoluteJointVehicleWheel
                            anchor={[-0.75, -0.4, 1.2]}
                            side="left"
                            steered
                        >
                            <WheelColliderAndMesh />
                        </RevoluteJointVehicleWheel>

                        {/* top right wheel */}
                        <RevoluteJointVehicleWheel
                            anchor={[0.75, -0.4, 1.2]}
                            side="right"
                            steered
                        >
                            <WheelColliderAndMesh />
                        </RevoluteJointVehicleWheel>

                        {/* back left wheel */}
                        <RevoluteJointVehicleWheel
                            anchor={[-0.75, -0.4, -1.2]}
                            side="left"
                            torque
                        >
                            <WheelColliderAndMesh />
                        </RevoluteJointVehicleWheel>

                        {/* back right wheel */}
                        <RevoluteJointVehicleWheel
                            anchor={[0.75, -0.4, -1.2]}
                            side="right"
                            torque
                        >
                            <WheelColliderAndMesh />
                        </RevoluteJointVehicleWheel>
                    </RevoluteJointVehicle>

                    <Scene />
                    {debug && <Debug />}
                    <RapierConfiguration />
                </Physics>
            </Canvas>
            <Controls>use wasd to drive</Controls>
        </>
    )
}
