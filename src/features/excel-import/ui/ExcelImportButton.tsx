import { useRef, useState } from 'react';
import { Button, Modal, Table, Progress, Alert, Tag, Tooltip } from 'antd';
import { UploadOutlined, DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { toast } from 'sonner';
import { parseExcelFile, downloadTemplate } from '../lib/parseExcel';

export interface ParsedRow<T> {
  index: number;
  raw: Record<string, string>;
  data?: T;
  error?: string;
}

export interface ExcelImportButtonProps<T> {
  entityLabel: string;
  templateHeaders: string[];
  templateExample: string[];
  templateFileName: string;
  parseRow: (raw: Record<string, string>, index: number) => ParsedRow<T>;
  createFn: (data: T) => Promise<unknown>;
  onComplete?: () => void;
  disabled?: boolean;
}

type Phase = 'idle' | 'preview' | 'importing' | 'done';

export function ExcelImportButton<T>({
  entityLabel,
  templateHeaders,
  templateExample,
  templateFileName,
  parseRow,
  createFn,
  onComplete,
  disabled,
}: ExcelImportButtonProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>('idle');
  const [rows, setRows] = useState<ParsedRow<T>[]>([]);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ added: number; failed: number }>({ added: 0, failed: 0 });

  const validRows = rows.filter((r) => !r.error);
  const invalidRows = rows.filter((r) => r.error);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (inputRef.current) inputRef.current.value = '';
    if (!file) return;

    try {
      const raw = await parseExcelFile(file);
      if (raw.length === 0) { toast.error('Excel fayl bo\'sh'); return; }
      const parsed = raw.map((r, i) => parseRow(r, i));
      setRows(parsed);
      setProgress(0);
      setResults({ added: 0, failed: 0 });
      setPhase('preview');
    } catch {
      toast.error('Faylni o\'qishda xato yuz berdi');
    }
    // reset input so same file can be re-selected
    e.target.value = '';
  }

  async function startImport() {
    if (validRows.length === 0) return;
    setPhase('importing');
    let added = 0;
    let failed = 0;

    for (const [i, row] of validRows.entries()) {
      try {
        await createFn(row.data!);
        added++;
      } catch {
        failed++;
      }
      setProgress(Math.round(((i + 1) / validRows.length) * 100));
    }

    setResults({ added, failed });
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
        <span style={{ fontSize: 12 }}>{r.raw[h] ?? ''}</span>
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

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <Button
        icon={<UploadOutlined />}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        Import Excel
      </Button>

      <Modal
        title={`${entityLabel} — Excel import`}
        open={phase !== 'idle'}
        onCancel={phase !== 'importing' ? handleClose : undefined}
        closable={phase !== 'importing'}
        maskClosable={false}
        width={760}
        footer={
          phase === 'preview' ? [
            <Button key="tpl" icon={<DownloadOutlined />} onClick={() => downloadTemplate(templateHeaders, templateExample, templateFileName)}>
              Shablon yuklab olish
            </Button>,
            <Button key="cancel" onClick={handleClose}>Bekor qilish</Button>,
            <Button
              key="import"
              type="primary"
              disabled={validRows.length === 0}
              onClick={startImport}
            >
              {validRows.length} ta qatorni import qilish
            </Button>,
          ] : phase === 'done' ? [
            <Button key="close" type="primary" onClick={handleClose}>Yopish</Button>,
          ] : null
        }
      >
        {phase === 'preview' && (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <Tag color="success">{validRows.length} ta to'g'ri</Tag>
              {invalidRows.length > 0 && (
                <Tag color="error">{invalidRows.length} ta xatolik (import qilinmaydi)</Tag>
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

        {phase === 'importing' && (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <Progress percent={progress} status="active" />
            <div style={{ marginTop: 12, color: 'var(--ink-3)', fontSize: 13 }}>
              Import qilinmoqda... {Math.round(progress * validRows.length / 100)} / {validRows.length}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div style={{ padding: '8px 0' }}>
            <Alert
              type={results.failed === 0 ? 'success' : 'warning'}
              message={
                <span>
                  <b>{results.added}</b> ta muvaffaqiyatli qo'shildi
                  {results.failed > 0 && <>, <b>{results.failed}</b> ta xato</>}
                </span>
              }
              showIcon
            />
          </div>
        )}
      </Modal>

      <style>{`
        .import-row-error td { background: #fff1f2 !important; }
      `}</style>
    </>
  );
}
