import { createPlugin, InputContextProps, useInputContext } from "leva/plugin"

type CustomInputContextProps = InputContextProps & {
  value: string | number | boolean
  setValue: (value: string | number | boolean) => void
  settings: {
    component: (input: CustomInputContextProps) => JSX.Element
  }
}

export const custom = createPlugin<
  {
    data: any
    component: (input: CustomInputContextProps) => JSX.Element
  },
  any,
  {
    component: (input: CustomInputContextProps) => JSX.Element
  }
>({
  normalize({ data, component }) {
    return { value: data, settings: { component } }
  },
  component: () => {
    const input = useInputContext<CustomInputContextProps>()

    return input.settings!.component(input)
  }
})
