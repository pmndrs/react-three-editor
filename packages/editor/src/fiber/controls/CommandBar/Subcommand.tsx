import * as Popover from "@radix-ui/react-popover"
import { Command } from "cmdk"
import { ReactNode, RefObject, useEffect, useState } from "react"

function SubCommand({
  inputRef,
  listRef,
  selectedValue
}: {
  inputRef: RefObject<HTMLInputElement>
  listRef: RefObject<HTMLElement>
  selectedValue: string
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function listener(e: KeyboardEvent) {
      if (e.key === "k" && e.metaKey) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }

    document.addEventListener("keydown", listener)

    return () => {
      document.removeEventListener("keydown", listener)
    }
  }, [])

  useEffect(() => {
    const el = listRef.current

    if (!el) return

    if (open) {
      el.style.overflow = "hidden"
    } else {
      el.style.overflow = ""
    }
  }, [open, listRef])

  return (
    <Popover.Root open={open} onOpenChange={setOpen} modal>
      <Popover.Trigger
        cmdk-raycast-subcommand-trigger=""
        onClick={() => setOpen(true)}
        aria-expanded={open}
      >
        Actions
        <kbd>⌘</kbd>
        <kbd>K</kbd>
      </Popover.Trigger>
      <Popover.Content
        side="top"
        align="end"
        className="commandbar-submenu"
        sideOffset={16}
        alignOffset={0}
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          inputRef?.current?.focus()
        }}
      >
        <Command>
          <Command.List>
            <Command.Group heading={selectedValue}>
              <SubItem shortcut="↵">Open Application</SubItem>
              <SubItem shortcut="⌘ ↵">Show in Finder</SubItem>
              <SubItem shortcut="⌘ I">Show Info in Finder</SubItem>
              <SubItem shortcut="⌘ ⇧ F">Add to Favorites</SubItem>
            </Command.Group>
          </Command.List>
          <Command.Input placeholder="Search for actions..." />
        </Command>
      </Popover.Content>
    </Popover.Root>
  )
}

function SubItem({
  children,
  shortcut
}: {
  children: ReactNode
  shortcut: string
}) {
  return (
    <Command.Item>
      {children}
      <div cmdk-raycast-submenu-shortcuts="">
        {shortcut.split(" ").map((key) => {
          return <kbd key={key}>{key}</kbd>
        })}
      </div>
    </Command.Item>
  )
}
