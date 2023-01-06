import { EditPatch } from "@editable-jsx/state"
import { Node, Project, SourceFile, SyntaxKind } from "ts-morph"

export const tsProject = new Project({
  tsConfigFilePath: "tsconfig.json"
})

function isPos(el: Node, pos: { lineNumber: number; columnNumber: number }) {
  // console.log(
  //   el.getStartLineNumber(),
  //   el.getFullStart() - el.StartLin() + 1,
  //   pos.lineNumber,
  //   pos.columnNumber
  // )
  // debugger
  return (
    el.getStartLineNumber() === pos.lineNumber &&
    el.getStart() - el.getStartLinePos() + 1 === pos.columnNumber
  )
}

let findElement = (
  sourceFile: SourceFile,
  pos: { lineNumber: number; columnNumber: number }
) => {
  // for (let x of sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement)) {
  //   if (isPos(x, pos)) {
  //     return x
  //   }
  // }

  for (let x of sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement)) {
    console.log(x.getText())
    if (isPos(x, pos)) {
      return x
    }
  }

  for (let x of sourceFile.getDescendantsOfKind(
    SyntaxKind.JsxSelfClosingElement
  )) {
    if (isPos(x, pos)) {
      return x
    }
  }
}

const valueExpression = (value: any) => {
  if (typeof value.expression === "string") {
    // const templ = template(value.expression)
    // const ast = templ({})
    // if (types.isExpressionStatement(ast)) {
    //   return types.jsxExpressionContainer(ast.expression)
    // }
  } else if (Array.isArray(value)) {
    return `{[${value.join(", ")}]}`
  }
  if (typeof value === "string") {
    return `"${value}"`
  } else if (typeof value === "number") {
    return `{${value}}`
  } else if (typeof value === "boolean") {
    return `{${value}}`
  }
}

function setAttribute(
  el: Exclude<ReturnType<typeof findElement>, undefined>,
  propPath: string,
  propValue: any
) {
  for (var attribute of el.getDescendantsOfKind(SyntaxKind.JsxAttribute)) {
    if (attribute.compilerNode.name.text === propPath) {
      if (typeof propValue === "object" && !Array.isArray(propValue)) {
        // set attribute value to 0.1
        attribute
          .getInitializer()!
          .replaceWithText(`{${JSON.stringify(propValue)}}`)
      } else {
        const propValueString = valueExpression(propValue)
        if (!propValueString) {
          throw new Error(`Could not parse prop value`)
        }

        attribute.getInitializer()!.replaceWithText(`${propValueString}`)
      }
      // set attribute value to 0.1
    }
  }
}

export async function tsMorphPatcher(
  fileName: string,
  code: string,
  patches: EditPatch<{}>[]
) {
  let sourceFile: SourceFile
  if ((sourceFile = tsProject.getSourceFile(fileName)!)) {
    tsProject.removeSourceFile(sourceFile)
    sourceFile = tsProject.addSourceFileAtPath(fileName)
  } else {
    sourceFile = tsProject.addSourceFileAtPath(fileName)
  }

  sourceFile?.replaceWithText(code)

  patches.forEach((patch) => {
    const { action_type, source, value } = patch
    if (action_type === "updateAttribute") {
      console.log("setting", value, patches[0].source)
      let el = findElement(sourceFile, patches[0].source)
      if (!el) {
        throw new Error(`Could not find element`)
      }
      Object.entries(value).forEach(([propPath, propValue]) => {
        setAttribute(el!, propPath, propValue)
      })
    }
  })

  return sourceFile.getFullText()
}
