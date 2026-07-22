import { http } from '@erp/erp-shared'
import type { ApiResponse } from '@erp/erp-shared'
import type { Branch, BranchPage, BranchPageQuery, BranchPayload } from '../../../../models/domain/branch'

const parseBranches = (r: { data: unknown }) => {
  //
  const body = r.data as Record<string, unknown>
  return (Array.isArray(body) ? body : body.data) as Branch[]
}

const parseBranch = (r: { data: unknown }) => {
  //
  const body = r.data as Record<string, unknown>
  return (body.data ?? body) as Branch
}

const findBranches = () => http.get('/branches').then(parseBranches)

const findBranchesPage = (params: BranchPageQuery) =>
  http.get<BranchPage>('/branches', { params }).then((r) => r.data)

const createBranch = (data: BranchPayload) => http.post('/branches', data).then(parseBranch)

const updateBranch = ({ id, data }: { id: string; data: Partial<BranchPayload> }) =>
  http.patch(`/branches/${id}`, data).then(parseBranch)

const deleteBranch = (id: string) => http.delete(`/branches/${id}`)

export const BranchSeekApi = {
  findBranches,
  findBranchesPage,
  fetch: {
    findBranches: () => ({
      queryKey: ['branches', 'findBranches'] as const,
      queryFn: findBranches,
    }),
    findBranchesPage: (params: BranchPageQuery) => ({
      queryKey: ['branches', 'findBranches', 'paginated', params.page, params.pageSize] as const,
      queryFn: () => findBranchesPage(params),
    }),
  },
}

export const BranchFlowApi = {
  createBranch,
  updateBranch,
  deleteBranch,
}

export const branchApi = {
  list: findBranches,
  listPaginated: findBranchesPage,
  create: createBranch,
  update: (id: string, data: Partial<BranchPayload>) => updateBranch({ id, data }),
  delete: deleteBranch,
}
