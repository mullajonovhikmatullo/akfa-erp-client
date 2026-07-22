import { Outlet } from 'react-router-dom';
import type { CSSProperties } from 'react';
import dashboardBackgroundUrl from '../assets/dashboard-background-city.jpg';
import { AppHeader } from './components/AppHeader';
import { AppSidebar } from './components/AppSidebar';

const shellStyle = {
  '--app-background-photo': `url(${dashboardBackgroundUrl})`,
} as CSSProperties & Record<'--app-background-photo', string>;

export const AppLayout = () => {
  //
  return (
    <div className="app-shell" style={shellStyle}>
      <AppHeader />
      <div className="app-body">
        <AppSidebar />
        <main className="app-main" id="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
