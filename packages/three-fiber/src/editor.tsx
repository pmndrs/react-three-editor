import { Editor } from "@editable-jsx/editable"
import { client } from "@editable-jsx/vite/src/client"
import { DEFAULT_EDITOR_PLUGINS } from "./plugins"
export let editor = new Editor({
  plugins: DEFAULT_EDITOR_PLUGINS,
  client: client
})

// @ts-ignore
window.editor = editor
