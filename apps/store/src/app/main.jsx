/**
 * app/main.jsx — entry point.
 *
 * app/main.jsx — entry point.
 */

import './styles.css';
import ReactDOM from 'react-dom/client';
import {Toaster} from 'sonner';
import {AppProviders} from './providers/index.tsx';
import {AppRouter} from '../routes/index.tsx';

// eslint-disable-next-line react-refresh/only-export-components
const App = () => (
    <AppProviders>
        <AppRouter/>
        <Toaster richColors position="top-right"/>
    </AppProviders>
);

const mount = () => {
  //
    if (window.__store_mounted) return;
    const el = document.getElementById('root');
    if (!el) {
        setTimeout(mount, 30);
        return;
    }
    window.__store_mounted = true;
    ReactDOM.createRoot(el).render(<App/>);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
} else {
    mount();
}
