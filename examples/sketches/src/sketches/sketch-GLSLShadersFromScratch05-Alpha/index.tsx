import { OrthographicCamera, useTexture } from '@react-three/drei'
import { Vector4 } from 'three'
import { Canvas } from '../Canvas'
import dogImage from './dog.jpeg'
import overlayImage from './overlay.png'

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

uniform sampler2D diffuse;
uniform sampler2D overlay;

void main() {
    vec4 diffuseSample = texture2D(diffuse, vUvs);
    vec4 overlaySample = texture2D(overlay, vUvs);
    gl_FragColor = mix(diffuseSample, overlaySample, overlaySample.w);
}
`

const App = () => {
    const dogTexture = useTexture(dogImage)
    const overlayTexture = useTexture(overlayImage)
    return (
        <mesh position={[0.5, 0.5, 0]}>
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={{
                    diffuse: { value: dogTexture },
                    overlay: { value: overlayTexture },
                    tint: { value: new Vector4(1, 0.5, 0.5) },
                }}
            />
            <planeBufferGeometry args={[1, 1]} />
        </mesh>
    )
}

export default () => (
    <>
        <h1>SFS 05 - Alpha</h1>
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
