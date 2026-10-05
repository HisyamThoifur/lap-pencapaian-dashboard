# LAP PENCAPAIAN KPI B2C — Dashboard Visual & Infografis

Dashboard web untuk laporan harian pencapaian KPI B2C per Service Area — **Branch Bekasi**.
Dibangun dari data Google Sheets "LAP PENCAPAIAN" (spreadsheet kpi-rekap), snapshot 05/10/2026.

## Fitur

- **Ringkasan** — KPI strip, achievement H vs H-1 per SA, gap, peta pencapaian berwarna
- **Detail Indikator** — 17 indikator × 8 SA: grafik bar, tabel (sel merah muda = belum capai target, sesuai laporan asli), heatmap status vs target, filter per SA dan per hari (H / H-1)
- **Trend & Analisa** — susut skor per SA, blok analisa penyebab turun + rekomendasi + PIC
- **Infografis** — hero statistik, arah KPI, indikator penyebab, kehilangan skor, fokus tindakan

## Aturan data (mengikuti laporan asli)

- Skor indikator = bobot × real / target (maks. bobot)
- Underspec Non Warranty = lower-better (real > target = gagal)
- Nilai 0 pada "Rasio INUSE to INSTOCK" dan "Underspec" = data belum input (bukan nol asli)
- Validasi DC & VALINS tersimpan sebagai fraksi, tampil sebagai persen

## Menjalankan lokal

```bash
node scripts/serve.js   # http://localhost:8477
```

## Struktur

```
index.html      — halaman utama (4 tab)
css/style.css   — styling (palet dari sheet asli: oranye C55A11, merah FFC7CE, hijau E2EFDA)
js/data.js      — data snapshot (semua angka disalin apa adanya dari sheet)
js/app.js       — logika render + Chart.js
scripts/serve.js — dev server lokal tanpa dependensi
```

## Deploy

Situs statis — tanpa build step. Deploy di Vercel.
