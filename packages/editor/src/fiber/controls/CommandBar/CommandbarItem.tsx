import { Command } from "cmdk"
import { ReactNode } from "react"

export function Item({
  children,
  value,
  onSelect,
  shortcut
}: {
  children: ReactNode
  value: string
  onSelect: () => void
  shortcut?: string[]
}) {
  return (
    <Command.Item value={value} onSelect={onSelect}>
      {children}
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
