import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Reset window scroll on client-side route changes (pathname or search). */
export function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, search])

  return null
}
