import { useState } from 'react';
import {
  App as AntdApp,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import { PencilSimple, PlusCircle, Trash } from '@phosphor-icons/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlatformFlowApi, PlatformSeekApi } from '@store/platform-stub';
import type { ManagedPlan, PlanMutationPayload, UpdatePlanPayload } from '@store/platform-stub';
import { formatMoney } from '../../shared/lib/platformFormatters';

const initialPlan: PlanMutationPayload = {
  code: '',
  name: '',
  monthlyPriceUzs: 0,
  maxBranches: null,
  maxUsers: null,
  maxProducts: null,
  isPublic: true,
  isActive: true,
};

const limitLabel = (value: number | null) => value ?? 'Cheksiz';

export const PlansPage = () => {
  const { message } = AntdApp.useApp();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<PlanMutationPayload>();
  const [editingPlan, setEditingPlan] = useState<ManagedPlan | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ManagedPlan | null>(null);
  const [deletePassword, setDeletePassword] = useState('');
  const isActiveValue = Form.useWatch('isActive', form);

  const plansQuery = useQuery(PlatformSeekApi.fetch.listManagedPlans());

  const refreshPlans = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['platform-plans'] }),
      queryClient.invalidateQueries({ queryKey: ['platform-stores'] }),
      queryClient.invalidateQueries({ queryKey: ['platform-dashboard'] }),
    ]);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingPlan(null);
    form.resetFields();
  };

  const createMutation = useMutation({
    mutationFn: PlatformFlowApi.createPlan,
    onSuccess: async () => {
      message.success('Tarif yaratildi');
      closeForm();
      await refreshPlans();
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : 'Tarifni yaratib bo‘lmadi');
      void refreshPlans();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ planId, payload }: { planId: string; payload: UpdatePlanPayload }) =>
      PlatformFlowApi.updatePlan({ planId, payload }),
    onSuccess: async () => {
      message.success('Tarif yangilandi');
      closeForm();
      await refreshPlans();
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : 'Tarifni yangilab bo‘lmadi');
      void refreshPlans();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (plan: ManagedPlan) =>
      PlatformFlowApi.deletePlan({
        planId: plan.id,
        payload: {
          expectedVersion: plan.version,
          currentPassword: deletePassword,
        },
      }),
    onSuccess: async (result) => {
      message.success(result.archived ? 'Foydalanilayotgan tarif arxivlandi' : 'Tarif o‘chirildi');
      setDeleteTarget(null);
      setDeletePassword('');
      await refreshPlans();
    },
    onError: (error) => {
      setDeletePassword('');
      message.error(error instanceof Error ? error.message : 'Tarifni olib tashlab bo‘lmadi');
      void refreshPlans();
    },
  });

  const openCreate = () => {
    setEditingPlan(null);
    form.setFieldsValue(initialPlan);
    setFormOpen(true);
  };

  const openEdit = (plan: ManagedPlan) => {
    setEditingPlan(plan);
    form.setFieldsValue({
      code: plan.code,
      name: plan.name,
      monthlyPriceUzs: plan.monthlyPriceUzs,
      maxBranches: plan.maxBranches,
      maxUsers: plan.maxUsers,
      maxProducts: plan.maxProducts,
      isPublic: plan.isActive && plan.isPublic,
      isActive: plan.isActive,
    });
    setFormOpen(true);
  };

  const submitPlan = async () => {
    const values = await form.validateFields();
    const payload: PlanMutationPayload = {
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      monthlyPriceUzs: Number(values.monthlyPriceUzs),
      maxBranches: values.maxBranches ?? null,
      maxUsers: values.maxUsers ?? null,
      maxProducts: values.maxProducts ?? null,
      isPublic: Boolean(values.isActive) && Boolean(values.isPublic),
      isActive: Boolean(values.isActive),
    };

    if (editingPlan) {
      updateMutation.mutate({
        planId: editingPlan.id,
        payload: { ...payload, expectedVersion: editingPlan.version },
      });
      return;
    }
    createMutation.mutate(payload);
  };

  const plans = plansQuery.data ?? [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <section className="operation-page">
      <div className="operation-page__header">
        <div>
          <span className="operation-page__eyebrow">Subscription catalog</span>
          <h1>Tariflar</h1>
        </div>
        <Button type="primary" icon={<PlusCircle size={18} />} onClick={openCreate}>
          Yangi tarif
        </Button>
      </div>

      <div className="operation-stats" aria-label="Tariflar ko‘rsatkichlari">
        <div>
          <span>Jami</span>
          <strong>{plans.length}</strong>
        </div>
        <div>
          <span>Faol</span>
          <strong>{plans.filter((plan) => plan.isActive).length}</strong>
        </div>
        <div>
          <span>Landing page</span>
          <strong>{plans.filter((plan) => plan.isActive && plan.isPublic).length}</strong>
        </div>
      </div>

      <div className="operation-panel">
        <Table<ManagedPlan>
          rowKey="id"
          loading={plansQuery.isLoading}
          dataSource={plans}
          scroll={{ x: 1200 }}
          pagination={false}
          columns={[
            {
              title: 'Tarif',
              key: 'plan',
              fixed: 'left',
              width: 230,
              render: (_value, plan) => (
                <div className="table-primary-cell">
                  <strong>{plan.name}</strong>
                  <span>{plan.code}</span>
                </div>
              ),
            },
            {
              title: 'Oylik narx',
              key: 'price',
              width: 180,
              render: (_value, plan) => <strong>{formatMoney(plan.monthlyPriceUzs)}</strong>,
            },
            {
              title: 'Limitlar',
              key: 'limits',
              width: 310,
              render: (_value, plan) => (
                <Space size={4} wrap>
                  <Tag>{limitLabel(plan.maxBranches)} filial</Tag>
                  <Tag>{limitLabel(plan.maxUsers)} user</Tag>
                  <Tag>{limitLabel(plan.maxProducts)} mahsulot</Tag>
                </Space>
              ),
            },
            {
              title: 'Ko‘rinish',
              key: 'visibility',
              width: 180,
              render: (_value, plan) => (
                <Space size={5} wrap>
                  <Tag color={plan.isActive ? 'green' : 'default'}>
                    {plan.isActive ? 'Faol' : 'Arxiv'}
                  </Tag>
                  <Tag color={plan.isPublic ? 'blue' : 'default'}>
                    {plan.isPublic ? 'Public' : 'Private'}
                  </Tag>
                </Space>
              ),
            },
            {
              title: 'Foydalanish',
              key: 'usage',
              width: 180,
              render: (_value, plan) => (
                <div className="table-primary-cell">
                  <strong>{plan._count.stores} do‘kon</strong>
                  <span>{plan._count.subscriptions} obuna</span>
                </div>
              ),
            },
            {
              title: 'Amallar',
              key: 'actions',
              fixed: 'right',
              width: 120,
              render: (_value, plan) => (
                <Space size={4}>
                  <Tooltip title="Tahrirlash">
                    <Button
                      aria-label="Tarifni tahrirlash"
                      icon={<PencilSimple size={17} />}
                      onClick={() => openEdit(plan)}
                    />
                  </Tooltip>
                  <Tooltip title="Olib tashlash">
                    <Button
                      danger
                      aria-label="Tarifni olib tashlash"
                      icon={<Trash size={17} />}
                      onClick={() => setDeleteTarget(plan)}
                    />
                  </Tooltip>
                </Space>
              ),
            },
          ]}
        />
      </div>

      <Modal
        title={editingPlan ? 'Tarifni tahrirlash' : 'Yangi tarif'}
        open={formOpen}
        okText={editingPlan ? 'Saqlash' : 'Yaratish'}
        cancelText="Bekor qilish"
        confirmLoading={isSaving}
        onOk={() => void submitPlan()}
        onCancel={closeForm}
      >
        <Form<PlanMutationPayload>
          form={form}
          layout="vertical"
          initialValues={initialPlan}
          className="operation-form"
        >
          <div className="plan-form-grid">
            <Form.Item
              name="name"
              label="Tarif nomi"
              rules={[{ required: true, min: 2, message: 'Tarif nomini kiriting' }]}
            >
              <Input maxLength={80} placeholder="Masalan: Professional" />
            </Form.Item>
            <Form.Item
              name="code"
              label="Tarif kodi"
              normalize={(value: string) => value.toUpperCase().replace(/[^A-Z0-9_]/g, '')}
              rules={[
                { required: true, message: 'Tarif kodini kiriting' },
                { pattern: /^[A-Z][A-Z0-9_]{1,29}$/, message: 'Masalan: PROFESSIONAL' },
              ]}
            >
              <Input maxLength={30} placeholder="PROFESSIONAL" />
            </Form.Item>
          </div>
          <Form.Item
            name="monthlyPriceUzs"
            label="Oylik narx"
            rules={[{ required: true, message: 'Narxni kiriting' }]}
          >
            <InputNumber
              min={0}
              max={1_000_000_000}
              precision={0}
              addonAfter="UZS"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <div className="plan-form-grid plan-form-grid--limits">
            <Form.Item name="maxBranches" label="Filial limiti" extra="Bo‘sh qolsa cheksiz">
              <InputNumber min={1} max={1_000_000} precision={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="maxUsers" label="User limiti" extra="Bo‘sh qolsa cheksiz">
              <InputNumber min={1} max={1_000_000} precision={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="maxProducts" label="Mahsulot limiti" extra="Bo‘sh qolsa cheksiz">
              <InputNumber min={1} max={1_000_000} precision={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <div className="plan-switches">
            <Form.Item name="isActive" label="Faol" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item
              name="isPublic"
              label="Landing page’da ko‘rinsin"
              valuePropName="checked"
              extra="Faqat faol tariflar landing va store’da ko‘rinadi"
            >
              <Switch disabled={isActiveValue === false} />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Tarifni olib tashlash"
        open={Boolean(deleteTarget)}
        okText="Tasdiqlash"
        cancelText="Bekor qilish"
        okButtonProps={{ danger: true, disabled: deletePassword.length === 0 }}
        confirmLoading={deleteMutation.isPending}
        onOk={() => {
          if (deleteTarget && deletePassword) deleteMutation.mutate(deleteTarget);
        }}
        onCancel={() => {
          setDeleteTarget(null);
          setDeletePassword('');
        }}
      >
        <div className="status-change-modal">
          <p>
            <strong>{deleteTarget?.name}</strong> foydalanilayotgan bo‘lsa arxivlanadi,
            foydalanilmagan bo‘lsa butunlay o‘chiriladi.
          </p>
          <Input.Password
            value={deletePassword}
            onChange={(event) => setDeletePassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Platform egasining joriy paroli"
          />
        </div>
      </Modal>
    </section>
  );
};
