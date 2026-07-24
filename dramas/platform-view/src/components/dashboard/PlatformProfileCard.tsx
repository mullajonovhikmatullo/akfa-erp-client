import { ShieldCheck, Storefront } from '@phosphor-icons/react';
import { GlassCard } from '../common/GlassCard';
import { formatTime } from '../../lib/formatters';
import type { PlatformProfile } from '../../types/dashboard';

interface PlatformProfileCardProps {
  admin: PlatformProfile;
}

export const PlatformProfileCard = ({ admin }: PlatformProfileCardProps) => (
  <GlassCard className="profile-card">
    <div className="profile-card__avatar-wrap">
      <img className="profile-card__avatar" src={admin.avatarUrl} alt={`${admin.name} profili`} />
      <span className="profile-card__status" aria-label="Admin faol" />
    </div>
    <div className="profile-card__identity">
      <h1>{admin.name}</h1>
      <span>Admin ID: {admin.id}</span>
    </div>
    <div className="profile-card__meta">
      <div>
        <ShieldCheck size={18} weight="duotone" aria-hidden="true" />
        <span>{admin.role}</span>
      </div>
      <div>
        <Storefront size={18} weight="duotone" aria-hidden="true" />
        <span>{admin.accessLevel}</span>
      </div>
    </div>
    <div className="profile-card__platform">
      <span>Platforma</span>
      <strong>{admin.platformName}</strong>
      <div>
        <small>{admin.managedTenants} mijoz nazoratda</small>
        <small>Oxirgi kirish: {formatTime(admin.lastLogin)}</small>
      </div>
    </div>
  </GlassCard>
);
