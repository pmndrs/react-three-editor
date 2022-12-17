import { folder } from "leva"
import {
  BackSide,
  ClampToEdgeWrapping,
  DoubleSide,
  FrontSide,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MirroredRepeatWrapping,
  RepeatWrapping,
  Texture
} from "three"
import { EditableElement } from "../../editable/EditableElement"
import { prop } from "../controls/prop"

const commonControls = (element: EditableElement, path: string[]) => {
  return {
    // common: folder({
    transparent: prop.bool({
      element,
      path: [...path, "transparent"],
      onChange: (value) => {
        const object = element.getObjectByPath<Material>(path)
        object.needsUpdate = true
      }
    }),
    opacity: prop.bool({
      element,
      path: [...path, "opacity"],
      min: 0,
      max: 1,
      step: 0.1
    }),
    toneMapped: prop.bool({
      element,
      path: [...path, "tonemapped"]
    }),
    side: prop.select({
      element,
      path: [...path, "side"],
      options: {
        FrontSide,
        BackSide,
        DoubleSide
      }
    }),
    shadowSide: prop.select({
      element,
      path: [...path, "shadowSide"],
      default: "null",
      options: {
        FrontSide,
        BackSide,
        DoubleSide
      }
    }),
    precision: prop.select({
      element,
      path: [...path, "precision"],
      options: [null, "highp", "mediump", "lowp"],
      default: null
    })
    // })
  }
}

const meshBasicMaterialControls = (
  element: EditableElement,
  path: string[]
) => {
  return {
    color: prop.color({
      element,
      path: [...path, "color"]
    }),
    ...commonControls(element, path),
    fog: prop.bool({
      element,
      path: [...path, "fog"]
    }),
    reflectivity: prop.number({
      element,
      path: [...path, "reflectivity"]
    }),
    refractionRatio: prop.number({
      element,
      path: [...path, "refractionRatio"]
    })
  }
}

const createTextureFolder = (
  element: EditableElement,
  prefix: string,
  path: string[],
  otherControls: any = {}
) => {
  const texturePropName = `${prefix !== "map" ? prefix + "Map" : "map"}`

  return {
    [`${prefix}`]: folder(
      {
        ...otherControls,
        [`${prefix}Map`]: prop.texture({
          element,
          label: "texture",
          onChange(value, prop, p) {
            let o = element.getObjectByPath<Texture>([...path, texturePropName])
            element.store?.setValueAtPath(p + "WrapS", o.wrapS, false)
            element.store?.setValueAtPath(p + "WrapT", o.wrapT, false)
            element.store?.setValueAtPath(
              p + "Repeat",
              o.repeat.toArray(),
              false
            )
          },
          path: [...path, texturePropName]
        }),
        [`${prefix}MapWrapS`]: prop.select({
          element,
          path: [...path, texturePropName, "wrapS"],
          options: {
            RepeatWrapping,
            ClampToEdgeWrapping,
            MirroredRepeatWrapping
          },
          default: RepeatWrapping,
          label: "wrapS",
          onChange(v) {
            let o = element.getObjectByPath<Texture>([...path, texturePropName])
            o.needsUpdate = true
          }
        }),
        [`${prefix}MapWrapT`]: prop.select({
          element,
          path: [...path, texturePropName, "wrapT"],
          options: {
            RepeatWrapping,
            ClampToEdgeWrapping,
            MirroredRepeatWrapping
          },
          default: RepeatWrapping,
          label: "wrapT",
          render: (get) => {
            let o = element.getObjectByPath<Texture>([...path, texturePropName])
            return o && o.source?.data?.src
          },
          onChange(v) {
            let o = element.getObjectByPath<Texture>([...path, texturePropName])
            o.needsUpdate = true
          }
        }),
        [`${prefix}MapRepeat`]: prop.vector2d({
          element,
          path: [...path, texturePropName, "repeat"],
          label: "repeat",
          default: [1, 1],
          step: 0.1,
          render: (get) => {
            let o = element.getObjectByPath<Texture>([...path, texturePropName])
            return o && o.source?.data?.src
          }
        })
      },
      {
        collapsed: true
      }
    )
  }
}

const meshStandardMaterialControls = (
  element: EditableElement,
  path: string[]
) => {
  return {
    color: prop.color({
      element,
      path: [...path, "color"]
    }),
    flatShading: prop.bool({
      element,
      path: [...path, "flatShading"],
      onChange: (value) => {
        element.getObjectByPath<MeshStandardMaterial>(path).needsUpdate = true
      }
    }),
    ...commonControls(element, path),
    fog: prop.bool({
      element,
      path: [...path, "fog"]
    }),
    wireframe: prop.bool({
      element,
      path: [...path, "wireframe"]
    }),
    ...createTextureFolder(element, "map", path),
    ...createTextureFolder(element, "alpha", path),
    ...createTextureFolder(element, "ao", path),
    ...createTextureFolder(element, "bump", path),
    ...createTextureFolder(element, "displacement", path),
    ...createTextureFolder(element, "emissive", path, {
      emissiveColor: prop.color({
        element,
        path: [...path, "emissive"],
        label: "color"
      })
    }),
    ...createTextureFolder(element, "env", path),
    ...createTextureFolder(element, "light", path),
    ...createTextureFolder(element, "metalness", path, {
      metalnessValue: prop.number({
        element,
        path: [...path, "metalness"],
        label: "value",
        min: 0,
        max: 1,
        step: 0.1
      })
    }),
    ...createTextureFolder(element, "roughness", path, {
      roughnessValue: prop.number({
        element,
        path: [...path, "roughness"],
        label: "value",
        min: 0,
        max: 1,
        step: 0.1
      })
    }),
    ...createTextureFolder(element, "normal", path)
  }
}

export const material = {
  applicable: (entity: EditableElement) => entity.ref instanceof Material,
  icon: (entity: EditableElement) => "ph:paint-brush-broad-duotone",
  controls: (entity: EditableElement) => {
    return {
      type: prop.select({
        element: entity,
        path: ["elementName"],
        options: {
          meshBasicMaterial: "meshBasicMaterial",
          meshStandardMaterial: "meshStandardMaterial"
        }
      }),
      ...(entity.ref instanceof MeshBasicMaterial
        ? meshBasicMaterialControls(entity, ["ref"])
        : {}),
      ...(entity.ref instanceof MeshStandardMaterial
        ? meshStandardMaterialControls(entity, ["ref"])
        : {})
    }
  }
}

export const meshMaterial = {
  applicable: (entity: EditableElement) =>
    entity.ref instanceof Mesh && entity.ref.material instanceof Material,
  controls: (entity: EditableElement) => {
    return {
      material: folder({
        ...(entity.ref.material instanceof MeshBasicMaterial
          ? meshBasicMaterialControls(entity, ["ref", "material"])
          : {}),
        ...(entity.ref.material instanceof MeshStandardMaterial
          ? meshStandardMaterialControls(entity, ["ref", "material"])
          : {})
      })
    }
  }
}
