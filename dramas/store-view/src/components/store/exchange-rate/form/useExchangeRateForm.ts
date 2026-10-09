import type { StoreTranslator } from '@store/store-i18n'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import type { ExchangeRate, ExchangeRateMode } from '@store/store-stub'
import { useExchangeRateMutation } from '../hooks/useExchangeRateMutation'

export interface ExchangeRateFormValues {
  mode: ExchangeRateMode
  rate: number | null
  ownerPassword: string
}

interface UseExchangeRateFormOptions {
  t: StoreTranslator
  open: boolean
  current?: ExchangeRate
  onClose: () => void
}

const MIN_RATE = 1000

function defaultValues(current?: ExchangeRate): ExchangeRateFormValues {
  //
  return {
    mode: current?.mode ?? 'CBU',
    rate: current?.manualRate ?? current?.usdToUzsRate ?? null,
    ownerPassword: '',
  }
}

export function useExchangeRateForm({ t, open, current, onClose }: UseExchangeRateFormOptions) {
  //
  const { updateExchangeRate } = useExchangeRateMutation(t)
  const { control, handleSubmit, reset } = useForm<ExchangeRateFormValues>({ defaultValues: defaultValues(current) })
  const mode = useWatch({ control, name: 'mode' })
  const rate = useWatch({ control, name: 'rate' })
  const ownerPassword = useWatch({ control, name: 'ownerPassword' })

  useEffect(() => {
    //
    if (open) reset(defaultValues(current))
  }, [current, open, reset])

  const hasCbuRate = Boolean(current?.cbu)
  const canSubmit =
    ownerPassword.length > 0 &&
    (mode === 'CBU' ? hasCbuRate : rate != null && rate >= MIN_RATE)

  function submit(values: ExchangeRateFormValues) {
    //
    const payload = values.mode === 'CBU'
      ? { mode: values.mode, ownerPassword: values.ownerPassword }
      : { mode: values.mode, rate: Number(values.rate), ownerPassword: values.ownerPassword }
    updateExchangeRate.mutate(payload, { onSuccess: onClose })
  }

  return {
    control,
    mode,
    hasCbuRate,
    minRate: MIN_RATE,
    canSubmit,
    isPending: updateExchangeRate.isPending,
    submit: handleSubmit(submit),
  }
}
