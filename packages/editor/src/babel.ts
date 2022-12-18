/**
 * This adds {fileName, lineNumber, columnNumber} annotations to JSX tags.
 *
 * NOTE: lineNumber and columnNumber are both 1-based.
 *
 * == JSX Literals ==
 *
 * <sometag />
 *
 * becomes:
 *
 * var __jsxFileName = 'this/file.js';
 * <sometag __source={{fileName: __jsxFileName, lineNumber: 10, columnNumber: 1}}/>
 */
import { template, types as t } from "@babel/core"
import { declare } from "@babel/helper-plugin-utils"
import { basename, extname } from "path"

const TRACE_ID = "_source"
const FILE_NAME_VAR = "_jsxFileName"

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

const createNodeFromNullish = <T, N extends t.Node>(
  val: T | null,
  fn: (val: T) => N
): N | t.NullLiteral => (val == null ? t.nullLiteral() : fn(val))

type State = {
  fileNameIdentifier: t.Identifier
}
export default declare<State>((api) => {
  api.assertVersion(7)

  function makeTrace(
    fileNameIdentifier: t.Identifier,
    { line, column }: { line: number; column: number },
    componentName: string,
    moduleName: string,
    elementName: string
  ) {
    const fileLineLiteral = createNodeFromNullish(line, t.numericLiteral)
    const moduleNameLiteral = createNodeFromNullish(moduleName, t.stringLiteral)
    const componentNameLiteral = createNodeFromNullish(
      componentName,
      t.stringLiteral
    )
    const elementNameLiteral = createNodeFromNullish(
      elementName,
      t.stringLiteral
    )
    const fileColumnLiteral = createNodeFromNullish(column, (c) =>
      // c + 1 to make it 1-based instead of 0-based.
      t.numericLiteral(c + 1)
    )

    return template.expression.ast`{
        fileName: ${fileNameIdentifier},
        lineNumber: ${fileLineLiteral},
        columnNumber: ${fileColumnLiteral},
        moduleName: ${moduleNameLiteral},
        componentName: ${componentNameLiteral},
        elementName: ${elementNameLiteral}
      }`
  }

  const isSourceAttr = (attr: t.Node) =>
    t.isJSXAttribute(attr) && attr.name.name === TRACE_ID

  return {
    name: "transform-react-jsx-source",
    visitor: {
      Program: {
        exit(e) {
          // import { editable, Editable } from '@react-three/editor/fiber' with babel

          const { node } = e
          const { body } = node
          const { fileNameIdentifier } = this
          body.unshift(
            t.importDeclaration(
              [
                t.importSpecifier(
                  t.identifier("editable"),
                  t.identifier("editable")
                ),
                t.importSpecifier(
                  t.identifier("Editable"),
                  t.identifier("Editable")
                ),
                t.importSpecifier(
                  t.identifier("useEditorFrame"),
                  t.identifier("useEditorFrame")
                )
              ],
              t.stringLiteral("@react-three/editor/fiber")
            )
          )
        }
      },
      ImportDeclaration(path, state) {
        // check if there is an import from '@react-three/editor/fiber'
        // if there is one, then save that to state

        const { node } = path
        const { specifiers, source } = node
        if (source.value === "@react-three/fiber") {
          source.value = "@react-three/editor/fiber"
        }

        if (source.value !== "@react-three/editor/fiber") return

        state.set("editorFiberImport", node)
      },
      // JSXClosingElement(path, state) {
      //   const { node } = path
      //   if (
      //     t.isJSXIdentifier(node.name) &&
      //     node.name.name.match(/^[a-z]/) &&
      //     transformElements.includes(node.name.name)
      //   ) {
      //     node.name = t.jsxMemberExpression(
      //       t.jsxIdentifier("$"),
      //       t.jsxIdentifier(node.name.name)
      //     )
      //   }
      // },
      JSXOpeningElement(path, state) {
        const { node } = path
        if (
          // the element was generated and doesn't have location information
          !node.loc ||
          // Already has __source
          path.node.attributes.some(isSourceAttr)
        ) {
          return
        }

        const parentComponent = path.findParent(
          (path) =>
            (path.isFunctionDeclaration() &&
              path.get("id").isIdentifier() &&
              path.get("id").node.name.match(/^[A-Z]/)) ||
            (path.isVariableDeclarator() &&
              path.get("id").isIdentifier() &&
              path.get("id").node.name.match(/^[A-Z]/))
        )

        let componentName = null
        if (parentComponent) {
          componentName = parentComponent.get("id").node.name
        }

        let elementName =
          node.name.type === "JSXIdentifier" ? node.name.name : null

        function isEditable(node) {
          return (
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
          )
        }

        if (
          t.isJSXIdentifier(node.name) &&
          node.name.name.match(/^[a-z]/)
          // transformElements.includes(node.name.name)
          // state.get("editorFiberImport")
        ) {
          node.name = t.jsxMemberExpression(
            t.jsxIdentifier("editable"),
            t.jsxIdentifier(node.name.name)
          )
        } else if (
          t.isJSXIdentifier(node.name) &&
          node.name.name.match(/^[A-Z]/) &&
          node.name.name !== "Editable" &&
          // has an attribute called 'position' or 'rotation' or 'scale'
          isEditable(node)
        ) {
          node.attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier("component"),
              t.jsxExpressionContainer(t.identifier(node.name.name))
            )
          )
          node.name = t.jsxIdentifier("Editable")
        } else if (
          t.isJSXMemberExpression(node.name) &&
          t.isJSXIdentifier(node.name.object) &&
          node.name.object.name !== "editable" &&
          // has an attribute called 'position' or 'rotation' or 'scale'
          isEditable(node)
        ) {
          node.attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier("component"),
              t.jsxExpressionContainer(
                t.memberExpression(
                  t.identifier(node.name.object.name),
                  t.identifier(node.name.property.name)
                )
              )
            )
          )
          node.name = t.jsxIdentifier("Editable")
        }

        if (!state.fileNameIdentifier) {
          const fileNameId = path.scope.generateUidIdentifier(FILE_NAME_VAR)
          state.fileNameIdentifier = fileNameId

          path.scope.getProgramParent().push({
            id: fileNameId,
            init: t.stringLiteral(state.filename || "")
          })
        }

        node.attributes.push(
          t.jsxAttribute(
            t.jsxIdentifier(TRACE_ID),
            t.jsxExpressionContainer(
              makeTrace(
                t.cloneNode(state.fileNameIdentifier),
                node.loc.start,
                componentName,
                basename(state.filename, extname(state.filename)),
                elementName
              )
            )
          )
        )
      },
      CallExpression(path, state) {
        // check if we are calling `useFrame` and replace it with `useEditorFrame` and use the name of the parent component as the first argument

        const { node } = path
        if (
          t.isIdentifier(node.callee) &&
          node.callee.name === "useFrame" &&
          node.arguments.length === 1
        ) {
          const parentComponent = path.findParent(
            (path) =>
              (path.isFunctionDeclaration() &&
                path.get("id").isIdentifier() &&
                path.get("id").node.name.match(/^[A-Z]/)) ||
              (path.isVariableDeclarator() &&
                path.get("id").isIdentifier() &&
                path.get("id").node.name.match(/^[A-Z]/))
          )

          if (parentComponent) {
            const componentName = parentComponent.get("id").node.name
            parentComponent.state = parentComponent.state?.["count"]
              ? { count: parentComponent.state?.["count"] + 1 }
              : { count: 0 }

            node.arguments.unshift(
              t.stringLiteral(
                componentName + ":" + parentComponent.state["count"]
              )
            )
            node.callee.name = "useEditorFrame"
          }
        }
      }
    }
  }
})
