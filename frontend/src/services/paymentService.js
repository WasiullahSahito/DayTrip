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
  return api.delete(`/payment-methods/${id}`)
}

export async function setDefaultCard(id) {
  return api.post(`/payment-methods/${id}/default`)
}
