import { interpret } from "xstate"
import { panelMachine } from "../../editable/panels.machine"

export const panelService = interpret(panelMachine, {
  devTools: true
})
  .onTransition(console.log)
  .start()
