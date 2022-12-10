import React, { FC, PropsWithChildren, useState } from "react";
import { CommandHistory } from "./command-manager";
import { CommandHistoryContext } from "./contexts";

export type CommandHistoryProviderProps = PropsWithChildren<{}>

export const CommandHistoryProvider: FC<CommandHistoryProviderProps> = ( { children } ) => {
    const [commandHistory] = useState(() => new CommandHistory())
    return (
        <CommandHistoryContext.Provider value={commandHistory}>
            {children}
        </CommandHistoryContext.Provider>
    )
}
