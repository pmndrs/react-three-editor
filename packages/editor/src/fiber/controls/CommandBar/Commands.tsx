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
            .useStore.setState(({ data }) => {
              data["settings.camera.enabled"].value = true

              if (data["settings.physics.paused"]) {
                data["settings.physics.paused"].value = true
                data["settings.physics.debug"].value = true
              }

              let panelNames = Object.keys(editor.panels)
              for (let i = 0; i < panelNames.length; i++) {
                data["settings.panel." + panelNames[i] + ".hidden"].value =
                  false
              }

              return { data }
            })
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
        shortcut: ["meta", "e"]
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
            .useStore.setState(({ data }) => {
              data["settings.camera.enabled"].value = false

              if (data["settings.physics.paused"]) {
                data["settings.physics.paused"].value = false
                data["settings.physics.debug"].value = false
              }

              let panelNames = Object.keys(editor.panels)
              for (let i = 0; i < panelNames.length; i++) {
                data["settings.panel." + panelNames[i] + ".hidden"].value = true
              }

              return { data }
            })

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
        shortcut: ["meta", "e"]
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
              await traverse(child)
            }
          }
          await traverse(el)

          commandStore.setState({ open: false })
        },
        render: (editor: ThreeEditor) => {
          return true
        }
      }),
      []
    )
  )

  useCommand(
    useMemo(
      () => ({
        icon: () => <Icon icon="ph:cube" />,
        description: "Save selected element",
        name: "Save selected element",
        execute: async (editor: ThreeEditor) => {
          editor.selectedElement()?.save()
          commandStore.setState({ open: false })
        },
        render: (editor: ThreeEditor) => {
          return true
        },
        shortcut: ["meta", "s"]
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
        }
      }),
      []
    )
  )

  return null
}
