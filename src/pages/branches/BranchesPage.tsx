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
import { useBranchesPage, useCreateBranch, useUpdateBranch, useDeleteBranch } from '@/entities/branch';
import { useUsers, useAssignBranch, useCurrentUser } from '@/entities/user';
import { DataTable, StatusBadge } from '@/shared/ui';
import { formatDate } from '@/shared/lib/formatters';
import { usePagination } from '@/shared/lib/usePagination';
import { useT } from '@/shared/lib/i18n';
import type { Branch } from '@/shared/types/domain';
import type { ColumnDef } from '@/shared/ui';
import type { BranchPayload } from '@/entities/branch';

export function BranchesPage() {
  const t = useT();
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination();
  const { data: result, isLoading, isFetching, refetch } = useBranchesPage(page, pageSize);
  const branches = result?.items ?? [];
  const total = result?.total ?? 0;
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
          onSuccess: () => { toast.success(t('branches.updateSuccess')); setBranchModalOpen(false); },
          onError: () => toast.error(t('branches.updateError')),
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => { toast.success(t('branches.createSuccess')); setBranchModalOpen(false); },
        onError: () => toast.error(t('branches.createError')),
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
      .then(() => { toast.success(t('branches.assignSuccess')); setAssignTarget(null); })
      .catch(() => toast.error(t('branches.assignError')));
  }

  const columns: ColumnDef<Branch>[] = [
    {
      title: '#',
      key: 'index',
      width: 48,
      render: (_: unknown, __: Branch, index: number) => (
        <span style={{ fontSize: 12, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>
          {rowIndex(index)}
        </span>
      ),
    },
    {
      title: t('nav.branches'),
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
                    {t('branches.mainBadge')}
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
      title: t('common.phone'),
      dataIndex: 'phone',
      width: 150,
      responsiveHide: true,
      render: (v: string | null) =>
        v ? <span style={{ fontSize: 13 }}>{v}</span> : <span style={{ color: 'var(--ink-4)' }}>—</span>,
    },
    {
      title: t('admins.colAdmin'),
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
          <Tag color="warning">{t('common.unassigned')}</Tag>
        );
      },
    },
    {
      title: t('common.added'),
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
          <Tooltip title={t('branches.assignTooltip')}>
            <Button
              size="small"
              type="text"
              icon={<UserAddOutlined />}
              onClick={(e) => { e.stopPropagation(); openAssign(b); }}
            />
          </Tooltip>
          <Tooltip title={t('common.edit')}>
            <Button
              size="small"
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => { e.stopPropagation(); openEdit(b); }}
            />
          </Tooltip>
          <Popconfirm
            title={t('common.deleteTitle')}
            description={t('branches.deleteDesc')}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
            onConfirm={(e) => { e?.stopPropagation(); deleteMutation.mutate(b.id, { onSuccess: () => toast.success(t('branches.deleteSuccess')), onError: () => toast.error(t('branches.deleteError')) }); }}
            onPopupClick={(e) => e.stopPropagation()}
          >
            <Tooltip title={t('common.delete')}>
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
          <h1>{t('nav.branches')}</h1>
          <div className="sub">{total} {t('branches.statSuffix')} · {branchAdmins.length} {t('admins.subtitleSuffix')}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title={t('common.refresh')}>
            <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()} />
          </Tooltip>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            {t('branches.newBranch')}
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{t('branches.statTotal')}</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{total}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{t('branches.statWithAdmin')}</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{branchAdmins.filter((u) => !!u.branchId).length}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>{t('branches.statUnassigned')}</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{branchAdmins.filter((u) => !u.branchId).length}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable<Branch>
          rowKey="id"
          dataSource={branches}
          columns={columns}
          loading={isLoading}
          pagination={{ current: page, pageSize, total, onChange: onPageChange, showSizeChanger: true, showTotal: (n) => `${n} ${t('common.countSuffix')}`, pageSizeOptions: ['10', '25', '50'] }}
          emptyText={t('branches.empty')}
        />
      </div>

      <Modal
        title={editTarget ? t('branches.modalEdit') : t('branches.modalCreate')}
        open={branchModalOpen}
        onCancel={() => setBranchModalOpen(false)}
        onOk={handleBranchSubmit}
        okText={editTarget ? t('common.save') : t('common.create')}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form form={branchForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label={t('branches.labelName')} rules={[{ required: true, message: t('branches.nameRequired') }]}>
            <Input placeholder={t('branches.namePlaceholder')} />
          </Form.Item>
          <Form.Item name="address" label={t('branches.labelAddress')}>
            <Input placeholder={t('branches.addressPlaceholder')} />
          </Form.Item>
          <Form.Item name="phone" label={t('common.phone')}>
            <Input placeholder={t('branches.phonePlaceholder')} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${t('branches.assignTitle')} — ${assignTarget?.name ?? ''}`}
        open={!!assignTarget}
        onCancel={() => setAssignTarget(null)}
        onOk={handleAssignSubmit}
        okText={t('branches.assignBtn')}
        confirmLoading={assignMutation.isPending}
        destroyOnClose
      >
        <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--ink-3)' }}>
          {t('branches.assignHint')}
        </div>
        <Form form={assignForm} layout="vertical">
          <Form.Item name="userId" label={t('branches.assignLabel')}>
            <Select
              allowClear
              placeholder={t('branches.assignPlaceholder')}
              options={[
                ...unassignedAdmins.map((u) => ({ value: u.id, label: `${u.name} (@${u.username})` })),
                ...branchAdmins
                  .filter((u) => u.branchId && u.branchId !== assignTarget?.id)
                  .map((u) => {
                    const assignedTo = branches.find((b) => b.id === u.branchId);
                    return { value: u.id, label: `${u.name} (@${u.username}) · ${assignedTo?.name ?? t('common.otherBranch')}`, disabled: true };
                  }),
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
