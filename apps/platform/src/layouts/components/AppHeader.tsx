import { Badge, Input, Popover, Tooltip } from 'antd';
import { Bell, MagnifyingGlass, ShieldCheck, Storefront } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { dashboardMock } from '@store/platform-view/mocks';
import { readPlatformUser } from '../../shared/auth/session';
import { ThemeToggle } from './ThemeToggle';
import { UserProfileMenu } from './UserProfileMenu';

const notificationItems = [
  {
    title: '3 ta to‘lov muddati yaqin',
    meta: 'Bugun tekshirish kerak',
  },
  {
    title: '7 ta yangi murojaat',
    meta: 'Qo‘llab-quvvatlash navbatida',
  },
  {
    title: 'Tizim holati barqaror',
    meta: '99.8% ishlash darajasi',
  },
];

export const AppHeader = () => {
  const platformUser = readPlatformUser();
  const admin = platformUser
    ? {
        ...dashboardMock.admin,
        id: platformUser.id,
        name: platformUser.name,
        role: 'Global super admin',
        accessLevel: 'Platform owner',
      }
    : dashboardMock.admin;

  const notificationContent = (
    <div className="notification-popover">
      <div className="notification-popover__header">
        <strong>Bildirishnomalar</strong>
        <span>5 ta</span>
      </div>
      {notificationItems.map((item) => (
        <button
          key={item.title}
          className="notification-item"
          type="button"
          onClick={() => toast.info('Bu bo‘lim keyingi bosqichda qo‘shiladi')}
        >
          <span>{item.title}</span>
          <small>{item.meta}</small>
        </button>
      ))}
    </div>
  );

  return (
    <header className="app-header">
      <div className="app-header__left">
        <div className="brand-mark" aria-hidden="true">
          <Storefront size={22} weight="duotone" />
        </div>
        <div className="brand-copy">
          <span>Store Management</span>
        </div>
        <span className="role-chip">
          <ShieldCheck size={15} weight="fill" aria-hidden="true" />
          Platform admin
        </span>
      </div>

      <div className="app-header__search">
        <Input
          aria-label="Global qidiruv"
          prefix={<MagnifyingGlass size={18} weight="duotone" aria-hidden="true" />}
          placeholder="Mijoz, do‘kon yoki to‘lov qidirish"
          allowClear
          onPressEnter={(event) => {
            //
            if (event.currentTarget.value.trim()) {
              toast.info('Qidiruv keyingi bosqichda qo‘shiladi');
            }
          }}
        />
      </div>

      <div className="app-header__actions">
        <Tooltip title="Qidirish">
          <button
            className="icon-button app-header__search-button"
            type="button"
            aria-label="Qidiruvni ochish"
            onClick={() => toast.info('Qidiruv keyingi bosqichda qo‘shiladi')}
          >
            <MagnifyingGlass size={20} weight="duotone" />
          </button>
        </Tooltip>
        <ThemeToggle />
        <Popover content={notificationContent} trigger="click" placement="bottomRight">
          <button className="icon-button" type="button" aria-label="Bildirishnomalarni ko‘rish">
            <Badge count={5} size="small" offset={[2, -1]}>
              <Bell size={20} weight="duotone" />
            </Badge>
          </button>
        </Popover>
        <UserProfileMenu admin={admin} />
      </div>
    </header>
  );
};
