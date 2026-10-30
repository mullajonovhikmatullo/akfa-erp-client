import { EXERCISES } from '@/domain/exercises.ts'
import { MUSCLES } from '@/domain/muscles.ts'
import { assessSafety, isExerciseAllowed } from '@/domain/planner.ts'
import { formatDate, muscleHistory } from '@/domain/progress.ts'
import type { MuscleId } from '@/domain/types.ts'
import { useAppStore } from '@/store/AppStore.tsx'
import { Badge, Sheet } from '../ui.tsx'

export const MuscleSheet = ({ muscle, onClose }: { muscle: MuscleId | null; onClose: () => void }) => {
  //
  const { state } = useAppStore()
  const info = muscle ? MUSCLES[muscle] : null
  const profile = state.profile
  const mode = state.plan?.safetyMode ?? (profile ? assessSafety(profile).mode : 'normal')
  const exercises = muscle
    ? EXERCISES.filter((item) => item.primary.includes(muscle) || item.secondary.includes(muscle))
        .filter((item) => !profile || isExerciseAllowed(item, profile, mode))
        .sort((a, b) => Number(b.primary.includes(muscle)) - Number(a.primary.includes(muscle)) || a.difficulty - b.difficulty)
        .slice(0, 8)
    : []
  const history = muscle ? muscleHistory(state.sessions, muscle).slice(0, 6) : []

  return (
    <Sheet open={Boolean(info)} onClose={onClose} title={info?.name ?? ''}>
      {info && muscle ? (
        <div className="space-y-5">
          <div>
            <div className="text-xs tracking-wider text-fog italic">{info.latin}</div>
            <p className="mt-1 text-sm text-mist">{info.description}</p>
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-widest text-fog uppercase">Sizga mos mashqlar</h3>
            {exercises.length === 0 ? (
              <p className="text-sm text-mist">Hozirgi jihoz va cheklovlaringizga mos mashq topilmadi.</p>
            ) : (
              <ul className="divide-y divide-line rounded-2xl border border-line">
                {exercises.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span>{item.name}</span>
                    <Badge tone={item.primary.includes(muscle) ? 'volt' : 'neutral'}>{item.primary.includes(muscle) ? 'Asosiy' : 'Yordamchi'}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold tracking-widest text-fog uppercase">Mashg‘ulot tarixi</h3>
            {history.length === 0 ? (
              <p className="text-sm text-mist">Bu mushak guruhi uchun hali qayd yo‘q. Birinchi mashg‘ulotdan keyin tarix shu yerda paydo bo‘ladi.</p>
            ) : (
              <ul className="space-y-2">
                {history.map(({ session, sets }) => (
                  <li key={session.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-4 py-2.5 text-sm">
                    <span>
                      {formatDate(session.finishedAt)} · <span className="text-mist">{session.title}</span>
                    </span>
                    <span className="font-semibold text-volt-3">{sets} set</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </Sheet>
  )
}
