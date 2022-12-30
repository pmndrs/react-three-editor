import { Interpreter, State } from "xstate"

export function getService<T extends Interpreter<any, any, any, any>>(
  ser: T,
  key: any
) {
  let prevState = localStorage.getItem(key)
  if (prevState) {
    prevState = JSON.parse(prevState)
  }

  const service = ser

  service.onTransition((state) => {
    localStorage.setItem(key, JSON.stringify(state))
  })

  service.start(prevState ? State.create(prevState as any) : undefined)
  return service
}
