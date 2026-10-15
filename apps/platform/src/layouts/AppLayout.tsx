import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, Search } from 'lucide-react';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { Button } from '../shared/ui/button';
import { CommandMenu } from './CommandMenu';
import { navItems } from './navigation';
import { BrandMark, Sidebar } from './Sidebar';
import { SignOutDialog } from './SignOutDialog';

function isTyping(target: EventTarget | null) {
  //
  const element = target as HTMLElement | null;
  return Boolean(element && (element.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)));
}

function useKeyboardShortcuts(openCommand: () => void) {
  //
  const navigate = useNavigate();
  const pendingG = useRef(false);

  useEffect(() => {
    //
    const onKeyDown = (event: KeyboardEvent) => {
      //
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openCommand();
        return;
      }
      if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      if (pendingG.current) {
        pendingG.current = false;
        const target = navItems.find((item) => item.shortcut === event.key);
        if (target) navigate(target.path);
        return;
      }
      if (event.key === 'g') {
        pendingG.current = true;
        window.setTimeout(() => {
          pendingG.current = false;
        }, 900);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [navigate, openCommand]);
}

export function AppLayout() {
  //
  const location = useLocation();
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const openCommand = useRef(() => setCommandOpen(true)).current;
  useKeyboardShortcuts(openCommand);

  useEffect(() => {
    //
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-dvh border-r border-border bg-background lg:block">
        <Sidebar onOpenCommand={openCommand} />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur lg:hidden">
        <DialogPrimitive.Root open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <DialogPrimitive.Trigger asChild>
            <Button variant="ghost" size="icon" aria-label="Menyu">
              <MenuIcon />
            </Button>
          </DialogPrimitive.Trigger>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 animate-in" />
            <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-background shadow-soft outline-none">
              <DialogPrimitive.Title className="sr-only">Menyu</DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">Bo‘limlar</DialogPrimitive.Description>
              <Sidebar onOpenCommand={openCommand} onNavigate={() => setMobileNavOpen(false)} />
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
        <BrandMark />
        <Button variant="ghost" size="icon" aria-label="Qidirish" onClick={openCommand}>
          <Search />
        </Button>
      </header>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto grid max-w-6xl gap-6">
          <Outlet />
        </div>
      </main>

      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
      <SignOutDialog />
    </div>
  );
}
