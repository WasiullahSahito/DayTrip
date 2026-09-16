import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router's <Link> does not auto-scroll to an in-page anchor on
// navigation (that's plain-browser behavior, not SPA behavior) — without
// this, a "/#personal" link from another page would land on "/" without
// ever scrolling to the section. Renders nothing; just watches the route.
export default function ScrollToHash() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      const el = document.getElementById(id)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [location.pathname, location.hash])

  return null
}
