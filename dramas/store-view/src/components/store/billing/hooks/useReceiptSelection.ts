import { useEffect, useRef, useState } from 'react'
import type { UploadFile } from 'antd'
import type { ReceiptPreview } from '../view/types'

export function useReceiptSelection() {
  //
  const [files, setFiles] = useState<UploadFile[]>([])
  const [preview, setPreview] = useState<ReceiptPreview | null>(null)
  const previewUrlRef = useRef<string | null>(null)

  useEffect(
    () => () => {
      //
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    },
    [],
  )

  const updateFiles = (fileList: UploadFile[]) => {
    //
    const nextFiles = fileList.slice(-1)
    const nextFile = nextFiles[0]?.originFileObj

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)

    const nextPreview = nextFile
      ? {
          url: URL.createObjectURL(nextFile),
          fileName: nextFile.name,
          mimeType: nextFile.type,
          note: null,
        }
      : null

    previewUrlRef.current = nextPreview?.url ?? null
    setFiles(nextFiles)
    setPreview(nextPreview)
  }

  return {
    files,
    preview,
    updateFiles,
    clear: () => updateFiles([]),
  }
}

