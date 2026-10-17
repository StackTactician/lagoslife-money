# LagosLife Money — clone

Clone of lagoslife-money-website with new theme (teal / orange / dark slate, not lime/yellow).

**Account:** OPay **8123951223** — SUNSHINE OGBIGBE
**WhatsApp / Phone:** 08123951223

## Stack
- Frontend: Vite vanilla JS (no framework) — `src/`
- Backend: Express + Multer — `backend/server.js`
- Orders stored in `backend/orders.json`, receipts in `backend/uploads/`

## Run
```bash
npm install
npm run build
npm run server   # http://localhost:3001 (serves built frontend too)
# dev:
npm run dev      # vite on :5173 proxies /api to :3001
```

## Packages
Starter 25B ₦500 · Hustler 50B ₦1,000 · Big Boy 100B ₦2,000 · Odogwu 200B ₦4,000 · Custom ₦20/B (min 25B)

## Deploy
- Frontend: `dist/` is static — Netlify/Vercel/any static host.
- Backend: Node 20+, `PORT` env.
