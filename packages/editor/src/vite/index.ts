import { types as t } from "@babel/core"
import react from "@vitejs/plugin-react"
import { default as babel, JSXElementType } from "../editable/babel"

import { default as vite } from "../server"
const transformElements = [
  "mesh",
  "group",
  "directionalLight",
  "meshStandardMaterial",
  "meshBasicMaterial",
  "pointLight",
  "ambientLight",
  "spotLight",
  "primitive",
  "points"
]

let shouldEdit = (node: JSXElementType) => {
  let isEditableComponent = (node: t.JSXOpeningElement) =>
    node.attributes.some(
      (attr) =>
        t.isJSXAttribute(attr) &&
        (attr.name.name === "position" ||
          attr.name.name === "rotation" ||
          attr.name.name === "scale" ||
          attr.name.name === "name")
    ) ||
    (t.isJSXIdentifier(node.name) &&
      ["OrbitControls", "Physics"].includes(node.name.name)) ||
    (t.isJSXIdentifier(node.name) &&
      (node.name.name.endsWith("Material") ||
        node.name.name.endsWith("Geometry"))) ||
    (t.isJSXMemberExpression(node.name) &&
      (node.name.property.name.endsWith("Material") ||
        node.name.property.name.endsWith("Geometry")))

  switch (node.type) {
    case "primitive":
      return true
    case "namespaced-primitive":
      return true
    case "component":
      return isEditableComponent(node.openingElement)
    case "namespaced-component":
      return isEditableComponent(node.openingElement)
  }
}
export function r3f({ babelPlugins = [], editable = shouldEdit } = {}) {
  return [
    vite(),
    react({
      babel: {
        plugins: [
          ...babelPlugins,
          [
            babel,
            {
              importPath: "@react-three/editor/fiber",
              replaceImports: {
                "@react-three/fiber": "@react-three/editor/fiber"
              },
              imports: {
                path: "@react-three/editor/fiber",
                imports: [
                  "editable",
                  "Editable",
                  "useEditorFrame",
                  "useEditorUpdate"
                ]
              },
              isEditable: editable
            }
          ]
        ]
      }
    })
  ]
}
