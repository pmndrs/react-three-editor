import { BirpcReturn } from "birpc"
import create from "zustand"
import { devtools } from "zustand/middleware"
import { RpcServerFunctions } from "../Editor"

export type ComponentType = {
  name: string
  importPath: string
}

export type ComponentRegistryStoreState = {
  components: ComponentType[]
}

const createComponentRegistryStore = (name: string = "component-registry") => {
  return create<ComponentRegistryStoreState>(
    devtools(
      (_) => {
        return {
          components: []
        }
      },
      { name }
    )
  )
}

export type ComponentRegistryStore = ReturnType<
  typeof createComponentRegistryStore
>

export class ComponentLoader {
  store: ComponentRegistryStore = createComponentRegistryStore()

  constructor(public client: BirpcReturn<RpcServerFunctions>) {}

  async initialize() {
    const componentFiles = await this.client.initializeComponentsWatcher()
    componentFiles.forEach(({ fileName, components }) => {
      components.forEach((componentName) =>
        this.registerProjectComponent(componentName, fileName)
      )
    })
  }

  registerComponent(name: string, meta: Omit<ComponentType, "name">) {
    //
    this.store.setState((state) => {
      const index = state.components.findIndex(
        (c) => c.name === name && c.importPath === meta.importPath
      )
      if (index > -1) {
        state.components.splice(
          index,
          1,
          Object.assign(state.components[index], { name, ...meta })
        )
      } else {
        state.components.push({ name, ...meta })
      }
      return {
        ...state,
        components: [...state.components]
      }
    })
  }

  registerProjectComponent(name: string, importPath: string) {
    return this.registerComponent(name, { importPath })
  }

  getComponents() {
    return this.store.getState().components
  }

  useComponents() {
    return this.store(({ components }) => components)
  }
}
