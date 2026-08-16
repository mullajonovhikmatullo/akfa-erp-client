import { useMemo, useState } from 'react';
import { Button, Input, Select, Table, Tag } from 'antd';
import { ArrowClockwiseIcon, MagnifyingGlassIcon } from '@phosphor-icons/react';
import { AuthenticatedProductImage, useProducts } from '@store/store-view/product';
import { useInventoryRecords } from '@store/store-view/inventory';
import type { InventoryRecord, ProductUnit } from '@store/store-stub';
import { useUIStore } from '@/app/stores/ui.store';
import { useCurrentUser } from '@/entities/user';
import { useT } from '@/shared/lib/i18n';

type StockRow = {
  productId: string;
  name: string;
  sku: string | null;
  primaryThumbnailUrl: string | null;
  unit: ProductUnit;
  quantity: number;
  branches: Set<string>;
  updatedAt: string;
  lowStockThreshold: number | null;
};

type QuantityFilter = 'all' | 'out' | 'low' | 'available';

const formatQuantity = (value: number) =>
  new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 3 }).format(value);

export function InventoryPage() {
  const t = useT();
  const { isStoreOwner, branchId } = useCurrentUser();
  const activeBranchId = useUIStore((state) => state.activeBranchId);
  const [search, setSearch] = useState('');
  const [quantityFilter, setQuantityFilter] = useState<QuantityFilter>('all');
  const { data: products = [] } = useProducts();
  const productImagesById = useMemo(
    () => new Map(products.map((product) => [product.id, product.primaryThumbnailUrl ?? product.primaryImageUrl ?? null])),
    [products],
  );
  const scopedBranchId = isStoreOwner
    ? activeBranchId !== '__all__' ? activeBranchId : undefined
    : branchId ?? undefined;
  const inventoryQuery = useInventoryRecords(scopedBranchId ? { branchId: scopedBranchId } : undefined);

  const rows = useMemo(() => {
    const grouped = new Map<string, StockRow>();
    for (const record of inventoryQuery.data ?? []) {
      const current = grouped.get(record.product.id);
      if (current) {
        current.quantity += record.quantity;
        current.branches.add(record.branch.name);
        if (record.updatedAt > current.updatedAt) current.updatedAt = record.updatedAt;
      } else {
        grouped.set(record.product.id, {
          productId: record.product.id,
          name: record.product.name,
          sku: record.product.sku,
          primaryThumbnailUrl: productImagesById.get(record.product.id) ?? null,
          unit: record.product.unit,
          quantity: record.quantity,
          branches: new Set([record.branch.name]),
          updatedAt: record.updatedAt,
          lowStockThreshold: record.product.lowStockThreshold ?? null,
        });
      }
    }
    return [...grouped.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [inventoryQuery.data, productImagesById]);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase();
    return rows.filter((row) => {
      const matchesSearch = !needle || `${row.name} ${row.sku ?? ''}`.toLocaleLowerCase().includes(needle);
      if (!matchesSearch) return false;
      if (quantityFilter === 'out') return row.quantity <= 0;
      if (quantityFilter === 'low') {
        return row.quantity > 0 && row.lowStockThreshold != null && row.quantity <= row.lowStockThreshold;
      }
      if (quantityFilter === 'available') {
        return row.quantity > 0 && (row.lowStockThreshold == null || row.quantity > row.lowStockThreshold);
      }
      return true;
    });
  }, [quantityFilter, rows, search]);

  const totals = useMemo(() => rows.reduce(
    (result, row) => {
      result[row.unit] += row.quantity;
      return result;
    },
    { PIECE: 0, KG: 0 } as Record<ProductUnit, number>,
  ), [rows]);

  return (
    <section className="inventory-page">
      <div className="page-head inventory-page__head">
        <div>
          <h1>{t('inventory.title')}</h1>
          <div className="sub">{t('inventory.subtitle')}</div>
        </div>
        <Button
          icon={<ArrowClockwiseIcon size={13} />}
          loading={inventoryQuery.isFetching}
          onClick={() => void inventoryQuery.refetch()}
        >
          {t('common.refresh')}
        </Button>
      </div>

      <div className="inventory-summary">
        <div className="inventory-summary__card">
          <span>{t('inventory.products')}</span>
          <strong>{rows.length.toLocaleString('uz-UZ')}</strong>
          <small>{t('inventory.productTypes')}</small>
        </div>
        <div className="inventory-summary__card">
          <span>{t('inventory.totalPieces')}</span>
          <strong>{formatQuantity(totals.PIECE)}</strong>
          <small>{t('units.PIECE')}</small>
        </div>
        <div className="inventory-summary__card">
          <span>{t('inventory.totalWeight')}</span>
          <strong>{formatQuantity(totals.KG)}</strong>
          <small>{t('units.KG')}</small>
        </div>
      </div>

      <div className="inventory-panel">
        <div className="inventory-panel__header">
          <div>
            <h2>{t('inventory.currentStock')}</h2>
            <span>{t('inventory.currentStockHint')}</span>
          </div>
          <div className="inventory-panel__filters">
            <Select<QuantityFilter>
              value={quantityFilter}
              onChange={setQuantityFilter}
              options={[
                { value: 'all', label: t('inventory.filterAll') },
                { value: 'out', label: t('inventory.filterOut') },
                { value: 'low', label: t('inventory.filterLow') },
                { value: 'available', label: t('inventory.filterAvailable') },
              ]}
            />
            <Input
              allowClear
              value={search}
              prefix={<MagnifyingGlassIcon size={15} />}
              placeholder={t('inventory.searchPlaceholder')}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <Table<StockRow>
          rowKey="productId"
          loading={inventoryQuery.isLoading}
          dataSource={filteredRows}
          scroll={{ x: 760 }}
          pagination={{ pageSize: 15, showSizeChanger: false, hideOnSinglePage: true }}
          locale={{ emptyText: t('inventory.empty') }}
          columns={[
            {
              title: t('inventory.product'),
              key: 'product',
              render: (_value, row) => (
                <div className="inventory-product-cell">
                  <AuthenticatedProductImage
                    url={row.primaryThumbnailUrl}
                    alt={row.name}
                    width={42}
                    height={42}
                  />
                  <div><strong>{row.name}</strong><small>{row.sku || '—'}</small></div>
                </div>
              ),
            },
            {
              title: t('inventory.branches'),
              key: 'branches',
              width: 150,
              render: (_value, row) => <Tag>{row.branches.size}</Tag>,
            },
            {
              title: t('inventory.unit'),
              dataIndex: 'unit',
              key: 'unit',
              width: 140,
              render: (unit: ProductUnit) => t(`units.${unit}`),
            },
            {
              title: t('inventory.available'),
              dataIndex: 'quantity',
              key: 'quantity',
              width: 190,
              align: 'right',
              sorter: (a, b) => a.quantity - b.quantity,
              render: (quantity: number, row) => (
                <div className="inventory-quantity-cell">
                  <strong className="inventory-quantity">{formatQuantity(quantity)} <small>{t(`units.${row.unit}`)}</small></strong>
                  {quantity <= 0 ? <Tag color="red">{t('inventory.statusOut')}</Tag> : null}
                  {quantity > 0 && row.lowStockThreshold != null && quantity <= row.lowStockThreshold
                    ? <Tag color="orange">{t('inventory.statusLow')}</Tag>
                    : null}
                </div>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}
