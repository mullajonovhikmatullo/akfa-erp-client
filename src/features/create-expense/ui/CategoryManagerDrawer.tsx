import { useState } from 'react';
import { Drawer, Button, Input, Popconfirm, Switch, Skeleton, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import {
  useExpenseCategories,
  useCreateExpenseCategory,
  useUpdateExpenseCategory,
  useDeleteExpenseCategory,
} from '@/entities/expense';
import { StatusBadge } from '@/shared/ui';
import type { ExpenseCategory } from '@/shared/types/domain';

interface CategoryManagerDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CategoryManagerDrawer({ open, onClose }: CategoryManagerDrawerProps) {
  const { data: categories = [], isLoading } = useExpenseCategories(true);
  const createCat = useCreateExpenseCategory();
  const updateCat = useUpdateExpenseCategory();
  const deleteCat = useDeleteExpenseCategory();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    createCat.mutate({ name: newName.trim() }, { onSuccess: () => setNewName('') });
  };

  const startEdit = (cat: ExpenseCategory) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;
    updateCat.mutate({ id, payload: { name: editName.trim() } }, { onSuccess: () => setEditingId(null) });
  };

  return (
    <Drawer
      title="Xarajat kategoriyalari"
      open={open}
      onClose={onClose}
      width={440}
      destroyOnHidden
    >
      {/* Add new */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Yangi kategoriya nomi"
          onPressEnter={handleCreate}
          style={{ flex: 1 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          loading={createCat.isPending}
          disabled={!newName.trim()}
          onClick={handleCreate}
        >
          Qo'shish
        </Button>
      </div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : categories.length === 0 ? (
        <Empty description="Kategoriyalar yo'q" image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onPressEnter={() => saveEdit(cat.id)}
                    style={{ flex: 1 }}
                    autoFocus
                  />
                  <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => saveEdit(cat.id)} loading={updateCat.isPending} />
                  <Button size="small" icon={<CloseOutlined />} onClick={() => setEditingId(null)} />
                </>
              ) : (
                <>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{cat.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                      {cat._count.expenses} ta xarajat
                    </div>
                  </div>
                  <StatusBadge tone={cat.isActive ? 'success' : 'danger'}>
                    {cat.isActive ? 'Faol' : 'Nofaol'}
                  </StatusBadge>
                  <Switch
                    size="small"
                    checked={cat.isActive}
                    loading={updateCat.isPending}
                    onChange={(checked) => updateCat.mutate({ id: cat.id, payload: { isActive: checked } })}
                  />
                  <Button size="small" type="text" icon={<EditOutlined />} onClick={() => startEdit(cat)} />
                  <Popconfirm
                    title="O'chirilsinmi?"
                    description={cat._count.expenses > 0 ? "Bu kategoriyaga bog'liq xarajatlar bor. O'chira olmaysiz." : "Kategoriya o'chiriladi."}
                    okText="Ha"
                    cancelText="Bekor"
                    okButtonProps={{ danger: true, disabled: cat._count.expenses > 0 }}
                    onConfirm={() => deleteCat.mutate(cat.id)}
                  >
                    <Button size="small" type="text" danger icon={<DeleteOutlined />} />
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
