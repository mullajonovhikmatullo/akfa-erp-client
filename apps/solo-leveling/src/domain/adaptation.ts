import { MAX_PHASE, rebuildPlan } from './planner.ts'
import type { Plan, PlanAdjustment, Profile, SessionLog } from './types.ts'

export const completionRatio = (session: SessionLog): number => {
  //
  const planned = session.exercises.reduce((total, item) => total + item.sets.length, 0)
  const done = session.exercises.reduce((total, item) => total + item.sets.filter((set) => set.done).length, 0)
  return planned === 0 ? 0 : done / planned
}

export interface AdaptationResult {
  plan: Plan
  adjustment: PlanAdjustment
}

const DAY_MS = 24 * 60 * 60 * 1000

export const adaptAfterSession = (plan: Plan, profile: Profile, sessions: SessionLog[], now = new Date()): AdaptationResult => {
  //
  const ordered = [...sessions].sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))
  const [last, previous] = ordered
  const advanced: Plan = { ...plan, cursor: (plan.cursor + 1) % Math.max(1, plan.workouts.length) }
  const date = now.toISOString()

  if (!last) {
    const adjustment: PlanAdjustment = { date, kind: 'hold', message: 'Reja o‘zgarishsiz qoldi.' }
    return { plan: advanced, adjustment }
  }

  if (last.feedback.discomfort === 'pain') {
    const phase = Math.max(0, plan.phase - 1)
    const adjustment: PlanAdjustment = {
      date,
      kind: 'safety',
      message:
        'Og‘riq qayd etildi. Yuklama oshirilmaydi: keyingi mashg‘ulotlar yengil rejimga o‘tkazildi. Og‘riq takrorlansa yoki kuchaysa, shifokor yoki fizioterapevt bilan maslahatlashing.',
    }
    return { plan: rebuildPlan(advanced, profile, phase, adjustment, true), adjustment }
  }

  const gap = previous ? new Date(last.startedAt).getTime() - new Date(previous.finishedAt).getTime() : 0
  if (previous && gap > 14 * DAY_MS) {
    const phase = Math.max(0, plan.phase - 1)
    const adjustment: PlanAdjustment = {
      date,
      kind: 'return',
      message: 'Qaytganingiz bilan! Tanaffusdan keyin yuklama bir pog‘ona yengillashtirildi — bu tabiiy jarayon.',
    }
    return { plan: rebuildPlan(advanced, profile, phase, adjustment), adjustment }
  }

  if (last.feedback.discomfort === 'mild') {
    const adjustment: PlanAdjustment = {
      date,
      kind: 'hold',
      message: 'Yengil noqulaylik qayd etildi, shuning uchun yuklama shu darajada qoldirildi. Texnikaga e’tibor bering.',
    }
    return { plan: rebuildPlan(advanced, profile, plan.phase, adjustment, plan.safetyMode === 'gentle'), adjustment }
  }

  const ratio = completionRatio(last)
  if (last.feedback.difficulty >= 5 || last.feedback.fatigue >= 5 || ratio < 0.6) {
    const phase = Math.max(0, plan.phase - 1)
    const reason = ratio < 0.6 ? 'setlarning ko‘p qismi bajarilmadi' : 'mashg‘ulot juda og‘ir deb belgilandi'
    const adjustment: PlanAdjustment = {
      date,
      kind: phase < plan.phase ? 'decrease' : 'hold',
      message: `Oxirgi mashg‘ulotda ${reason}. Yuklama biroz kamaytirildi — barqarorlik tezlikdan muhimroq.`,
    }
    return { plan: rebuildPlan(advanced, profile, phase, adjustment, plan.safetyMode === 'gentle'), adjustment }
  }

  const easyStreak = [last, previous].every(
    (item) => item && item.feedback.discomfort === 'none' && item.feedback.difficulty <= 3 && item.feedback.fatigue <= 3 && completionRatio(item) >= 0.9,
  )
  const safetyLocked = plan.safetyMode === 'gentle'
  if (easyStreak && !safetyLocked && plan.phase < MAX_PHASE) {
    const adjustment: PlanAdjustment = {
      date,
      kind: 'increase',
      message: 'Ketma-ket ikki mashg‘ulot to‘liq va qulay bajarildi. Takrorlashlar biroz oshirildi — keyingi pog‘onaga!',
    }
    return { plan: rebuildPlan(advanced, profile, plan.phase + 1, adjustment), adjustment }
  }

  const adjustment: PlanAdjustment = {
    date,
    kind: 'hold',
    message: safetyLocked
      ? 'Ehtiyotkor rejimda yuklama avtomatik oshirilmaydi. Mutaxassis ruxsat bersa, profilda cheklovlarni yangilang.'
      : 'Yaxshi ish! Yuklama hozircha shu darajada qoladi; ikki mashg‘ulot qulay o‘tsa, oshiriladi.',
  }
  return { plan: { ...advanced, adjustments: [adjustment, ...plan.adjustments].slice(0, 30) }, adjustment }
}

export const ADAPTATION_RULES: string[] = [
  'Ketma-ket ikki mashg‘ulot to‘liq bajarilsa va qiyinlik, charchoq 3/5 dan oshmasa — takrorlashlar yoki vaqt biroz oshiriladi.',
  'Mashg‘ulot juda og‘ir (5/5) deb belgilansa yoki setlarning 60% dan kami bajarilsa — yuklama bir pog‘ona kamayadi.',
  'Yengil noqulaylik qayd etilsa — yuklama o‘zgarmaydi.',
  'Og‘riq qayd etilsa — yuklama kamayadi, reja yengil rejimga o‘tadi va mutaxassisga murojaat tavsiya etiladi.',
  '14 kundan ortiq tanaffusdan keyin — yuklama bir pog‘ona yengillashadi. Hech qanday jarima yo‘q.',
  'Salomatlik bilan bog‘liq cheklovlar bo‘lsa — yuklama avtomatik oshirilmaydi.',
]
