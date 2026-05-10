import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export function usePagination(defaultPageSize = 10) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const pageSize = Math.max(1, Number(searchParams.get('pageSize') || defaultPageSize));

  const onChange = useCallback(
    (newPage: number, newPageSize: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('page', String(newPage));
          next.set('pageSize', String(newPageSize));
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  // Convert 0-based table index to absolute row number
  const rowIndex = useCallback(
    (index: number) => (page - 1) * pageSize + index + 1,
    [page, pageSize],
  );

  return { page, pageSize, onChange, rowIndex };
}
