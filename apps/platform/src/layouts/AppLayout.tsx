import { Outlet } from 'react-router-dom';
import { AppHeader } from './components/AppHeader';
import { AppSidebar } from './components/AppSidebar';

export const AppLayout = () => {
  //
  return (
    <div className="app-shell">
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
