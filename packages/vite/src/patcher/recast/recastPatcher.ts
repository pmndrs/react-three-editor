import { transformFromAstAsync } from "@babel/core"
import { EditPatch } from "@editable-jsx/state"
import { parse, prettyPrint } from "@vinxi/recast"
import { parse as babelParse, parser } from "@vinxi/recast/parsers/babel-ts"
import { filesToSkipOnHmr } from "../../server/hmr"
import { plugins } from "./transform-plugins"

export async function recastPatcher(
  fileName: string,
  source: string,
  patches: EditPatch[]
) {
  const sourceAst = parse(source, {
    parser: { parser, parse: babelParse },
    jsx: true
  } as any)
  filesToSkipOnHmr.set(fileName, { skip: true, timeout: 0 })
  await transformFromAstAsync(sourceAst, undefined, {
    cloneInputAst: false,
    filename: fileName,
    ast: true,
    plugins: plugins(patches)
  })
  const code = prettyPrint(sourceAst, {
    wrapColumn: 1000
  }).code

  filesToSkipOnHmr.get(fileName)!.timeout = setTimeout(() => {
    if (filesToSkipOnHmr.get(fileName)?.timeout) {
      filesToSkipOnHmr.get(fileName)!.skip = false
    }
  }, 1000)

  return code
}
