export default function Lights()
{
    return <>
        <directionalLight
            castShadow
            position={[0.491, 3.82, -2.037]}
            intensity={ 1.5 }
            shadow-mapSize={ [ 1024, 1024 ] }
            shadow-camera-near={ 1 }
            shadow-camera-far={ 10 }
            shadow-camera-top={ 10 }
            shadow-camera-right={ 10 }
            shadow-camera-bottom={ - 10 }
            shadow-camera-left={ - 10 }
        />
        <ambientLight intensity={0.7} position={[0, 8.058, 0]} color={"rgb(209, 179, 140)"} />
    </>;
}