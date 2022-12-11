import { OrbitControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import { useMemo, useRef } from 'react'
import { BufferGeometry, Color, BufferAttribute, AdditiveBlending } from 'three'
import { Canvas } from '../Canvas'

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uSize;
uniform float uSizeAttenuation;

attribute vec3 aRandomness;
attribute float aScale;

varying vec3 vColor;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Rotate
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
    angle += angleOffset;
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;
    modelPosition.xyz += aRandomness;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    gl_PointSize = uSize * aScale;
    gl_PointSize *= (uSizeAttenuation / - viewPosition.z);
    
    vColor = color;
}
`

const fragmentShader = /* glsl */ `
varying vec3 vColor;

void main() {
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength = 1.0 - strength;
    strength = pow(strength, 10.0);

    vec3 color = mix(vec3(0.0), vColor, strength);
    gl_FragColor = vec4(color, 1.0);
}

`

const App = () => {
    const getPixelRatio = useThree((state) => state.gl.getPixelRatio)

    const uTime = useRef({ value: 0 })

    const {
        count,
        size,
        sizeAttenuation,
        radiusRange,
        branches,
        randomness,
        randomnessPower,
        insideColor: insideColorHex,
        outsideColor: outsideColorHex,
    } = useControls('journey-29-animated-galaxy', {
        count: 200000,
        size: 20,
        sizeAttenuation: 1,
        radiusRange: 5,
        branches: 4,
        randomness: 0.2,
        randomnessPower: 3,
        insideColor: '#ffac93',
        outsideColor: '#6994ff',
    })

    useFrame(({ clock: { elapsedTime } }) => {
        uTime.current.value = elapsedTime
    })

    const deps = [
        count,
        size,
        sizeAttenuation,
        radiusRange,
        branches,
        randomness,
        randomnessPower,
        insideColorHex,
        outsideColorHex,
    ]

    const bufferGeometry = useMemo(() => {
        const geometry = new BufferGeometry()

        const position = new Float32Array(count * 3)
        const color = new Float32Array(count * 3)
        const aScale = new Float32Array(count)
        const aRandomness = new Float32Array(count * 3)

        const insideColor = new Color(insideColorHex)
        const outsideColor = new Color(outsideColorHex)

        for (let i = 0; i < count; i++) {
            const i3 = i * 3

            // Position
            const radius = Math.random() * radiusRange

            const branchAngle = ((i % branches) / branches) * Math.PI * 2

            position[i3] = Math.cos(branchAngle) * radius
            position[i3 + 1] = 0
            position[i3 + 2] = Math.sin(branchAngle) * radius

            const randomX =
                Math.pow(Math.random(), randomnessPower) *
                (Math.random() < 0.5 ? 1 : -1) *
                randomness *
                radius
            const randomY =
                Math.pow(Math.random(), randomnessPower) *
                (Math.random() < 0.5 ? 1 : -1) *
                randomness *
                radius
            const randomZ =
                Math.pow(Math.random(), randomnessPower) *
                (Math.random() < 0.5 ? 1 : -1) *
                randomness *
                radius

            aRandomness[i3] = randomX
            aRandomness[i3 + 1] = randomY
            aRandomness[i3 + 2] = randomZ

            // Color
            const mixedColor = insideColor.clone()
            mixedColor.lerp(outsideColor, radius / radiusRange)

            color[i3] = mixedColor.r
            color[i3 + 1] = mixedColor.g
            color[i3 + 2] = mixedColor.b

            // Scale
            const scale = Math.random()
            aScale[i3 / 3] = scale
        }

        geometry.setAttribute('position', new BufferAttribute(position, 3))
        geometry.setAttribute('color', new BufferAttribute(color, 3))
        geometry.setAttribute('aScale', new BufferAttribute(aScale, 1))
        geometry.setAttribute(
            'aRandomness',
            new BufferAttribute(aRandomness, 3)
        )

        return geometry
    }, deps)

    return (
        <>
            <color attach="background" args={[0x000000]} />
            <points key={deps.join('-')}>
                <shaderMaterial
                    depthWrite={false}
                    blending={AdditiveBlending}
                    vertexColors
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={{
                        uTime: uTime.current,
                        uSize: { value: size * getPixelRatio() },
                        uSizeAttenuation: { value: sizeAttenuation },
                    }}
                />
                <primitive attach="geometry" object={bufferGeometry} />
            </points>
        </>
    )
}

export default () => (
    <>
        <h1>Journey 29 - Animated Galaxy</h1>
        <Canvas camera={{ position: [2, 2, 2] }}>
            <App />
            <OrbitControls />
        </Canvas>
    </>
)
