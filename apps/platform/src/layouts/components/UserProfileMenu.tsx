import { Avatar, Dropdown } from 'antd';
import { CaretDown, GearSix, Headset, SignOut, UserCircle } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { MenuProps } from 'antd';
import type { PlatformProfile } from '@store/platform-view/types';
import { routes } from '../../config/routes';
import { clearPlatformSession } from '../../shared/auth/session';

interface UserProfileMenuProps {
  admin: PlatformProfile;
}

const profileMenuItems: MenuProps['items'] = [
  {
    key: 'profile',
    label: 'Profil',
    icon: <UserCircle size={17} weight="duotone" />,
  },
  {
    key: 'settings',
    label: 'Sozlamalar',
    icon: <GearSix size={17} weight="duotone" />,
  },
  {
    key: 'help',
    label: 'Yordam',
    icon: <Headset size={17} weight="duotone" />,
  },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    label: 'Tizimdan chiqish',
    icon: <SignOut size={17} weight="duotone" />,
    danger: true,
  },
];

export const UserProfileMenu = ({ admin }: UserProfileMenuProps) => {
  const navigate = useNavigate();

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    //
    if (key === 'logout') {
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
        <CaretDown size={15} weight="bold" aria-hidden="true" />
      </button>
    </Dropdown>
  );
};
