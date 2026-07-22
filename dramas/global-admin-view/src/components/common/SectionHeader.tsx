interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader = ({ title, subtitle, actionLabel, onAction }: SectionHeaderProps) => (
  <div className="section-header">
    <div>
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
    {actionLabel ? (
      <button className="section-header__action" type="button" onClick={onAction}>
        {actionLabel}
      </button>
    ) : null}
  </div>
);
