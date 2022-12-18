import { Icon } from "@iconify/react"
import { useMemo } from "react"
import { ThreeEditor } from "../../ThreeEditor"
import { commandStore, useCommand } from "./CommandBar"

export function Commands() {
  useCommand(
    useMemo(
      () => ({
        icon: () => <Icon icon="ph:cube" />,
        description: "Go to Editor Mode",
        name: "Go to Editor Mode",
        execute: (editor: ThreeEditor) => {
          editor
            .getPanel(editor.settingsPanel)
            .setValueAtPath("settings.camera.enabled", true, true)

          commandStore.setState({ open: false })
        },
        render: (editor: ThreeEditor) => {
          let enabled = editor
            .getPanel(editor.settingsPanel)
            .get("settings.camera.enabled")
          if (enabled === undefined) {
            return true
          } else {
            return !enabled
          }
        },
        shortcut: () => (
          <>
            <kbd>⌘</kbd>
            <kbd>E</kbd>
          </>
        )
      }),
      []
    )
  )

  useCommand(
    useMemo(
      () => ({
        icon: () => <Icon icon="ph:cube" />,
        description: "Save all",
        name: "Save all",
        execute: async (editor: ThreeEditor) => {
          let el = editor.root
          let traverse = async (item) => {
            if (Object.keys(item.changes).length > 0) {
              console.log("saving", item.key)
              await item.save()
            }
            for (var child of item.children) {
              console.log(child)
              await traverse(child)
            }
          }
          await traverse(el)

          commandStore.setState({ open: false })
        },
        render: (editor: ThreeEditor) => {
          return true
        },
        shortcut: () => (
          <>
            <kbd>⌘</kbd>
            <kbd>E</kbd>
          </>
        )
      }),
      []
    )
  )

  useCommand(
    useMemo(
      () => ({
        icon: () => <Icon icon="ph:cube" />,
        description: "Clear local storage state",
        name: "Clear local storage state",
        execute: async (editor: ThreeEditor) => {
          localStorage.clear()

          commandStore.setState({ open: false })
        },
        render: (editor: ThreeEditor) => {
          return true
        },
        shortcut: () => (
          <>
            <kbd>⌘</kbd>
            <kbd>E</kbd>
          </>
        )
      }),
      []
    )
  )

  useCommand(
    useMemo(
      () => ({
        icon: () => <Icon icon="ph:cube" />,
        description: "Go to Play Mode",
        name: "Go to Play Mode",
        execute: (editor: ThreeEditor) => {
          editor
            .getPanel(editor.settingsPanel)
            .setValueAtPath("settings.camera.enabled", false, true)

          commandStore.setState({ open: false })
        },
        render: (editor: ThreeEditor) => {
          let enabled = editor
            .getPanel(editor.settingsPanel)
            .get("settings.camera.enabled")
          if (enabled === undefined) {
            return true
          } else {
            return enabled
          }
        },
        shortcut: () => (
          <>
            <kbd>⌘</kbd>
            <kbd>E</kbd>
          </>
        )
      }),
      []
    )
  )

  return null
}
