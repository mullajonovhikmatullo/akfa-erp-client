import {useEffect, useId, useMemo, useState} from 'react';
import {yupResolver} from '@hookform/resolvers/yup';

import {Controller, useForm} from 'react-hook-form';
import * as yup from 'yup';
import {createAdminHandoffUrl, getAdminUrl, registerStore, type PublicPlanCode} from '@store/landing-stub';
import {useI18n} from '../../i18n/I18nProvider';
import {formatMessage} from '../../i18n/translations';
import type {TranslationDictionary} from '../../i18n/types';
import {UzbekPhoneInput} from '../ui/UzbekPhoneInput';

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

const initialForm: FormState = {
    storeName: '', ownerName: '', phone: '', email: '', username: '', password: '', confirmPassword: '',
};

const UZBEK_MOBILE_CODES = ['33', '50', '77', '88', '90', '91', '93', '94', '95', '97', '98', '99'];

function createRegistrationSchema(validation: TranslationDictionary['registration']['validation']): yup.ObjectSchema<FormState> {
    //
    return yup.object({
        storeName: yup.string().trim().required(validation.storeRequired).min(2, validation.storeMin).max(120, validation.storeMax),
        ownerName: yup.string().trim().required(validation.ownerRequired).min(2, validation.ownerMin).max(100, validation.ownerMax),
        phone: yup.string().trim().required(validation.phoneRequired)
            .matches(/^\+998\d{9}$/, validation.phoneFormat)
            .test('uzbek-mobile-code', validation.phoneCode, (value) => value ? UZBEK_MOBILE_CODES.includes(value.slice(4, 6)) : true),
        email: yup.string().trim().max(120, validation.emailMax).email(validation.emailFormat).defined(),
        username: yup.string().trim().required(validation.usernameRequired).min(3, validation.usernameMin)
            .max(50, validation.usernameMax).matches(/^[a-zA-Z0-9_]+$/, validation.usernameFormat),
        password: yup.string().required(validation.passwordRequired).min(6, validation.passwordMin).max(100, validation.passwordMax),
        confirmPassword: yup.string().required(validation.confirmRequired).oneOf([yup.ref('password')], validation.confirmMismatch),
    });
}

function FieldError({message}: { message?: string }) {
    //
    return (
        <small className="registration-form__field-error" data-visible={Boolean(message)} title={message}
               aria-live="polite">
            {message || '\u00a0'}
        </small>
    );
}

export function RegistrationModal({open, planCode, planName, onClose}: RegistrationModalProps) {
    //
    const {language, t} = useI18n();
    const copy = t.registration;
    const titleId = useId();
    const introId = useId();
    const schema = useMemo(() => createRegistrationSchema(copy.validation), [copy.validation]);
    const {
        register, handleSubmit, reset, clearErrors, control,
        formState: {errors, isSubmitting},
    } = useForm<FormState>({
        resolver: yupResolver(schema),
        defaultValues: initialForm,
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
    });
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [createdStoreName, setCreatedStoreName] = useState<string | null>(null);
    const [adminUrl, setAdminUrl] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Existing validation messages are cleared when the language changes so no
    // stale message remains visible in the previous language.
    useEffect(() => {
        //
        clearErrors();
        setSubmitError(null);
    }, [clearErrors, language]);

    useEffect(() => {
        //
        if (!open) return undefined;
        const previousOverflow = document.body.style.overflow;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isSubmitting) onClose();
        };
        document.body.style.overflow = 'hidden';
        document.addEventListener('keydown', closeOnEscape);
        return () => {
            //
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', closeOnEscape);
        };
    }, [isSubmitting, onClose, open]);

    if (!open) return null;

    const submitRegistration = async (form: FormState) => {
        //
        setSubmitError(null);
        try {
            const result = await registerStore({
                storeName: form.storeName.trim(), ownerName: form.ownerName.trim(), phone: form.phone.trim(),
                email: form.email.trim() || undefined, username: form.username.trim(), password: form.password,
                confirmPassword: form.confirmPassword, planCode,
            });
            setCreatedStoreName(result.store.name);
            setAdminUrl(createAdminHandoffUrl(result.handoffCode));
        } catch {
            // Backend messages can arrive in a different language; expose a localized,
            // stable message to the landing user instead.
            setSubmitError(copy.requestFailed);
        }
    };

    const resetAndClose = () => {
        //
        reset(initialForm);
        setSubmitError(null);
        setCreatedStoreName(null);
        setAdminUrl(null);
        setShowPassword(false);
        setShowConfirmPassword(false);
        onClose();
    };

    return (
        <div className="registration-modal" role="dialog" aria-modal="true" aria-labelledby={titleId}
             aria-describedby={introId}>
            <button className="registration-modal__backdrop" type="button" onClick={resetAndClose}
                    aria-label={copy.close}/>
            <div className="registration-modal__panel">
                <div className="registration-modal__header">
                    <div><span className="registration-modal__eyebrow">{planName}</span><h3
                        id={titleId}>{copy.title}</h3></div>
                    <button className="registration-modal__close" type="button" onClick={resetAndClose}
                            aria-label={copy.close}>
                        <i className="icons-close h-4 w-4"/>
                    </button>
                </div>

                {createdStoreName ? (
                    <div className="registration-success">
                        <i className="icons-circle-check h-10 w-10"/>
                        <h4>{formatMessage(copy.successTitle, {storeName: createdStoreName})}</h4>
                        <p id={introId}>{copy.successText}</p>
                        <a className="btn-primary" href={adminUrl ?? getAdminUrl()}>{copy.openAdmin}<i
                            className="icons-arrow-right h-4 w-4"/></a>
                    </div>
                ) : (
                    <form className="registration-form" onSubmit={handleSubmit(submitRegistration)} noValidate>
                        <p className="registration-form__intro" id={introId}>{copy.intro}</p>

                        <section className="registration-form__section">
                            <div className="registration-form__section-title"><i
                                className="icons-building h-4 w-4"/><span>{copy.storeSection}</span></div>
                            <div className="registration-form__fields">
                                <label className="registration-form__field--wide">
                                    <span>{copy.fields.storeName}</span>
                                    <input {...register('storeName')} placeholder={copy.fields.storeNamePlaceholder}
                                           aria-invalid={Boolean(errors.storeName)} autoFocus/>
                                    <FieldError message={errors.storeName?.message}/>
                                </label>
                                <label>
                                    <span>{copy.fields.ownerName}</span>
                                    <input {...register('ownerName')} placeholder={copy.fields.ownerNamePlaceholder}
                                           aria-invalid={Boolean(errors.ownerName)}/>
                                    <FieldError message={errors.ownerName?.message}/>
                                </label>
                                <label>
                                    <span>{copy.fields.phone}</span>
                                    <Controller
                                        name="phone"
                                        control={control}
                                        render={({field}) => (
                                            <UzbekPhoneInput
                                                name={field.name} ref={field.ref} value={field.value}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur} error={Boolean(errors.phone)}
                                                ariaLabel={copy.fields.phone}
                                            />
                                        )}
                                    />
                                    <FieldError message={errors.phone?.message}/>
                                </label>
                                <label className="registration-form__field--wide">
                                    <span>{copy.fields.email} <em>{copy.fields.optional}</em></span>
                                    <input {...register('email')} type="email" placeholder="name@example.com"
                                           aria-invalid={Boolean(errors.email)}/>
                                    <FieldError message={errors.email?.message}/>
                                </label>
                            </div>
                        </section>

                        <section className="registration-form__section">
                            <div className="registration-form__section-title"><i className="icons-user-circle h-4 w-4"/><span>{copy.accountSection}</span>
                            </div>
                            <div className="registration-form__fields">
                                <label className="registration-form__field--wide">
                                    <span>{copy.fields.username}</span>
                                    <input {...register('username')} autoComplete="off"
                                           placeholder={copy.fields.usernamePlaceholder}
                                           aria-invalid={Boolean(errors.username)}/>
                                    <FieldError message={errors.username?.message}/>
                                </label>
                                <label>
                                    <span>{copy.fields.password}</span>
                                    <div className="registration-form__password-control">
                                        <input {...register('password')} type={showPassword ? 'text' : 'password'}
                                               placeholder={copy.fields.passwordPlaceholder}
                                               aria-invalid={Boolean(errors.password)}/>
                                        <button className="registration-form__password-toggle" type="button"
                                                onClick={() => setShowPassword((visible) => !visible)}
                                                aria-label={showPassword ? copy.hidePassword : copy.showPassword}
                                                aria-pressed={showPassword}>
                                            {showPassword ? <i className="icons-hide icon-size-17"/> :
                                                <i className="icons-eye icon-size-17"/>}
                                        </button>
                                    </div>
                                    <FieldError message={errors.password?.message}/>
                                </label>
                                <label>
                                    <span>{copy.fields.confirmPassword}</span>
                                    <div className="registration-form__password-control">
                                        <input {...register('confirmPassword')}
                                               type={showConfirmPassword ? 'text' : 'password'}
                                               placeholder={copy.fields.confirmPasswordPlaceholder}
                                               aria-invalid={Boolean(errors.confirmPassword)}/>
                                        <button className="registration-form__password-toggle" type="button"
                                                onClick={() => setShowConfirmPassword((visible) => !visible)}
                                                aria-label={showConfirmPassword ? copy.hideConfirmPassword : copy.showConfirmPassword}
                                                aria-pressed={showConfirmPassword}>
                                            {showConfirmPassword ? <i className="icons-hide icon-size-17"/> :
                                                <i className="icons-eye icon-size-17"/>}
                                        </button>
                                    </div>
                                    <FieldError message={errors.confirmPassword?.message}/>
                                </label>
                            </div>
                        </section>

                        {submitError ?
                            <div className="registration-form__error" role="alert">{submitError}</div> : null}
                        <button className="btn-primary registration-form__submit" type="submit" disabled={isSubmitting}
                                aria-label={isSubmitting ? copy.submitting : copy.submit}>
                            {isSubmitting ? <i className="icons-reload h-4 w-4 animate-spin"/> :
                                <i className="icons-arrow-right h-4 w-4"/>}
                            {isSubmitting ? copy.submitting : copy.submit}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
