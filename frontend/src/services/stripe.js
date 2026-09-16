import { loadStripe } from '@stripe/stripe-js'

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

// A single shared Stripe.js instance, loaded once. Only the publishable key
// is ever used client-side — the secret key lives exclusively in the
// Laravel backend's .env. loadStripe() throws synchronously on an empty
// key, which would break every page that merely imports this module (most
// of the booking flow) even when the caller never mounts a card form — so
// stay `null` instead of calling it until a real key is configured; callers
// already show a "not configured" state when this resolves to null.
export const stripePromise = publishableKey ? loadStripe(publishableKey) : Promise.resolve(null)
