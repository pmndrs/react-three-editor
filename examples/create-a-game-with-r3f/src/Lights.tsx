export default function Lights() {
    return <>
        <directionalLight castShadow position={[3.451, 4.277, -2.997]} intensity={1.5} shadow-mapSize={[1024, 1024]} shadow-camera-near={1} shadow-camera-far={10} shadow-camera-top={10} shadow-camera-right={10} shadow-camera-bottom={-10} shadow-camera-left={-10} />
        <ambientLight intensity={0.7} position={[-1.984, 3.006, 0.5]} color={"rgb(209, 179, 140)"} />
    </>;
}