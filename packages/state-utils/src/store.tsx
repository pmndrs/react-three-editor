import { levaStore } from "leva"
import { DataInput, StoreType } from "leva/dist/declarations/src/types"
import create, {
  GetState,
  SetState,
  UseBoundStore as Store,
  UseBoundStore
} from "zustand"

export { LevaInputs as InputTypes, levaStore as defaultStore } from "leva"
export type { StoreApi, UseBoundStore as Store } from "zustand"

export type ControlledStore = Omit<StoreType, "useStore"> & {
  useStore: UseBoundStore<{ data: { [key: string]: DataInput } }>
}

export const createControlledStore = (): ControlledStore => {
  return new (Object.getPrototypeOf(levaStore).constructor)()
}
export function createStore<T extends object>(
  name: string,
  fn: (set: SetState<T>, get: GetState<T>) => T
): Store<T> {
  return create(fn)
}
