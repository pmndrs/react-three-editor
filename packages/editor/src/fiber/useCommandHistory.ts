import { useContext } from "react"
import { CommandHistoryContext } from "./contexts"

export const useCommandHistory = ( ) => {
    const commandHistory = useContext( CommandHistoryContext )
    if ( !commandHistory ) {
        throw new Error('useCommandHistory should be used within CommandHistoryProvider')
    }
    return commandHistory
}
