import { createStore, Store } from "@editable-jsx/state"
import { Icon } from "@editable-jsx/ui"
import { Command } from "cmdk"
import {
  createContext,
  FC,
  KeyboardEvent,
  useCallback,
  useContext
} from "react"
import {
  CommandManager,
  CommandType,
  useCommandManager
} from "./CommandManager"
import { commandBarTunnel } from "./tunnel"

export const CommandBarContext = createContext({} as CommandBarManager)

export function useCommandBar() {
  return useContext(CommandBarContext)
}

export type CommandBarProps = {}

export type CommandBarState = {
  open: boolean
  activeCommandChain: string[]
  filter: string
}

export class CommandBarManager {
  store: Store<CommandBarState> = createStore("command-store", (_) => {
    return {
      open: false,
      activeCommandChain: [],
      filter: ""
    }
  })

  /**
   * useStore hook to consume store state in react components
   */
  useStore = this.store

  constructor(public context: any, public manager: CommandManager) {}

  get filter() {
    return this.useStore.getState().filter
  }

  set filter(value: string) {
    this.store.setState((state) => {
      return {
        ...state,
        filter: value
      }
    })
  }

  toggle(flag?: boolean) {
    this.store.setState((state) => {
      if (typeof flag !== "boolean") {
        flag = !state.open
      }
      return {
        ...state,
        filter: !flag ? "" : state.filter,
        activeCommandChain: !flag ? [] : state.activeCommandChain,
        open: flag
      }
    })
  }

  openCommandGroup(name: string) {
    this.store.setState((state) => {
      let activeCommandChain = [...state.activeCommandChain]
      if (this.manager.has(name)) {
        activeCommandChain.push(name)
      }
      return {
        ...state,
        filter: "",
        activeCommandChain
      }
    })
  }

  closeCommandGroup(name?: string) {
    this.store.setState((state) => {
      let activeCommandChain = [...state.activeCommandChain]
      if (name) {
        const index = activeCommandChain.indexOf(name)
        if (index > -1) {
          activeCommandChain = activeCommandChain.splice(
            index,
            activeCommandChain.length
          )
        }
      } else {
        activeCommandChain.pop()
      }

      return {
        ...state,
        filter: "",
        activeCommandChain
      }
    })
  }
}

const CommandChain: FC = () => {
  const commandBar = useCommandBar()
  const activeCommandChain = commandBar.useStore(
    ({ activeCommandChain }) => activeCommandChain
  )
  return (
    <div
      style={{
        marginLeft: 8
      }}
    >
      {activeCommandChain.map((n) => {
        return (
          <div key={n} cmdk-vercel-badge="">
            {n}
          </div>
        )
      })}
    </div>
  )
}

const CommandInput: FC = () => {
  const commandBar = useCommandBar()

  const filter = commandBar.useStore((state) => state.filter)
  const onInputValueChange = useCallback((filter: string) => {
    commandBar.filter = filter
  }, [])

  return (
    <Command.Input
      autoFocus
      placeholder="Search for apps and commands..."
      value={filter}
      onValueChange={onInputValueChange}
    />
  )
}

const selectActiveCommands = (
  editor: CommandManager,
  state: CommandBarState
): CommandType[] => {
  const folderChain = state.activeCommandChain
  if (folderChain.length) {
    return Object.values(editor.store.getState().commands).filter(
      (c) => c.parentId === folderChain[folderChain.length - 1]
    )
  } else {
    return Object.values(editor.store.getState().commands).filter(
      (c) => typeof c.parentId === "undefined" || c.parentId === null
    )
  }
}

function CommanderBar() {
  const manager = useCommandManager()
  const commands = useCommandBar().useStore((state) =>
    selectActiveCommands(manager, state)
  )

  return (
    <commandBarTunnel.In>
      <div cmdk-raycast-top-shine="" />
      <CommandChain />
      <CommandInput />
      <hr cmdk-raycast-loader="" />
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        {(commands ?? []).map((command) => {
          if (command.render && !command.render(manager.context)) return null
          return <CommandItem key={command.name} command={command} />
        })}
      </Command.List>
    </commandBarTunnel.In>
  )
}

type CommandProps = {
  command: CommandType
  onSelect?(command: CommandType): void
}

export const CommandItem: FC<CommandProps> = ({
  command,
  onSelect: _onSelect
}) => {
  const { icon, description, render, shortcut } = command
  const commandBar = useCommandBar()
  const manager = useCommandManager()

  const onSelect = useCallback(() => {
    if (Array.isArray(command.subcommands) && command.subcommands.length) {
      commandBar.openCommandGroup(command.name)
      _onSelect?.(command)
    } else {
      commandBar.toggle(false)
      _onSelect?.(command)
      command.execute?.(manager.context)
    }
  }, [_onSelect, command, manager.context, commandBar])

  if (render && !render(manager.context)) return null

  return (
    <Command.Item value={command.name} onSelect={onSelect}>
      {typeof icon === "function" ? (
        icon(manager.context)
      ) : typeof icon == "string" ? (
        <Icon icon={icon} />
      ) : null}
      {typeof description === "function"
        ? description(manager.context)
        : description || command.name}
      <div cmdk-raycast-meta="" cmdk-raycast-submenu-shortcuts="">
        {shortcut?.map((key, i) => (
          <kbd key={`${i}`}>
            {key === "meta" ? "⌘" : key === "shift" ? "⇧" : key.toUpperCase()}
          </kbd>
        ))}
      </div>
    </Command.Item>
  )
}

export const CommandBar = {
  In: CommanderBar,
  Out: () => {
    let commandBar = useCommandBar()
    const open = commandBar.useStore((state) => state.open)

    const onKeydown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Backspace" && commandBar.filter.length === 0) {
          commandBar.closeCommandGroup()
        }
      },
      [commandBar]
    )

    return (
      <>
        <Command.Dialog
          open={open}
          onOpenChange={() => commandBar.toggle()}
          className="commandbar dark vercel"
          tabIndex={-1}
          onKeyDown={onKeydown}
        >
          <commandBarTunnel.Out />
        </Command.Dialog>
      </>
    )
  }
}
