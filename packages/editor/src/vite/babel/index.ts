import { ConfigAPI, PluginObj, template, types as t } from "@babel/core"

export const reactThreeEditorBabel = (api: ConfigAPI): PluginObj => {
  api.assertVersion(7)
  return {
    name: "react-three-editor-transform",
    visitor: {
      Program: {
        exit(pass, program) {
          const {
            node: { body }
          } = pass
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
                ),
                t.importSpecifier(
                  t.identifier("useEditorUpdate"),
                  t.identifier("useEditorUpdate")
                )
              ],
              t.stringLiteral("@react-three/editor/fiber")
            )
          )
        }
      },
      ImportDeclaration(path, program) {
        const {
          node: { source }
        } = path
        if (source.value === "@react-three/fiber") {
          source.value = "@react-three/editor/fiber"
        }
        if (source.value !== "@react-three/editor/fiber") return

        program.set("editorFiberImport", path.node)
      },
      JSXElement() {
        //
      },
      CallExpression() {
        //
      }
    }
  }
}
