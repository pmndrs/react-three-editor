import { Leva } from 'leva'
import { Perf } from 'r3f-perf'
import React, {
    Suspense,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react'
import { HashRouter as Router, Route, Routes, useMatch } from 'react-router-dom'
import { DebugTunnel } from './DebugTunnel'
import { Loader } from './Loader'
import {
    isSketchRoute,
    Sketch,
    sketchComponents,
    visibleSketches,
} from './sketches'
import {
    GlobalStyle,
    HideH1GlobalStyle,
    Menu,
    MenuContainer,
    MenuItem,
    MenuItemImage,
    MenuItemTitle,
    MenuToggle,
    Page,
} from './styles'

const defaultSketch = 'Home'
const DefaultComponent = sketchComponents[defaultSketch].Component

const RoutedComponent = () => {
    const {
        params: { name: routeName },
    } = useMatch('/sketch/:name') || { params: { name: defaultSketch } }
    const sketchName = isSketchRoute(routeName) ? routeName : defaultSketch
    const { Component } = sketchComponents[sketchName]
    return <Component />
}

const modes = ['default', 'debug', 'screenshot'] as const
type DisplayMode = typeof modes[number]

type NavigationProps = {
    currentRoute?: string
    displayMode: DisplayMode | null
}

type NavigationRef = {
    setMenuOpen: (value: boolean) => void
}

const Navigation = React.forwardRef<NavigationRef, NavigationProps>(
    ({ displayMode, currentRoute }, ref) => {
        const [menuOpen, setMenuOpen] = useState(false)

        useImperativeHandle(ref, () => ({
            setMenuOpen: (value: boolean) => {
                setMenuOpen(value)
            },
        }))

        return (
            <>
                {displayMode !== 'screenshot' ? (
                    <MenuToggle
                        className="material-symbols-outlined"
                        onClick={() => setMenuOpen((v) => !v)}
                    >
                        menu
                    </MenuToggle>
                ) : undefined}

                <MenuContainer
                    id="menu-container"
                    open={menuOpen}
                    onClick={() => setMenuOpen(false)}
                >
                    <Menu id="menu" open={menuOpen}>
                        {visibleSketches.map((sketch) => (
                            <MenuItem
                                key={sketch.route}
                                to={`/sketch/${sketch.route}`}
                                title={sketch.title}
                                className={
                                    sketch.route === currentRoute
                                        ? 'active'
                                        : ''
                                }
                            >
                                {(sketch as Sketch).cover ? (
                                    <MenuItemImage
                                        src={sketch.cover}
                                        alt={sketch.title}
                                    />
                                ) : undefined}
                                <MenuItemTitle>{sketch.title}</MenuItemTitle>
                            </MenuItem>
                        ))}
                    </Menu>
                </MenuContainer>
            </>
        )
    }
)

const App = () => {
    const [displayMode, setDisplayMode] = useState<DisplayMode>('default')
    const [smallScreen, setSmallScreen] = useState(false)
    const navigationRef = useRef<NavigationRef>(null)

    const {
        params: { name: currentRoute },
    } = useMatch('/sketch/:name') || { params: { name: defaultSketch } }

    useEffect(() => {
        const handler = (e: WindowEventMap['keyup']): void => {
            if (e.key === '?') {
                const currentIndex = modes.findIndex((m) => m === displayMode)
                const nextModeIndex = (currentIndex + 1) % modes.length
                setDisplayMode(modes[nextModeIndex])
            } else if (e.key === 'Escape') {
                navigationRef.current?.setMenuOpen(false)
            }
        }

        window.addEventListener('keyup', handler)

        return () => {
            window.removeEventListener('keyup', handler)
        }
    }, [displayMode])

    useEffect(() => {
        const media = window.matchMedia('(max-width: 500px)')

        if (media.matches !== smallScreen) {
            setSmallScreen(media.matches)
        }

        const listener = () => {
            setSmallScreen(media.matches)
        }

        window.addEventListener('resize', listener)
        return () => window.removeEventListener('resize', listener)
    }, [smallScreen])

    return (
        <Page>
            {/* <Leva
                collapsed
                theme={
                    smallScreen
                        ? {}
                        : {
                              sizes: {
                                  rootWidth: '450px',
                                  controlWidth: '160px',
                              },
                          }
                }
            /> */}

            <Suspense fallback={<Loader />}>
                <Routes>
                    <Route path="/*" element={<DefaultComponent />} />
                    <Route path="/sketch/:name" element={<RoutedComponent />} />
                </Routes>
            </Suspense>

            <Navigation
                ref={navigationRef}
                currentRoute={currentRoute}
                displayMode={displayMode}
            />

            {displayMode === 'default' ? (
                <a
                    href={`https://github.com/isaac-mason/sketches/tree/main/src/sketches/sketch-${currentRoute}`}
                >
                    GitHub
                </a>
            ) : undefined}

            {displayMode === 'debug' ? (
                <DebugTunnel.In>
                    <Perf position="bottom-right" />
                </DebugTunnel.In>
            ) : undefined}

            {displayMode === 'screenshot' ? <HideH1GlobalStyle /> : undefined}
        </Page>
    )
}

export default () => {
    return (
        <Router>
            <App />
            <GlobalStyle />
        </Router>
    )
}
