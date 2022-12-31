import { createStore } from "@editable-jsx/controls"
import { Editor } from "../Editor"

export class CommandBar {
  store = createStore<{
    open: boolean
    activeCommandChain: string[]
    filter: string
  }>("command-store", (_) => {
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

  constructor(public editor: Editor) {
    this.editor = editor
  }

  get filter() {
    return this.useStore.getState().filter
  }

  toggleCommandBar(flag?: boolean) {
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
      if (this.editor.commands.has(name)) {
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
