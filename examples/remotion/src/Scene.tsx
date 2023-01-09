import { getVideoMetadata, VideoMetadata } from "@remotion/media-utils"
import { useVideoTexture } from "@remotion/three"
import React, { useEffect, useRef, useState } from "react"
import { AbsoluteFill, useVideoConfig } from "remotion"
import { Video } from "./Video"

const container: React.CSSProperties = {
  backgroundColor: "white",
}

const videoStyle: React.CSSProperties = {
  position: "absolute",
  opacity: 0,
}

export const Scene: React.FC<{
  videoSrc: string
  baseScale: number
}> = ({ baseScale, videoSrc }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const { width, height } = useVideoConfig()
  const [videoData, setVideoData] = useState<VideoMetadata | null>(null)

  useEffect(() => {
    getVideoMetadata(videoSrc)
      .then((data) => setVideoData(data))
      .catch((err) => console.log(err))
  }, [videoSrc])

  const texture = useVideoTexture(videoRef)
  return (
    <AbsoluteFill style={container}>
      <Video />
      {/* {videoData ? (
        <ThreeCanvas linear width={width} height={height}>
          <ambientLight intensity={1.5} color={0xffffff} />
          <pointLight position={[10, 10, 0]} />

          <Phone baseScale={baseScale} aspectRatio={videoData.aspectRatio} />
        </ThreeCanvas>
      ) : null} */}
    </AbsoluteFill>
  )
}
