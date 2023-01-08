import { CommandBar, KeyboardCommands } from "@editable-jsx/commander"
import {
  EditorPanels,
  SceneControls,
  SelectedElementControls
} from "@editable-jsx/editable"
import { EditorProvider } from "@editable-jsx/editable/src/EditorProvider"
import { PanelRoot } from "@editable-jsx/panels/src/ui/PanelGroup"
import { Floating, Toaster } from "@editable-jsx/ui"
import { PlayerProps, PlayerRef } from "@remotion/player"
import { forwardRef } from "react"
import { AllCommands } from "./commands"
import { editor } from "./EditablePlayer"
import { PlayerPanel } from "./PlayerPanel"

// function EditorLayout(props) {
//   const editor = useEditor()
//   if (editor) {
//     return <EditorRoot></EditorRoot>
//   } else {
//     return (
//       <EditorProvider editor={editor}>
//         {/* Registers all the commands: keyboard shortcuts & command palette */}
//         <AllCommands />
//         {/* Panels active in the editor */}
//         <EditorPanels />
//         {/* Editor layout and the Canvas in the middle */}
//         <PanelContainer>
//           <PanelGroup side="left" />
//           <div
//             style={{
//               width: "100%",
//               height: "100%",
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               justifyContent: "center",
//               background: "#CBD5E1"
//             }}
//           >
//             <div
//               style={{
//                 background: "white"
//               }}
//             >
//               <EditablePlayer
//                 {...props}
//                 style={{
//                   width: "60vw",
//                   aspectRatio: `1 / ${
//                     props.compositionHeight / props.compositionWidth
//                   }}`
//                 }}
//               />
//             </div>
//           </div>
//           {/* <EditableCanvas {...props} ref={ref} /> */}
//           <PanelGroup side="right" />
//         </PanelContainer>
//         <SelectedElementControls />
//         <SceneControls />
//         {/* Tray of user component library to pick and place entities */}
//         {/* <ComponentsTray /> */}
//         {/* Command bar dialog */}
//         <CommandBar.Out />
//         {/* Floating UI, panels, bottom bar */}
//         <Floating.Out />
//         {/* Toaster for alerts */}
//         <Toaster />
//       </EditorProvider>
//     )
//   }
// }
// function EditorRoot({
//   editor,
//   children
// }: {
//   editor: Editor
//   children: React.ReactNode
// }) {
//   return (
//     <EditorProvider editor={editor}>
//       {/* Registers all the commands: keyboard shortcuts & command palette */}
//       <AllCommands />
//       {/* Panels active in the editor */}
//       <EditorPanels />
//       <SelectedElementControls />
//       <SceneControls />
//       {/* Editor layout and the Canvas in the middle */}
//       <PanelContainer>
//         <PanelGroup side="left" />
//         {children}
//         <PanelGroup side="right" />
//       </PanelContainer>
//       {/* Tray of user component library to pick and place entities */}
//       {/* <ComponentsTray /> */}
//       {/* Command bar dialog */}
//       <CommandBar.Out />
//       {/* Floating UI, panels, bottom bar */}
//       <Floating.Out />
//       {/* Toaster for alerts */}
//       <Toaster />
//     </EditorProvider>
//   )
// }

export const Player = forwardRef<
  PlayerRef,
  PlayerProps<{}> & { component: React.FC }
>((props, ref) => {
  return (
    <EditorProvider editor={editor}>
      {/* Registers all the commands: keyboard shortcuts & command palette */}
      <AllCommands />

      {/* Panels active in the editor */}
      <EditorPanels />
      <SelectedElementControls />
      <SceneControls />
      <KeyboardCommands />
      <CommandBar.In />

      {/* Editor layout and the Canvas in the middle */}
      <PanelRoot>
        <PlayerPanel {...props} ref={ref} />
      </PanelRoot>

      {/* Tray of user component library to pick and place entities */}
      {/* <ComponentsTray /> */}

      {/* Command bar dialog */}
      <CommandBar.Out />

      {/* Floating UI, panels, bottom bar */}
      <Floating.Out />

      {/* Toaster for alerts */}
      <Toaster />
    </EditorProvider>
  )
})
