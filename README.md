# Next.js Google Auth — Premium Dark UI

ระบบ Login ToDoDashboard ด้วย Google และ Microsoft On Next.js App Router 

---

## 📁 Structure Project 

```
project-name/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts        ← NextAuth handler
│   ├── globals.css                 ← Global styles + fonts
│   ├── layout.tsx                  ← Root layout
│   ├── page.tsx                    ← Main page (Server Component)
│   └── providers.tsx               ← SessionProvider wrapper
├── components/
│   └── AuthCard.tsx                ← Client Component Main
│   └── TodoDashBoard.tsx           ← Client Component ToDo Add
├── .env.local                      ← Environment variables
├── next.config.ts                  ← Next.js config (image domains)
└── tailwind.config.ts              ← Tailwind config + custom fonts
```

---

## Install

```bash

npx create-next-app@latest my-app --typescript --tailwind --app --src-dir=false --import-alias="@/*"
cd my-app

# Install packages ที่จำเป็น
npm install next-auth framer-motion react-icons
```


---

##  Environment Variables

1. `.env.local`
2. กรอกค่าจาก Google Cloud Console , Microsoft Azure

```env
GOOGLE_CLIENT_ID=xxx.com
GOOGLE_CLIENT_SECRET=xxxx
MICROSOFT_CLIENT_ID=xxxxx 
MICROSOFT_CLIENT_SECRET=xxxxx  
MICROSOFT_TENANT_ID=xxxxx 

```

---

## 🔧 Setting Google OAuth
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project ใหม่ หรือเลือก Project ที่มีอยู่
3. ไปที่ **APIs & Services → Credentials**
4. กด **Create Credentials → OAuth 2.0 Client ID**
5. เลือก Application type: **Web application**
6. เพิ่ม Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   ```
7. Copy `Client ID` และ `Client Secret` ใส่ `.env.local`

---

## 🎨 Design Decisions

| Element | Choice |
|---|---|
| Font Display | Syne (bold, geometric) |
| Font Body | DM Sans (clean, modern) |
| Theme | Deep Dark `#070708` |
| Accent | Violet `#a78bfa` |
| Animations | Framer Motion + staggered fadeUp |
| Glass Effect | `backdrop-filter: blur(20px)` |
| Background | Ambient gradient orbs + noise texture |

---

## Dev Server

```bash
npm run dev
```
[http://localhost:3000](http://localhost:3000)

---

## 📝 Notes

- `app/page.tsx` เป็น **Server Component** — ดึง session ด้วย `getServerSession`
- `components/AuthCard.tsx` เป็น **Client Component** — จัดการ animation + signIn/signOut
- `app/providers.tsx` ห่อ `SessionProvider` สำหรับ client-side session
- รูปโปรไฟล์ Google โหลดจาก `lh3.googleusercontent.com` — ตั้งค่า remote patterns ใน `next.config.ts` แล้ว
-  Resource 
-(https://cloud.google.com/free?utm_source=google&utm_medium=cpc&utm_campaign=Cloud-SS-DR-GCP-1713664-GCP-DR-APAC-TH-th-Google-BKWS-MIX-GenericCloud&utm_content=c-Hybrid+%7C+BKWS+-+EXA+%7C+Txt+-+Generic+Cloud-Cloud+Generic-Core+GCP-TH_en-6458750523&utm_term=google%20cloud&gclsrc=aw.ds&gad_source=1&gad_campaignid=12372110337&gclid=CjwKCAjwn4vQBhBsEiwAq3hhN66Tt4GODfHRqppGua5Qi2FyVYVykHFiZXHiTeFoc4FEXmhO2rrT5BoCTYwQAvD_BwE)[Google Cloud] for Login Google 
- (https://azure.microsoft.com/en-us)[Microsoft Azure For Login Microsoft]