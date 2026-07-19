const MAX_DIMENSION = 1280
const JPEG_QUALITY = 0.8

/**
 * Comprime una imagen a JPEG (máx. 1280px por lado) y la devuelve
 * como data-URL, lista para guardarse en IndexedDB.
 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(
        1,
        MAX_DIMENSION / Math.max(img.width, img.height),
      )
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('No se pudo procesar la imagen.'))
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('El archivo no es una imagen válida.'))
    }
    img.src = url
  })
}
