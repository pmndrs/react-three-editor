import { Box, useGLTF } from '@react-three/drei'
import {
    forwardRef,
    RefObject,
    useImperativeHandle,
    useRef,
    useState,
} from 'react'
import {
    Mesh,
    MeshStandardMaterial,
    BoxBufferGeometry,
    Group,
    Object3D,
} from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import chassisDracoUrl from '../assets/chassis-draco.glb?url'

interface ChassisGLTF extends GLTF {
    nodes: {
        Chassis_1: Mesh
        Chassis_2: Mesh
        Glass: Mesh
        BrakeLights: Mesh
        HeadLights: Mesh
        Cabin_Grilles: Mesh
        Undercarriage: Mesh
        TurnSignals: Mesh
        Chrome: Mesh
        Wheel_1: Mesh
        Wheel_2: Mesh
        License_1: Mesh
        License_2: Mesh
        Cube013: Mesh
        Cube013_1: Mesh
        Cube013_2: Mesh
        'pointer-left': Mesh
        'pointer-right': Mesh
    }
    materials: {
        BodyPaint: MeshStandardMaterial
        License: MeshStandardMaterial
        Chassis_2: MeshStandardMaterial
        Glass: MeshStandardMaterial
        BrakeLight: MeshStandardMaterial
        defaultMatClone: MeshStandardMaterial
        HeadLight: MeshStandardMaterial
        Black: MeshStandardMaterial
        Undercarriage: MeshStandardMaterial
        TurnSignal: MeshStandardMaterial
    }
}

type MaterialMesh = Mesh<BoxBufferGeometry, MeshStandardMaterial>

export type ChassisRef = {
    glass: RefObject<MaterialMesh>
    brake: RefObject<MaterialMesh>
    wheel: RefObject<Group>
    needle: RefObject<MaterialMesh>
    chassis_1: RefObject<MaterialMesh>
    group: RefObject<Group>
}
export const Chassis = forwardRef<ChassisRef, JSX.IntrinsicElements['group']>(
    ({ children, ...props }, ref) => {
        const { nodes: n, materials: m } = useGLTF(
            chassisDracoUrl
        ) as ChassisGLTF

        const group = useRef<Group>(null!)
        const glass = useRef<MaterialMesh>(null!)
        const brake = useRef<MaterialMesh>(null!)
        const wheel = useRef<Group>(null)
        const needle = useRef<MaterialMesh>(null!)
        const chassis_1 = useRef<MaterialMesh>(null!)

        const [leftHeadlightsTarget] = useState(() => {
            const object = new Object3D()
            object.position.set(0.8, 0.5, 4)
            return object
        })
        const [rightHeadlightsTarget] = useState(() => {
            const object = new Object3D()
            object.position.set(-0.8, 0.5, 4)
            return object
        })

        useImperativeHandle(ref, () => ({
            group,
            glass,
            brake,
            wheel,
            needle,
            chassis_1,
        }))

        return (
            <group {...props} ref={group} dispose={null}>
                <group>
                    <mesh
                        ref={chassis_1}
                        castShadow
                        receiveShadow
                        geometry={n.Chassis_1.geometry}
                        material={m.BodyPaint}
                        material-color="#f0c050"
                    />
                    <mesh
                        castShadow
                        geometry={n.Chassis_2.geometry}
                        material={n.Chassis_2.material}
                        material-color="#353535"
                    />
                    <mesh
                        castShadow
                        ref={glass}
                        geometry={n.Glass.geometry}
                        material={m.Glass}
                        material-transparent
                    />
                    <mesh
                        ref={brake}
                        geometry={n.BrakeLights.geometry}
                        material={m.BrakeLight}
                        material-transparent
                    />
                    <mesh
                        geometry={n.HeadLights.geometry}
                        material={m.HeadLight}
                    />
                    <mesh
                        geometry={n.Cabin_Grilles.geometry}
                        material={m.Black}
                    />
                    <mesh
                        geometry={n.Undercarriage.geometry}
                        material={m.Undercarriage}
                    />
                    <mesh
                        geometry={n.TurnSignals.geometry}
                        material={m.TurnSignal}
                    />
                    <mesh
                        geometry={n.Chrome.geometry}
                        material={n.Chrome.material}
                    />
                    <group ref={wheel} position={[0.37, 0.25, 0.46]}>
                        <mesh
                            geometry={n.Wheel_1.geometry}
                            material={n.Wheel_1.material}
                        />
                        <mesh
                            geometry={n.Wheel_2.geometry}
                            material={n.Wheel_2.material}
                        />
                    </group>
                    <group position={[0, 0, 0]}>
                        <mesh
                            geometry={n.License_1.geometry}
                            material={m.License}
                        />
                        <mesh
                            geometry={n.License_2.geometry}
                            material={n.License_2.material}
                        />
                    </group>
                    <group
                        position={[0.2245, 0.3045, 0.6806]}
                        scale={[0.0594, 0.0594, 0.0594]}
                    >
                        <mesh
                            geometry={n.Cube013.geometry}
                            material={n.Cube013.material}
                        />
                        <mesh
                            geometry={n.Cube013_1.geometry}
                            material={n.Cube013_1.material}
                        />
                        <mesh
                            geometry={n.Cube013_2.geometry}
                            material={n.Cube013_2.material}
                        />
                    </group>
                    <mesh
                        geometry={n['pointer-left'].geometry}
                        material={n['pointer-left'].material}
                        position={[0.5107, 0.3045, 0.6536]}
                        rotation={[Math.PI / 2, -1.1954, 0]}
                        scale={[0.0209, 0.0209, 0.0209]}
                    />
                    <mesh
                        ref={needle}
                        geometry={n['pointer-right'].geometry}
                        material={n['pointer-right'].material}
                        position={[0.2245, 0.3045, 0.6536]}
                        rotation={[-Math.PI / 2, -0.9187, Math.PI]}
                        scale={[0.0209, 0.0209, 0.0209]}
                    />
                </group>
                {children}
            </group>
        )
    }
)
