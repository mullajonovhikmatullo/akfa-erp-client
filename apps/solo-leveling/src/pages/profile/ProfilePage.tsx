import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assessSafety, availableEquipment } from '@/domain/planner.ts'
import type { Profile } from '@/domain/types.ts'
import { EQUIPMENT_LABELS, EXPERIENCE_LABELS, GOAL_LABELS, LEVEL_LABELS, LIMITATION_LABELS, LOCATION_LABELS, SEX_LABELS } from '@/i18n/uz.ts'
import { Icon } from '@/components/Icon.tsx'
import { Button, Card, Notice, SectionTitle, Segmented, Sheet } from '@/components/ui.tsx'
import { useAppStore } from '@/store/AppStore.tsx'
import {
  BasicsFields,
  BodyFields,
  ExperienceFields,
  GoalFields,
  LimitationsFields,
  LocationFields,
  ScheduleFields,
  draftToProfile,
  validateBasics,
  validateBody,
  type ProfileDraft,
} from '../onboarding/view/ProfileFields.tsx'

const toDraft = (profile: Profile): ProfileDraft => ({ ...profile })

const SECTIONS = [
  { key: 'basics', title: 'Asosiy ma’lumotlar' },
  { key: 'body', title: 'Bo‘y va vazn' },
  { key: 'level', title: 'Tayyorgarlik' },
  { key: 'goal', title: 'Maqsad' },
  { key: 'location', title: 'Joy va jihozlar' },
  { key: 'schedule', title: 'Jadval' },
  { key: 'limits', title: 'Cheklovlar va salomatlik' },
] as const

type SectionKey = (typeof SECTIONS)[number]['key']

export default function ProfilePage() {
  //
  const { state, updateProfile, updateSettings, deleteHealthData, resetAll } = useAppStore()
  const navigate = useNavigate()
  const profile = state.profile!
  const [editing, setEditing] = useState<SectionKey | null>(null)
  const [draft, setDraft] = useState<ProfileDraft>(() => toDraft(profile))
  const [confirm, setConfirm] = useState<'health' | 'all' | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const safety = assessSafety(profile)

  const openEditor = (key: SectionKey) => {
    setDraft(toDraft(profile))
    setEditing(key)
  }

  const basicsErrors = validateBasics(draft)
  const bodyErrors = validateBody(draft)
  const canSave = !basicsErrors.age && !basicsErrors.sex && !bodyErrors.height && !bodyErrors.weight

  const save = () => {
    if (!canSave) return
    updateProfile(draftToProfile(draft, profile))
    setEditing(null)
    setSaved('Profil saqlandi. Reja yangi ma’lumotlarga moslab qayta tuzildi.')
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `solo-leveling-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const summary: Record<SectionKey, string> = {
    basics: [profile.name || 'Ism kiritilmagan', `${profile.age} yosh`, SEX_LABELS[profile.sex]].join(' · '),
    body: profile.heightCm || profile.weightKg ? [profile.heightCm ? `${profile.heightCm} sm` : null, profile.weightKg ? `${profile.weightKg} kg` : null].filter(Boolean).join(' · ') : 'Kiritilmagan',
    level: `${LEVEL_LABELS[profile.level].title} · ${EXPERIENCE_LABELS[profile.experience]}`,
    goal: GOAL_LABELS[profile.goal].title,
    location: `${LOCATION_LABELS[profile.location].title} · ${
      availableEquipment(profile).length === 0 ? 'jihozsiz' : profile.location === 'gym' ? 'to‘liq jihozlar' : profile.equipment.map((item) => EQUIPMENT_LABELS[item]).join(', ')
    }`,
    schedule: `Haftasiga ${profile.daysPerWeek} kun · ${profile.minutesPerSession} daqiqa`,
    limits: profile.limitations.length === 0 ? 'Cheklov yo‘q' : profile.limitations.map((item) => LIMITATION_LABELS[item]).join(', '),
  }

  const onChange = (patch: Partial<ProfileDraft>) => setDraft((current) => ({ ...current, ...patch }))
  const renderEditor = (key: SectionKey) => {
    switch (key) {
      case 'basics':
        return <BasicsFields draft={draft} onChange={onChange} showErrors />
      case 'body':
        return <BodyFields draft={draft} onChange={onChange} />
      case 'level':
        return <ExperienceFields draft={draft} onChange={onChange} />
      case 'goal':
        return <GoalFields draft={draft} onChange={onChange} />
      case 'location':
        return <LocationFields draft={draft} onChange={onChange} />
      case 'schedule':
        return <ScheduleFields draft={draft} onChange={onChange} />
      default:
        return <LimitationsFields draft={draft} onChange={onChange} />
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <span className="flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-volt/40 to-blood/30 font-display text-2xl font-bold">
          {(profile.name || 'O')[0]?.toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">{profile.name || 'Ovchi'}</h1>
          <p className="text-sm text-mist">Profil va sozlamalar</p>
        </div>
      </header>

      {saved ? (
        <div role="status" className="flex animate-rise items-center justify-between gap-3 rounded-2xl border border-ok/30 bg-ok/10 px-4 py-3 text-sm text-ok">
          {saved}
          <button type="button" onClick={() => setSaved(null)} aria-label="Yopish" className="text-ok/80 hover:text-ok">
            <Icon name="x" size={16} />
          </button>
        </div>
      ) : null}

      <div className="grid gap-6 [&>*]:min-w-0 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card>
          <SectionTitle>Mening ma’lumotlarim</SectionTitle>
          <ul className="divide-y divide-line">
            {SECTIONS.map((section) => (
              <li key={section.key}>
                <button type="button" onClick={() => openEditor(section.key)} className="flex w-full items-center gap-3 py-3.5 text-left">
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-fog">{section.title}</span>
                    <span className="block truncate text-sm font-medium">{summary[section.key]}</span>
                  </span>
                  <Icon name="edit" size={18} className="shrink-0 text-fog" />
                  <span className="sr-only">tahrirlash</span>
                </button>
              </li>
            ))}
          </ul>
          {safety.reasons.length > 0 ? (
            <div className="mt-4">
              <Notice tone={safety.consultSpecialist ? 'warn' : 'info'}>{safety.reasons.join(' ')}</Notice>
            </div>
          ) : null}
        </Card>

        <div className="space-y-6">
          <Card>
            <SectionTitle>Ko‘rinish</SectionTitle>
            <div className="space-y-5">
              <div>
                <div className="mb-2 text-sm font-semibold">Animatsiyalar</div>
                <Segmented
                  label="Animatsiyalar"
                  value={state.settings.motion}
                  onChange={(motion) => updateSettings({ motion })}
                  options={[
                    { value: 'system', label: 'Tizim' },
                    { value: 'reduce', label: 'Kamroq' },
                    { value: 'full', label: 'To‘liq' },
                  ]}
                />
                <p className="mt-1.5 text-xs text-fog">“Tizim” qurilmangizdagi “harakatni kamaytirish” sozlamasiga amal qiladi.</p>
              </div>
              <div>
                <div className="mb-2 text-sm font-semibold">Tana modeli</div>
                <Segmented
                  label="Tana modeli"
                  value={state.settings.prefer3D ? '3d' : '2d'}
                  onChange={(value) => updateSettings({ prefer3D: value === '3d' })}
                  options={[
                    { value: '3d', label: '3D model' },
                    { value: '2d', label: '2D sxema' },
                  ]}
                />
                <p className="mt-1.5 text-xs text-fog">Kuchsiz qurilmalarda 2D sxema tezroq ishlaydi.</p>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle>Maxfiylik va ma’lumotlar</SectionTitle>
            <p className="text-sm text-mist">
              Barcha ma’lumotlaringiz faqat shu brauzerda saqlanadi va hech qayerga yuborilmaydi. Istalgan vaqt yuklab olishingiz yoki o‘chirishingiz mumkin.
            </p>
            <div className="mt-4 grid gap-2">
              <Button variant="secondary" icon="download" onClick={exportData}>
                Ma’lumotlarni yuklab olish (JSON)
              </Button>
              <Button variant="secondary" icon="heart" onClick={() => setConfirm('health')}>
                Sog‘liq ma’lumotlarini o‘chirish
              </Button>
              <Button variant="danger" icon="trash" onClick={() => setConfirm('all')}>
                Barcha ma’lumotlarni o‘chirish
              </Button>
            </div>
          </Card>

          <p className="px-1 text-xs leading-relaxed text-fog">
            Solo Leveling tibbiy maslahat bermaydi. Daraja, ballar va mushak faolligi ko‘rsatkichlari motivatsiya uchun mo‘ljallangan taxminlardir. Salomatligingiz bo‘yicha savollar bo‘lsa, shifokorga murojaat qiling.
          </p>
        </div>
      </div>

      <Sheet open={editing !== null} onClose={() => setEditing(null)} title={SECTIONS.find((item) => item.key === editing)?.title ?? ''} wide>
        {editing ? (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              save()
            }}
          >
            {renderEditor(editing)}
            <div className="mt-6 flex gap-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Bekor qilish
              </Button>
              <Button type="submit" className="flex-1" disabled={!canSave}>
                Saqlash
              </Button>
            </div>
            <p className="mt-3 text-xs text-fog">Saqlangandan so‘ng reja yangi ma’lumotlarga moslab qayta tuziladi; erishgan pog‘onangiz saqlanib qoladi.</p>
          </form>
        ) : null}
      </Sheet>

      <Sheet open={confirm !== null} onClose={() => setConfirm(null)} title={confirm === 'all' ? 'Barcha ma’lumotlarni o‘chirasizmi?' : 'Sog‘liq ma’lumotlarini o‘chirasizmi?'}>
        <p className="text-sm text-mist">
          {confirm === 'all'
            ? 'Profil, reja, mashg‘ulotlar tarixi, ballar va yutuqlar butunlay o‘chiriladi. Bu amalni qaytarib bo‘lmaydi.'
            : 'Bo‘y, vazn, jarohat va cheklovlar, shuningdek mashg‘ulotlardagi noqulaylik qaydlari o‘chiriladi. Mashg‘ulotlar tarixi saqlanib qoladi. Cheklovlar o‘chirilgach, reja ularni hisobga olmaydi.'}
        </p>
        <div className="mt-5 grid gap-2">
          <Button
            variant="danger"
            icon="trash"
            onClick={() => {
              if (confirm === 'all') {
                resetAll()
                navigate('/welcome', { replace: true })
              } else {
                deleteHealthData()
                setSaved('Sog‘liq ma’lumotlari o‘chirildi.')
              }
              setConfirm(null)
            }}
          >
            Ha, o‘chirish
          </Button>
          <Button variant="secondary" onClick={() => setConfirm(null)}>
            Bekor qilish
          </Button>
        </div>
      </Sheet>
    </div>
  )
}
