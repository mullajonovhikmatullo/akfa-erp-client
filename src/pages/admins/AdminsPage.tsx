import { useState } from 'react';
import { Button, Modal, Form, Input, Select, Popconfirm, Tooltip, Tag } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserSwitchOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { toast } from 'sonner';
import { useUsers, useCreateAdmin, useUpdateAdmin, useDeleteAdmin } from '@/entities/user';
import { useBranches } from '@/entities/branch';
import { DataTable, StatusBadge } from '@/shared/ui';
import { formatDate } from '@/shared/lib/formatters';
import { usePagination } from '@/shared/lib/usePagination';
import type { User } from '@/shared/types/domain';
import type { CreateAdminPayload, UpdateAdminPayload } from '@/entities/user';

type AdminFormValues = {
  name: string;
  username?: string;
  password?: string;
  branchId?: string | null;
};

export function AdminsPage() {
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination();
  const { data: users = [], isLoading, isFetching, refetch } = useUsers();
  const { data: branches = [] } = useBranches();

  const createMutation = useCreateAdmin();
  const updateMutation = useUpdateAdmin();
  const deleteMutation = useDeleteAdmin();

  const [form] = Form.useForm<AdminFormValues>();
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const admins = users.filter((u) => u.role === 'branch_admin');

  function openCreate() {
    setEditTarget(null);
    form.resetFields();
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditTarget(user);
    form.setFieldsValue({
      name: user.name,
      username: user.username,
      password: undefined,
      branchId: user.branchId ?? undefined,
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    const values = await form.validateFields();

    if (editTarget) {
      const payload: UpdateAdminPayload = {
        fullName: values.name,
        branchId: values.branchId ?? null,
      };
      updateMutation.mutate(
        { id: editTarget.id, data: payload },
        {
          onSuccess: () => { toast.success('Администратор янгиланди'); setModalOpen(false); },
          onError: () => toast.error('Янгилашда хатолик'),
        },
      );
    } else {
      const payload: CreateAdminPayload = {
        fullName: values.name,
        username: values.username!,
        password: values.password!,
        branchId: values.branchId!,
      };
      createMutation.mutate(payload, {
        onSuccess: () => { toast.success('Администратор яратилди'); setModalOpen(false); },
        onError: () => toast.error('Яратишда хатолик'),
      });
    }
  }

  const getBranch = (branchId: string | null) =>
    branches.find((b) => b.id === branchId);

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
      title: 'Администратор',
      key: 'name',
      render: (_: unknown, u: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AdminAvatar name={u.name} />
          <div>
            <div style={{ fontWeight: 600 }}>{u.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>@{u.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Тайинланган филиал',
      key: 'branch',
      width: 220,
      render: (_: unknown, u: User) => {
        const branch = getBranch(u.branchId);
        return branch
          ? <StatusBadge tone="info">{branch.name}</StatusBadge>
          : <Tag color="warning">Тайинланмаган</Tag>;
      },
    },
    {
      title: 'Роль',
      key: 'role',
      width: 140,
      render: () => (
        <StatusBadge tone="muted">Филиал админи</StatusBadge>
      ),
    },
    {
      title: 'Қўшилган',
      key: 'createdAt',
      width: 120,
      responsiveHide: true,
      render: (_: unknown, u: User) =>
        u.createdAt
          ? <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(u.createdAt)}</span>
          : <span style={{ color: 'var(--ink-4)' }}>—</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      fixed: 'right' as const,
      render: (_: unknown, u: User) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title="Таҳрирлаш">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => { e.stopPropagation(); openEdit(u); }}
            />
          </Tooltip>
          <Popconfirm
            title="Ўчирилсинми?"
            description="Ушбу фойдаланувчи тизимга кира олмайди."
            okText="Ўчириш"
            cancelText="Бекор"
            okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
            onConfirm={(e) => {
              e?.stopPropagation();
              deleteMutation.mutate(u.id, {
                onSuccess: () => toast.success('Администратор ўчирилди'),
                onError: () => toast.error('Ўчиришда хатолик'),
              });
            }}
            onPopupClick={(e) => e.stopPropagation()}
          >
            <Tooltip title="Ўчириш">
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

  const unassigned = admins.filter((u) => !u.branchId).length;
  const assigned = admins.filter((u) => !!u.branchId).length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Администраторлар</h1>
          <div className="sub">{admins.length} та филиал администратори</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title="Янгилаш">
            <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()} />
          </Tooltip>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            Янги администратор
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            Жами
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{admins.length}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            Тайинланган
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--success, #16a34a)' }}>{assigned}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            Тайинланмаган
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: unassigned > 0 ? 'var(--warning, #d97706)' : 'inherit' }}>
            {unassigned}
          </div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            Бириктирилган филиаллар
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
            {assigned} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--ink-3)' }}>/ {branches.length}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable<User>
          rowKey="id"
          dataSource={admins}
          columns={columns}
          loading={isLoading}
          pagination={{ current: page, pageSize, onChange: onPageChange, showSizeChanger: true, showTotal: (t) => `${t} та`, pageSizeOptions: ['10', '25', '50'] }}
          emptyText="Ҳали администраторлар йўқ"
        />
      </div>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserSwitchOutlined />
            {editTarget ? `Таҳрирлаш — ${editTarget.name}` : 'Янги филиал администратори'}
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
        okText={editTarget ? 'Сақлаш' : 'Яратиш'}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
        width={480}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Тўлиқ исм"
            rules={[{ required: true, message: 'Исмни киритинг' }]}
          >
            <Input placeholder="Масалан: Дилшод Раҳимов" />
          </Form.Item>

          {!editTarget && (
            <Form.Item
              name="username"
              label="Фойдаланувчи номи"
              rules={[
                { required: true, message: 'Фойдаланувчи номини киритинг' },
                { pattern: /^[a-zA-Z0-9_]+$/, message: 'Ҳарф, рақам ва _ белгисидан иборат бўлиши керак' },
              ]}
            >
              <Input placeholder="Масалан: dilshod_r" prefix="@" />
            </Form.Item>
          )}

          {!editTarget && (
            <Form.Item
              name="password"
              label="Парол"
              rules={[{ required: true, message: 'Паролни киритинг' }, { min: 6, message: 'Камида 6 та белги' }]}
            >
              <Input.Password
                placeholder="Камида 6 та белги"
                prefix={<LockOutlined style={{ color: 'var(--ink-3)' }} />}
              />
            </Form.Item>
          )}

          <Form.Item
            name="branchId"
            label="Филиалга тайинлаш"
            rules={editTarget ? [] : [{ required: true, message: 'Филиал танланг' }]}
          >
            <Select
              allowClear={!!editTarget}
              placeholder="Филиал танланг"
              options={branches.map((b) => ({ value: b.id, label: b.name }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function AdminAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
  return (
    <span
      style={{
        width: 26,
        height: 26,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0e7490, #0e7490cc)',
        color: '#fff',
        fontSize: 10,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );
}
