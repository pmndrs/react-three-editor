import { levaStore } from "leva"
import create, { GetState, SetState, UseBoundStore as Store } from "zustand"

export { LevaInputs, levaStore as defaultStore } from "leva"
export type {
  DataInput,
  DataInputOptions,
  DataItem,
  StoreType as ControlledStore
} from "leva/dist/declarations/src/types"
export type { StoreApi, UseBoundStore as Store } from "zustand"

export const createControlledStore = () => {
  return new (Object.getPrototypeOf(levaStore).constructor)()
}
export function createStore<T extends object>(
  name: string,
  fn: (set: SetState<T>, get: GetState<T>) => T
): Store<T> {
  return create(fn)
}
