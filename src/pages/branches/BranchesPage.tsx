import { useState } from 'react';
import { Button, Modal, Form, Input, Popconfirm, Tooltip, Select, Tag } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  UserAddOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { toast } from 'sonner';
import { useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch } from '@/entities/branch';
import { useUsers, useAssignBranch, useCurrentUser } from '@/entities/user';
import { DataTable, StatusBadge } from '@/shared/ui';
import { formatDate } from '@/shared/lib/formatters';
import type { Branch } from '@/shared/types/domain';
import type { ColumnDef } from '@/shared/ui';
import type { BranchPayload } from '@/entities/branch';

export function BranchesPage() {
  const { data: branches = [], isLoading, isFetching, refetch } = useBranches();
  const { data: users = [] } = useUsers();
  const { user: currentUser, isSuper } = useCurrentUser();

  const createMutation = useCreateBranch();
  const updateMutation = useUpdateBranch();
  const deleteMutation = useDeleteBranch();
  const assignMutation = useAssignBranch();

  const [branchForm] = Form.useForm<BranchPayload>();
  const [assignForm] = Form.useForm<{ userId: string | null }>();

  const [editTarget, setEditTarget] = useState<Branch | null>(null);
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<Branch | null>(null);

  const branchAdmins = users.filter((u) => u.role === 'branch_admin');

  // Returns whoever is assigned to a branch — branch_admin from the list,
  // or the superadmin themselves if the branch is their own.
  function getAssignedUser(branchId: string) {
    const admin = branchAdmins.find((u) => u.branchId === branchId);
    if (admin) return admin;
    if (isSuper && currentUser?.branchId === branchId) return currentUser;
    return null;
  }

  function openCreate() {
    setEditTarget(null);
    branchForm.resetFields();
    setBranchModalOpen(true);
  }

  function openEdit(branch: Branch) {
    setEditTarget(branch);
    branchForm.setFieldsValue({ name: branch.name, address: branch.address ?? '', phone: branch.phone ?? '' });
    setBranchModalOpen(true);
  }

  function openAssign(branch: Branch) {
    setAssignTarget(branch);
    const currentAdmin = branchAdmins.find((u) => u.branchId === branch.id);
    assignForm.setFieldsValue({ userId: currentAdmin?.id ?? null });
  }

  async function handleBranchSubmit() {
    const values = await branchForm.validateFields();
    if (editTarget) {
      updateMutation.mutate(
        { id: editTarget.id, data: values },
        {
          onSuccess: () => { toast.success('Branch updated'); setBranchModalOpen(false); },
          onError: () => toast.error('Failed to update branch'),
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => { toast.success('Branch created'); setBranchModalOpen(false); },
        onError: () => toast.error('Failed to create branch'),
      });
    }
  }

  async function handleAssignSubmit() {
    const { userId } = await assignForm.validateFields();
    if (!assignTarget) return;

    const prevAdmin = branchAdmins.find((u) => u.branchId === assignTarget.id);

    const steps: Promise<unknown>[] = [];
    if (prevAdmin && prevAdmin.id !== userId) {
      steps.push(assignMutation.mutateAsync({ userId: prevAdmin.id, branchId: null }));
    }
    if (userId) {
      steps.push(assignMutation.mutateAsync({ userId, branchId: assignTarget.id }));
    }

    Promise.all(steps)
      .then(() => { toast.success('Admin assigned'); setAssignTarget(null); })
      .catch(() => toast.error('Failed to assign admin'));
  }

  const columns: ColumnDef<Branch>[] = [
    {
      title: '#',
      key: 'index',
      width: 48,
      render: (_: unknown, __: Branch, index: number) => (
        <span style={{ fontSize: 12, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>
          {index + 1}
        </span>
      ),
    },
    {
      title: 'Branch',
      key: 'name',
      render: (_: unknown, b: Branch) => {
        const isMain = b.name === 'Main Branch';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 26, height: 26, borderRadius: 6, flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: isMain
                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                : 'var(--primary)',
              color: '#fff',
              boxShadow: isMain ? '0 0 0 2px #fde68a' : undefined,
            }}>
              <BankOutlined style={{ fontSize: 14 }} />
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>{b.name}</span>
                {isMain && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, lineHeight: 1,
                    padding: '2px 5px', borderRadius: 4,
                    background: '#fef3c7', color: '#92400e',
                    letterSpacing: '.04em', textTransform: 'uppercase',
                  }}>
                    Main
                  </span>
                )}
              </div>
              {b.address && <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{b.address}</div>}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      width: 150,
      responsiveHide: true,
      render: (v: string | null) =>
        v ? <span style={{ fontSize: 13 }}>{v}</span> : <span style={{ color: 'var(--ink-4)' }}>—</span>,
    },
    {
      title: 'Admin',
      key: 'admin',
      width: 200,
      render: (_: unknown, b: Branch) => {
        const admin = getAssignedUser(b.id);
        return admin ? (
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{admin.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>@{admin.username}</div>
          </div>
        ) : (
          <Tag color="warning">Unassigned</Tag>
        );
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      width: 120,
      responsiveHide: true,
      render: (v?: string) =>
        v ? <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(v)}</span> : <span style={{ color: 'var(--ink-4)' }}>—</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 110,
      fixed: 'right' as const,
      render: (_: unknown, b: Branch) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title="Assign admin">
            <Button
              size="small"
              type="text"
              icon={<UserAddOutlined />}
              onClick={(e) => { e.stopPropagation(); openAssign(b); }}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => { e.stopPropagation(); openEdit(b); }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete branch?"
            description="All associated data will be affected."
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
            onConfirm={(e) => { e?.stopPropagation(); deleteMutation.mutate(b.id, { onSuccess: () => toast.success('Branch deleted'), onError: () => toast.error('Failed to delete') }); }}
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

  const unassignedAdmins = branchAdmins.filter((u) => !u.branchId || u.branchId === assignTarget?.id);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Branches</h1>
          <div className="sub">{branches.length} branch{branches.length !== 1 ? 'es' : ''} · {branchAdmins.length} admins</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title="Refresh">
            <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()} />
          </Tooltip>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            New branch
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Total branches</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{branches.length}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>With admin</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{branches.filter((b) => getAssignedUser(b.id) !== null).length}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Unassigned admins</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{branchAdmins.filter((u) => !u.branchId).length}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable<Branch>
          rowKey="id"
          dataSource={branches}
          columns={columns}
          loading={isLoading}
          pagination={false}
          emptyText="No branches found"
        />
      </div>

      {/* Create / Edit modal */}
      <Modal
        title={editTarget ? 'Edit branch' : 'New branch'}
        open={branchModalOpen}
        onCancel={() => setBranchModalOpen(false)}
        onOk={handleBranchSubmit}
        okText={editTarget ? 'Save' : 'Create'}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form form={branchForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="Branch name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input placeholder="e.g. Tashkent — Chilonzor" />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input placeholder="Street, city" />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input placeholder="+998 __ ___ __ __" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign admin modal */}
      <Modal
        title={`Assign admin — ${assignTarget?.name ?? ''}`}
        open={!!assignTarget}
        onCancel={() => setAssignTarget(null)}
        onOk={handleAssignSubmit}
        okText="Assign"
        confirmLoading={assignMutation.isPending}
        destroyOnClose
      >
        <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--ink-3)' }}>
          Select a branch admin to manage this branch. Choosing a different admin will unlink the current one.
        </div>
        <Form form={assignForm} layout="vertical">
          <Form.Item name="userId" label="Admin">
            <Select
              allowClear
              placeholder="Select admin…"
              options={[
                ...unassignedAdmins.map((u) => ({ value: u.id, label: `${u.name} (@${u.username})` })),
                ...branchAdmins
                  .filter((u) => u.branchId && u.branchId !== assignTarget?.id)
                  .map((u) => {
                    const assignedTo = branches.find((b) => b.id === u.branchId);
                    return { value: u.id, label: `${u.name} (@${u.username}) · ${assignedTo?.name ?? 'other branch'}`, disabled: true };
                  }),
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
