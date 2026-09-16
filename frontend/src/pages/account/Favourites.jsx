import { useEffect, useState } from 'react'
import { Star, Plus, Trash2, Home, Briefcase, MapPin } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import AddressField from '../../components/booking/AddressField'
import * as locationService from '../../services/locationService'
import { useToast } from '../../context/ToastContext'

function iconFor(nickname = '') {
  const n = nickname.toLowerCase()
  if (n.includes('home')) return Home
  if (n.includes('work')) return Briefcase
  return MapPin
}

export default function Favourites() {
  const toast = useToast()
  const [favourites, setFavourites] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [pendingAddress, setPendingAddress] = useState(null)
  const [nickname, setNickname] = useState('')
  const [saving, setSaving] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    locationService.getFavourites().then(setFavourites)
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    if (!pendingAddress || !nickname.trim()) return
    setSaving(true)
    const next = await locationService.addFavourite(pendingAddress, nickname.trim())
    setFavourites(next)
    setSaving(false)
    setAddOpen(false)
    setPendingAddress(null)
    setNickname('')
    toast.success('Address added to favourites.')
  }

  async function handleRemove() {
    setRemoving(true)
    const next = await locationService.removeFavourite(removeTarget.id)
    setFavourites(next)
    setRemoving(false)
    setRemoveTarget(null)
    toast.success('Favourite removed.')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Favourite addresses</h1>
          <p className="text-sm text-ink-soft">Save the places you go most for faster booking.</p>
        </div>
        <Button size="sm" icon={<Plus className="size-4" />} onClick={() => setAddOpen(true)}>
          Add
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {favourites === null && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}

        {favourites !== null && favourites.length === 0 && (
          <EmptyState
            icon={<Star className="size-6" />}
            title="No favourites yet"
            description="Add home, work, or anywhere you visit often."
            action={
              <Button size="sm" onClick={() => setAddOpen(true)}>
                Add your first favourite
              </Button>
            }
          />
        )}

        {(favourites || []).map((f) => {
          const Icon = iconFor(f.nickname)
          return (
            <Card key={f.id} className="flex items-center gap-3.5 !p-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-ink">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink">{f.nickname}</p>
                <p className="truncate text-sm text-ink-soft">{f.label}</p>
              </div>
              <button
                onClick={() => setRemoveTarget(f)}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-soft hover:bg-danger-bg hover:text-danger cursor-pointer"
                aria-label="Remove favourite"
              >
                <Trash2 className="size-4.5" />
              </button>
            </Card>
          )
        })}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add favourite address" size="sm">
        <form onSubmit={handleAdd} className="space-y-4 pb-2">
          <AddressField label="Address" placeholder="Search for an address" value={pendingAddress} onChange={setPendingAddress} tone="stop" />
          <Input label="Nickname" placeholder="e.g. Home, Work, Mam's house" value={nickname} onChange={(e) => setNickname(e.target.value)} />
          <Button type="submit" fullWidth loading={saving} disabled={!pendingAddress || !nickname.trim()}>
            Save favourite
          </Button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={handleRemove}
        loading={removing}
        title="Delete this favourite?"
        description={removeTarget ? `“${removeTarget.nickname}” will be removed from your favourites.` : ''}
        confirmLabel="Yes, delete"
      />
    </div>
  )
}
