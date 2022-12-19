import { Icon } from "@iconify/react"
import { useMemo } from "react"
import { Group, Mesh } from "three"
import { EditableElement } from "../../../editable/EditableElement"
import { ThreeEditor } from "../../ThreeEditor"
import { commandStore } from "./store"
import { useCommand } from "./useCommand"

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
        description: (editor) => (
          <>Focus on {editor.selectedElement()?.displayName}</>
        ),
        name: "Focus",
        shortcut: ["meta", "f"],
        execute: async (editor: ThreeEditor) => {
          let el = editor.root
          let selectedElement = editor.selectedElement()
          let selected = selectedElement?.treeId

          function show(c: EditableElement) {
            if (c.ref instanceof Mesh || c.ref instanceof Group) {
              c.visible = true
            } else {
              for (var d of c.children) {
                show(d)
              }
            }
          }

          function hide(c: EditableElement) {
            if (c.ref instanceof Mesh || c.ref instanceof Group) {
              c.visible = false
            } else {
              for (var d of c.children) {
                hide(d)
              }
            }
          }

          function focus(c: EditableElement, selected: string) {
            if (!selected.startsWith(c.treeId)) {
              hide(c)
            } else if (selected === c.treeId) {
            } else {
              for (var d of c.children) {
                focus(d, selected)
              }
            }
          }

          if (selected) {
            show(el)
            for (var child of el.children) {
              focus(child, selected)
            }
          }

          editor.bounds.refresh(selectedElement?.ref).fit()

          // let position = selectedElement?.ref?.position
          // editor.setSettings("camera.position", [
          //   position.x + 2,
          //   position.y + 2,
          //   position.z + 2
          // ])

          // editor.camera?.lookAt(position)

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
