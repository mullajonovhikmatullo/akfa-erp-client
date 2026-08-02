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
import {useUIStore} from './stores/ui.store.ts';

const AppToaster = () => {
    const theme = useUIStore((state) => state.theme);

    return (
        <Toaster
            theme={theme}
            position="bottom-right"
            richColors
            closeButton
            visibleToasts={4}
            gap={10}
            offset={18}
            mobileOffset={12}
            duration={3200}
            toastOptions={{className: 'mavion-toast'}}
        />
    );
};

// eslint-disable-next-line react-refresh/only-export-components
const App = () => (
    <AppProviders>
        <AppRouter/>
        <AppToaster/>
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
