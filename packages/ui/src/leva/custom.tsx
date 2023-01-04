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
    data: string
    component: (input: CustomInputContextProps) => JSX.Element
  },
  string,
  {
    component: (input: CustomInputContextProps) => JSX.Element
  }
>({
  normalize({ data, component, ...settings }) {
    return { value: data, settings: { component, ...settings } }
  },
  component: () => {
    const input = useInputContext<CustomInputContextProps>()

    return input.settings!.component(input)
  }
})
