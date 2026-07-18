import { useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Button, Select, InputNumber, Radio, Alert, Tooltip, Empty, DatePicker } from 'antd';
import {
  CheckCircleIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import dayjs from 'dayjs';
import { useProducts } from '@/entities/product';
import { useCustomers } from '@/entities/customer';
import { useCreateSale } from '@/entities/sale';
import { useStockBatches } from '@/entities/inventory';
import { useCurrentUser } from '@/entities/user';
import { useUIStore } from '@/app/stores/ui.store';
import { CustomerFormModal } from '@/features/create-customer';
import { MoneyDisplay, SelectLoadingContent } from '@/shared/ui';
import {
  PAYMENT_METHOD_LABELS,
  type SaleType,
  type PaymentMethod,
  type Product,
  type Customer,
} from '@/shared/types/domain';
import { useT } from '@/shared/lib/i18n';
import { getSaleProductPrice, getSaleProductPriceUzs } from '@/shared/lib/productPricing';
import { useSaleDraftStore } from '../model/saleDraft.store';

interface CartItem {
  _key: string;
  productId: string;
  product: Product;
  quantity: number;
}

type SaleFormCartItem = {
  key: string;
  productId: string;
  quantity: number;
};

type SaleFormValues = {
  branchId?: string;
  saleType: SaleType;
  customerId?: string;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  debtDueDateIso?: string;
  selectedProductId?: string;
  cart: SaleFormCartItem[];
};

const MIN_QTY = 0.0001;
const CART_GRID_COLUMNS = 'minmax(170px, 1fr) minmax(188px, 220px) minmax(126px, 150px) minmax(150px, 178px) 28px';

function emptySaleFormValues(branchId?: string): SaleFormValues {
  return {
    branchId,
    saleType: 'RETAIL',
    customerId: undefined,
    paymentMethod: 'CASH_UZS',
    paidAmount: 0,
    debtDueDateIso: undefined,
    selectedProductId: undefined,
    cart: [],
  };
}

function persistedSaleFormValues(): SaleFormValues {
  const draft = useSaleDraftStore.getState();
  return {
    branchId: draft.branchId,
    saleType: draft.saleType,
    customerId: draft.customerId,
    paymentMethod: draft.paymentMethod,
    paidAmount: draft.paidAmount,
    debtDueDateIso: draft.debtDueDateIso,
    selectedProductId: undefined,
    cart: draft.cart,
  };
}

function createCartKey(productId: string) {
  return `${productId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function NewSaleForm({ onSuccess }: { onSuccess?: () => void }) {
  const t = useT();
  const { branchId: userBranchId } = useCurrentUser();
  const exchangeRate = useUIStore((s) => s.exchangeRate);

  const branchFilter = userBranchId ?? undefined;
  const { data: products = [], isLoading: productsLoading } = useProducts({ isActive: true });
  const { data: batches = [], isLoading: batchesLoading } = useStockBatches(
    branchFilter ? { branchId: branchFilter, depleted: false } : undefined,
    { enabled: Boolean(branchFilter) },
  );
  const customerFilters = {
    isActive: true,
    ...(branchFilter ? { branchId: branchFilter } : {}),
  };
  const { data: customers = [], isLoading: customersLoading, refetch: refetchCustomers } = useCustomers(customerFilters);
  const productSelectLoading = Boolean(branchFilter) && (productsLoading || batchesLoading);

  const createSale = useCreateSale();

  const setDraftValues = useSaleDraftStore((s) => s.setDraftValues);
  const clearSaleDraft = useSaleDraftStore((s) => s.clearDraft);
  const { control, handleSubmit, reset, setValue } = useForm<SaleFormValues>({
    defaultValues: persistedSaleFormValues(),
  });
  const { append, update, remove } = useFieldArray({
    control,
    name: 'cart',
    keyName: 'fieldId',
  });
  const formBranchId = useWatch({ control, name: 'branchId' });
  const saleType = useWatch({ control, name: 'saleType' }) ?? 'RETAIL';
  const customerId = useWatch({ control, name: 'customerId' });
  const paymentMethod = useWatch({ control, name: 'paymentMethod' }) ?? 'CASH_UZS';
  const paidAmount = useWatch({ control, name: 'paidAmount' }) ?? 0;
  const debtDueDateIso = useWatch({ control, name: 'debtDueDateIso' });
  const cartDraft = useWatch({ control, name: 'cart' }) ?? [];
  const [paidAmountError, setPaidAmountError] = useState(false);
  const [productSelectKey, setProductSelectKey] = useState(0);
  const [creatingCustomer, setCreatingCustomer] = useState(false);

  const stockByProductId = useMemo(() => {
    const map = new Map<string, number>();
    for (const batch of batches) {
      const current = map.get(batch.product.id) ?? 0;
      map.set(batch.product.id, current + batch.remainingQty);
    }
    return map;
  }, [batches]);

  const sellableProducts = useMemo(
    () => products.filter((p) => p.isActive && (stockByProductId.get(p.id) ?? 0) > 0),
    [products, stockByProductId],
  );
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const cart = useMemo<CartItem[]>(
    () =>
      cartDraft.flatMap((item) => {
        const product = productById.get(item.productId);
        if (!product) return [];
        return {
          _key: item.key,
          productId: item.productId,
          product,
          quantity: item.quantity,
        };
      }),
    [cartDraft, productById],
  );
  const selectedProductIds = useMemo(() => new Set(cart.map((item) => item.productId)), [cart]);

  const PAYMENT_OPTIONS = (Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((k) => ({
    value: k,
    label: PAYMENT_METHOD_LABELS[k],
  }));

  const addToCart = (productId: string) => {
    const product = sellableProducts.find((p) => p.id === productId);
    if (!product) return;
    const stock = stockByProductId.get(productId) ?? 0;
    if (stock <= 0) return;
    if (cartDraft.some((item) => item.productId === productId)) return;
    append({ key: createCartKey(productId), productId, quantity: Math.min(1, stock) });
    setValue('selectedProductId', undefined);
    setProductSelectKey((key) => key + 1);
  };

  const updateQty = (key: string, quantity: number | null) => {
    const item = cart.find((i) => i._key === key);
    if (!item) return;
    const index = cartDraft.findIndex((draftItem) => draftItem.key === key);
    if (index < 0) return;
    const draftItem = cartDraft[index];
    if (!draftItem) return;
    const stock = stockByProductId.get(item.productId) ?? 0;
    const nextQuantity = quantity == null || !Number.isFinite(quantity) ? 0 : Math.max(quantity, 0);
    update(index, { ...draftItem, quantity: Math.min(nextQuantity, stock) });
  };

  const changeQty = (key: string, delta: number) => {
    const item = cart.find((i) => i._key === key);
    if (!item) return;
    const current = Math.max(item.quantity, 0);
    updateQty(key, delta < 0 ? Math.max(current + delta, MIN_QTY) : current + delta);
  };

  const removeItem = (key: string) => {
    const index = cartDraft.findIndex((item) => item.key === key);
    if (index >= 0) remove(index);
    setValue('selectedProductId', undefined);
    setProductSelectKey((current) => current + 1);
  };

  const effectiveExchangeRate = exchangeRate > 0 ? exchangeRate : 1;
  const unitPrice = (p: Product) => getSaleProductPriceUzs(p, saleType, effectiveExchangeRate);

  const subtotal = cart.reduce((sum, i) => sum + Math.max(i.quantity, 0) * unitPrice(i.product), 0);
  const isUsdPayment = paymentMethod === 'CASH_USD';
  const paidAmountUzsEquivalent = isUsdPayment ? paidAmount * effectiveExchangeRate : paidAmount;
  const debtAmount = Math.max(0, subtotal - paidAmountUzsEquivalent);
  const needsCustomer = debtAmount > 0;
  const fullPaidAmount = Number((isUsdPayment ? subtotal / effectiveExchangeRate : subtotal).toFixed(2));
  const clampPaidAmount = (value: number | null) => {
    const nextValue = value == null || !Number.isFinite(value) ? 0 : Math.max(value, 0);
    return Math.min(nextValue, fullPaidAmount);
  };
  const handlePaidAmountChange = (value: number | null) => {
    const nextValue = value == null || !Number.isFinite(value) ? 0 : Math.max(value, 0);
    setPaidAmountError(nextValue > fullPaidAmount);
    setValue('paidAmount', Math.min(nextValue, fullPaidAmount), { shouldDirty: true });
  };
  const hasUsdPricedItems = cart.some((i) => getSaleProductPrice(i.product, saleType).currency === 'USD');
  const needsExchangeRate = hasUsdPricedItems || isUsdPayment;

  const hasValidQuantities = cart.every((i) => {
    const stock = stockByProductId.get(i.productId) ?? 0;
    return i.quantity >= MIN_QTY && i.quantity <= stock;
  });
  const canSubmit =
    Boolean(userBranchId) &&
    cart.length > 0 &&
    hasValidQuantities &&
    (!needsExchangeRate || exchangeRate > 0) &&
    (!needsCustomer || customerId);

  useEffect(() => {
    const nextPaidAmount = Math.min(Math.max(paidAmount, 0), fullPaidAmount);
    if (paidAmount !== nextPaidAmount) {
      setValue('paidAmount', nextPaidAmount);
    }
    setPaidAmountError(false);
  }, [fullPaidAmount, paidAmount, setValue]);

  useEffect(() => {
    if (!needsCustomer && debtDueDateIso) setValue('debtDueDateIso', undefined);
  }, [debtDueDateIso, needsCustomer, setValue]);

  useEffect(() => {
    if (!branchFilter) return;
    if (formBranchId && formBranchId !== branchFilter) {
      clearSaleDraft(branchFilter);
      reset(emptySaleFormValues(branchFilter));
      setPaidAmountError(false);
      setProductSelectKey((current) => current + 1);
      return;
    }
    if (!formBranchId) setValue('branchId', branchFilter);
  }, [branchFilter, clearSaleDraft, formBranchId, reset, setValue]);

  useEffect(() => {
    setDraftValues({
      branchId: formBranchId,
      saleType,
      customerId: customerId || undefined,
      paymentMethod,
      paidAmount,
      debtDueDateIso,
      cart: cartDraft.map((item) => ({
        key: item.key,
        productId: item.productId,
        quantity: item.quantity,
      })),
    });
  }, [cartDraft, customerId, debtDueDateIso, formBranchId, paidAmount, paymentMethod, saleType, setDraftValues]);

  const submitSale = (values: SaleFormValues) => {
    const safePaidAmount = clampPaidAmount(values.paidAmount);

    createSale.mutate(
      {
        saleType: values.saleType,
        customerId: values.customerId || undefined,
        paymentMethod: values.paymentMethod,
        paidAmountUzs: isUsdPayment ? 0 : safePaidAmount,
        paidAmountUsd: isUsdPayment ? safePaidAmount : 0,
        usdToUzsRate: needsExchangeRate ? exchangeRate : undefined,
        debtDueDate: needsCustomer && values.debtDueDateIso ? values.debtDueDateIso : undefined,
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      },
      {
        onSuccess: () => {
          clearSaleDraft(branchFilter);
          reset(emptySaleFormValues(branchFilter));
          setPaidAmountError(false);
          setProductSelectKey((current) => current + 1);
          onSuccess?.();
        },
      },
    );
  };

  const handleCustomerCreated = (customer: Customer) => {
    refetchCustomers();
    setValue('customerId', customer.id, { shouldDirty: true });
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'flex-start' }}>

      {/* Left: Cart */}
      <div className="card">

        {/* Controls row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <Label>{t('newSale.typeLabel')}</Label>
            <Controller
              name="saleType"
              control={control}
              render={({ field }) => (
                <Radio.Group
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  style={{ display: 'flex' }}
                >
                  <Radio.Button value="RETAIL" style={{ flex: 1, textAlign: 'center' }}>{t('sales.typeRetail')}</Radio.Button>
                  <Radio.Button value="WHOLESALE" style={{ flex: 1, textAlign: 'center' }}>{t('sales.typeWholesale')}</Radio.Button>
                </Radio.Group>
              )}
            />
          </div>
          <div>
            <Label>{t('newSale.customerOptional')}</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
              <Controller
                name="customerId"
                control={control}
                render={({ field }) => (
                  <Select
                    showSearch
                    allowClear
                    optionFilterProp="label"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t('newSale.customerPlaceholder')}
                    style={{ width: '100%' }}
                    loading={customersLoading}
                    notFoundContent={customersLoading ? <SelectLoadingContent /> : undefined}
                    options={customers.map((c) => ({
                      value: c.id,
                      label: c.phone ? `${c.fullName} · ${c.phone}` : c.fullName,
                    }))}
                  />
                )}
              />
              <Button icon={<PlusIcon size={18} />} onClick={() => setCreatingCustomer(true)}>
                {t('customers.newCustomer')}
              </Button>
            </div>
          </div>
        </div>

        {/* Product selector */}
        <div style={{ marginBottom: 14 }}>
          <Controller
            name="selectedProductId"
            control={control}
            render={({ field }) => (
              <Select
                key={productSelectKey}
                showSearch
                optionFilterProp="searchText"
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  addToCart(value);
                }}
                placeholder={t('newSale.productSearchPlaceholder')}
                style={{ width: '100%' }}
                loading={productSelectLoading}
                suffixIcon={productSelectLoading ? undefined : <PlusIcon size={16} />}
                notFoundContent={productSelectLoading ? <SelectLoadingContent /> : undefined}
                options={sellableProducts
                  .filter((p) => !selectedProductIds.has(p.id))
                  .map((p) => {
                    const stock = stockByProductId.get(p.id) ?? 0;
                    return {
                      value: p.id,
                      searchText: [p.sku, p.name].filter(Boolean).join(' '),
                      label: (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {p.name}
                            </div>
                            {p.sku && (
                              <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'monospace' }}>
                                {p.sku}
                              </div>
                            )}
                          </div>
                          <span style={{ flexShrink: 0, fontSize: 12, color: 'var(--ink-3)' }}>
                            {t('newSale.availableStock')}: {stock.toLocaleString('ru-RU')} {t(`units.${p.unit}`)}
                          </span>
                        </div>
                      ),
                    };
                  })}
              />
            )}
          />
        </div>

        {/* Cart items */}
        {cart.length === 0 ? (
          <Empty
            description={t('newSale.emptyCart')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '24px 0' }}
          />
        ) : (
          <>
            {/* Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: CART_GRID_COLUMNS,
                gap: 8,
                padding: '6px 10px',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--ink-3)',
                textTransform: 'uppercase',
                letterSpacing: '.04em',
                borderBottom: '1px solid var(--border)',
                marginBottom: 6,
              }}
            >
              <div style={{ whiteSpace: 'nowrap' }}>{t('newSale.colProduct')}</div>
              <div style={{ whiteSpace: 'nowrap' }}>{t('newSale.colQty')}</div>
              <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{t('newSale.colUnitPrice')}</div>
              <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{t('newSale.colTotal')}</div>
              <div />
            </div>

            {cart.map((item) => {
              const originalPrice = getSaleProductPrice(item.product, saleType);
              const unitPriceUzs = unitPrice(item.product);
              return (
                <div
                  key={item._key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: CART_GRID_COLUMNS,
                    gap: 8,
                    alignItems: 'center',
                    padding: '8px 10px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</div>
                    {item.product.sku && (
                      <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'monospace' }}>
                        {item.product.sku}
                      </div>
                    )}
                  </div>
                  <QuantityStepper
                    value={item.quantity}
                    max={stockByProductId.get(item.productId) ?? 0}
                    unitLabel={t(`units.${item.product.unit}`)}
                    onMinus={() => changeQty(item._key, -1)}
                    onPlus={() => changeQty(item._key, 1)}
                    onChange={(value) => updateQty(item._key, value)}
                  />
                  <PriceCell original={originalPrice} uzs={unitPriceUzs} />
                  <PriceCell original={{ ...originalPrice, amount: originalPrice.amount * Math.max(item.quantity, 0) }} uzs={Math.max(item.quantity, 0) * unitPriceUzs} strong />
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<TrashIcon size={18} />}
                    onClick={() => removeItem(item._key)}
                  />
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Right: Summary */}
      <div className="card" style={{ position: 'sticky', top: 76 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{t('newSale.summary')}</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Row
            label={t('newSale.rowProducts')}
            value={`${cart.length} ${t('newSale.typeSuffix')} · ${cart.reduce((s, i) => s + Math.max(i.quantity, 0), 0).toLocaleString('ru-RU')} ${t('newSale.qtySuffix')}`}
          />
          <Row
            label={t('newSale.rowTotal')}
            value={<span className="num" style={{ fontWeight: 700 }}><MoneyDisplay amount={subtotal} currency="UZS" /></span>}
          />
        </div>

        <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <Label>{t('newSale.paymentMethod')}</Label>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    setPaidAmountError(false);
                  }}
                  options={PAYMENT_OPTIONS}
                  style={{ width: '100%' }}
                />
              )}
            />
          </div>
          <div>
            <Label>{isUsdPayment ? `${t('newSale.paidAmount')} (USD)` : t('newSale.paidAmount')}</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
              <Controller
                name="paidAmount"
                control={control}
                render={({ field }) => (
                  <InputNumber<number>
                    value={field.value}
                    onChange={handlePaidAmountChange}
                    status={paidAmountError ? 'error' : undefined}
                    style={{ width: '100%' }}
                    min={0}
                    max={fullPaidAmount}
                    step={isUsdPayment ? 1 : 10000}
                    precision={isUsdPayment ? 2 : 0}
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                    parser={(v) => Number(v?.replace(/\s/g, '')) as unknown as 0}
                  />
                )}
              />
              <Tooltip title={t('newSale.markFullPaidTooltip')}>
                <Button
                  icon={<CheckCircleIcon size={18} weight="duotone" />}
                  disabled={fullPaidAmount <= 0 || paidAmount === fullPaidAmount}
                  onClick={() => {
                    setValue('paidAmount', fullPaidAmount, { shouldDirty: true });
                    setPaidAmountError(false);
                  }}
                >
                  {t('newSale.markFullPaid')}
                </Button>
              </Tooltip>
            </div>
            {paidAmountError && (
              <div role="alert" style={{ marginTop: 6, color: 'var(--danger)', fontSize: 12 }}>
                {t('newSale.paidAmountMaxError')}
              </div>
            )}
          </div>

          {subtotal > 0 && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                border: `1px solid ${debtAmount > 0 ? 'var(--danger)' : 'var(--success)'}`,
                background: debtAmount > 0 ? 'rgba(220,38,38,.04)' : 'rgba(22,163,74,.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--ink-3)' }}>{t('sales.drawerDebt')}</span>
                <span className="num" style={{ fontWeight: 700, color: debtAmount > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  <MoneyDisplay amount={debtAmount} currency="UZS" />
                </span>
              </div>
            </div>
          )}

          {needsCustomer && (
            <div>
              <Label>{t('newSale.debtDeadlineOptional')}</Label>
              <Controller
                name="debtDueDateIso"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(value) => field.onChange(value ? value.toISOString() : undefined)}
                    style={{ width: '100%' }}
                    format="DD.MM.YYYY"
                    placeholder={t('newSale.debtDeadlinePlaceholder')}
                    disabledDate={(current) => Boolean(current && current < dayjs().startOf('day'))}
                    allowClear
                  />
                )}
              />
            </div>
          )}
        </div>

        {needsCustomer && !customerId && (
          <Alert
            type="warning"
            showIcon
            message={t('newSale.debtNeedsCustomer')}
            style={{ marginTop: 12 }}
          />
        )}

        <Button
          type="primary"
          size="large"
          block
          icon={<CheckIcon size={18} weight="bold" />}
          loading={createSale.isPending}
          disabled={!canSubmit}
          style={{ marginTop: 16 }}
          onClick={handleSubmit(submitSale)}
        >
          {t('newSale.confirmSale')}
        </Button>
      </div>
      </div>

      <CustomerFormModal
        open={creatingCustomer}
        customer={null}
        onClose={() => setCreatingCustomer(false)}
        onCreated={handleCustomerCreated}
      />
    </>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
      <span style={{ color: 'var(--ink-3)' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function PriceCell({
  original,
  uzs,
  strong = false,
}: {
  original: { amount: number; currency: 'UZS' | 'USD' };
  uzs: number;
  strong?: boolean;
}) {
  return (
    <div className="num" style={{ textAlign: 'right', fontWeight: strong ? 700 : undefined, fontSize: 13, lineHeight: 1.25, whiteSpace: 'nowrap' }}>
      <MoneyDisplay amount={uzs} currency="UZS" />
      {original.currency === 'USD' && (
        <div style={{ fontSize: 10.5, color: 'var(--ink-3)', fontWeight: 500, whiteSpace: 'nowrap' }}>
          <MoneyDisplay amount={original.amount} currency="USD" noConvert />
        </div>
      )}
    </div>
  );
}

function QuantityStepper({
  value,
  max,
  unitLabel,
  onMinus,
  onPlus,
  onChange,
}: {
  value: number;
  max: number;
  unitLabel: string;
  onMinus: () => void;
  onPlus: () => void;
  onChange: (value: number | null) => void;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '30px minmax(86px, 1fr) 30px minmax(38px, auto)', gap: 4, alignItems: 'center' }}>
      <Button
        icon={<MinusIcon size={16} />}
        onClick={onMinus}
        disabled={value <= 1}
        style={{ width: 30, height: 30, padding: 0 }}
      />
      <InputNumber
        value={value > 0 ? value : null}
        onChange={(v) => onChange(v == null ? null : Number(v))}
        min={0}
        max={max || undefined}
        step={1}
        controls={false}
        placeholder="0"
        style={{ width: '100%' }}
        formatter={(v) => `${v ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
        parser={(v) => Number(v?.replace(/\s/g, '')) as unknown as 0}
      />
      <Button
        icon={<PlusIcon size={16} />}
        disabled={max > 0 && value >= max}
        onClick={onPlus}
        style={{ width: 30, height: 30, padding: 0 }}
      />
      <span
        style={{
          height: 30,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border)',
          borderRadius: 6,
          background: 'var(--surface-2)',
          color: 'var(--ink-3)',
          fontSize: 11,
          fontWeight: 700,
          lineHeight: 1,
          padding: '0 6px',
          whiteSpace: 'nowrap',
        }}
      >
        {unitLabel}
      </span>
    </div>
  );
}
