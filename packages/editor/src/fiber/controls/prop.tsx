import { MathUtils, TextureLoader } from "three"
import { GLTFLoader } from "three-stdlib"
import { createProp } from "../../editable/controls/createProp"
import { ref } from "../../editable/controls/ref"
import { EditableElement } from "../../editable/EditableElement"
import { gltf } from "./gltf"
import { texture } from "./texture"

export interface PropInput {
  path?: string[]
  element?: EditableElement

  step?: number
  min?: number
  max?: number
  options?: string[] | Record<any, any>
  lock?: boolean
  default?: any
  label?: string

  onChange?: (
    value: any,
    prop: string,
    controlPath: string,
    context: any
  ) => void
  render?(get: (prop: string) => any): boolean
}

export function getEditableElement(obj: any): EditableElement {
  return obj?.__r3f?.editable
}

const color = {
  get: (obj: any, prop: string) => {
    return obj[prop].getStyle()
  },
  set: (obj: any, prop: string, value: any) => {
    obj[prop].setStyle(value)
  }
}

const colorstring = {
  get: (obj: any, prop: string) => {
    return obj[prop]
  },
  set: (obj: any, prop: string, value: any) => {
    obj[prop] = value
  }
}
const vector3d = {
  get: (obj: any, prop: string) => {
    return obj[prop].toArray()
  },
  set: (obj: any, prop: string, value: any) => {
    obj[prop].fromArray(value)
  },
  serialize: (obj: any, prop: string, value: [number, number, number]) => {
    return value?.map((v) => Number(v.toFixed(3)))
  }
}

const vector2d = {
  get: (obj: any, prop: string): [number, number] => {
    return obj?.[prop]?.toArray()
  },
  set: (obj: any, prop: string, value: [number, number]) => {
    obj[prop].fromArray(value)
  },
  serialize: (obj: any, prop: string, value: [number, number]) => {
    return value?.map((v) => Number(v.toFixed(3)))
  }
}

const euler = {
  get: (obj: any, prop: string) => {
    return [
      MathUtils.radToDeg(obj[prop].x),
      MathUtils.radToDeg(obj[prop].y),
      MathUtils.radToDeg(obj[prop].z)
    ]
  },
  set: (obj: any, prop: string, value: [number, number, number]) => {
    let radians = value.map((v) => MathUtils.degToRad(v))
    let v = [...radians, "XYZ"]
    obj[prop].fromArray(v)
  },
  serialize: (obj: any, prop: string, value: [number, number, number]) => {
    return value?.map((v) => Number(MathUtils.degToRad(v).toFixed(3)))
  }
}

const bool = {
  get: (obj: any, prop: string) => {
    return obj[prop]
  },
  set: (obj: any, prop: string, value: any) => {
    obj[prop] = value
  }
}

const number = {
  get: (obj: any, prop: string) => {
    return obj[prop]
  },
  set: (obj: any, prop: string, value: any) => {
    obj[prop] = value
  },
  serialize: (obj: any, prop: string, value: any) => {
    return Number(value.toFixed(3))
  }
}

const textureT: {
  get: (obj: any, prop: string) => any
  set: (obj: any, prop: string, value: any) => void
  control?: any
  init?: ((obj: any, prop: string, value: any) => void) | undefined
  serialize(obj: any, prop: string, value: any): any
} = {
  control: texture,
  get(obj: any, prop: string) {
    return obj[prop]?.source?.data?.src
  },
  set(obj: any, prop: string, value: any) {
    obj[prop] = new TextureLoader().load(value)
    obj.needsUpdate = true
  },
  serialize(obj: any, prop: string, value: any) {
    return {
      src: value,
      loader: "TextureLoader",
      expression: `useLoader(TextureLoader, '${value}')`,
      imports: [
        {
          import: ["useLoader"],
          importPath: "@react-three/fiber"
        },
        {
          import: ["TextureLoader"],
          importPath: "three"
        }
      ]
    }
  },
  override(obj: any, prop: string, value: any) {
    return undefined
  }
}

const gltfT: {
  get: (obj: any, prop: string) => any
  set: (obj: any, prop: string, value: any) => void
  control?: any
  init?: ((obj: any, prop: string, value: any) => void) | undefined
  serialize(obj: any, prop: string, value: any): any
} = {
  control: gltf,
  get(obj: any, prop: string) {
    return obj[prop]?.uuid
  },
  async set(obj: any, prop: string, value: any) {
    return new Promise((res) =>
      new GLTFLoader().load(value, (data) => {
        obj[prop] = data.scene
        res(data.scene)
      })
    )
  },
  serialize(obj: any, prop: string, value: any) {
    return {
      src: value,
      loader: "TextureLoader",
      expression: `useGLTF('${value}').scene`,
      imports: [
        {
          import: ["useGltf"],
          importPath: "@react-three/fiber"
        }
      ]
    }
  }
}

const select = {
  get(obj: any, prop: string) {
    return obj?.[prop]
  },
  set(obj: any, prop: string, value: any) {
    obj[prop]
  },
  serialize(obj: any, prop: string, value: any) {
    return value
  }
}

export const prop = Object.assign(createProp, {
  color: (props: PropInput) => createProp(color, props),
  colorstring: (props: PropInput) => createProp(colorstring, props),
  number: (props: PropInput) => createProp(number, props),
  texture: (props: PropInput) => createProp(textureT, props),
  gltf: (props: PropInput) => createProp(gltfT, props),
  bool: (props: PropInput) => createProp(bool, props),
  vector3d: (props: PropInput) => createProp(vector3d, props),
  vector2d: (props: PropInput) => createProp(vector2d, props),
  euler: (props: PropInput) => createProp(euler, props),
  ref: (props: PropInput) =>
    createProp(
      {
        get(obj: any, prop: string) {
          return getEditableElement(obj[prop])
        },
        control: ref,
        set(obj: any, prop: string, value: any) {}
      },
      props
    ),
  select: (props: PropInput) => createProp(select, props),
  unknown: (props: PropInput) =>
    createProp(
      {
        get(obj: any, prop: string) {
          return obj?.[prop]
        },
        set(obj: any, prop: string, value: any) {
          obj[prop]
        },
        serialize(obj: any, prop: string, value: any) {
          return value
        }
      },
      props
    )
})
