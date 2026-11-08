import { useEffect, useMemo, useState } from 'react'

/**
 * Colors for code that cannot use Tailwind classes, such as a canvas. They are read from the
 * CSS tokens, so the canvas follows the theme instead of carrying its own palette.
 */
export function useCssColors<K extends string>(names: Record<K, string>) {
  const [theme, setTheme] = useState(0)
  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setTheme((n) => n + 1)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  // `theme` only exists to recompute the values when the system theme flips.
  return useMemo(() => {
    const style = getComputedStyle(document.documentElement)
    const entries = Object.entries<string>(names).map(([key, variable]) => [key, style.getPropertyValue(variable).trim()])
    return { ...(Object.fromEntries(entries) as Record<K, string>), font: getComputedStyle(document.body).fontFamily }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme])
}
