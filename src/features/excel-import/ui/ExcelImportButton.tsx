import { useState } from 'react';
import { Button, Modal, Table, Progress, Alert, Tag, Tooltip, Upload } from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { parseExcelFile, downloadTemplate, getField } from '../lib/parseExcel';
import { useT } from '@/shared/lib/i18n';
import type { ApiError } from '@/shared/types/api';

export interface ParsedRow<T> {
  index: number;
  raw: Record<string, string>;
  data?: T;
  error?: string;
}

export interface ExcelImportButtonProps<T> {
  entityLabel: string;
  templateHeaders: string[];
  templateExamples: string[][];
  templateFileName: string;
  parseRow: (raw: Record<string, string>, index: number) => ParsedRow<T>;
  createFn: (data: T) => Promise<unknown>;
  onComplete?: () => void;
  disabled?: boolean;
  hints?: { label: string; items: string[] }[];
}

type Phase = 'idle' | 'setup' | 'preview' | 'importing' | 'done';

interface FailedRow {
  rowNum: number;
  label: string;
  message: string;
}

function extractError(err: unknown): string {
  const data = (err as AxiosError<ApiError>)?.response?.data;
  if (data?.message) return data.message;
  return (err as Error)?.message ?? 'Noma\'lum xato';
}

export function ExcelImportButton<T>({
  entityLabel,
  templateHeaders,
  templateExamples,
  templateFileName,
  parseRow,
  createFn,
  onComplete,
  disabled,
  hints,
}: ExcelImportButtonProps<T>) {
  const t = useT();

  const [phase, setPhase] = useState<Phase>('idle');
  const [rows, setRows] = useState<ParsedRow<T>[]>([]);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ added: number; failedRows: FailedRow[] }>({
    added: 0,
    failedRows: [],
  });

  const validRows = rows.filter((r) => !r.error);
  const invalidRows = rows.filter((r) => r.error);

  async function processFile(file: File) {
    try {
      const raw = await parseExcelFile(file);
      if (raw.length === 0) { toast.error(t('excel.emptyFile')); return; }
      const parsed = raw.map((r, i) => parseRow(r, i));
      setRows(parsed);
      setProgress(0);
      setResults({ added: 0, failedRows: [] });
      setPhase('preview');
    } catch {
      toast.error(t('excel.readError'));
    }
  }

  async function startImport() {
    if (validRows.length === 0) return;
    setPhase('importing');
    let added = 0;
    const failedRows: FailedRow[] = [];

    for (const [i, row] of validRows.entries()) {
      try {
        await createFn(row.data!);
        added++;
      } catch (err) {
        failedRows.push({
          rowNum: row.index + 1,
          label: (templateHeaders[0] ? row.raw[templateHeaders[0]] : undefined) ?? `#${row.index + 1}`,
          message: extractError(err),
        });
      }
      setProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setResults({ added, failedRows });
    setPhase('done');
    onComplete?.();
  }

  function handleClose() {
    setPhase('idle');
    setRows([]);
  }

  const previewColumns = [
    {
      title: '#',
      key: 'index',
      width: 48,
      render: (_: unknown, r: ParsedRow<T>) => (
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{r.index + 1}</span>
      ),
    },
    ...templateHeaders.map((h) => ({
      title: h,
      key: h,
      ellipsis: true,
      render: (_: unknown, r: ParsedRow<T>) => (
        <span style={{ fontSize: 12 }}>{getField(r.raw, h)}</span>
      ),
    })),
    {
      title: '',
      key: 'status',
      width: 36,
      render: (_: unknown, r: ParsedRow<T>) =>
        r.error ? (
          <Tooltip title={r.error}>
            <CloseCircleOutlined style={{ color: '#ef4444' }} />
          </Tooltip>
        ) : (
          <CheckCircleOutlined style={{ color: '#22c55e' }} />
        ),
    },
  ];

  const failedColumns = [
    {
      title: '#',
      dataIndex: 'rowNum',
      width: 48,
      render: (v: number) => <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{v}</span>,
    },
    {
      title: entityLabel,
      dataIndex: 'label',
      ellipsis: true,
      render: (v: string) => <span style={{ fontSize: 12, fontWeight: 500 }}>{v}</span>,
    },
    {
      title: 'Xato sababi',
      dataIndex: 'message',
      render: (v: string) => (
        <span style={{ fontSize: 12, color: '#ef4444' }}>{v}</span>
      ),
    },
  ];

  return (
    <>
      <Button
        icon={<UploadOutlined />}
        disabled={disabled}
        onClick={() => setPhase('setup')}
      >
        {t('excel.importButton')}
      </Button>

      <Modal
        title={`${entityLabel} — ${t('excel.modalTitle')}`}
        open={phase !== 'idle'}
        onCancel={phase !== 'importing' ? handleClose : undefined}
        closable={phase !== 'importing'}
        maskClosable={false}
        width={760}
        footer={
          phase === 'setup' ? [
            <Button key="cancel" onClick={handleClose}>{t('common.cancel')}</Button>,
          ] : phase === 'preview' ? [
            <Button
              key="tpl"
              icon={<DownloadOutlined />}
              onClick={() => downloadTemplate(templateHeaders, templateExamples, templateFileName)}
            >
              {t('excel.downloadTemplate')}
            </Button>,
            <Button key="back" onClick={() => setPhase('setup')}>{t('common.back')}</Button>,
            <Button
              key="import"
              type="primary"
              disabled={validRows.length === 0}
              onClick={startImport}
            >
              {validRows.length} {t('excel.importRowsSuffix')}
            </Button>,
          ] : phase === 'done' ? [
            <Button key="close" type="primary" onClick={handleClose}>{t('excel.close')}</Button>,
          ] : null
        }
      >
        {/* ── Setup ── */}
        {phase === 'setup' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderRadius: 8,
              background: 'var(--surface-2, #f9fafb)',
              border: '1px solid var(--border)',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{t('excel.templateTitle')}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{t('excel.templateDesc')}</div>
              </div>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => downloadTemplate(templateHeaders, templateExamples, templateFileName)}
              >
                {t('excel.downloadTemplate')}
              </Button>
            </div>

            <Upload.Dragger
              accept=".xlsx,.xls"
              showUploadList={false}
              multiple={false}
              beforeUpload={(file) => { processFile(file); return false; }}
            >
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">{t('excel.dropzoneTitle')}</p>
              <p className="ant-upload-hint">{t('excel.dropzoneHint')}</p>
            </Upload.Dragger>

            {hints && hints.length > 0 && (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {hints.map((hint) => (
                  <div key={hint.label} style={{ flex: '1 1 200px' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>
                      {hint.label}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {hint.items.map((item) => (
                        <Tag key={item} style={{ fontSize: 11, margin: 0 }}>{item}</Tag>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Preview ── */}
        {phase === 'preview' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <Tag color="success">{validRows.length} {t('excel.validSuffix')}</Tag>
              {invalidRows.length > 0 && (
                <Tag color="error">{invalidRows.length} {t('excel.invalidSuffix')}</Tag>
              )}
            </div>
            <Table
              dataSource={rows}
              columns={previewColumns}
              rowKey="index"
              size="small"
              pagination={{ pageSize: 10, size: 'small' }}
              rowClassName={(r) => r.error ? 'import-row-error' : ''}
              scroll={{ x: true }}
              style={{ fontSize: 12 }}
            />
          </>
        )}

        {/* ── Importing ── */}
        {phase === 'importing' && (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <Progress percent={progress} status="active" />
            <div style={{ marginTop: 12, color: 'var(--ink-3)', fontSize: 13 }}>
              {t('excel.importing')} {Math.round(progress * validRows.length / 100)} / {validRows.length}
            </div>
          </div>
        )}

        {/* ── Done ── */}
        {phase === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Alert
              type={results.failedRows.length === 0 ? 'success' : results.added === 0 ? 'error' : 'warning'}
              message={
                <span>
                  <b>{results.added}</b> {t('excel.addedSuffix')}
                  {results.failedRows.length > 0 && (
                    <>, <b>{results.failedRows.length}</b> {t('excel.failedSuffix')}</>
                  )}
                </span>
              }
              showIcon
            />
            {results.failedRows.length > 0 && (
              <Table
                dataSource={results.failedRows}
                columns={failedColumns}
                rowKey="rowNum"
                size="small"
                pagination={false}
                scroll={{ y: 260 }}
              />
            )}
          </div>
        )}
      </Modal>

      <style>{`
        .import-row-error td { background: #fff1f2 !important; }
      `}</style>
    </>
  );
}
