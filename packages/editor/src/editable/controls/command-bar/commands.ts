import { Group, Mesh } from "three"
import { EditableElement } from "../../EditableElement"
import { CommandType } from "./types"

export const commands: CommandType[] = [
  {
    name: "Toggle mode",
    icon: "ph:cube",
    description: (e) => `Go to ${e.isEditorMode() ? "Play" : "Editor"} Mode`,
    execute(editor) {
      if (!editor.isEditorMode()) {
        editor.setMode("editor")
      } else {
        editor.setMode("play")
      }
    },
    shortcut: ["meta", "e"]
  },
  {
    name: "Save all",
    description: "Save all",
    icon: "ph:cube",
    async execute(editor) {
      let el = editor.root
      let traverse = async (item: any) => {
        if (Object.keys(item.changes).length > 0) {
          await item.save()
        }
        for (var child of item.children) {
          await traverse(child)
        }
      }
      await traverse(el)
    },
    shortcut: ["meta", "s"]
  },
  {
    name: "Focus",
    description: "Focus",
    icon: "ph:cube",
    shortcut: ["meta", "f"],
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
      editor.showAllPanels()
    }
  },
  {
    name: "Hide panels",
    description: "Hide panels",
    icon: "ph:cube",
    execute(editor) {
      editor.hideAllPanels()
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
            editor.appendNewElement(selectedElement, "group")
          }
        }
      },
      {
        name: "Mesh",
        execute(editor) {
          const selectedElement = editor.selectedElement
          if (selectedElement) {
            editor.appendNewElement(selectedElement, "mesh")
          }
        }
      },
      {
        name: "Sphere Geometry",
        execute(editor) {
          const selectedElement = editor.selectedElement
          if (selectedElement) {
            editor.appendNewElement(selectedElement, "sphereGeometry")
          }
        }
      },
      {
        name: "Mesh standard material",
        execute(editor) {
          const selectedElement = editor.selectedElement
          if (selectedElement) {
            editor.appendNewElement(selectedElement, "meshStandardMaterial")
          }
        }
      }
    ]
  },
  {
    name: "Remove Element",
    icon: "ph:cube",
    render(editor) {
      return !!editor.selectedElement
    },
    execute(editor) {
      const selectedElement = editor.selectedElement
      if (selectedElement) {
        editor.deleteElement(selectedElement)
      }
    }
  }
]
