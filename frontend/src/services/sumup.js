const SDK_URL = 'https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js'

let sdkPromise = null

// Loads SumUp's Card Widget SDK on demand (only when someone opens the SumUp
// tab), so no SumUp script runs for anyone who never uses it. Card details are
// typed into SumUp's own widget — this app never sees them.
export function loadSumUpCard() {
  if (window.SumUpCard) return Promise.resolve(window.SumUpCard)

  sdkPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SDK_URL
    script.async = true
    script.onload = () => (window.SumUpCard ? resolve(window.SumUpCard) : reject(new Error('SumUp failed to load.')))
    script.onerror = () => {
      sdkPromise = null
      script.remove()
      reject(new Error('Unable to load the SumUp card form. Check your connection and try again.'))
    }
    document.head.appendChild(script)
  })

  return sdkPromise
}
