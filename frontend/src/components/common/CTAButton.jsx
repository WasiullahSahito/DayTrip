import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import clsx from 'clsx'
import Button from '../ui/Button'

// A single place that decides HOW a call-to-action navigates: internal
// destinations use React Router's <Link> (no full reload); external
// destinations render a real <a target="_blank"> and get a visual marker,
// per the "separate internal vs external navigation" rule.
export default function CTAButton({ to, href, state, disabled, icon, fullWidth, children, ...buttonProps }) {
  const wrapperClass = clsx('inline-flex', fullWidth && 'w-full')

  // A disabled CTA must not navigate at all — wrapping a disabled <Button> in
  // <Link>/<a> would still let clicks on its enclosing anchor fire the nav,
  // since the disabled attribute only blocks the button element itself.
  if (disabled) {
    return (
      <span className={wrapperClass}>
        <Button icon={icon} fullWidth={fullWidth} disabled {...buttonProps}>
          {children}
        </Button>
      </span>
    )
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={wrapperClass}>
        <Button icon={icon} fullWidth={fullWidth} {...buttonProps}>
          {children}
          <ExternalLink className="size-3.5 opacity-60" />
        </Button>
      </a>
    )
  }

  return (
    <Link to={to} state={state} className={wrapperClass}>
      <Button icon={icon} fullWidth={fullWidth} {...buttonProps}>
        {children}
      </Button>
    </Link>
  )
}
