import { KeyboardCommands } from "./KeyboardCommands"
import { useCommandBar } from "./useCommandBar"

export function CommandBarControls() {
  const open = useCommandBar().useStore((state) => state.open)

  return (
    <>
      <CommandBar key={open ? 0 : 1} />
      <KeyboardCommands />
    </>
  )
}
