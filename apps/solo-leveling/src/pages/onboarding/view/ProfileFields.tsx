import { useId, type ReactNode } from 'react'
import { MIN_AGE } from '@/domain/planner.ts'
import type { Equipment, Experience, FitnessLevel, Goal, Limitation, Profile, Sex, TrainingLocation } from '@/domain/types.ts'
import {
  EQUIPMENT_LABELS,
  EXPERIENCE_LABELS,
  GOAL_LABELS,
  LEVEL_LABELS,
  LIMITATION_LABELS,
  LOCATION_LABELS,
  SEX_LABELS,
} from '@/i18n/uz.ts'
import { ChoiceCard, Segmented, cx } from '@/components/ui.tsx'

export type ProfileDraft = Omit<Profile, 'createdAt' | 'updatedAt' | 'age' | 'sex'> & { age: number | null; sex: Sex | null }

export const emptyDraft = (): ProfileDraft => ({
  name: '',
  age: null,
  sex: null,
  heightCm: null,
  weightKg: null,
  level: 'beginner',
  experience: 'none',
  goal: 'general',
  location: 'home',
  equipment: [],
  daysPerWeek: 3,
  minutesPerSession: 30,
  limitations: [],
  limitationNote: '',
})

export interface FieldProps {
  draft: ProfileDraft
  onChange: (patch: Partial<ProfileDraft>) => void
}

const toggle = <T,>(list: T[], value: T): T[] => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value])

const Label = ({ children, htmlFor, hint }: { children: ReactNode; htmlFor?: string; hint?: string }) => (
  <div className="mb-2">
    <label htmlFor={htmlFor} className="block text-sm font-semibold">
      {children}
    </label>
    {hint ? <p className="text-xs text-fog">{hint}</p> : null}
  </div>
)

const NumberInput = ({
  value,
  onChange,
  placeholder,
  suffix,
  min,
  max,
  label,
  hint,
  invalid,
}: {
  value: number | null
  onChange: (value: number | null) => void
  placeholder: string
  suffix: string
  min: number
  max: number
  label: string
  hint?: string
  invalid?: string | null
}) => {
  //
  const id = useId()
  return (
    <div>
      <Label htmlFor={id} hint={hint}>
        {label}
      </Label>
      <div
        className={cx(
          'flex min-h-14 items-center rounded-2xl border bg-white/[0.03] px-4 transition focus-within:border-volt/70',
          invalid ? 'border-blood/60' : 'border-line',
        )}
      >
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value ?? ''}
          placeholder={placeholder}
          aria-invalid={Boolean(invalid)}
          aria-describedby={invalid ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value === '' ? null : Number(event.target.value))}
          className="w-full bg-transparent font-display text-lg font-semibold outline-none placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-fog"
        />
        <span className="text-sm text-fog">{suffix}</span>
      </div>
      {invalid ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-blood-2">
          {invalid}
        </p>
      ) : null}
    </div>
  )
}

export const validateBasics = (draft: ProfileDraft): { age: string | null; sex: string | null } => ({
  age:
    draft.age === null
      ? 'Yoshingizni kiriting'
      : draft.age < MIN_AGE
        ? `Ilova ${MIN_AGE} yoshdan katta foydalanuvchilar uchun. Mashg‘ulotlarni ota-onangiz va shifokor bilan rejalashtiring.`
        : draft.age > 100
          ? 'Yosh 100 dan oshmasligi kerak'
          : null,
  sex: draft.sex === null ? 'Birini tanlang' : null,
})

export const validateBody = (draft: ProfileDraft): { height: string | null; weight: string | null } => ({
  height: draft.heightCm !== null && (draft.heightCm < 100 || draft.heightCm > 250) ? '100–250 sm oralig‘ida kiriting' : null,
  weight: draft.weightKg !== null && (draft.weightKg < 30 || draft.weightKg > 300) ? '30–300 kg oralig‘ida kiriting' : null,
})

export const BasicsFields = ({ draft, onChange, showErrors }: FieldProps & { showErrors: boolean }) => {
  //
  const nameId = useId()
  const errors = validateBasics(draft)
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor={nameId} hint="Ixtiyoriy — salomlashish uchun">
          Ismingiz
        </Label>
        <input
          id={nameId}
          value={draft.name}
          maxLength={40}
          autoComplete="given-name"
          onChange={(event) => onChange({ name: event.target.value })}
          placeholder="Masalan, Jasur"
          className="min-h-14 w-full rounded-2xl border border-line bg-white/[0.03] px-4 text-base outline-none placeholder:text-fog focus:border-volt/70"
        />
      </div>
      <NumberInput
        label="Yoshingiz"
        value={draft.age}
        onChange={(age) => onChange({ age })}
        placeholder="25"
        suffix="yosh"
        min={MIN_AGE}
        max={100}
        invalid={showErrors || (draft.age !== null && draft.age < MIN_AGE) ? errors.age : null}
      />
      <div>
        <Label>Jinsingiz</Label>
        <Segmented
          label="Jins"
          value={draft.sex ?? ('' as Sex)}
          onChange={(sex) => onChange({ sex })}
          options={(Object.keys(SEX_LABELS) as Sex[]).map((value) => ({ value, label: SEX_LABELS[value] }))}
        />
        {showErrors && errors.sex ? <p className="mt-1.5 text-xs text-blood-2">{errors.sex}</p> : null}
      </div>
    </div>
  )
}

export const BodyFields = ({ draft, onChange }: FieldProps) => {
  //
  const errors = validateBody(draft)
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <NumberInput
        label="Bo‘y"
        hint="Ixtiyoriy"
        value={draft.heightCm}
        onChange={(heightCm) => onChange({ heightCm })}
        placeholder="175"
        suffix="sm"
        min={100}
        max={250}
        invalid={errors.height}
      />
      <NumberInput
        label="Vazn"
        hint="Ixtiyoriy"
        value={draft.weightKg}
        onChange={(weightKg) => onChange({ weightKg })}
        placeholder="70"
        suffix="kg"
        min={30}
        max={300}
        invalid={errors.weight}
      />
    </div>
  )
}

export const ExperienceFields = ({ draft, onChange }: FieldProps) => (
  <div className="space-y-6">
    <div role="radiogroup" aria-label="Jismoniy tayyorgarlik darajasi" className="space-y-2.5">
      {(Object.keys(LEVEL_LABELS) as FitnessLevel[]).map((level) => (
        <ChoiceCard
          key={level}
          selected={draft.level === level}
          onSelect={() => onChange({ level })}
          title={LEVEL_LABELS[level].title}
          description={LEVEL_LABELS[level].description}
        />
      ))}
    </div>
    <div>
      <Label>Mashg‘ulot tajribasi</Label>
      <div role="radiogroup" aria-label="Mashg‘ulot tajribasi" className="grid grid-cols-2 gap-2">
        {(Object.keys(EXPERIENCE_LABELS) as Experience[]).map((experience) => (
          <button
            key={experience}
            type="button"
            role="radio"
            aria-checked={draft.experience === experience}
            onClick={() => onChange({ experience })}
            className={cx(
              'min-h-12 rounded-2xl border px-3 text-sm font-semibold transition',
              draft.experience === experience ? 'border-volt/70 bg-volt/12 text-bone' : 'border-line text-mist hover:text-bone',
            )}
          >
            {EXPERIENCE_LABELS[experience]}
          </button>
        ))}
      </div>
    </div>
  </div>
)

export const GoalFields = ({ draft, onChange }: FieldProps) => (
  <div role="radiogroup" aria-label="Asosiy maqsad" className="grid gap-2.5 sm:grid-cols-2">
    {(Object.keys(GOAL_LABELS) as Goal[]).map((goal) => (
      <ChoiceCard
        key={goal}
        selected={draft.goal === goal}
        onSelect={() => onChange({ goal })}
        title={GOAL_LABELS[goal].title}
        description={GOAL_LABELS[goal].description}
        icon={GOAL_LABELS[goal].icon}
      />
    ))}
  </div>
)

export const LocationFields = ({ draft, onChange }: FieldProps) => (
  <div className="space-y-6">
    <div role="radiogroup" aria-label="Mashg‘ulot joyi" className="grid gap-2.5 sm:grid-cols-2">
      {(Object.keys(LOCATION_LABELS) as TrainingLocation[]).map((location) => (
        <ChoiceCard
          key={location}
          selected={draft.location === location}
          onSelect={() => onChange({ location })}
          title={LOCATION_LABELS[location].title}
          description={LOCATION_LABELS[location].description}
          icon={LOCATION_LABELS[location].icon}
        />
      ))}
    </div>
    {draft.location === 'home' ? (
      <div>
        <Label hint="Hech narsa bo‘lmasa — tanlamang, jihozsiz reja tuzamiz">Uyda mavjud jihozlar</Label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Jihozlar">
          {(Object.keys(EQUIPMENT_LABELS) as Equipment[])
            .filter((item) => item !== 'machines')
            .map((item) => {
              const selected = draft.equipment.includes(item)
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange({ equipment: toggle(draft.equipment, item) })}
                  className={cx(
                    'min-h-11 rounded-full border px-4 text-sm font-medium transition',
                    selected ? 'border-volt/70 bg-volt/15 text-bone' : 'border-line text-mist hover:text-bone',
                  )}
                >
                  {selected ? '✓ ' : ''}
                  {EQUIPMENT_LABELS[item]}
                </button>
              )
            })}
        </div>
      </div>
    ) : (
      <p className="rounded-2xl border border-line bg-white/[0.02] p-4 text-sm text-mist">Sport zalida odatiy jihozlar (trenajyorlar, shtanga, gantellar, turnik) bor deb hisoblaymiz.</p>
    )}
  </div>
)

export const ScheduleFields = ({ draft, onChange }: FieldProps) => (
  <div className="space-y-6">
    <div>
      <Label hint="Dam olish kunlari ham rejaning bir qismi">Haftasiga necha kun?</Label>
      <Segmented
        label="Haftalik kunlar"
        value={draft.daysPerWeek}
        onChange={(daysPerWeek) => onChange({ daysPerWeek })}
        options={[2, 3, 4, 5, 6].map((value) => ({ value, label: String(value) }))}
      />
    </div>
    <div>
      <Label>Bir mashg‘ulotga qancha vaqt?</Label>
      <Segmented
        label="Mashg‘ulot davomiyligi"
        value={draft.minutesPerSession}
        onChange={(minutesPerSession) => onChange({ minutesPerSession })}
        options={[20, 30, 45, 60].map((value) => ({ value, label: `${value} daq` }))}
      />
    </div>
  </div>
)

export const LimitationsFields = ({ draft, onChange }: FieldProps) => {
  //
  const noteId = useId()
  const joints: Limitation[] = ['knee', 'back', 'shoulder', 'wrist']
  const medical: Limitation[] = ['heart', 'pressure', 'pregnancy', 'recentSurgery', 'other']
  const renderGroup = (items: Limitation[], title: string) => (
    <div>
      <Label>{title}</Label>
      <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label={title}>
        {items.map((item) => (
          <ChoiceCard
            key={item}
            multi
            selected={draft.limitations.includes(item)}
            onSelect={() => onChange({ limitations: toggle(draft.limitations, item) })}
            title={LIMITATION_LABELS[item]}
          />
        ))}
      </div>
    </div>
  )
  return (
    <div className="space-y-6">
      {renderGroup(joints, 'Jarohat yoki og‘riq bo‘lgan joylar')}
      {renderGroup(medical, 'Salomatlik holati')}
      <div>
        <Label htmlFor={noteId} hint="Ixtiyoriy">
          Qo‘shimcha izoh
        </Label>
        <textarea
          id={noteId}
          rows={2}
          maxLength={300}
          value={draft.limitationNote}
          onChange={(event) => onChange({ limitationNote: event.target.value })}
          placeholder="Masalan: chap tizzamda eski jarohat bor"
          className="w-full rounded-2xl border border-line bg-white/[0.03] p-4 text-sm outline-none placeholder:text-fog focus:border-volt/70"
        />
      </div>
      {draft.limitations.length === 0 ? <p className="text-sm text-mist">Hech qanday cheklov bo‘lmasa, shunchaki davom eting.</p> : null}
    </div>
  )
}

export const draftToProfile = (draft: ProfileDraft, previous?: Profile | null): Profile => {
  //
  const now = new Date().toISOString()
  return {
    ...draft,
    name: draft.name.trim(),
    age: draft.age ?? MIN_AGE,
    sex: draft.sex ?? 'male',
    equipment: draft.location === 'gym' ? [] : draft.equipment,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  }
}
