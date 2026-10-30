# Solo Leveling — shaxsiy fitnes ilovasi (MVP)

Mobil uchun birinchi navbatda ishlab chiqilgan, kompyuterda ham to‘liq ishlaydigan fitnes ilovasi. Interfeys tili — o‘zbekcha.

## Ishga tushirish

```bash
pnpm install
pnpm -F @store/solo-leveling dev      # http://127.0.0.1:5176
pnpm -F @store/solo-leveling test     # domen qoidalari testlari
pnpm -F @store/solo-leveling typecheck
pnpm -F @store/solo-leveling build
```

## Tuzilishi

- `src/domain/` — UI'dan mustaqil sof mantiq: mashqlar katalogi, mushaklar, reja tuzuvchi (`planner.ts`), moslashish qoidalari (`adaptation.ts`), XP/daraja/statistika (`progress.ts`) va testlar.
- `src/store/` — holat (React context) va `localStorage` bilan versiyalangan saqlash. Ma’lumotlar faqat qurilmada saqlanadi.
- `src/components/` — dizayn tizimi (`ui.tsx`, `styles.css` tokenlari), 3D model (`body/BodyModel3D.tsx`, three.js, kerak bo‘lganda yuklanadi), 2D sxema (`body/BodyMap2D.tsx`), texnika animatsiyasi.
- `src/pages/` — Onboarding, Bugun, Mashg‘ulot jarayoni, Mashg‘ulotlar, Rivojlanish, Profil.
- `src/i18n/uz.ts` — enum yorliqlari va umumiy matnlar.

## Kengaytirish

- Yangi mashq: `EXERCISES` ro‘yxatiga element qo‘shing (`pattern`, mushaklar, jihozlar, `avoidWith`, `easierId`). Reja tuzuvchi uni avtomatik hisobga oladi.
- Yangi til: `i18n/uz.ts` tuzilishidan nusxa oling; sahifalardagi matnlarni bosqichma-bosqich lug‘atga ko‘chirish mumkin.

## Xavfsizlik qoidalari

- 13 yoshdan kichiklarga reja tuzilmaydi; 16 yoshgacha va 65 yoshdan katta foydalanuvchilar, shuningdek tibbiy holatlarda reja yengil rejimda tuziladi va mutaxassis tavsiya etiladi.
- Jarohat joyiga yuk beruvchi mashqlar chiqarib tashlanadi.
- Og‘riq qayd etilsa, yuklama hech qachon oshirilmaydi.
- Mushak faolligi — taxminiy ko‘rsatkich; daraja va ballar tibbiy o‘lchov emas.
