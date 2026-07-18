import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Drawer, Button, Input, Popconfirm, Switch, Skeleton, Empty } from 'antd';
import {
  CheckIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  XIcon,
} from '@phosphor-icons/react';
import {
  useExpenseCategories,
  useCreateExpenseCategory,
  useUpdateExpenseCategory,
  useDeleteExpenseCategory,
} from '@/entities/expense';
import { StatusBadge } from '@/shared/ui';
import type { ExpenseCategory } from '@/shared/types/domain';
import { useT } from '@/shared/lib/i18n';
import { blockAutofill } from '@/shared/lib/autofill';

interface CategoryManagerDrawerProps {
  open: boolean;
  onClose: () => void;
}

type CategoryManagerFormValues = {
  newName: string;
  editName: string;
};

export function CategoryManagerDrawer({ open, onClose }: CategoryManagerDrawerProps) {
  const t = useT();
  const { data: categories = [], isLoading } = useExpenseCategories(true);
  const createCat = useCreateExpenseCategory();
  const updateCat = useUpdateExpenseCategory();
  const deleteCat = useDeleteExpenseCategory();

  const [editingId, setEditingId] = useState<string | null>(null);
  const { control, handleSubmit, resetField, setValue, getValues, watch } = useForm<CategoryManagerFormValues>({
    defaultValues: {
      newName: '',
      editName: '',
    },
  });
  const newName = watch('newName') ?? '';
  const editName = watch('editName') ?? '';

  const submitCreate = (values: CategoryManagerFormValues) => {
    const name = values.newName.trim();
    if (!name) return;
    createCat.mutate({ name }, { onSuccess: () => resetField('newName') });
  };

  const startEdit = (cat: ExpenseCategory) => {
    setEditingId(cat.id);
    setValue('editName', cat.name);
  };

  const saveEdit = (id: string) => {
    const name = getValues('editName').trim();
    if (!name) return;
    updateCat.mutate({ id, payload: { name } }, { onSuccess: () => setEditingId(null) });
  };

  return (
    <Drawer
      title={t('categoryDrawer.title')}
      open={open}
      onClose={onClose}
      width={440}
      destroyOnHidden
    >
      {/* Add new */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Controller
          name="newName"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              {...blockAutofill('akfa-expense-category-new-name')}
              placeholder={t('categoryDrawer.placeholderNewName')}
              onPressEnter={handleSubmit(submitCreate)}
              style={{ flex: 1 }}
            />
          )}
        />
        <Button
          type="primary"
          icon={<PlusIcon size={18} weight="bold" />}
          loading={createCat.isPending}
          disabled={!newName.trim()}
          onClick={handleSubmit(submitCreate)}
        >
          {t('common.add')}
        </Button>
      </div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : categories.length === 0 ? (
        <Empty description={t('categoryDrawer.emptyCategories')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--surface-2)',
                opacity: cat.isActive ? 1 : 0.6,
              }}
            >
              {editingId === cat.id ? (
                <>
                  <Controller
                    name="editName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        {...blockAutofill(`akfa-expense-category-edit-${cat.id}`)}
                        onPressEnter={() => saveEdit(cat.id)}
                        style={{ flex: 1 }}
                        autoFocus
                      />
                    )}
                  />
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckIcon size={16} weight="bold" />}
                    onClick={() => saveEdit(cat.id)}
                    loading={updateCat.isPending}
                    disabled={!editName.trim()}
                  />
                  <Button
                    size="small"
                    icon={<XIcon size={16} />}
                    onClick={() => {
                      setEditingId(null);
                      resetField('editName');
                    }}
                  />
                </>
              ) : (
                <>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{cat.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                      {cat._count.expenses} {t('categoryDrawer.expenseCountSuffix')}
                    </div>
                  </div>
                  <StatusBadge tone={cat.isActive ? 'success' : 'danger'}>
                    {cat.isActive ? t('common.active') : t('common.inactive')}
                  </StatusBadge>
                  <Switch
                    size="small"
                    checked={cat.isActive}
                    loading={updateCat.isPending}
                    onChange={(checked) => updateCat.mutate({ id: cat.id, payload: { isActive: checked } })}
                  />
                  <Button size="small" type="text" icon={<PencilSimpleIcon size={16} />} onClick={() => startEdit(cat)} />
                  <Popconfirm
                    title={t('categoryDrawer.popconfirmTitle')}
                    description={cat._count.expenses > 0 ? t('categoryDrawer.popconfirmHasExpenses') : t('categoryDrawer.popconfirmNoExpenses')}
                    okText={t('categoryDrawer.okText')}
                    cancelText={t('categoryDrawer.cancelText')}
                    okButtonProps={{
                      danger: true,
                      disabled: cat._count.expenses > 0,
                      loading: deleteCat.isPending && deleteCat.variables === cat.id,
                    }}
                    onConfirm={() => deleteCat.mutate(cat.id)}
                  >
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<TrashIcon size={16} />}
                      loading={deleteCat.isPending && deleteCat.variables === cat.id}
                    />
                  </Popconfirm>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}
