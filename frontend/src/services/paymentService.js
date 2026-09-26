import { api } from './api'

export async function getCards() {
  return api.get('/payment-methods')
}

export async function createSetupIntent() {
  const data = await api.post('/payment-methods/setup-intent')
  return data.clientSecret
}

/**
 * `paymentMethodId` is a Stripe PaymentMethod ID (pm_...) produced by
 * Stripe.js after the customer enters their card into Stripe's own Payment
 * Element — never a raw card number/expiry/CVC.
 */
export async function attachCard(paymentMethodId) {
  return api.post('/payment-methods', { paymentMethodId })
}

export async function removeCard(id) {
  return api.delete(`/payment-methods/${encodeURIComponent(id)}`)
}

export async function setDefaultCard(id) {
  return api.post(`/payment-methods/${encodeURIComponent(id)}/default`)
}

// -- SumUp --

/** Starts saving a SumUp card; returns the checkout id the Card Widget mounts against. */
export async function createSumUpCheckout() {
  const data = await api.post('/payment-methods/sumup/checkout')
  return data.checkoutId
}

/** Tells the backend the widget finished; it re-verifies with SumUp and returns the updated card list. */
export async function confirmSumUpSetup(checkoutId) {
  return api.post('/payment-methods/sumup/confirm', { checkoutId })
}

/** Pays a booking with a saved SumUp card ("sumup:<token>"). The amount is the booking's stored fare. */
export async function chargeSumUpCard(bookingId, cardId) {
  return api.post('/payments/sumup/charge', { bookingId, cardId })
}

export function isSumUpCard(cardId) {
  return typeof cardId === 'string' && cardId.startsWith('sumup:')
}
