import { useState, useEffect } from 'react'

export const usePageActive = () => {
    const [isPageActive, setIsPageActive] = useState(true)

    useEffect(() => {
        const onPageVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                requestAnimationFrame(() => setIsPageActive(true))
            } else {
                setIsPageActive(false)
            }
        }

        document.addEventListener('visibilitychange', onPageVisibilityChange)
        return () => {
            document.removeEventListener(
                'visibilitychange',
                onPageVisibilityChange
            )
        }
    }, [])

    return isPageActive
}
