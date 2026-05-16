import { useNavigate, useLocation } from 'react-router-dom';
import { Select, Dropdown, Tooltip } from 'antd';
import {
  EnvironmentOutlined,
  DollarOutlined,
  SettingOutlined,
  LogoutOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  MoonOutlined,
  SunOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/entities/user';
import { useDispatch } from '@/app/store.jsx';
import { useUIStore } from '@/app/stores/ui.store';
import { useT } from '@/shared/lib/i18n';
import { ALL_NAV_ITEMS } from '@/widgets/app-sidebar/model/navConfig';
import { ROUTES } from '@/shared/config/routes';
import type { Lang, Theme } from '@/app/stores/ui.store';

const ALL_BRANCHES_LABEL_KEY = 'header.allBranches';

interface AppHeaderProps {
  branches: Array<{ id: string; name: string }>;
}

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: 'uz-cy', label: "O'z (кирил)" },
  { value: 'uz-la', label: "O'z (lotin)" },
  { value: 'ru', label: 'Рус' },
  { value: 'en', label: 'Eng' },
];

export function AppHeader({ branches }: AppHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();
  const user = useAuthStore((s) => s.user);
  const zustandLogout = useAuthStore((s) => s.logout);
  const legacyDispatch = useDispatch();
  const isSuper = useAuthStore((s) => s.isSuper)();

  const activeBranchId = useUIStore((s) => s.activeBranchId);
  const exchangeRate = useUIStore((s) => s.exchangeRate);
  const setActiveBranch = useUIStore((s) => s.setActiveBranch);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const toggleMobileSidebar = useUIStore((s) => s.toggleMobileSidebar);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const lang = useUIStore((s) => s.lang);
  const setLang = useUIStore((s) => s.setLang);

  const handleToggle = () => {
    if (window.innerWidth < 768) toggleMobileSidebar();
    else toggleSidebar();
  };

  const toggleDark = () => {
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    const next: Theme = isDark ? 'light' : 'dark';
    setTheme(next);
  };

  const isDarkActive = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const activeBranch = branches.find((b) => b.id === activeBranchId);
  const userBranch = branches.find((b) => b.id === user?.branchId);

  const currentNav = ALL_NAV_ITEMS.find((n) => {
    if (n.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(n.path);
  });
  const pageLabel = currentNav ? t(`nav.${currentNav.key}`) : t('nav.dashboard');

  const langMenuItems = LANG_OPTIONS.map((opt) => ({
    key: opt.value,
    label: opt.label,
    onClick: () => setLang(opt.value),
  }));

  const profileMenuItems = [
    {
      key: 'header',
      type: 'group' as const,
      label: (
        <div style={{ padding: '4px 0', minWidth: 220 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'capitalize', marginTop: 2 }}>
            {user?.role?.replace('_', ' ')} · {userBranch?.name?.split(' — ')[0] ?? t('header.allBranches')}
          </div>
        </div>
      ),
    },
    { type: 'divider' as const },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('header.profile'),
      onClick: () => navigate(ROUTES.PROFILE),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('header.settings'),
      onClick: () => navigate(ROUTES.SETTINGS),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: <span style={{ color: '#dc2626' }}>{t('header.logout')}</span>,
      onClick: () => {
        zustandLogout();
        legacyDispatch({ type: 'auth/logout' });
        navigate(ROUTES.LOGIN);
      },
    },
  ];

  const currentLangLabel = LANG_OPTIONS.find((o) => o.value === lang)?.label ?? 'UZ';

  return (
    <header className="topbar">
      <button className="sidebar-toggle" onClick={handleToggle} type="button">
        {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </button>

      <div className="crumbs">
        AKFA ERP · <strong>{pageLabel}</strong>
      </div>

      <div className="grow" />

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span className="tagpill info topbar-hide-mobile">
          <DollarOutlined style={{ fontSize: 11 }} />
          1 USD = {exchangeRate.toLocaleString('ru-RU').replace(/,/g, ' ')} so&apos;m
        </span>

        {/* Theme toggle */}
        <Tooltip title={isDarkActive ? t('settings.themeLight') : t('settings.themeDark')} placement="bottom">
          <button
            type="button"
            onClick={toggleDark}
            className="sidebar-toggle topbar-hide-mobile"
            style={{ fontSize: 15 }}
          >
            {isDarkActive ? <SunOutlined /> : <MoonOutlined />}
          </button>
        </Tooltip>

        {/* Language selector */}
        <Dropdown
          menu={{ items: langMenuItems, selectedKeys: [lang] }}
          trigger={['click']}
          placement="bottomRight"
        >
          <button
            type="button"
            className="sidebar-toggle topbar-hide-mobile"
            style={{ fontSize: 11, fontWeight: 700, gap: 4, width: 'auto', padding: '0 10px', minWidth: 56 }}
          >
            <GlobalOutlined style={{ fontSize: 13 }} />
            {currentLangLabel}
          </button>
        </Dropdown>

        {isSuper ? (
          <Select
            value={activeBranchId}
            onChange={setActiveBranch}
            className="topbar-hide-mobile"
            style={{ minWidth: 220 }}
            suffixIcon={<EnvironmentOutlined />}
            options={[
              { value: '__all__', label: t('header.allBranches') },
              ...branches.map((b) => ({ value: b.id, label: b.name })),
            ]}
          />
        ) : (
          <span className="branchchip topbar-hide-mobile">
            <span className="dot" /> {activeBranch?.name ?? userBranch?.name}
          </span>
        )}

        <Dropdown menu={{ items: profileMenuItems }} trigger={['click']} placement="bottomRight">
          <button className="profile-trigger" type="button">
            <UserAvatar name={user?.name} size={28} />
            <span className="profile-name">{user?.name?.split(' ')[0]}</span>
            <DownOutlined style={{ fontSize: 10, color: 'var(--ink-3)' }} />
          </button>
        </Dropdown>
      </div>
    </header>
  );
}

function UserAvatar({ name, size = 28 }: { name?: string; size?: number }) {
  const tone = '#1e4dd8';
  const initials = (name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((s) => s[0])
    .join('')
    .toUpperCase();
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${tone}, ${tone}cc)`,
        color: '#fff',
        fontSize: size * 0.42,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  );
}
