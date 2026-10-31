#!/usr/bin/env bash
echo "=== Lapor Sekolah ==="
command -v node >/dev/null 2>&1 || { echo "Node.js belum terpasang. Unduh versi LTS dari https://nodejs.org"; exit 1; }
[ -f .env ] || cp .env.example .env
[ -d node_modules ] || { echo "Memasang dependensi, tunggu sebentar..."; npm install; }
echo "Membuka aplikasi di http://localhost:5173"
npm run dev -- --open
