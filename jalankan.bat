@echo off
chcp 65001 >nul
echo === Lapor Sekolah ===
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js belum terpasang. Unduh versi LTS dari https://nodejs.org lalu jalankan file ini lagi.
  pause
  exit /b 1
)
if not exist .env copy .env.example .env >nul
if not exist node_modules (
  echo Memasang dependensi, tunggu sebentar...
  call npm install
)
echo Membuka aplikasi di http://localhost:5173
call npm run dev -- --open
pause
