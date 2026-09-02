import { Avatar, Dropdown } from 'antd';

import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { MenuProps } from 'antd';
import type { PlatformProfile } from '@store/platform-view/types';
import { routes } from '../../config/routes';
import { clearPlatformSession } from '../../shared/auth/session';
import { platformQueryClient } from '../../app/providers/AppProviders';

interface UserProfileMenuProps {
  admin: PlatformProfile;
}

const profileMenuItems: MenuProps['items'] = [
  {
    key: 'profile',
    label: 'Profil',
    icon: <i className="icons-user-circle icon-size-17" />,
  },
  {
    key: 'settings',
    label: 'Sozlamalar',
    icon: <i className="icons-settings icon-size-17" />,
  },
  {
    key: 'help',
    label: 'Yordam',
    icon: <i className="icons-header-support icon-size-17" />,
  },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    label: 'Tizimdan chiqish',
    icon: <i className="icons-logout icon-size-17" />,
    danger: true,
  },
];

export const UserProfileMenu = ({ admin }: UserProfileMenuProps) => {
  //
  const navigate = useNavigate();

  const handleMenuClick: MenuProps['onClick'] = async ({ key }) => {
    //
    if (key === 'logout') {
      await platformQueryClient.cancelQueries();
      platformQueryClient.clear();
      clearPlatformSession();
      toast.success('Tizimdan chiqildi');
      navigate(routes.login, { replace: true });
      return;
    }

    toast.info('Bu bo‘lim keyingi bosqichda qo‘shiladi');
  };

  return (
    <Dropdown
      menu={{ items: profileMenuItems, onClick: handleMenuClick }}
      placement="bottomRight"
      trigger={['click']}
    >
      <button className="user-menu" type="button" aria-label="Profil menyusini ochish">
        <Avatar src={admin.avatarUrl} size={36} alt={admin.name} />
        <span className="user-menu__name">{admin.name}</span>
        <i className="icons-arrow-down icon-size-15" aria-hidden="true" />
      </button>
    </Dropdown>
  );
};
