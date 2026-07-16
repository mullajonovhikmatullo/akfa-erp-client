import { Spin } from 'antd';

export function SelectLoadingContent() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}>
      <Spin size="small" />
    </div>
  );
}
