export function Floating({
  children
}: {
  children: (size) => React.ReactNode
}) {
  const size = useThree((s) => s.size)
  return <FloatingPanels.In>{children(size)}</FloatingPanels.Outs>
}
