import { State } from "xstate"

export function persisted<T>(ser: T, key: any): T {
  let prevState = localStorage.getItem(key)
  if (prevState) {
    prevState = JSON.parse(prevState)
  }

  const service = ser

  // @ts-ignore
  service.onTransition((state) => {
    localStorage.setItem(key, JSON.stringify(state))
  })

  // @ts-ignore
  service.start(prevState ? State.create(prevState as any) : undefined)
  return service
}
