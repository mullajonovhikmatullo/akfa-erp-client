import { useId, useState } from 'react'
import type { Discomfort, SessionFeedback } from '@/domain/types.ts'
import { Icon } from '@/components/Icon.tsx'
import { Button, ChoiceCard, IconButton, Notice, cx } from '@/components/ui.tsx'

const Scale = ({ label, hint, value, onChange, low, high }: { label: string; hint: string; value: number; onChange: (value: number) => void; low: string; high: string }) => (
  <fieldset>
    <legend className="text-sm font-semibold">{label}</legend>
    <p className="text-xs text-fog">{hint}</p>
    <div className="mt-3 grid grid-cols-5 gap-2" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          aria-label={`${option} / 5`}
          onClick={() => onChange(option)}
          className={cx(
            'min-h-12 rounded-2xl border font-display text-lg font-bold transition active:scale-95',
            value === option ? 'border-volt bg-volt text-white shadow-glow' : 'border-line text-mist hover:border-white/25',
          )}
        >
          {option}
        </button>
      ))}
    </div>
    <div className="mt-1.5 flex justify-between text-[11px] text-fog">
      <span>{low}</span>
      <span>{high}</span>
    </div>
  </fieldset>
)

export const FeedbackForm = ({
  doneSets,
  totalSets,
  elapsed,
  onBack,
  onSubmit,
}: {
  doneSets: number
  totalSets: number
  elapsed: number
  onBack: () => void
  onSubmit: (feedback: SessionFeedback) => void
}) => {
  //
  const noteId = useId()
  const [difficulty, setDifficulty] = useState(3)
  const [fatigue, setFatigue] = useState(3)
  const [discomfort, setDiscomfort] = useState<Discomfort>('none')
  const [note, setNote] = useState('')

  const options: Array<{ value: Discomfort; title: string; description: string }> = [
    { value: 'none', title: 'Hammasi yaxshi', description: 'Noqulaylik sezmadim' },
    { value: 'mild', title: 'Yengil noqulaylik', description: 'Biroz taranglik yoki bezovtalik' },
    { value: 'pain', title: 'Og‘riq', description: 'Bo‘g‘im yoki mushakda og‘riq sezdim' },
  ]

  return (
    <div className="mx-auto min-h-dvh w-full max-w-xl px-4 pt-4 pb-10 sm:px-6">
      <header className="flex items-center gap-2">
        <IconButton icon="chevronLeft" label="Mashqlarga qaytish" onClick={onBack} />
        <h1 className="font-display text-xl font-bold">Holatingizni qayd eting</h1>
      </header>
      <p className="mt-2 text-sm text-mist">
        {doneSets}/{totalSets} set · {Math.max(1, Math.round(elapsed / 60))} daqiqa. Bu javoblar keyingi mashg‘ulotlarni moslash uchun ishlatiladi.
      </p>

      <form
        className="mt-6 space-y-7 animate-rise"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit({ difficulty, fatigue, discomfort, note: note.trim() })
        }}
      >
        <Scale label="Qiyinlik" hint="Mashg‘ulot qanchalik og‘ir bo‘ldi?" value={difficulty} onChange={setDifficulty} low="Juda oson" high="Juda og‘ir" />
        <Scale label="Charchoq" hint="Hozir o‘zingizni qanchalik charchagan his qilyapsiz?" value={fatigue} onChange={setFatigue} low="Tetik" high="Holdan toydim" />
        <fieldset>
          <legend className="text-sm font-semibold">Noqulaylik</legend>
          <div className="mt-3 space-y-2" role="radiogroup" aria-label="Noqulaylik">
            {options.map((option) => (
              <ChoiceCard
                key={option.value}
                selected={discomfort === option.value}
                onSelect={() => setDiscomfort(option.value)}
                title={option.title}
                description={option.description}
              />
            ))}
          </div>
        </fieldset>
        {discomfort === 'pain' ? (
          <Notice tone="danger" title="Ehtiyot bo‘ling">
            Og‘riq bilan mashq qilishni davom ettirmang. Keyingi mashg‘ulotlar yengillashtiriladi. Og‘riq kuchli, keskin bo‘lsa yoki o‘tib ketmasa, shifokorga murojaat qiling.
          </Notice>
        ) : null}
        <div>
          <label htmlFor={noteId} className="text-sm font-semibold">
            Izoh <span className="font-normal text-fog">(ixtiyoriy)</span>
          </label>
          <textarea
            id={noteId}
            rows={3}
            maxLength={300}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={discomfort === 'none' ? 'Masalan: otjimaniyada yangi rekord!' : 'Qayerda va qachon sezdingiz?'}
            className="mt-2 w-full rounded-2xl border border-line bg-white/[0.03] p-4 text-sm outline-none placeholder:text-fog focus:border-volt/70"
          />
        </div>
        <Button type="submit" size="lg" className="w-full">
          <Icon name="bolt" /> Saqlash va natijani ko‘rish
        </Button>
      </form>
    </div>
  )
}
