import { OrthographicCamera } from '@react-three/drei'
import { Vector4 } from 'three'
import { Canvas } from '../Canvas'

const vertexShader = /* glsl */ `
varying vec2 vUvs;

void main() {
    vec4 localPosition = vec4(position, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * localPosition;
    vUvs = uv;
}
`

const fragmentShader = /* glsl */ `
varying vec2 vUvs;
uniform vec4 color1;
uniform vec4 color2;

void main() {
    gl_FragColor = mix(
        color1,
        color2,
        vUvs.x
    );
}
`

const App = () => {
    return (
        <mesh position={[0.5, 0.5, 0]}>
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={{
                    color1: { value: new Vector4(1, 1, 0, 1) },
                    color2: { value: new Vector4(0, 1, 1, 1) },
                }}
            />
            <planeGeometry args={[1, 1]} />
        </mesh>
    )
}

export default () => (
    <>
        <h1>SFS 02 - Uniforms</h1>
        <Canvas>
            <App />
            <OrthographicCamera
                makeDefault
                manual
                top={1}
                bottom={0}
                left={0}
                right={1}
                near={0.1}
                far={1000}
                position={[0, 0, 0.5]}
            />
        </Canvas>
    </>
)
