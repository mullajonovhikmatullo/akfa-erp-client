import { StoreManagerMark } from "./Logo";

export function DashboardMock() {
  return (
    <figure className="dashboard-preview" aria-label="Boshqaruv paneli ko‘rinishi">
      <img
        className="dashboard-preview__image"
        src={`${import.meta.env.BASE_URL}dashboard.png`}
        alt="Savdo, tushum, xarajatlar va to‘lov usullari ko‘rsatilgan boshqaruv paneli"
      />
      <div className="dashboard-preview__brand" aria-label="Your Brand">
        <StoreManagerMark size={28} />
        <strong><span>Your</span> Brand</strong>
      </div>
    </figure>
  );
}
