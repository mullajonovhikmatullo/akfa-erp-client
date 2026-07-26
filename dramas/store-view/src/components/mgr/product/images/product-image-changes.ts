export interface ProductImageReplacement {
  imageId: string
  file: File
}

export interface ProductImageChanges {
  deletedImageIds: string[]
  replacements: ProductImageReplacement[]
  orderedImageIds: string[] | null
  primaryImageId?: string
}

export function createEmptyProductImageChanges(): ProductImageChanges {
  return {
    deletedImageIds: [],
    replacements: [],
    orderedImageIds: null,
    primaryImageId: undefined,
  }
}

export function hasExistingProductImageChanges(changes: ProductImageChanges) {
  return (
    changes.deletedImageIds.length > 0 ||
    changes.replacements.length > 0 ||
    changes.orderedImageIds !== null ||
    changes.primaryImageId !== undefined
  )
}
