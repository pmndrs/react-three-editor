import { Billboard, Float, Text } from '@react-three/drei'
import { Canvas } from '../Canvas'
import NotoEmojiRegular from './NotoEmoji-Regular.ttf'

const Balloons = () => {
    return (
        <>
            {Array.from({ length: 10 }).map((_, idx) => (
                <Float key={idx} floatIntensity={1} rotationIntensity={2}>
                    <Text
                        fontSize={2}
                        font={NotoEmojiRegular}
                        scale={0.5}
                        position={[0, 0, -idx * 2]}
                    >
                        🎈
                        <meshNormalMaterial />
                    </Text>
                </Float>
            ))}
        </>
    )
}

const Tadas = () => {
    return (
        <>
            {Array.from({ length: 10 }).map((_, idx) => (
                <Float key={idx} floatIntensity={1} rotationIntensity={2}>
                    <Text
                        fontSize={2}
                        font={NotoEmojiRegular}
                        scale={[0.5, 0.5, 0.5]}
                        position={[6.869, -0.325, -5.568]}
                    >
                        🎉
                        <meshNormalMaterial />
                    </Text>
                </Float>
            ))}
        </>
    );
}

const Confettis = () => {
    return (
        <>
            {Array.from({ length: 10 }).map((_, idx) => (
                <Float key={idx} floatIntensity={1} rotationIntensity={2}>
                    <Text
                        fontSize={2}
                        font={NotoEmojiRegular}
                        scale={0.5}
                        position={[2.5, 0, -idx * 2]}
                    >
                        🎊
                        <meshNormalMaterial />
                    </Text>
                </Float>
            ))}
        </>
    )
}

export default () => {
    return (
        <>
            <h1>Journey 13 - Text</h1>
            <Canvas camera={{ position: [0, 2, 5] }}>
                <Float>
                    <Billboard follow>
                        <Text fontSize={0.5} position={[-0.019, 1.383, 1.555]}>
                            Yeeeew!
                        </Text>
                    </Billboard>
                </Float>

                <Tadas />
                <Balloons />
                <Confettis />
            </Canvas>
        </>
    )
}
