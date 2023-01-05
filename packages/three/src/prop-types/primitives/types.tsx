import { PropType } from "@editable-jsx/editable"
import { MathUtils } from "three"
import { GLTFLoader } from "three-stdlib"
import { getEditableElement } from ".."
import { gltf as levaGltf } from "../gltf"
import { ref as levaRef } from "../ref"

export const color = {
  get: (obj: any, prop: string) => {
    return obj[prop].getStyle()
  },
  set: (obj: any, prop: string, value: any) => {
    obj[prop].setStyle(value)
  }
} satisfies PropType

export const colorstring = {
  get: (obj: any, prop: string) => {
    return obj[prop]
  },
  set: (obj: any, prop: string, value: any) => {
    obj[prop] = value
  }
} satisfies PropType

export const vector3d = {
  get: (obj: any, prop: string) => {
    return obj[prop].toArray()
  },
  set: (obj: any, prop: string, value: any) => {
    obj[prop].fromArray(value)
  },
  serialize: (obj: any, prop: string, value: [number, number, number]) => {
    return value?.map((v) => Number(v.toFixed(3)))
  }
} satisfies PropType

export const vector2d = {
  get: (obj: any, prop: string): [number, number] => {
    return obj?.[prop]?.toArray()
  },
  set: (obj: any, prop: string, value: [number, number]) => {
    obj[prop].fromArray(value)
  },
  serialize: (obj: any, prop: string, value: [number, number]) => {
    return value?.map((v) => Number(v.toFixed(3)))
  }
} satisfies PropType

export const euler = {
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
} satisfies PropType

export const bool = {
  get: (obj: any, prop: string) => {
    return obj[prop]
  },
  set: (obj: any, prop: string, value: any) => {
    obj[prop] = value
  }
} satisfies PropType

export const number = {
  get: (obj: any, prop: string) => {
    return obj[prop]
  },
  set: (obj: any, prop: string, value: any) => {
    obj[prop] = value
  },
  serialize: (obj: any, prop: string, value: any) => {
    return Number(value.toFixed(3))
  }
} satisfies PropType

export const string = {
  get: (obj: any, prop: string) => {
    return obj[prop]
  },
  set: (obj: any, prop: string, value: any) => {
    obj[prop] = value
  },
  serialize: (obj: any, prop: string, value: any) => {
    return String(value)
  }
} satisfies PropType

export const gltf = {
  control: levaGltf,
  get(obj: any, prop: string) {
    return obj[prop]?.uuid
  },
  async load(obj: any, prop: string, value: any) {
    return new Promise((res) =>
      new GLTFLoader().load(value, (data) => {
        res(data.scene)
      })
    )
  },
  set(obj: any, prop: string, value: any) {
    obj[prop] = value
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
} satisfies PropType

export const select = {
  get(obj: any, prop: string) {
    return obj?.[prop]
  },
  set(obj: any, prop: string, value: any) {
    obj[prop]
  },
  serialize(obj: any, prop: string, value: any) {
    return value
  }
} satisfies PropType

export const ref = {
  get(obj: any, prop: string) {
    return getEditableElement(obj[prop])
  },
  control: levaRef,
  set(obj: any, prop: string, value: any) {}
}

export const unknown = {
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
