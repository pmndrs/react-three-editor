import { levaStore } from "leva"

export const createLevaStore = () => {
  return new (Object.getPrototypeOf(levaStore).constructor)()
}
