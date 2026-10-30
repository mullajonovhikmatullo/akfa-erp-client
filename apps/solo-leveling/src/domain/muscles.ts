import type { MuscleId } from './types.ts'

export interface MuscleInfo {
  id: MuscleId
  name: string
  latin: string
  side: 'front' | 'back' | 'both'
  description: string
}

export const MUSCLES: Record<MuscleId, MuscleInfo> = {
  chest: {
    id: 'chest',
    name: 'Ko‘krak',
    latin: 'Pectoralis major',
    side: 'front',
    description: 'Itarish harakatlarida ishlaydi: qo‘llarni oldinga itarish va birlashtirish.',
  },
  shoulders: {
    id: 'shoulders',
    name: 'Yelka',
    latin: 'Deltoideus',
    side: 'both',
    description: 'Qo‘lni yuqoriga, oldinga va yon tomonga ko‘tarishda asosiy rol o‘ynaydi.',
  },
  biceps: {
    id: 'biceps',
    name: 'Biceps',
    latin: 'Biceps brachii',
    side: 'front',
    description: 'Tirsakni bukadi va tortish mashqlarida yordam beradi.',
  },
  triceps: {
    id: 'triceps',
    name: 'Triceps',
    latin: 'Triceps brachii',
    side: 'back',
    description: 'Tirsakni to‘g‘rilaydi, barcha itarish mashqlarida faol.',
  },
  forearms: {
    id: 'forearms',
    name: 'Bilak',
    latin: 'Antebrachium',
    side: 'both',
    description: 'Ushlash kuchi uchun javob beradi — tortish va ko‘tarishda muhim.',
  },
  abs: {
    id: 'abs',
    name: 'Qorin pressi',
    latin: 'Rectus abdominis',
    side: 'front',
    description: 'Tana markazini barqaror ushlab turadi va umurtqani himoya qiladi.',
  },
  obliques: {
    id: 'obliques',
    name: 'Yon qorin',
    latin: 'Obliquus',
    side: 'front',
    description: 'Tanani burish va yon tomonga egilishni nazorat qiladi.',
  },
  quads: {
    id: 'quads',
    name: 'Son old qismi',
    latin: 'Quadriceps',
    side: 'front',
    description: 'Tizzani to‘g‘rilaydi — o‘tirib-turish, yurish va sakrashda asosiy kuch.',
  },
  hamstrings: {
    id: 'hamstrings',
    name: 'Son orqa qismi',
    latin: 'Hamstrings',
    side: 'back',
    description: 'Tizzani bukadi va son-chanoq bo‘g‘imini yozishda ishtirok etadi.',
  },
  glutes: {
    id: 'glutes',
    name: 'Dumba',
    latin: 'Gluteus maximus',
    side: 'back',
    description: 'Tanadagi eng kuchli mushaklardan biri; chanoqni barqarorlashtiradi.',
  },
  calves: {
    id: 'calves',
    name: 'Boldir',
    latin: 'Gastrocnemius',
    side: 'back',
    description: 'Oyoq uchida ko‘tarilish, yugurish va sakrash uchun kerak.',
  },
  traps: {
    id: 'traps',
    name: 'Trapetsiya',
    latin: 'Trapezius',
    side: 'back',
    description: 'Yelka kamarini ko‘taradi va kuraklarni boshqaradi.',
  },
  upperBack: {
    id: 'upperBack',
    name: 'Kuraklar orasi',
    latin: 'Rhomboideus',
    side: 'back',
    description: 'Kuraklarni birlashtiradi — to‘g‘ri qaddi-qomat uchun muhim.',
  },
  lats: {
    id: 'lats',
    name: 'Keng orqa',
    latin: 'Latissimus dorsi',
    side: 'back',
    description: 'Qo‘llarni pastga va orqaga tortadi — V-shaklli orqa uchun asosiy mushak.',
  },
  lowerBack: {
    id: 'lowerBack',
    name: 'Bel',
    latin: 'Erector spinae',
    side: 'back',
    description: 'Umurtqani to‘g‘ri ushlab turadi va egilishdan qaytishda ishlaydi.',
  },
}

export const MUSCLE_IDS = Object.keys(MUSCLES) as MuscleId[]
