import { CommandType } from "./types"
import { Group, Mesh } from "three"
import { EditableElement } from "../../../editable/EditableElement"

export const commands: CommandType[] = [
  {
    name: "Toggle mode",
    icon: "ph:cube",
    description: (e) => `Go to ${e.isEditorMode() ? "Play" : "Editor"} Mode`,
    execute(editor) {
      if (!editor.isEditorMode()) {
        editor
          .getPanel(editor.settingsPanel)
          .useStore.setState(({ data }: any) => {
            console.log(Object.assign({}, data))
            data["settings.camera.enabled"].value = true
            data["settings.scene.mode"].value = "editor"

            if (data["settings.physics.paused"]) {
              data["settings.physics.paused"].value = true
              data["settings.physics.debug"].value = true
            }

            let panelNames = Object.keys(editor.panels)
            for (let i = 0; i < panelNames.length; i++) {
              data["settings.panels." + panelNames[i] + ".hidden"].value = false
            }

            return { data }
          })

        editor.remount()
      } else {
        editor
          .getPanel(editor.settingsPanel)
          .useStore.setState(({ data }: any) => {
            data["settings.camera.enabled"].value = false

            data["settings.scene.mode"].value = "play"

            if (data["settings.physics.paused"]) {
              data["settings.physics.paused"].value = false
              data["settings.physics.debug"].value = false
            }

            let panelNames = Object.keys(editor.panels)
            for (let i = 0; i < panelNames.length; i++) {
              data["settings.panels." + panelNames[i] + ".hidden"].value = true
            }

            return { data }
          })
      }
    }
  },
  {
    name: "Save all",
    description: "Save all",
    icon: "ph:cube",
    async execute(editor) {
      let el = editor.root
      let traverse = async (item: any) => {
        if (Object.keys(item.changes).length > 0) {
          console.log("saving", item.key)
          await item.save()
        }
        for (var child of item.children) {
          await traverse(child)
        }
      }
      await traverse(el)
    }
  },
  {
    name: "Focus",
    description: "Focus",
    icon: "ph:cube",
    execute(editor) {
      let el = editor.root
      let selectedElement = editor.selectedElement
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
    }
  },
  {
    icon: "ph:cube",
    description: "Save selected item",
    name: "Save selected item",
    execute(editor) {
      editor.selectedElement?.save()
    }
  },
  {
    icon: "ph:cube",
    description: "Clear local storage state",
    name: "Clear local storage state",
    execute(editor) {
      localStorage.clear()
    }
  },
  {
    name: "Show panels",
    description: "Show panels",
    icon: "ph:cube",
    execute(editor) {
      editor
        .getPanel(editor.settingsPanel)
        .useStore.setState(({ data }: any) => {
          let panelNames = Object.keys(editor.panels)
          for (let i = 0; i < panelNames.length; i++) {
            data["settings.panels." + panelNames[i] + ".hidden"].value = false
          }

          return { data }
        })
    }
  },
  {
    name: "Hide panels",
    description: "Hide panels",
    icon: "ph:cube",
    execute(editor) {
      editor
        .getPanel(editor.settingsPanel)
        .useStore.setState(({ data }: any) => {
          let panelNames = Object.keys(editor.panels)
          for (let i = 0; i < panelNames.length; i++) {
            data["settings.panels." + panelNames[i] + ".hidden"].value = true
          }

          return { data }
        })
    }
  },
  {
    icon: "ph:cube",
    name: "Insert element",
    children: [
      {
        name: "Group",
        execute(editor) {
          const selectedElement = editor.selectedElement
          if (selectedElement) {
            editor.insertElement({
              source: selectedElement.source,
              value: {
                componentType: "group"
              }
            })
          }
        }
      },
      {
        name: "Mesh",
        execute(editor) {
          const selectedElement = editor.selectedElement
          if (selectedElement) {
            editor.insertElement({
              source: selectedElement.source,
              value: {
                componentType: "mesh"
              }
            })
          }
        }
      },
      {
        name: "Sphere Geometry",
        execute(editor) {
          const selectedElement = editor.selectedElement
          if (selectedElement) {
            editor.insertElement({
              source: selectedElement.source,
              value: {
                componentType: "sphereGeometry"
              }
            })
          }
        }
      },
      {
        name: "Mesh standard material",
        execute(editor) {
          const selectedElement = editor.selectedElement
          if (selectedElement) {
            editor.insertElement({
              source: selectedElement.source,
              value: {
                componentType: "meshStandardMaterial"
              }
            })
          }
        }
      }
    ]
  },
  {
    name: "Remove Element",
    render(editor) {
      return !!editor.selectedElement
    },
    execute(editor) {
      const selectedElement = editor.selectedElement
      if (selectedElement) {
        editor.deleteElement({
          source: selectedElement.source
        })
      }
    }
  }
]
