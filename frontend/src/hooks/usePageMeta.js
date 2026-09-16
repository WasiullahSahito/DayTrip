import { useEffect } from 'react'

// Client-rendered SPA stand-in for per-route <title>/<meta description> —
// there's no server-side rendering here, so this is the SEO hook we've got.
export function usePageMeta(title, description) {
  useEffect(() => {
    const prevTitle = document.title
    document.title = title ? `${title} | Lynk Clone` : 'Lynk Clone'

    let meta = document.querySelector('meta[name="description"]')
    const prevDescription = meta?.getAttribute('content') ?? null
    if (description) {
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', description)
    }

    return () => {
      document.title = prevTitle
      if (meta && prevDescription != null) meta.setAttribute('content', prevDescription)
    }
  }, [title, description])
}
