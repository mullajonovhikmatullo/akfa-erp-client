import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, CheckCircle2, Loader2, X } from 'lucide-react';
import {
  getAdminUrl,
  persistAdminSession,
  type PlanCode,
  registerStore,
} from '@store/landing-stub';

interface RegistrationModalProps {
  open: boolean;
  planCode: PlanCode;
  planName: string;
  onClose: () => void;
}

type FormState = {
  storeName: string;
  ownerName: string;
  phone: string;
  email: string;
  username: string;
  password: string;
};

const initialForm: FormState = {
  storeName: '',
  ownerName: '',
  phone: '',
  email: '',
  username: '',
  password: '',
};

function buildUsername(storeName: string) {
  return storeName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

export function RegistrationModal({ open, planCode, planName, onClose }: RegistrationModalProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdStoreName, setCreatedStoreName] = useState<string | null>(null);

  const adminUrl = useMemo(() => getAdminUrl(), []);

  if (!open) return null;

  const updateField = (key: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === 'storeName' && !current.username ? { username: buildUsername(value) } : {}),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await registerStore({
        storeName: form.storeName.trim(),
        ownerName: form.ownerName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        username: form.username.trim(),
        password: form.password,
        planCode,
      });

      persistAdminSession(result);
      setCreatedStoreName(result.store.name);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'So‘rovni yuborib bo‘lmadi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setForm(initialForm);
    setError(null);
    setCreatedStoreName(null);
    onClose();
  };

  return (
    <div className="registration-modal" role="dialog" aria-modal="true">
      <button className="registration-modal__backdrop" type="button" onClick={resetAndClose} aria-label="Yopish" />
      <div className="registration-modal__panel">
        <div className="registration-modal__header">
          <div>
            <span className="registration-modal__eyebrow">{planName}</span>
            <h3>Admin ochish</h3>
          </div>
          <button className="registration-modal__close" type="button" onClick={resetAndClose} aria-label="Yopish">
            <X className="h-4 w-4" />
          </button>
        </div>

        {createdStoreName ? (
          <div className="registration-success">
            <CheckCircle2 className="h-10 w-10" />
            <h4>{createdStoreName} admini tayyor</h4>
            <p>Sinov muddati boshlandi. Kirish ma’lumotlari saqlandi.</p>
            <a className="btn-primary" href={adminUrl}>
              Adminga o‘tish
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <form className="registration-form" onSubmit={handleSubmit}>
            <label>
              <span>Do‘kon nomi</span>
              <input
                value={form.storeName}
                onChange={(event) => updateField('storeName', event.target.value)}
                minLength={2}
                maxLength={120}
                required
                autoFocus
              />
            </label>
            <label>
              <span>Egasi</span>
              <input
                value={form.ownerName}
                onChange={(event) => updateField('ownerName', event.target.value)}
                minLength={2}
                maxLength={100}
                required
              />
            </label>
            <label>
              <span>Telefon</span>
              <input
                value={form.phone}
                onChange={(event) => updateField('phone', event.target.value)}
                minLength={7}
                maxLength={30}
                required
              />
            </label>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                maxLength={120}
              />
            </label>
            <label>
              <span>Login</span>
              <input
                value={form.username}
                onChange={(event) => updateField('username', event.target.value)}
                minLength={3}
                maxLength={50}
                pattern="[a-zA-Z0-9_]+"
                required
              />
            </label>
            <label>
              <span>Parol</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                minLength={6}
                maxLength={100}
                required
              />
            </label>

            {error && <div className="registration-form__error">{error}</div>}

            <button className="btn-primary registration-form__submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Admin ochish
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
