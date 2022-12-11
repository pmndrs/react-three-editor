import type { MutableRefObject } from 'react'
import { useEffect, useRef } from 'react'

const keyControlMap = {
    ArrowDown: 'backward',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'forward',
    a: 'left',
    d: 'right',
    s: 'backward',
    w: 'forward',
    A: 'left',
    D: 'right',
    S: 'backward',
    W: 'forward',
    " ": 'brake',
} as const

type KeyCode = keyof typeof keyControlMap
type GameControl = typeof keyControlMap[KeyCode]

const keyCodes = Object.keys(keyControlMap) as KeyCode[]
const isKeyCode = (v: unknown): v is KeyCode => keyCodes.includes(v as KeyCode)

export type Controls = Record<GameControl, boolean>

const useKeyControls = (
    { current }: MutableRefObject<Controls>,
    map: Record<KeyCode, GameControl>
) => {
    useEffect(() => {
        const handleKeydown = ({ key }: KeyboardEvent) => {
            if (!isKeyCode(key)) return
            current[map[key]] = true
        }
        window.addEventListener('keydown', handleKeydown)

        const handleKeyup = ({ key }: KeyboardEvent) => {
            if (!isKeyCode(key)) return
            current[map[key]] = false
        }
        window.addEventListener('keyup', handleKeyup)
        
        return () => {
            window.removeEventListener('keydown', handleKeydown)
            window.removeEventListener('keyup', handleKeyup)
        }
    }, [current, map])
}

export const useControls = () => {
    const controls = useRef<Controls>({
        backward: false,
        forward: false,
        left: false,
        right: false,
        brake: false,
    })

    useKeyControls(controls, keyControlMap)

    return controls
}
