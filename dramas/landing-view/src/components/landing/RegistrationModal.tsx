import { useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Store, UserRound, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { UzbekPhoneInput } from '../ui/UzbekPhoneInput';
import {
  createAdminHandoffUrl,
  getAdminUrl,
  type PublicPlanCode,
  registerStore,
} from '@store/landing-stub';

interface RegistrationModalProps {
  open: boolean;
  planCode: PublicPlanCode;
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
  confirmPassword: string;
};

function FieldError({ message }: { message?: string }) {
  return (
    <small
      className="registration-form__field-error"
      data-visible={Boolean(message)}
      title={message}
      aria-live="polite"
    >
      {message || '\u00a0'}
    </small>
  );
}

const initialForm: FormState = {
  storeName: '',
  ownerName: '',
  phone: '',
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
};

const UZBEK_MOBILE_CODES = ['33', '50', '77', '88', '90', '91', '93', '94', '95', '97', '98', '99'];

const registrationSchema: yup.ObjectSchema<FormState> = yup.object({
  storeName: yup
    .string()
    .trim()
    .required('Do‘kon nomini kiriting')
    .min(2, 'Do‘kon nomi kamida 2 ta belgidan iborat bo‘lsin')
    .max(120, 'Do‘kon nomi 120 ta belgidan oshmasin'),
  ownerName: yup
    .string()
    .trim()
    .required('Do‘kon egasining ismini kiriting')
    .min(2, 'Ism kamida 2 ta belgidan iborat bo‘lsin')
    .max(100, 'Ism 100 ta belgidan oshmasin'),
  phone: yup
    .string()
    .trim()
    .required('Telefon raqamini kiriting')
    .matches(/^\+998\d{9}$/, 'Telefon raqami 9 ta raqamdan iborat bo‘lsin')
    .test('uzbek-mobile-code', 'Mobil operator kodi noto‘g‘ri', (value) =>
      value ? UZBEK_MOBILE_CODES.includes(value.slice(4, 6)) : true,
    ),
  email: yup
    .string()
    .trim()
    .max(120, 'Email 120 ta belgidan oshmasin')
    .email('Email manzilini to‘g‘ri kiriting')
    .defined(),
  username: yup
    .string()
    .trim()
    .required('Loginni kiriting')
    .min(3, 'Login kamida 3 ta belgidan iborat bo‘lsin')
    .max(50, 'Login 50 ta belgidan oshmasin')
    .matches(/^[a-zA-Z0-9_]+$/, 'Faqat lotin harflari, raqam va pastki chiziq mumkin'),
  password: yup
    .string()
    .required('Parolni kiriting')
    .min(6, 'Parol kamida 6 ta belgidan iborat bo‘lsin')
    .max(100, 'Parol 100 ta belgidan oshmasin'),
  confirmPassword: yup
    .string()
    .required('Parolni qayta kiriting')
    .oneOf([yup.ref('password')], 'Parollar mos kelmadi'),
});

export function RegistrationModal({ open, planCode, planName, onClose }: RegistrationModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormState>({
    resolver: yupResolver(registrationSchema),
    defaultValues: initialForm,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdStoreName, setCreatedStoreName] = useState<string | null>(null);
  const [adminUrl, setAdminUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!open) return null;

  const submitRegistration = async (form: FormState) => {
    setSubmitError(null);
    try {
      createAdminHandoffUrl('configuration-check');
      const result = await registerStore({
        storeName: form.storeName.trim(),
        ownerName: form.ownerName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        username: form.username.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        planCode,
      });

      setCreatedStoreName(result.store.name);
      setAdminUrl(createAdminHandoffUrl(result.handoffCode));
    } catch (submitError) {
      setSubmitError(submitError instanceof Error ? submitError.message : 'So‘rovni yuborib bo‘lmadi');
    }
  };

  const resetAndClose = () => {
    reset(initialForm);
    setSubmitError(null);
    setCreatedStoreName(null);
    setAdminUrl(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <div className="registration-modal" role="dialog" aria-modal="true">
      <button className="registration-modal__backdrop" type="button" onClick={resetAndClose} aria-label="Yopish" />
      <div className="registration-modal__panel">
        <div className="registration-modal__header">
          <div>
            <span className="registration-modal__eyebrow">{planName}</span>
            <h3>Bepul akkaunt yaratish</h3>
          </div>
          <button className="registration-modal__close" type="button" onClick={resetAndClose} aria-label="Yopish">
            <X className="h-4 w-4" />
          </button>
        </div>

        {createdStoreName ? (
          <div className="registration-success">
            <CheckCircle2 className="h-10 w-10" />
            <h4>{createdStoreName} akkaunti tayyor</h4>
            <p>Sinov muddati boshlandi. Bir martalik xavfsiz kirish tayyor.</p>
            <a className="btn-primary" href={adminUrl ?? getAdminUrl()}>
              Adminga o‘tish
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ) : (
          <form className="registration-form" onSubmit={handleSubmit(submitRegistration)} noValidate>
            <p className="registration-form__intro">
              Ma’lumotlarni kiriting — do‘kon boshqaruv paneli bir necha soniyada tayyor bo‘ladi.
            </p>

            <section className="registration-form__section">
              <div className="registration-form__section-title">
                <Store className="h-4 w-4" />
                <span>Do‘kon ma’lumotlari</span>
              </div>
              <div className="registration-form__fields">
                <label className="registration-form__field--wide">
                  <span>Do‘kon nomi</span>
                  <input
                    {...register('storeName')}
                    placeholder="Masalan: Baraka Market"
                    aria-invalid={Boolean(errors.storeName)}
                    autoFocus
                  />
                  <FieldError message={errors.storeName?.message} />
                </label>
                <label>
                  <span>Do‘kon egasi</span>
                  <input {...register('ownerName')} placeholder="Ism va familiya" aria-invalid={Boolean(errors.ownerName)} />
                  <FieldError message={errors.ownerName?.message} />
                </label>
                <label>
                  <span>Telefon raqami</span>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <UzbekPhoneInput
                        name={field.name}
                        ref={field.ref}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={Boolean(errors.phone)}
                      />
                    )}
                  />
                  <FieldError message={errors.phone?.message} />
                </label>
                <label className="registration-form__field--wide">
                  <span>Email <em>ixtiyoriy</em></span>
                  <input {...register('email')} type="email" placeholder="name@example.com" aria-invalid={Boolean(errors.email)} />
                  <FieldError message={errors.email?.message} />
                </label>
              </div>
            </section>

            <section className="registration-form__section">
              <div className="registration-form__section-title">
                <UserRound className="h-4 w-4" />
                <span>Kirish ma’lumotlari</span>
              </div>
              <div className="registration-form__fields">
                <label className="registration-form__field--wide">
                  <span>Login</span>
                  <input
                    {...register('username')}
                    autoComplete="off"
                    placeholder="Login kiriting"
                    aria-invalid={Boolean(errors.username)}
                  />
                  <FieldError message={errors.username?.message} />
                </label>
                <label>
                  <span>Parol</span>
                  <div className="registration-form__password-control">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Kamida 6 ta belgi"
                      aria-invalid={Boolean(errors.password)}
                    />
                    <button
                      className="registration-form__password-toggle"
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  <FieldError message={errors.password?.message} />
                </label>
                <label>
                  <span>Parolni tasdiqlang</span>
                  <div className="registration-form__password-control">
                    <input
                      {...register('confirmPassword')}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Parolni qayta kiriting"
                      aria-invalid={Boolean(errors.confirmPassword)}
                    />
                    <button
                      className="registration-form__password-toggle"
                      type="button"
                      onClick={() => setShowConfirmPassword((visible) => !visible)}
                      aria-label={showConfirmPassword ? 'Tasdiqlash parolini yashirish' : 'Tasdiqlash parolini ko‘rsatish'}
                      aria-pressed={showConfirmPassword}
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  <FieldError message={errors.confirmPassword?.message} />
                </label>
              </div>
            </section>

            {submitError && <div className="registration-form__error">{submitError}</div>}

            <button className="btn-primary registration-form__submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              Akkaunt yaratish
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
