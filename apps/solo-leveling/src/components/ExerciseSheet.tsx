import { getExercise } from '@/domain/exercises.ts'
import { MUSCLES } from '@/domain/muscles.ts'
import { assessSafety, easierFor } from '@/domain/planner.ts'
import type { Prescription } from '@/domain/types.ts'
import { EQUIPMENT_LABELS } from '@/i18n/uz.ts'
import { useAppStore } from '@/store/AppStore.tsx'
import { ExerciseDemo } from './ExerciseDemo.tsx'
import { Badge, Sheet } from './ui.tsx'
import { formatDose } from './format.ts'

export const ExerciseSheet = ({ exerciseId, prescription, onClose }: { exerciseId: string | null; prescription?: Prescription; onClose: () => void }) => {
  //
  const { state } = useAppStore()
  const exercise = exerciseId ? getExercise(exerciseId) : undefined
  const profile = state.profile
  const easier = exercise && profile ? easierFor(exercise.id, profile, state.plan?.safetyMode ?? assessSafety(profile).mode) : undefined

  return (
    <Sheet open={Boolean(exercise)} onClose={onClose} title={exercise?.name ?? ''} wide>
      {exercise ? (
        <div className="space-y-4">
          <ExerciseDemo kind={exercise.demo} label={exercise.name} className="h-52" />
          <p className="text-sm text-mist">{exercise.description}</p>
          <div className="flex flex-wrap gap-2">
            {prescription ? <Badge tone="volt">{formatDose(prescription)}</Badge> : null}
            {prescription ? <Badge>Dam: {prescription.restSec} s</Badge> : null}
            <Badge>{exercise.equipment.length === 0 ? 'Jihozsiz' : exercise.equipment.map((item) => EQUIPMENT_LABELS[item]).join(', ')}</Badge>
            <Badge>{['', 'Oson', 'O‘rta', 'Murakkab'][exercise.difficulty]}</Badge>
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-widest text-fog uppercase">Ishlaydigan mushaklar</h3>
            <div className="flex flex-wrap gap-2">
              {exercise.primary.map((id) => (
                <Badge key={id} tone="volt">● {MUSCLES[id].name}</Badge>
              ))}
              {exercise.secondary.map((id) => (
                <Badge key={id}>○ {MUSCLES[id].name}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-widest text-fog uppercase">Texnika</h3>
            <ol className="space-y-2">
              {exercise.technique.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-volt/15 text-xs font-bold text-volt-3">{index + 1}</span>
                  <span className="pt-0.5 text-bone/90">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          {easier ? (
            <div className="rounded-2xl border border-line bg-white/[0.02] p-4 text-sm">
              <div className="text-xs text-fog">Osonroq muqobil</div>
              <div className="mt-1 font-semibold">{easier.name}</div>
              <div className="text-mist">{easier.description}</div>
            </div>
          ) : null}
          <p className="text-xs text-fog">Og‘riq yoki keskin noqulaylik sezsangiz, mashqni darhol to‘xtating.</p>
        </div>
      ) : null}
    </Sheet>
  )
}
