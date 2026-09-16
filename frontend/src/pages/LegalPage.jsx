export default function LegalPage({ title, updated, children }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink-soft">Last updated {updated}</p>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-soft">{children}</div>
    </div>
  )
}
