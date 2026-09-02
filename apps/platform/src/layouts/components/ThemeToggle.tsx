import { Tooltip } from 'antd';

import { useUIStore } from '../../app/stores/uiStore';

export const ThemeToggle = () => {
  //
  const resolvedTheme = useUIStore((state) => state.resolvedTheme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const isDark = resolvedTheme === 'dark';

  return (
    <Tooltip title={isDark ? 'Yorug‘ mavzuga o‘tish' : 'Qorong‘i mavzuga o‘tish'}>
      <button
        aria-label={isDark ? 'Yorug‘ mavzuga o‘tish' : 'Qorong‘i mavzuga o‘tish'}
        aria-pressed={isDark}
        className="icon-button theme-toggle"
        type="button"
        onClick={toggleTheme}
      >
        {isDark ? <i className="icons-sun icon-size-20" /> : <i className="icons-moon icon-size-20" />}
      </button>
    </Tooltip>
  );
};
