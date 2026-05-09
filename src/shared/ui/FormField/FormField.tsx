import { Form } from 'antd';
import type { ReactNode } from 'react';
import type { FieldError } from 'react-hook-form';

interface FormFieldProps {
  label?: string;
  error?: FieldError;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}

/**
 * Bridges React Hook Form errors with Ant Design Form.Item validation display.
 * Wrap any AntD input with this to get consistent error messaging.
 */
export function FormField({ label, error, required, hint, children }: FormFieldProps) {
  return (
    <Form.Item
      label={label}
      required={required}
      validateStatus={error ? 'error' : undefined}
      help={error?.message ?? hint}
      style={{ marginBottom: 16 }}
    >
      {children}
    </Form.Item>
  );
}
