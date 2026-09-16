import clsx from 'clsx'

export default function Skeleton({ className }) {
  return <div className={clsx('animate-pulse-soft rounded-lg bg-border/70', className)} />
}
