import type { StoreTranslator } from '@store/store-i18n'
import { useState } from 'react'
import { Alert, Button, Modal, Progress, Table, Tag, Tooltip, Upload } from 'antd'

import { toast } from 'sonner'
import { getLocalizedApiErrorMessage } from '../../lib/apiError'
import { downloadTemplate, getField, parseExcelFile } from '../../lib/parseExcel'
import type { TemplateHint } from '../../lib/parseExcel'

type Translate = StoreTranslator

export interface ParsedRow<T> {
  index: number
  raw: Record<string, string>
  data?: T
  error?: string
}

export interface ExcelImportButtonProps<T> {
  t: Translate
  entityLabel: string
  templateHeaders: string[]
  templateExamples: string[][]
  templateFileName: string
  parseRow: (raw: Record<string, string>, index: number) => ParsedRow<T>
  createFn: (data: T) => Promise<unknown>
  onComplete?: () => void
  disabled?: boolean
  disabledReason?: string
  hints?: TemplateHint[]
}

type Phase = 'idle' | 'setup' | 'preview' | 'importing' | 'done'

interface FailedRow {
  rowNum: number
  label: string
  message: string
}

function extractError(err: unknown, t: Translate): string {
  //
  return getLocalizedApiErrorMessage(err, t, 'excel.importError')
}

export function ExcelImportButton<T>({
  t,
  entityLabel,
  templateHeaders,
  templateExamples,
  templateFileName,
  parseRow,
  createFn,
  onComplete,
  disabled,
  disabledReason,
  hints,
}: ExcelImportButtonProps<T>) {
  //
  const [phase, setPhase] = useState<Phase>('idle')
  const [rows, setRows] = useState<ParsedRow<T>[]>([])
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{ added: number; failedRows: FailedRow[] }>({
    added: 0,
    failedRows: [],
  })

  const validRows = rows.filter((row) => !row.error)
  const invalidRows = rows.filter((row) => row.error)

  async function processFile(file: File) {
    //
    try {
      const raw = await parseExcelFile(file)
      if (raw.length === 0) {
        toast.error(t('excel.emptyFile'))
        return
      }
      const parsed = raw.map((row, index) => parseRow(row, index))
      setRows(parsed)
      setProgress(0)
      setResults({ added: 0, failedRows: [] })
      setPhase('preview')
    } catch {
      toast.error(t('excel.readError'))
    }
  }

  async function startImport() {
    //
    if (validRows.length === 0) return
    setPhase('importing')
    let added = 0
    const failedRows: FailedRow[] = []

    for (const [index, row] of validRows.entries()) {
      try {
        await createFn(row.data!)
        added += 1
      } catch (error) {
        failedRows.push({
          rowNum: row.index + 1,
          label: (templateHeaders[0] ? row.raw[templateHeaders[0]] : undefined) ?? `#${row.index + 1}`,
          message: extractError(error, t),
        })
      }
      setProgress(Math.round(((index + 1) / validRows.length) * 100))
    }

    setResults({ added, failedRows })
    setPhase('done')
    onComplete?.()
  }

  function handleClose() {
    //
    setPhase('idle')
    setRows([])
  }

  const previewColumns = [
    {
      title: '#',
      key: 'index',
      width: 48,
      render: (_: unknown, row: ParsedRow<T>) => <span className="u-text-muted u-fs-12">{row.index + 1}</span>,
    },
    ...templateHeaders.map((header) => ({
      title: header,
      key: header,
      ellipsis: true,
      render: (_: unknown, row: ParsedRow<T>) => <span className="u-fs-12">{getField(row.raw, header)}</span>,
    })),
    {
      title: '',
      key: 'status',
      width: 36,
      render: (_: unknown, row: ParsedRow<T>) =>
        row.error ? (
          <Tooltip title={row.error}>
            <i className="icons-close-circle icon-size-18 u-text-danger" />
          </Tooltip>
        ) : (
          <i className="icons-circle-check icon-size-18 u-text-success" />
        ),
    },
  ]

  const failedColumns = [
    {
      title: '#',
      dataIndex: 'rowNum',
      width: 48,
      render: (value: number) => <span className="u-text-muted u-fs-12">{value}</span>,
    },
    {
      title: entityLabel,
      dataIndex: 'label',
      ellipsis: true,
      render: (value: string) => <span className="u-fs-12 u-fw-500">{value}</span>,
    },
    {
      title: t('excel.failureReason'),
      dataIndex: 'message',
      render: (value: string) => <span className="u-text-danger u-fs-12">{value}</span>,
    },
  ]

  const importTrigger = (
    <Button icon={<i className="icons-upload icon-size-18" />} disabled={disabled} onClick={() => setPhase('setup')}>
      {t('excel.importButton')}
    </Button>
  )

  return (
    <>
      {disabled && disabledReason ? (
        <Tooltip title={disabledReason}>
          <span>{importTrigger}</span>
        </Tooltip>
      ) : (
        importTrigger
      )}

      <Modal
        title={`${entityLabel} — ${t('excel.modalTitle')}`}
        open={phase !== 'idle'}
        onCancel={phase !== 'importing' ? handleClose : undefined}
        closable={phase !== 'importing'}
        maskClosable={false}
        width={760}
        footer={
          phase === 'setup'
            ? [<Button key="cancel" onClick={handleClose}>{t('common.cancel')}</Button>]
            : phase === 'preview'
              ? [
                  <Button key="tpl" icon={<i className="icons-download icon-size-18" />} onClick={() => downloadTemplate(templateHeaders, templateExamples, templateFileName, hints)}>
                    {t('excel.downloadTemplate')}
                  </Button>,
                  <Button key="back" onClick={() => setPhase('setup')}>{t('common.back')}</Button>,
                  <Button key="import" type="primary" disabled={validRows.length === 0} onClick={startImport}>
                    {validRows.length} {t('excel.importRowsSuffix')}
                  </Button>,
                ]
              : phase === 'done'
                ? [<Button key="close" type="primary" onClick={handleClose}>{t('excel.close')}</Button>]
                : null
        }
      >
        {phase === 'setup' && (
          <div className="u-flex u-flex-col u-gap-16">
            <div
              className="u-items-center u-bg-surface-subtle u-rounded-8 u-border-default u-flex u-justify-between u-p-12-16"
            >
              <div>
                <div className="u-fs-13 u-fw-600">{t('excel.templateTitle')}</div>
                <div className="u-text-muted u-fs-12 u-mt-2">{t('excel.templateDesc')}</div>
              </div>
              <Button icon={<i className="icons-download icon-size-18" />} onClick={() => downloadTemplate(templateHeaders, templateExamples, templateFileName, hints)}>
                {t('excel.downloadTemplate')}
              </Button>
            </div>

            <Upload.Dragger
              accept=".xlsx,.xls"
              showUploadList={false}
              multiple={false}
              beforeUpload={(file) => {
                //
                processFile(file)
                return false
              }}
            >
              <p className="ant-upload-drag-icon">
                <i className="icons-file-excel icon-size-48" />
              </p>
              <p className="ant-upload-text">{t('excel.dropzoneTitle')}</p>
              <p className="ant-upload-hint">{t('excel.dropzoneHint')}</p>
            </Upload.Dragger>

            {hints && hints.length > 0 && (
              <div className="u-flex u-flex-wrap u-gap-16">
                {hints.map((hint) => (
                  <div key={hint.label} className="u-flex-basis-200">
                    <div className="u-text-secondary u-fs-12 u-fw-600 u-mb-6">{hint.label}</div>
                    <div className="u-flex u-flex-wrap u-gap-4">
                      {hint.items.map((item) => (
                        <Tag key={item} className="u-fs-11 u-m-0">{item}</Tag>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {phase === 'preview' && (
          <>
            <div className="u-flex u-gap-8 u-mb-12">
              <Tag color="success">
                {validRows.length} {t('excel.validSuffix')}
              </Tag>
              {invalidRows.length > 0 && (
                <Tag color="error">
                  {invalidRows.length} {t('excel.invalidSuffix')}
                </Tag>
              )}
            </div>
            <Table
              dataSource={rows}
              columns={previewColumns}
              rowKey="index"
              size="small"
              pagination={{ pageSize: 10, size: 'small' }}
              rowClassName={(row) => (row.error ? 'import-row-error' : '')}
              scroll={{ x: true }}
              className="u-fs-12"
            />
          </>
        )}

        {phase === 'importing' && (
          <div className="u-p-24-0 u-text-center">
            <Progress percent={progress} status="active" />
            <div className="u-text-muted u-fs-13 u-mt-12">
              {t('excel.importing')} {Math.round((progress * validRows.length) / 100)} / {validRows.length}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="u-flex u-flex-col u-gap-12">
            <Alert
              type={results.failedRows.length === 0 ? 'success' : results.added === 0 ? 'error' : 'warning'}
              message={
                <span>
                  <b>{results.added}</b> {t('excel.addedSuffix')}
                  {results.failedRows.length > 0 && (
                    <>
                      , <b>{results.failedRows.length}</b> {t('excel.failedSuffix')}
                    </>
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
  )
}
