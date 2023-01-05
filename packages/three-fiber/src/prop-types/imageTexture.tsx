import { PropType } from "@editable-jsx/editable"
import {
  Components,
  createPlugin,
  DropZone,
  ImageContainer,
  ImageLargePreview,
  ImagePreview,
  Instructions,
  Remove,
  useDropzone,
  useInputContext,
  usePopin
} from "@editable-jsx/ui"
import { MouseEvent, useCallback } from "react"
import { TextureLoader } from "three"

export const levaTexture = createPlugin({
  sanitize(value: any) {
    if (value instanceof File) {
      return URL.createObjectURL(value)
    }
    return value
  },
  component() {
    const { label, value, onUpdate, disabled } = useInputContext()
    const { popinRef, wrapperRef, shown, show, hide } = usePopin()

    const onDrop = useCallback(
      async (acceptedFiles: File[]) => {
        if (acceptedFiles.length) {
          let data = new FormData()
          data.append("file", acceptedFiles[0])
          data.append("type", "texture")
          let response = await fetch(
            `/__editor/save/${acceptedFiles[0].name}`,
            {
              method: "POST",
              body: data
            }
          )
          let json = await response.json()
          onUpdate(json)
        }
      },
      [onUpdate]
    )

    const clear = useCallback(
      (e: MouseEvent) => {
        e.stopPropagation()
        onUpdate(undefined)
      },
      [onUpdate]
    )

    const { getRootProps, getInputProps, isDragAccept } = useDropzone({
      maxFiles: 1,
      accept: { "image/*": [] },
      onDrop,
      disabled
    })

    return (
      <Components.Row input>
        <Components.Label>{label}</Components.Label>
        <ImageContainer>
          <ImagePreview
            ref={popinRef}
            hasImage={!!value}
            onPointerDown={() => !!value && show()}
            onPointerUp={hide}
            style={{ backgroundImage: value ? `url(${value})` : "none" }}
          />
          {shown && !!value && (
            <Components.Portal>
              <Components.Overlay
                onPointerUp={hide}
                style={{ cursor: "pointer" }}
              />
              <ImageLargePreview
                ref={wrapperRef}
                style={{ backgroundImage: `url(${value})` }}
              />
            </Components.Portal>
          )}
          <DropZone {...(getRootProps({ isDragAccept }) as any)}>
            <input {...getInputProps()} />
            <Instructions>
              {isDragAccept ? "drop image" : "click or drop"}
            </Instructions>
          </DropZone>
          <Remove onClick={clear} disabled={!value} />
        </ImageContainer>
      </Components.Row>
    )
  }
})

export const imageTexture = {
  control: levaTexture,
  get(obj: any, prop: string) {
    return obj[prop]?.source?.data?.src
  },
  set(obj: any, prop: string, value: any) {
    obj[prop] = value
    obj.needsUpdate = true
  },
  load(obj: any, prop: string, value: any) {
    return new TextureLoader().load(value)
  },
  serialize(obj: any, prop: string, value: any) {
    if (value === undefined) {
      return {
        src: value,
        loader: "TextureLoader",
        expression: `undefined`,
        imports: []
      }
    }
    return {
      src: value,
      loader: "TextureLoader",
      expression: `useLoader(TextureLoader, '${value}')`,
      imports: [
        {
          import: ["useLoader"],
          importPath: "@react-three/fiber"
        },
        {
          import: ["TextureLoader"],
          importPath: "three"
        }
      ]
    }
  }
} satisfies PropType
