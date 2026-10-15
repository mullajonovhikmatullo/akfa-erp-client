import { useMemo, useState } from 'react';
import { App as AntdApp, Button, Form, Input, Modal, Select, Switch } from 'antd';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PlatformFlowApi, PlatformSeekApi } from '@store/platform-stub';
import type { ProvisionStorePayload, ProvisionStoreResult } from '@store/platform-stub';
import { routes } from '../../config/routes';
import {
  billingTypeLabels,
  formatDateTime,
  formatLimitCount,
  formatPlanPrice,
  storeStatusLabels,
} from '../../shared/lib/platformFormatters';
import { createOwnerSetupUrl } from '../../shared/lib/ownerSetupUrl';

export const NewCompanyPage = () => {
  //
  const { message } = AntdApp.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<ProvisionStorePayload>();
  const [provisioned, setProvisioned] = useState<ProvisionStoreResult | null>(null);
  const plansQuery = useQuery(PlatformSeekApi.fetch.listPlans());
  const planOptions = useMemo(
    () =>
      (['MONTHLY', 'LIFETIME'] as const)
        .map((billingType) => ({
          label: billingTypeLabels[billingType],
          options: (plansQuery.data ?? [])
            .filter((plan) => plan.billingType === billingType)
            .map((plan) => ({
              label: `${plan.name} · ${formatPlanPrice(plan)} · ${
                plan.maxBranches === null
                  ? 'Cheklanmagan filial'
                  : formatLimitCount(plan.maxBranches, 'filial')
              }`,
              value: plan.code as ProvisionStorePayload['planCode'],
            })),
        }))
        .filter((group) => group.options.length > 0),
    [plansQuery.data],
  );

  const setupUrl = useMemo(
    () => (provisioned ? createOwnerSetupUrl(provisioned.setupCode) : ''),
    [provisioned],
  );

  const provisionMutation = useMutation({
    mutationFn: PlatformFlowApi.provisionStore,
    onSuccess: async (result) => {
      //
      setProvisioned(result);
      form.resetFields();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['platform-stores'] }),
        queryClient.invalidateQueries({ queryKey: ['platform-dashboard'] }),
      ]);
    },
    onError: (error) => {
      message.error(error instanceof Error ? error.message : 'Tenantni yaratib bo‘lmadi');
    },
  });

  const copySetupUrl = async () => {
    //
    try {
      await navigator.clipboard.writeText(setupUrl);
      message.success('Setup manzili nusxalandi');
    } catch {
      message.error('Setup manzilini nusxalab bo‘lmadi');
    }
  };

  const submitProvision = (values: ProvisionStorePayload) => {
    //
    try {
      createOwnerSetupUrl('configuration-check');
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : 'Store login manzili konfiguratsiya qilinmagan',
      );
      return;
    }

    provisionMutation.mutate({
      ...values,
      storeName: values.storeName.trim(),
      ownerName: values.ownerName.trim(),
      phone: values.phone.trim(),
      username: values.username.trim(),
      email: values.email?.trim() || undefined,
    });
  };

  return (
    <section className="operation-page">
      <div className="operation-page__header">
        <div>
          <span className="operation-page__eyebrow">Platform admin</span>
          <h1>Yangi kompaniya</h1>
        </div>
        <Button icon={<i className="icons-arrow-left icon-size-18" />} onClick={() => navigate(routes.companies)}>
          Ro‘yxatga qaytish
        </Button>
      </div>

      <div className="operation-panel tenant-provisioning">
        <Form<ProvisionStorePayload>
          className="operation-form tenant-provisioning__form"
          form={form}
          layout="vertical"
          initialValues={{ startTrial: false }}
          onFinish={submitProvision}
        >
          <Form.Item
            label="Do‘kon nomi"
            name="storeName"
            rules={[{ required: true, min: 2, max: 120 }]}
          >
            <Input autoFocus maxLength={120} />
          </Form.Item>
          <Form.Item
            label="Do‘kon egasi"
            name="ownerName"
            rules={[{ required: true, min: 2, max: 100 }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item
            label="Telefon"
            name="phone"
            rules={[{ required: true, min: 7, max: 30 }]}
          >
            <Input maxLength={30} />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ type: 'email', max: 120 }]}>
            <Input type="email" maxLength={120} />
          </Form.Item>
          <Form.Item
            label="Egasi uchun login"
            name="username"
            rules={[
              { required: true, min: 3, max: 50 },
              { pattern: /^[a-zA-Z0-9_]+$/, message: 'Faqat harf, raqam va _ belgisi' },
            ]}
          >
            <Input autoComplete="off" maxLength={50} />
          </Form.Item>
          <Form.Item label="Tarif" name="planCode" rules={[{ required: true }]}>
            <Select
              loading={plansQuery.isLoading}
              options={planOptions}
              placeholder="Aktiv tarifni tanlang"
            />
          </Form.Item>
          <Form.Item
            label="14 kunlik sinov muddati"
            name="startTrial"
            valuePropName="checked"
            extra="Yoqilmasa do‘kon to‘lov tasdiqlanguncha faqat ko‘rish rejimida ochiladi. Sinovni keyinroq kompaniya kartasidan ham yoqish mumkin."
          >
            <Switch checkedChildren="Yoqilgan" unCheckedChildren="O‘chiq" />
          </Form.Item>
          <div className="tenant-provisioning__actions">
            <Button
              type="primary"
              htmlType="submit"
              icon={<i className="icons-plus icon-size-18" />}
              loading={provisionMutation.isPending}
            >
              Tenant yaratish
            </Button>
          </div>
        </Form>
      </div>

      <Modal
        title="Do‘kon egasi uchun setup"
        open={Boolean(provisioned)}
        footer={[
          <Button key="copy" type="primary" icon={<i className="icons-copy icon-size-18" />} onClick={() => void copySetupUrl()}>
            Setup manzilini nusxalash
          </Button>,
          <Button key="close" onClick={() => setProvisioned(null)}>
            Yopish
          </Button>,
        ]}
        onCancel={() => setProvisioned(null)}
      >
        <div className="setup-result">
          <div>
            <span>Do‘kon</span>
            <strong>{provisioned?.store.name}</strong>
          </div>
          <div>
            <span>Holati</span>
            <strong>{provisioned ? storeStatusLabels[provisioned.store.status] : ''}</strong>
          </div>
          <div>
            <span>Login</span>
            <strong>{provisioned?.owner.username}</strong>
          </div>
          <div>
            <span>Setup muddati</span>
            <strong>{formatDateTime(provisioned?.setupExpiresAt ?? null)}</strong>
          </div>
          <Input readOnly value={setupUrl} />
        </div>
      </Modal>
    </section>
  );
};
