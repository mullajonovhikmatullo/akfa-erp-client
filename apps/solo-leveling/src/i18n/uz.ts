import type { IconName } from '@/components/Icon.tsx'
import type { Equipment, Experience, FitnessLevel, Goal, Limitation, Sex, TrainingLocation, WorkoutIntensity } from '@/domain/types.ts'

export const SEX_LABELS: Record<Sex, string> = { male: 'Erkak', female: 'Ayol' }

export const LEVEL_LABELS: Record<FitnessLevel, { title: string; description: string }> = {
  beginner: { title: 'Boshlang‘ich', description: 'Muntazam mashq qilmayman yoki endi boshlayapman' },
  intermediate: { title: 'O‘rta', description: 'Haftasiga 2–3 marta faolman, asosiy mashqlarni bilaman' },
  advanced: { title: 'Yuqori', description: 'Ko‘p yillardan beri muntazam va og‘ir mashq qilaman' },
}

export const EXPERIENCE_LABELS: Record<Experience, string> = {
  none: 'Tajriba yo‘q',
  lt1: '1 yildan kam',
  '1to3': '1–3 yil',
  gt3: '3 yildan ko‘p',
}

export const GOAL_LABELS: Record<Goal, { title: string; description: string; icon: IconName }> = {
  strength: { title: 'Kuch', description: 'Ko‘proq ko‘tarish, kuchliroq bo‘lish', icon: 'bolt' },
  muscle: { title: 'Mushak rivoji', description: 'Atletik qomat va mushak hajmi', icon: 'dumbbell' },
  endurance: { title: 'Chidamlilik', description: 'Uzoqroq va charchamasdan harakat', icon: 'flame' },
  general: { title: 'Umumiy faollik', description: 'Sog‘lom, baquvvat va harakatchan bo‘lish', icon: 'heart' },
  weight: { title: 'Vazn bilan bog‘liq', description: 'Faollikni oshirib, vaznni boshqarish', icon: 'target' },
}

export const LOCATION_LABELS: Record<TrainingLocation, { title: string; description: string; icon: IconName }> = {
  home: { title: 'Uyda', description: 'O‘z vazni va mavjud jihozlar bilan', icon: 'home' },
  gym: { title: 'Sport zalida', description: 'Trenajyor, shtanga va gantellar bor', icon: 'dumbbell' },
}

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  dumbbells: 'Gantellar',
  pullupBar: 'Turnik',
  bands: 'Rezina tasmalar',
  bench: 'Skameyka',
  kettlebell: 'Girya',
  barbell: 'Shtanga',
  machines: 'Trenajyorlar',
}

export const LIMITATION_LABELS: Record<Limitation, string> = {
  knee: 'Tizza',
  back: 'Bel yoki umurtqa',
  shoulder: 'Yelka',
  wrist: 'Bilak yoki kaft',
  heart: 'Yurak-qon tomir kasalligi',
  pressure: 'Qon bosimi muammosi',
  pregnancy: 'Homiladorlik',
  recentSurgery: 'Yaqinda jarrohlik amaliyoti',
  other: 'Boshqa holat',
}

export const INTENSITY_LABELS: Record<WorkoutIntensity, { title: string; tone: 'ok' | 'volt' | 'blood' }> = {
  light: { title: 'Yengil', tone: 'ok' },
  moderate: { title: 'O‘rtacha', tone: 'volt' },
  hard: { title: 'Jadal', tone: 'blood' },
}

export const NAV_LABELS = {
  today: 'Bosh sahifa',
  workouts: 'Mashg‘ulotlar',
  progress: 'Rivojlanish',
  profile: 'Profil',
}

export const ESTIMATE_DISCLAIMER =
  'Taxminiy faoliyat ko‘rsatkichi: faqat siz qayd etgan mashg‘ulotlarga asoslanadi. Bu mushak hajmi, tibbiy o‘lchov yoki tiklanish darajasi emas.'

export const GAME_DISCLAIMER = 'Daraja va ballar — motivatsiya uchun. Ular sog‘liq yoki mushak rivojining tibbiy o‘lchovi emas.'
