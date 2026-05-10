import { useState } from 'react';
import { Button, Modal, Form, Input, Switch, Popconfirm, Tooltip, Tag } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { toast } from 'sonner';
import { ExcelImportButton } from '@/features/excel-import';
import { getField } from '@/features/excel-import/lib/parseExcel';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  categoryApi,
} from '@/entities/product';
import type { CreateCategoryPayload, UpdateCategoryPayload } from '@/entities/product';
import { DataTable, StatusBadge } from '@/shared/ui';
import { formatDate } from '@/shared/lib/formatters';
import { usePagination } from '@/shared/lib/usePagination';
import type { Category } from '@/shared/types/domain';

type CategoryFormValues = {
  name: string;
  description?: string;
  isActive?: boolean;
};

export function CategoriesPage() {
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination();
  const { data: categories = [], isLoading, isFetching, refetch } = useCategories();

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [form] = Form.useForm<CategoryFormValues>();
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function openCreate() {
    setEditTarget(null);
    form.resetFields();
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditTarget(cat);
    form.setFieldsValue({
      name: cat.name,
      description: cat.description ?? '',
      isActive: cat.isActive,
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    const values = await form.validateFields();

    if (editTarget) {
      const payload: UpdateCategoryPayload = {
        name: values.name,
        description: values.description || undefined,
        isActive: values.isActive,
      };
      updateMutation.mutate(
        { id: editTarget.id, payload },
        {
          onSuccess: () => { toast.success('Category updated'); setModalOpen(false); },
          onError: (e: unknown) =>
            toast.error((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to update category'),
        },
      );
    } else {
      const payload: CreateCategoryPayload = {
        name: values.name,
        description: values.description || undefined,
      };
      createMutation.mutate(payload, {
        onSuccess: () => { toast.success('Category created'); setModalOpen(false); },
        onError: (e: unknown) =>
          toast.error((e as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to create category'),
      });
    }
  }

  const active = categories.filter((c) => c.isActive).length;
  const inactive = categories.filter((c) => !c.isActive).length;

  const columns = [
    {
      title: '#',
      key: '_idx',
      width: 40,
      render: (_: unknown, __: unknown, index: number) => (
        <span style={{ color: 'var(--ink-4)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{rowIndex(index)}</span>
      ),
    },
    {
      title: 'Name',
      key: 'name',
      render: (_: unknown, c: Category) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CategoryIcon name={c.name} />
          <div>
            <div style={{ fontWeight: 600 }}>{c.name}</div>
            {c.description && (
              <div style={{ fontSize: 12, color: 'var(--ink-3)', maxWidth: 300 }}>{c.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'isActive',
      width: 110,
      responsiveHide: true,
      render: (_: unknown, c: Category) =>
        c.isActive
          ? <StatusBadge tone="success">Active</StatusBadge>
          : <Tag color="default">Inactive</Tag>,
    },
    {
      title: 'Created',
      key: 'createdAt',
      width: 120,
      responsiveHide: true,
      render: (_: unknown, c: Category) =>
        c.createdAt
          ? <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(c.createdAt)}</span>
          : <span style={{ color: 'var(--ink-4)' }}>—</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      fixed: 'right' as const,
      render: (_: unknown, c: Category) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title="Edit">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => { e.stopPropagation(); openEdit(c); }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete category?"
            description="Only possible if no products are assigned to it."
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
            onConfirm={(e) => {
              e?.stopPropagation();
              deleteMutation.mutate(c.id, {
                onSuccess: () => toast.success('Category deleted'),
                onError: (err: unknown) =>
                  toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to delete category'),
              });
            }}
            onPopupClick={(e) => e.stopPropagation()}
          >
            <Tooltip title="Delete">
              <Button
                size="small"
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Categories</h1>
          <div className="sub">{categories.length} product categor{categories.length !== 1 ? 'ies' : 'y'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title="Refresh">
            <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()} />
          </Tooltip>
          <ExcelImportButton<CreateCategoryPayload>
            entityLabel="Categories"
            templateHeaders={['name', 'description']}
            templateExample={['Glass Panels', 'All types of flat glass products']}
            templateFileName="categories_template.xlsx"
            parseRow={(raw, index) => {
              const name = getField(raw, 'name');
              if (!name) return { index, raw, error: 'Name is required' };
              const description = getField(raw, 'description') || undefined;
              return { index, raw, data: { name, description } };
            }}
            createFn={(data) => categoryApi.create(data)}
            onComplete={() => refetch()}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            New category
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            Total
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{categories.length}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            Active
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--success, #16a34a)' }}>{active}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            Inactive
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: inactive > 0 ? 'var(--warning, #d97706)' : 'inherit' }}>{inactive}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable<Category>
          rowKey="id"
          dataSource={categories}
          columns={columns}
          loading={isLoading}
          pagination={{ current: page, pageSize, onChange: onPageChange, showSizeChanger: true, showTotal: (t) => `${t} ta`, pageSizeOptions: ['10', '25', '50'] }}
          emptyText="No categories yet — create the first one"
        />
      </div>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AppstoreOutlined />
            {editTarget ? `Edit — ${editTarget.name}` : 'New category'}
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText={editTarget ? 'Save changes' : 'Create category'}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
        width={440}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Name is required' }, { max: 100 }]}
          >
            <Input placeholder="e.g. Glass Panels" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              placeholder="Optional description"
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>

          {editTarget && (
            <Form.Item name="isActive" label="Status" valuePropName="checked">
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}

function CategoryIcon({ name }: { name: string }) {
  const initial = name.trim()[0]?.toUpperCase() ?? '?';
  return (
    <span
      style={{
        width: 26,
        height: 26,
        borderRadius: 6,
        background: 'linear-gradient(135deg, #7c3aed, #7c3aedcc)',
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {initial}
    </span>
  );
}
