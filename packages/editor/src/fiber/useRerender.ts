import { useCallback, useState } from 'react'

export const useRerender = () => {
    const [, rerender] = useState(0)
    return useCallback(() => rerender((i) => i + 1), [rerender])
}
