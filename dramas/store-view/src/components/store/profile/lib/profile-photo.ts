export interface ProfilePhotoTransform {
  zoom: number
  rotation: number
}

export interface PreparedProfilePhoto {
  base64Photo: string
  thumbnailPhoto: string
}

interface LoadedPhoto {
  source: CanvasImageSource
  width: number
  height: number
  dispose: () => void
}

async function loadPhoto(file: File): Promise<LoadedPhoto> {
  //
  if ('createImageBitmap' in window) {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      dispose: () => bitmap.close(),
    }
  }

  const url = URL.createObjectURL(file)
  const image = new Image()
  image.decoding = 'async'
  image.src = url
  await image.decode()

  return {
    source: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    dispose: () => URL.revokeObjectURL(url),
  }
}

function renderSquare(source: LoadedPhoto, size: number, transform: ProfilePhotoTransform) {
  //
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is not available')

  const normalizedRotation = ((transform.rotation % 360) + 360) % 360
  const rotated = normalizedRotation === 90 || normalizedRotation === 270
  const rotatedWidth = rotated ? source.height : source.width
  const rotatedHeight = rotated ? source.width : source.height
  const coverScale = Math.max(size / rotatedWidth, size / rotatedHeight)
  const scale = coverScale * transform.zoom

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.translate(size / 2, size / 2)
  context.rotate((normalizedRotation * Math.PI) / 180)
  context.scale(scale, scale)
  context.drawImage(source.source, -source.width / 2, -source.height / 2, source.width, source.height)

  return canvas
}

function toClearDataUrl(canvas: HTMLCanvasElement, quality: number): string {
  const webp = canvas.toDataURL('image/webp', quality)
  if (webp.startsWith('data:image/webp;base64,')) return webp
  return canvas.toDataURL('image/jpeg', quality)
}

export async function prepareProfilePhoto(
  file: File,
  transform: ProfilePhotoTransform,
): Promise<PreparedProfilePhoto> {
  //
  const source = await loadPhoto(file)

  try {
    const clearCanvas = renderSquare(source, 1024, transform)
    const thumbnailCanvas = document.createElement('canvas')
    thumbnailCanvas.width = 256
    thumbnailCanvas.height = 256
    const thumbnailContext = thumbnailCanvas.getContext('2d')
    if (!thumbnailContext) throw new Error('Canvas is not available')
    thumbnailContext.imageSmoothingEnabled = true
    thumbnailContext.imageSmoothingQuality = 'high'
    thumbnailContext.drawImage(clearCanvas, 0, 0, 256, 256)

    return {
      base64Photo: toClearDataUrl(clearCanvas, 0.94),
      thumbnailPhoto: toClearDataUrl(thumbnailCanvas, 0.9),
    }
  } finally {
    source.dispose()
  }
}
