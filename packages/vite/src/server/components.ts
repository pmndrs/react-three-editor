import { types as babelTypes } from "@babel/core"
import { parse } from "@vinxi/recast"
import { parse as babelParse, parser } from "@vinxi/recast/parsers/babel-ts"
import glob from "fast-glob"
import { readFile } from "fs-extra"
import { getReactComponents } from "../utils"

export async function listComponents(componentsDir: string) {
  const componentFiles = await glob(componentsDir, {
    cwd: process.cwd()
  })

  const files = await Promise.all(componentFiles.map(listReactComponents))

  return files.filter((f) => f.components.length)
}

async function listReactComponents(
  fileName: string
): Promise<{ fileName: string; components: string[] }> {
  try {
    const source = await readFile(fileName)
    const sourceAst = parse(source.toString(), {
      parser: { parser, parse: babelParse },
      jsx: true
    } as any)
    const program = sourceAst.program as babelTypes.Program
    const components = program.body
      .map((node) => {
        const compo = getReactComponents(node)
        if (compo) {
          return compo.componentName
        }
      })
      .filter(Boolean) as string[]
    return {
      fileName,
      components
    }
  } catch (error) {
    console.log("something went wring while parsing the file")
    return {
      fileName,
      components: []
    }
  }
}
