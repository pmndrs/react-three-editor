import { Editor } from "@editable-jsx/editable"
import { client } from "@editable-jsx/vite/src/client"
import { DEFAULT_EDITOR_PLUGINS } from "./plugins/index"

export let editor = new Editor(DEFAULT_EDITOR_PLUGINS, client)

// @ts-ignore
window.editor = editor
