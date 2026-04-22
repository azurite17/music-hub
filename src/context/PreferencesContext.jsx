import { useLayoutEffect, useMemo, useState } from 'react'
import PreferencesContext from './preferences-context'

const THEME_KEY = 'music-hub-theme'
const FEED_RICH_KEY = 'music-hub-feed-rich'

export function PreferencesProvider({ children }) {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem(THEME_KEY) || 'default',
  )
  const [feedRich, setFeedRichState] = useState(
    () => localStorage.getItem(FEED_RICH_KEY) !== 'false',
  )

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const value = useMemo(
    () => ({
      theme,
      setTheme(next) {
        setThemeState(next)
        localStorage.setItem(THEME_KEY, next)
      },
      feedRich,
      setFeedRich(next) {
        setFeedRichState(next)
        localStorage.setItem(FEED_RICH_KEY, next ? 'true' : 'false')
      },
    }),
    [feedRich, theme],
  )

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  )
}
