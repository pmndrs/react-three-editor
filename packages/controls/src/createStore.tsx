import { levaStore } from "leva"

export const createStore = () => {
  return new (Object.getPrototypeOf(levaStore).constructor)()
}
