import { EditPatch } from "@editable-jsx/state"
import { readFile, writeFile } from "fs-extra"
import { tsMorphPatcher } from "./ts-morph"

const groupPatchesByFileName = (patches: EditPatch[]) => {
  return patches.reduce((accum, x) => {
    ;(accum[x.source.fileName] = accum[x.source.fileName] || []).push(x)
    return accum
  }, {} as Record<string, EditPatch[]>)
}

async function applyFilePatches(fileName: string, patches: EditPatch[]) {
  let code = (await readFile(fileName)).toString()

  code = await tsMorphPatcher(
    fileName,
    code,
    patches.filter((p) => p.action_type === "updateAttribute")
  )
  // code = await recastPatcher(
  //   fileName,
  //   code,
  //   patches.filter((p) => p.action_type !== "updateAttribute")
  // )
  await writeFile(fileName, code)
}

export async function applyPatches(data: EditPatch[]) {
  const grouped = groupPatchesByFileName(data)
  await Promise.all(
    Object.entries(grouped).map(async ([fileName, patches]) => {
      return applyFilePatches(fileName, patches).catch((err) => {
        console.log(
          `Something went wrong while applying patches to ${fileName}`
        )
        console.error(err)
      })
    })
  )
}
