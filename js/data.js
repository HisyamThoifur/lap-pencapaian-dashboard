// LAP PENCAPAIAN - Branch Bekasi - data per 05/10/2026
// Sumber: Google Sheets "LAP PENCAPAIAN" (spreadsheet kpi-rekap)
// fmt: "num" = angka skala persen; "pct" = fraksi, tampil sebagai persen (x100)
// skor indikator = bobot * real / target (max bobot), kecuali lower_better
const LAP = {
  meta: {
    title: "LAPORAN PENCAPAIAN KPI B2C HARIAN PER SA - BRANCH BEKASI",
    branch: "BRANCH BEKASI",
    h_date: "05/10/2026",
    h1_date: "04/10/2026",
    generated: "2026-10-05"
  },
  sa: ["BEKASI", "KRANJI", "KALIABANG", "PEKAYON", "PONDOK GEDE", "DEPOK", "SUKMAJAYA", "CINERE"],
  rekap: {
    "H-1": {
      tanggal: "04/10/2026",
      ach: [96.46, 99.44, 99.92, 99.91, 99.54, 98.74, 93.91, 98.91],
      rata: 98.35,
      terendah: { sa: "SUKMAJAYA", nilai: 93.91 },
      catatan: "Assurance Guaran:BKS,KRJ,PDG,DPK,CNR; Service Availabi:semua SA; TTR Comply 24 JA:DPK; TTR Comply 6H:BKS; Closed SQM:CNR"
    },
    "H": {
      tanggal: "05/10/2026",
      ach: [94.03, 96.42, 96.92, 96.91, 96.52, 96.01, 90.28, 95.68],
      rata: 95.35,
      terendah: { sa: "SUKMAJAYA", nilai: 90.28 },
      catatan: "Assurance Guaran:BKS,KRJ,PDG,DPK,CNR; Service Availabi:semua SA; TTR Comply 24 JA:DPK; TTR Comply 6H:BKS,SKM; Closed SQM:CNR; Rasio INUSE to I:semua SA"
    }
  },
  indicators: [
    { no: 1, name: "Assurance Guarantee", bobot: 10, target: 91.71, fmt: "num",
      H1: [87.07, 87.92, 92.35, 92.17, 88.57, 88.87, 94.535, 84.17],
      H:  [87.16, 87.78, 92.17, 92.24, 88.36, 88.79, 93.835, 83.93] },
    { no: 2, name: "Service Availability (All Teknis)", bobot: 8, target: 98.52, fmt: "num",
      H1: [97.46, 96.68, 97.57, 97.47, 97.08, 94.94, 97.375, 96.505],
      H:  [97.43, 96.71, 97.55, 97.47, 97.08, 94.86, 97.405, 96.515] },
    { no: 3, name: "TTR Comply 3H Manja", bobot: 10, target: 94.79, fmt: "num",
      H1: [100, 98.74, 99.23, 98.91, 98.8, 99.57, 99.23, 96.855],
      H:  [100, 98.74, 99.23, 98.91, 98.8, 99.57, 99.23, 96.855] },
    { no: 4, name: "TTR Comply 3H (D.V)", bobot: 10, target: 95.25, fmt: "num",
      H1: [100, 100, 100, 100, 100, 100, 100, 100],
      H:  [100, 100, 100, 100, 100, 100, 100, 100] },
    { no: 5, name: "TTR Comply 24 JAM NON HVC", bobot: 8, target: 99.04, fmt: "num",
      H1: [100, 100, 100, 100, 100, 90.91, 100, 100],
      H:  [100, 100, 100, 100, 100, 94.44, 100, 100] },
    { no: 6, name: "TTR Comply 6H (P)", bobot: 8, target: 95, fmt: "num",
      H1: [60, 100, 100, 100, 100, 100, 100, 100],
      H:  [66.67, 100, 100, 100, 100, 100, 87.5, 100] },
    { no: 7, name: "TTR Comply 12H (Gold)", bobot: 8, target: 83, fmt: "num",
      H1: [92.31, 93.24, 97.44, 97.75, 96.1, 99.39, 98.61, 97.915],
      H:  [93.65, 94.32, 98.46, 95.93, 93.94, 99.52, 98.925, 98] },
    { no: 8, name: "Validasi DC Qr Code & Service", bobot: 3, target: 0.95, fmt: "pct",
      H1: [0.9618, 0.9563, 0.964, 0.9596, 0.9561, 0.9543, 0.95485, 0.9535],
      H:  [0.9616, 0.9561, 0.9638, 0.9593, 0.9558, 0.954, 0.9546, 0.95315] },
    { no: 9, name: "VALINS Visit ODP", bobot: 3, target: 0.8409, fmt: "pct",
      H1: [0.995, 0.9846, 0.995, 0.9991, 0.8624, 0.9307, 0.9782, 0.98695],
      H:  [0.9953, 0.9863, 0.9947, 0.9991, 0.8624, 0.8849, 0.9776, 0.98655] },
    { no: 10, name: "TTR Comply SQM 4H", bobot: 3, target: 47, fmt: "num",
      H1: [100, 100, 100, 100, 100, 100, 100, 100],
      H:  [100, 100, 100, 100, 100, 100, 100, 100] },
    { no: 11, name: "Underspec Non Warranty", bobot: 6, target: 0.1, fmt: "pct", lower_better: true,
      note: "Data 0 = belum input WFM, bukan nol asli (cek input).",
      H1: [0.000235136042996305, 0.00040115240144414865, 0.00047567273715683607, 0.00008655385813822652, 0.00041021714160695727, 0.00026413921690490987, 0, 0.0005364022041254206],
      H:  [0.000235136042996305, 0.00040115240144414865, 0.00047567273715683607, 0.00008655385813822652, 0.00041021714160695727, 0.00026413921690490987, 0, 0.0005364022041254206] },
    { no: 12, name: "Closed SQM", bobot: 8, target: 65, fmt: "num",
      H1: [84.62, 76.6, 100, 82.98, 94.59, 73.91, 80.28, 64.165],
      H:  [83.33, 85.19, 97.92, 84.75, 88.89, 75, 87.02, 62.5] },
    { no: 13, name: "SCC-INET", bobot: 4, target: 70, fmt: "num",
      H1: [92.1, 91.15, 84.4, 94.23, 87.99, 90.46, 79.42, 75.005],
      H:  [92.1, 91.15, 84.4, 94.23, 87.99, 90.46, 79.42, 75.005] },
    { no: 14, name: "OutStanding Saldo Indihome", bobot: 4, target: 18, fmt: "num",
      H1: [18, 18, 18, 18, 18, 18, 18, 18],
      H:  [18, 18, 18, 18, 18, 18, 18, 18] },
    { no: 15, name: "Cek fungsi splicer", bobot: 2, target: 100, fmt: "num",
      H1: [100, 100, 100, 100, 100, 100, 100, 100],
      H:  [100, 100, 100, 100, 100, 100, 100, 100] },
    { no: 16, name: "Jumlah Arc Count (3.000 ARC Count Splicer)", bobot: 2, target: 100, fmt: "num",
      H1: [100, 100, 100, 100, 100, 100, 100, 100],
      H:  [100, 100, 100, 100, 100, 100, 100, 100] },
    { no: 17, name: "Rasio INUSE to INSTOCK - Dropcore Refurbish", bobot: 3, target: 65, fmt: "num",
      note: "Real 0 = data inuse belum input ke dashboard.",
      H1: [100, 100, 100, 100, 100, 100, 100, 100],
      H:  [0, 0, 0, 0, 0, 0, 0, 0] }
  ],
  trend: [
    { sa: "BEKASI", h1: 96.46, h: 94.03, gap: -2.43, arah: "TURUN" },
    { sa: "KRANJI", h1: 99.44, h: 96.42, gap: -3.01, arah: "TURUN" },
    { sa: "KALIABANG", h1: 99.92, h: 96.92, gap: -3.00, arah: "TURUN" },
    { sa: "PEKAYON", h1: 99.91, h: 96.91, gap: -3.00, arah: "TURUN" },
    { sa: "PONDOK GEDE", h1: 99.54, h: 96.52, gap: -3.02, arah: "TURUN" },
    { sa: "DEPOK", h1: 98.74, h: 96.01, gap: -2.73, arah: "TURUN" },
    { sa: "CINERE", h1: 98.91, h: 95.68, gap: -3.23, arah: "TURUN" },
    { sa: "SUKMAJAYA", h1: 93.91, h: 90.28, gap: -3.63, arah: "TURUN" },
    { sa: "BRANCH BEKASI", h1: 99.7, h: 99.7, gap: 0, arah: "STABIL", isBranch: true }
  ],
  analisa: [
    { sa: "SUKMAJAYA", gap: -3.63, pic: "ARFIRI (6281337875072)",
      penyebab: [
        { name: "Service Availability (All Teknis)", real: 97.41, target: 98.52, bobot: 8, skor: 7.90 },
        { name: "TTR Comply 6H (P)", real: 87.50, target: 95, bobot: 8, skor: 7.37 },
        { name: "Rasio INUSE to INSTOCK - Dropcore Refurbish", real: 0.00, target: 65, bobot: 3, skor: 0 }
      ],
      rekomendasi: [
        "Audit segment unspec aktif (akses/distribusi/feeder); eskalasi gangguan berulang ke tim INFRACARE/protector",
        "Percepat respons tiket HVC Platinum; siagakan teknisi standby di jam peak",
        "Optimalkan pemakaian dropcore in-stock; ajukan refurbish yang menganggur"
      ] },
    { sa: "CINERE", gap: -3.23, pic: "TEGUH (6281287146785)",
      penyebab: [
        { name: "Assurance Guarantee", real: 83.93, target: 91.71, bobot: 10, skor: 9.15 },
        { name: "Service Availability (All Teknis)", real: 96.52, target: 98.52, bobot: 8, skor: 7.84 },
        { name: "Closed SQM", real: 62.50, target: 65, bobot: 8, skor: 7.69 },
        { name: "Rasio INUSE to INSTOCK - Dropcore Refurbish", real: 0.00, target: 65, bobot: 3, skor: 0 }
      ],
      rekomendasi: [
        "Prioritaskan penanganan tiket Repeat & GTA \u22653x; push closure PSB/Gamas stale; cek reason code repeat order",
        "Audit segment unspec aktif (akses/distribusi/feeder); eskalasi gangguan berulang ke tim INFRACARE/protector",
        "Dorong closure SQM yang masih open; validasi kelengkapan berkas sebelum submit"
      ] },
    { sa: "PONDOK GEDE", gap: -3.02, pic: "HENDRI (6285210237698)",
      penyebab: [
        { name: "Assurance Guarantee", real: 88.36, target: 91.71, bobot: 10, skor: 9.63 },
        { name: "Service Availability (All Teknis)", real: 97.08, target: 98.52, bobot: 8, skor: 7.88 },
        { name: "Rasio INUSE to INSTOCK - Dropcore Refurbish", real: 0.00, target: 65, bobot: 3, skor: 0 }
      ],
      rekomendasi: [
        "Prioritaskan penanganan tiket Repeat & GTA \u22653x; push closure PSB/Gamas stale; cek reason code repeat order",
        "Audit segment unspec aktif (akses/distribusi/feeder); eskalasi gangguan berulang ke tim INFRACARE/protector",
        "Optimalkan pemakaian dropcore in-stock; ajukan refurbish yang menganggur"
      ] },
    { sa: "KRANJI", gap: -3.01, pic: "ROY TEMPO (6282298293464)",
      penyebab: [
        { name: "Assurance Guarantee", real: 87.78, target: 91.71, bobot: 10, skor: 9.57 },
        { name: "Service Availability (All Teknis)", real: 96.71, target: 98.52, bobot: 8, skor: 7.85 },
        { name: "Rasio INUSE to INSTOCK - Dropcore Refurbish", real: 0.00, target: 65, bobot: 3, skor: 0 }
      ],
      rekomendasi: [
        "Prioritaskan penanganan tiket Repeat & GTA \u22653x; push closure PSB/Gamas stale; cek reason code repeat order",
        "Audit segment unspec aktif (akses/distribusi/feeder); eskalasi gangguan berulang ke tim INFRACARE/protector",
        "Optimalkan pemakaian dropcore in-stock; ajukan refurbish yang menganggur"
      ] },
    { sa: "KALIABANG", gap: -3.00, pic: "M ALI (6281316207188)",
      penyebab: [
        { name: "Service Availability (All Teknis)", real: 97.55, target: 98.52, bobot: 8, skor: 7.92 },
        { name: "Rasio INUSE to INSTOCK - Dropcore Refurbish", real: 0.00, target: 65, bobot: 3, skor: 0 }
      ],
      rekomendasi: [
        "Audit segment unspec aktif (akses/distribusi/feeder); eskalasi gangguan berulang ke tim INFRACARE/protector",
        "Optimalkan pemakaian dropcore in-stock; ajukan refurbish yang menganggur"
      ] }
  ]
};
