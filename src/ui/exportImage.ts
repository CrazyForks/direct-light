import { capturePreview } from '../scene/capture'

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// Downscale a PNG data URL to a small thumbnail for cheap localStorage storage.
export function downscaleDataUrl(dataUrl: string, maxW: number): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve(dataUrl)
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

export function exportPreviewImage() {
  const data = capturePreview()
  if (!data) return
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  downloadDataUrl(data, `direct-light-${stamp}.png`)
}
