import { http } from '@store/store-shared'
import type { CreateTransferPayload, Transfer, TransferFilters, TransferPage, TransferPageQuery, TransferSummary } from '../../../../models/domain/transfer'

type Raw = Record<string, unknown>

const parseItem = (item: Raw) => ({
  ...(item as unknown as Transfer['items'][0]),
  quantity: Number(item.quantity),
  unitCostUzs: Number(item.unitCostUzs),
  totalCostUzs: Number(item.totalCostUzs),
})

const parseTransfer = (raw: Raw): Transfer => ({
  ...(raw as unknown as Transfer),
  items: ((raw.items as Raw[]) ?? []).map(parseItem),
})

const findTransfers = (params?: TransferFilters) =>
  http.get('/transfers', { params }).then((response) => (response.data.data as Raw[]).map(parseTransfer))

const findTransfersPage = (params: TransferPageQuery) =>
  http.get('/transfers', { params }).then((response) => {
    //
    const body = response.data.data as { items: Raw[]; total: number; pendingCount: number }
    return {
      ...body,
      items: body.items.map((row) => ({ ...(row as unknown as TransferSummary), totalCostUzs: Number(row.totalCostUzs) })),
    } satisfies TransferPage
  })

const findTransfer = (id: string) => http.get(`/transfers/${id}`).then((response) => parseTransfer(response.data.data))

const createTransfer = (payload: CreateTransferPayload) => http.post('/transfers', payload).then((response) => parseTransfer(response.data.data))

const completeTransfer = (id: string) => http.post(`/transfers/${id}/complete`).then((response) => parseTransfer(response.data.data))

const cancelTransfer = (id: string) => http.post(`/transfers/${id}/cancel`).then((response) => parseTransfer(response.data.data))

export const TransferSeekApi = {
  findTransfers,
  findTransfersPage,
  findTransfer,
  fetch: {
    findTransfers: (params?: TransferFilters) => ({
      queryKey: ['transfers', 'findTransfers', params] as const,
      queryFn: () => findTransfers(params),
    }),
    findTransfersPage: (params: TransferPageQuery) => ({
      queryKey: ['transfers', 'findTransfersPage', params] as const,
      queryFn: () => findTransfersPage(params),
    }),
    findTransfer: (id: string) => ({
      queryKey: ['transfers', 'findTransfer', id] as const,
      queryFn: () => findTransfer(id),
    }),
  },
}

export const TransferFlowApi = {
  createTransfer,
  completeTransfer,
  cancelTransfer,
}

export const transferApi = {
  list: findTransfers,
  getById: findTransfer,
  create: createTransfer,
  complete: completeTransfer,
  cancel: cancelTransfer,
}
