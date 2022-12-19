import { Icon } from "@iconify/react"
import { useMemo } from "react"
import { Group, Mesh } from "three"
import { ThreeEditor } from "../../ThreeEditor"
import { commandStore, useCommand } from "./CommandBar"

export function Commands() {
  useCommand(
    useMemo(
      () => ({
        icon: () => <Icon icon="ph:cube" />,
        description: (e) =>
          `Go to ${e.isEditorMode() ? "Play" : "Editor"} Mode`,
        name: "Toggle mode",
        execute: (editor: ThreeEditor) => {
          if (!editor.isEditorMode()) {
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
                  data["settings.panels." + panelNames[i] + ".hidden"].value =
                    false
                }

                return { data }
              })

            editor.remount()
          } else {
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
                  data["settings.panels." + panelNames[i] + ".hidden"].value =
                    true
                }

                return { data }
              })
          }
          commandStore.setState({ open: false })
        },
        render: (editor: ThreeEditor) => {
          return true
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
        description: () => "Save all",
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
        description: () => "Focus",
        name: "Focus",
        execute: async (editor: ThreeEditor) => {
          let el = editor.root
          let selected = editor.selectedElement().treeId
          // let traverse = (item, show) => {
          //   if (selected === item.treeId) {
          //     console.log("visible", item.treeId)

          //     // console.log("saving", item.key)
          //     // item.save()
          //   }  else if () {

          //   }
          //   else {
          //     item.visible = false
          //     for (var child of item.children) {
          //       traverse(child, false)
          //     }
          //   }
          // }

          for (var child of el.children) {
            if (!selected.startsWith(child.treeId)) {
              if (child.ref instanceof Mesh || child.ref instanceof Group) {
                child.visible = false
              } else {
                for (var c of child.children) {
                  if (c.ref instanceof Mesh || c.ref instanceof Group) {
                    c.visible = false
                  }
                }
              }
            } else {
              for (var c of child.children) {
                if (!selected.startsWith(c.treeId)) {
                  if (c.ref instanceof Mesh || c.ref instanceof Group) {
                    c.visible = false
                  } else {
                    for (var d of c.children) {
                      if (d.ref instanceof Mesh || d.ref instanceof Group) {
                        d.visible = false
                      }
                    }
                  }
                }
              }
            }
          }

          commandStore.setState({ open: false })
        },
        render: (editor: ThreeEditor) => {
          return editor.selectedElement()
        }
      }),
      []
    )
  )

  useCommand(
    useMemo(
      () => ({
        icon: () => <Icon icon="ph:cube" />,
        description: () => "Save selected item",
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
        description: () => "Clear local storage state",
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
