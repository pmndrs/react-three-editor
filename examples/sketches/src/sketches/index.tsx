import { lazy } from 'react'
import GLSLShadersFromScratch01Cover from './sketch-GLSLShadersFromScratch01-Varyings/cover.png'
import GLSLShadersFromScratch02Cover from './sketch-GLSLShadersFromScratch02-Uniforms/cover.png'
import GLSLShadersFromScratch03Cover from './sketch-GLSLShadersFromScratch03-Attributes/cover.png'
import GLSLShadersFromScratch04Cover from './sketch-GLSLShadersFromScratch04-Textures/cover.png'
import GLSLShadersFromScratch05Cover from './sketch-GLSLShadersFromScratch05-Alpha/cover.png'
import GLSLShadersFromScratch06Cover from './sketch-GLSLShadersFromScratch06-Addressing/cover.png'
import JourneyLesson03Cover from './sketch-JourneyLesson03-Basic/cover.png'
import JourneyLesson05Cover from './sketch-JourneyLesson05-Transforms/cover.png'
import JourneyLesson06Cover from './sketch-JourneyLesson06-Animations/cover.png'
import JourneyLesson07Cover from './sketch-JourneyLesson07-Cameras/cover.png'
import JourneyLesson09Cover from './sketch-JourneyLesson09-Geometries/cover.png'
import JourneyLesson11Cover from './sketch-JourneyLesson11-Textures/cover.png'
import JourneyLesson12Cover from './sketch-JourneyLesson12-Materials/cover.png'
import JourneyLesson13Cover from './sketch-JourneyLesson13-Text/cover.png'
import JourneyLesson15Cover from './sketch-JourneyLesson15-Lights/cover.png'
import JourneyLesson16Cover from './sketch-JourneyLesson16-Shadows/cover.png'
import JourneyLesson17Cover from './sketch-JourneyLesson17-HauntedHouse/cover.png'
import JourneyLesson18_1Cover from './sketch-JourneyLesson18-1-Particles/cover.png'
import JourneyLesson18_2Cover from './sketch-JourneyLesson18-2-Particles/cover.png'
import JourneyLesson19Cover from './sketch-JourneyLesson19-GalaxyGenerator/cover.png'
import JourneyLesson27Cover from './sketch-JourneyLesson27-Shaders/cover.png'
import JourneyLesson28Cover from './sketch-JourneyLesson28-RagingSea/cover.png'
import JourneyLesson29Cover from './sketch-JourneyLesson29-AnimatedGalaxy/cover.png'
import JourneyLesson30Cover from './sketch-JourneyLesson30-ModifiedMaterials/cover.png'
import RapierRevoluteJointVehicleCover from './sketch-Rapier-RevoluteJointVehicle/cover.png'
import RapierRaycastingCover from './sketch-Rapier-Raycasting/cover.png'
import RapierRaycastVehicleCover from './sketch-Rapier-RaycastVehicle/cover.png'

export type Sketch = {
    title: string
    route: string
    cover?: string
    hidden?: boolean
}

const sketchList = [
    { title: 'Home', route: 'Home' },
    /* GLSL Shaders From Scratch */
    {
        title: 'Shaders From Scratch 1 - Varyings',
        route: 'GLSLShadersFromScratch01-Varyings',
        cover: GLSLShadersFromScratch01Cover,
    },
    {
        title: 'Shaders From Scratch 2 - Uniforms',
        route: 'GLSLShadersFromScratch02-Uniforms',
        cover: GLSLShadersFromScratch02Cover,
    },
    {
        title: 'Shaders From Scratch 3 - Attributes',
        route: 'GLSLShadersFromScratch03-Attributes',
        cover: GLSLShadersFromScratch03Cover,
    },
    {
        title: 'Shaders From Scratch 4 - Textures',
        route: 'GLSLShadersFromScratch04-Textures',
        cover: GLSLShadersFromScratch04Cover,
    },
    {
        title: 'Shaders From Scratch 5 - Alpha',
        route: 'GLSLShadersFromScratch05-Alpha',
        cover: GLSLShadersFromScratch05Cover,
    },
    {
        title: 'Shaders From Scratch 6 - Addressing',
        route: 'GLSLShadersFromScratch06-Addressing',
        cover: GLSLShadersFromScratch06Cover,
    },
    /* Three.js Journey */
    {
        title: 'Journey Lesson 3 - Basic',
        route: 'JourneyLesson03-Basic',
        cover: JourneyLesson03Cover,
    },
    {
        title: 'Journey Lesson 5 - Transforms',
        route: 'JourneyLesson05-Transforms',
        cover: JourneyLesson05Cover,
    },
    {
        title: 'Journey Lesson 6 - Animations',
        route: 'JourneyLesson06-Animations',
        cover: JourneyLesson06Cover,
    },
    {
        title: 'Journey Lesson 7 - Cameras',
        route: 'JourneyLesson07-Cameras',
        cover: JourneyLesson07Cover,
    },
    {
        title: 'Journey Lesson 9 - Geometries',
        route: 'JourneyLesson09-Geometries',
        cover: JourneyLesson09Cover,
    },
    {
        title: 'Journey Lesson 11 - Textures',
        route: 'JourneyLesson11-Textures',
        cover: JourneyLesson11Cover,
    },
    {
        title: 'Journey Lesson 12 - Materials',
        route: 'JourneyLesson12-Materials',
        cover: JourneyLesson12Cover,
    },
    {
        title: 'Journey Lesson 13 - Text',
        route: 'JourneyLesson13-Text',
        cover: JourneyLesson13Cover,
    },
    {
        title: 'Journey Lesson 15 - Lights',
        route: 'JourneyLesson15-Lights',
        cover: JourneyLesson15Cover,
    },
    {
        title: 'Journey Lesson 16 - Shadows',
        route: 'JourneyLesson16-Shadows',
        cover: JourneyLesson16Cover,
    },
    {
        title: 'Journey Lesson 17 - Haunted House',
        route: 'JourneyLesson17-HauntedHouse',
        cover: JourneyLesson17Cover,
    },
    {
        title: 'Journey Lesson 18.1 - Particles',
        route: 'JourneyLesson18-1-Particles',
        cover: JourneyLesson18_1Cover,
    },
    {
        title: 'Journey Lesson 18.2 - Particles',
        route: 'JourneyLesson18-2-Particles',
        cover: JourneyLesson18_2Cover,
    },
    {
        title: 'Journey Lesson 19 - Galaxy Generator',
        route: 'JourneyLesson19-GalaxyGenerator',
        cover: JourneyLesson19Cover,
    },
    {
        title: 'Journey Lesson 27 - Shaders',
        route: 'JourneyLesson27-Shaders',
        cover: JourneyLesson27Cover,
    },
    {
        title: 'Journey Lesson 28 - Raging Sea',
        route: 'JourneyLesson28-RagingSea',
        cover: JourneyLesson28Cover,
    },
    {
        title: 'Journey Lesson 29 - Animated Galaxy',
        route: 'JourneyLesson29-AnimatedGalaxy',
        cover: JourneyLesson29Cover,
    },
    {
        title: 'Journey Lesson 30 - Modified Materials',
        route: 'JourneyLesson30-ModifiedMaterials',
        cover: JourneyLesson30Cover,
    },
    /* Rapier */
    {
        title: 'Rapier - Revolute Joint Vehicle',
        route: 'Rapier-RevoluteJointVehicle',
        cover: RapierRevoluteJointVehicleCover,
    },
    {
        title: 'Rapier - Raycasting',
        route: 'Rapier-Raycasting',
        cover: RapierRaycastingCover,
    },
    {
        title: 'Rapier - Raycast Vehicle',
        route: 'Rapier-RaycastVehicle',
        cover: RapierRaycastVehicleCover,
    },
] as const

export const sketches: readonly Sketch[] = sketchList

export const visibleSketches: readonly Sketch[] = sketches.filter(
    (sketch) => sketch.hidden === undefined || sketch.hidden === false
)

export const isSketchRoute = (v?: string): v is Sketch['route'] =>
    sketchList.some((s) => s.route === v)

export const sketchComponents = sketchList.reduce((o, sketch) => {
    o[sketch.route] = {
        Component: lazy(() => import(`./sketch-${sketch.route}/index.tsx`)),
    }
    return o
}, {} as Record<Sketch['route'], { Component: React.ComponentType }>)
