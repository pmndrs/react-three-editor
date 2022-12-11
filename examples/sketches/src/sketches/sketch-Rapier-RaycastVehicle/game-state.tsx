import { createContext, ReactNode, useContext, useState } from 'react'

export type GameState = {
    displayMode: 'drive' | 'editor'
}

export type GameStateContext = {
    state: GameState
    setState: (state: GameState | ((state: GameState) => GameState)) => void
}

const gameStateContext = createContext<GameStateContext>(null!)

const defaultGameState: GameState = { displayMode: 'drive' }

export type GameStateProviderProps = { children: ReactNode }

export const GameStateProvider = (props: GameStateProviderProps) => {
    const [state, setState] = useState(defaultGameState)

    return (
        <gameStateContext.Provider value={{ state, setState }}>
            {props.children}
        </gameStateContext.Provider>
    )
}

export const useGameState = (): GameState => {
    return useContext(gameStateContext).state
}

export const useGameStateDispatch = () => {
    const { setState } = useContext(gameStateContext)

    const setDisplayMode = (mode: GameState['displayMode']) => {
        setState((state) => ({ ...state, displayMode: mode }))
    }

    return {
        setDisplayMode,
    }
}
