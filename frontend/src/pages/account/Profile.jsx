import { useState } from 'react'
import { User, Mail, Building2, LogOut, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import PhoneField from '../../components/ui/PhoneField'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { isValidPhone, isNotEmpty } from '../../utils/validators'
import { initials } from '../../utils/format'

const TYPE_LABEL = { personal: 'Personal', business: 'Business', 'business-plus': 'Business+' }

export default function Profile() {
  const { user, updateProfile, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [phone, setPhone] = useState(user.phone)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  async function onSave(e) {
    e.preventDefault()
    const next = {}
    if (!isNotEmpty(firstName)) next.firstName = 'Required.'
    if (!isNotEmpty(lastName)) next.lastName = 'Required.'
    if (!isValidPhone(phone)) next.phone = 'Please enter a valid phone number'
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    await updateProfile({ firstName, lastName, phone })
    setSaving(false)
    toast.success('Profile updated.')
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-2xl font-extrabold text-ink">My profile</h1>

      <Card className="mt-6 !p-6">
        <div className="flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-full bg-ink text-lg font-bold text-white">
            {initials(`${user.firstName} ${user.lastName}`)}
          </span>
          <div>
            <p className="text-lg font-bold text-ink">
              {user.firstName} {user.lastName}
            </p>
            <Badge tone="primary">{TYPE_LABEL[user.accountType]} account</Badge>
          </div>
        </div>

        <form onSubmit={onSave} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" icon={<User className="size-4.5" />} value={firstName} onChange={(e) => setFirstName(e.target.value)} error={errors.firstName} />
            <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} error={errors.lastName} />
          </div>
          <Input label="Email address" icon={<Mail className="size-4.5" />} value={user.email} disabled className="!bg-surface-muted !text-ink-soft" />
          <PhoneField label="Phone number" value={phone} onChange={setPhone} error={errors.phone} />
          {user.businessName && (
            <Input label="Business name" icon={<Building2 className="size-4.5" />} value={user.businessName} disabled className="!bg-surface-muted !text-ink-soft" />
          )}
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
        </form>
      </Card>

      <Card className="mt-4 !p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2.5 text-sm font-semibold text-ink hover:bg-surface-muted cursor-pointer"
        >
          <LogOut className="size-4.5" /> Sign out
        </button>
        <button
          onClick={() => setDeleteOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2.5 text-sm font-semibold text-danger hover:bg-danger-bg cursor-pointer"
        >
          <Trash2 className="size-4.5" /> Delete account
        </button>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          toast.info('Account deletion is disabled in this demo.')
          setDeleteOpen(false)
        }}
        title="Delete account?"
        description="This action cannot be undone. All your bookings and saved data will be permanently removed."
        confirmLabel="Delete my account"
      />
    </div>
  )
}
