import { Link } from 'react-router-dom'
import { MapPinOff } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary-light text-ink">
        <MapPinOff className="size-8" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold text-ink">Ah, we can’t find it!</h1>
      <p className="mt-2 max-w-sm text-ink-soft">
        The page you’re looking for doesn’t exist or may have moved.
      </p>
      <Link to="/">
        <Button className="mt-6">Back to home</Button>
      </Link>
    </div>
  )
}
