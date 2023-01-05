import { Components, CustomInput, InputOptions } from "leva/plugin"

import { MultiToggle } from "../MultiToggle"
import { custom } from "./custom"

export function multiToggle<TOptions extends readonly string[]>(
  props: InputOptions & { options: TOptions; data?: string }
): CustomInput<TOptions[number]> {
  return custom({
    data: props.options[0],
    ...props,
    component: (input) => {
      return (
        <Components.Row input>
          <Components.Label>{input.label}</Components.Label>
          <MultiToggle.Root>
            {props.options.map((option) => (
              <MultiToggle.Option value={option} key={option} />
            ))}
          </MultiToggle.Root>
        </Components.Row>
      )
    }
  }) as any
}
