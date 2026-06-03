declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, string>) => void
    }
  }
}

const websiteId = import.meta.env.VITE_UMAMI_WEBSITE_ID as string | undefined
const scriptUrl = (import.meta.env.VITE_UMAMI_SCRIPT_URL as string | undefined) ?? 'https://cloud.umami.is/script.js'

export const isUmamiConfigured = Boolean(websiteId)

export function initUmami(): void {
  if (!websiteId || document.querySelector(`script[data-website-id="${websiteId}"]`)) return

  const script = document.createElement('script')
  script.defer = true
  script.src = scriptUrl
  script.setAttribute('data-website-id', websiteId)
  document.head.appendChild(script)
}

export function trackUmamiEvent(name: string, data?: Record<string, string>): void {
  window.umami?.track(name, data)
}
