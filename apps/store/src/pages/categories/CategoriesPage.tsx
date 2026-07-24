import { CategoriesList } from '@store/store-view/category'
import { useT } from '@/shared/lib/i18n'

export function CategoriesPage() {
  //
  const t = useT()

  return <CategoriesList t={t} />
}
