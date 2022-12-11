import { OrbitControls } from '@react-three/drei'
import { useControls } from 'leva'
import { useMemo } from 'react'
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color } from 'three'
import { Canvas } from '../Canvas'

const App = () => {
    const parameters = useControls('journey-19-galaxy-generator', {
        branches: 8,
        count: 200000,
        radius: 8,
        size: 0.02,
        spin: 0.6,
        randomness: 0.8,
        randomnessPower: 3,
        insideColor: '#834141',
        outsideColor: '#28195c',
    })

    const bufferGeometry = useMemo(() => {
        const geo = new BufferGeometry()

        const positions = new Float32Array(parameters.count * 3)
        const colors = new Float32Array(parameters.count * 3)

        const insideColor = new Color(parameters.insideColor)
        const outsideColor = new Color(parameters.outsideColor)

        const mixedColor = new Color()

        for (let i = 0; i < parameters.count; i++) {
            const i3 = i * 3

            const radius = Math.random() * parameters.radius
            const spinAngle = radius * parameters.spin
            const branchAngle =
                ((i % parameters.branches) / parameters.branches) * Math.PI * 2

            const randomX =
                Math.pow(
                    Math.random() * parameters.randomness,
                    parameters.randomnessPower
                ) * (Math.random() - 0.5 > 0 ? 1 : -1)
            const randomY =
                Math.pow(
                    Math.random() * parameters.randomness,
                    parameters.randomnessPower
                ) * (Math.random() - 0.5 > 0 ? 1 : -1)
            const randomZ =
                Math.pow(
                    Math.random() * parameters.randomness,
                    parameters.randomnessPower
                ) * (Math.random() - 0.5 > 0 ? 1 : -1)

            positions[i3] = randomX + Math.cos(branchAngle + spinAngle) * radius
            positions[i3 + 1] = randomY
            positions[i3 + 2] =
                randomZ + Math.sin(branchAngle + spinAngle) * radius

            mixedColor.copy(insideColor)
            mixedColor.lerp(outsideColor, radius / parameters.radius)

            colors[i3] = mixedColor.r
            colors[i3 + 1] = mixedColor.g
            colors[i3 + 2] = mixedColor.b
        }

        geo.setAttribute('position', new BufferAttribute(positions, 3))
        geo.setAttribute('color', new BufferAttribute(colors, 3))

        return geo
    }, [parameters])

    return (
        <>
            <points>
                <pointsMaterial
                    size={parameters.size}
                    sizeAttenuation={true}
                    vertexColors
                    blending={AdditiveBlending}
                    depthWrite={false}
                />
                <primitive attach="geometry" object={bufferGeometry} />
            </points>
        </>
    )
}

export default () => (
    <>
        <h1>Journey 19 - Galaxy Generator</h1>
        <Canvas camera={{ position: [0, 15, 8] }}>
            <App />
            <OrbitControls target={[0, -2, 0]} />
        </Canvas>
    </>
)
