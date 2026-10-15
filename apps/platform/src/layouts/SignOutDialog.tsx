import { LogOut } from 'lucide-react';
import { useUIStore } from '../app/stores/uiStore';
import { Button } from '../shared/ui/button';
import { Dialog } from '../shared/ui/overlay';
import { useSignOut } from './useSignOut';

export function SignOutDialog() {
  //
  const open = useUIStore((state) => state.signOutConfirmOpen);
  const setOpen = useUIStore((state) => state.setSignOutConfirmOpen);
  const signOut = useSignOut();

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      title="Chiqishni tasdiqlang"
      description="Platformadan chiqasiz. Qayta kirish uchun login va parol kerak bo‘ladi."
      footer={
        <>
          <Button variant="ghost" onClick={() => setOpen(false)}>Bekor qilish</Button>
          <Button
            variant="danger"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
          >
            <LogOut />
            Chiqish
          </Button>
        </>
      }
    />
  );
}
