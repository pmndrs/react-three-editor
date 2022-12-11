import { Canvas as R3FCanvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { DebugTunnel } from '../DebugTunnel'
import { Loader } from '../Loader'

export const Canvas = ({ children, ...rest }: Parameters<typeof R3FCanvas>[0]) => (
    <Suspense fallback={<Loader />}>
        <R3FCanvas id="gl" {...rest}>
            {children}
            <DebugTunnel.Out />
        </R3FCanvas>
    </Suspense>
)
