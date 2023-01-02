import { Components, createPlugin, styled, useInputContext } from "leva/plugin"
export const StyledInputRow = styled(Components.Row, {
  columnGap: "$colGap",
  gridTemplateColumns: "auto 1fr"
})

export const toggle = createPlugin({
  component: () => {
    const { value, onUpdate, disabled, id, label } = useInputContext<{
      value: boolean
    }>()
    return (
      <StyledInputRow>
        <Components.Boolean
          {...{
            value,
            onUpdate,
            disabled,
            id
          }}
        />
        <Components.Label>{label}</Components.Label>
      </StyledInputRow>
    )
  }
})
