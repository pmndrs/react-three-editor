import { client } from "../vite/client"
import { DEFAULT_EDITOR_PLUGINS } from "./plugins/index"
import { ThreeEditor } from "./ThreeEditor"

export let editor = new ThreeEditor(DEFAULT_EDITOR_PLUGINS, client)

// @ts-ignore
window.editor = editor
