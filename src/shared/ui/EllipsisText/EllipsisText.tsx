import { Tooltip } from 'antd';
import type { ReactNode } from 'react';

interface EllipsisTextProps {
  children: ReactNode;
  title?: ReactNode;
  maxWidth?: number | string;
}

export function EllipsisText({ children, title, maxWidth = 180 }: EllipsisTextProps) {
  const content = (
    <span
      style={{
        display: 'inline-block',
        maxWidth,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        verticalAlign: 'bottom',
      }}
    >
      {children}
    </span>
  );

  return (
    <Tooltip title={title ?? children} mouseEnterDelay={0.4}>
      {content}
    </Tooltip>
  );
}
