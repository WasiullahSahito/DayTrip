import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  danger = true,
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center py-2 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-danger-bg text-danger">
          <AlertTriangle className="size-6" />
        </span>
        <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
        {description && <p className="mt-1.5 text-sm text-ink-soft">{description}</p>}
        <div className="mt-6 flex w-full gap-3">
          <Button variant="outline" fullWidth onClick={onClose}>
            Go back
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} fullWidth loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
