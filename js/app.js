/* app.js - LAP PENCAPAIAN dashboard logic
   Semua angka dibaca dari data.js (snapshot sheet LAP PENCAPAIAN).
   Aturan "belum capai" = aturan laporan asli:
   - underspec: lower-better (real > target = gagal)
   - lainnya: real < target = gagal
   - real 0 pada indikator input-dependent (underspec, rasio inuse) = data belum input (abu)
*/

(() => {
  const SA = LAP.sa;
  const ABBR = { "BEKASI": "BKS", "KRANJI": "KRJ", "KALIABANG": "KLB", "PEKAYON": "PKY",
                 "PONDOK GEDE": "PDG", "DEPOK": "DPK", "SUKMAJAYA": "SKM", "CINERE": "CNR" };
  const INK = "#262626", SOFT = "#5b6169", FAINT = "#9aa0a6";
  const ACC = "#c55a11", RED = "#9c0006", GREEN = "#3d7a2c", BLUE = "#2f5597";
  const GRAY = "#a6a6a6";

  const fmt = (n, d = 2) => (n == null || isNaN(n)) ? "-" : Number(n).toFixed(d);
  const pctName = (ind) => ind.fmt === "pct";
  const displayVal = (ind, v) => pctName(ind) ? v * 100 : v;
  const displayTgt = (ind) => pctName(ind) ? ind.target * 100 : ind.target;
  const isZeroNA = (ind, v) => v === 0 && (ind.name.includes("Rasio INUSE") || ind.name.includes("Underspec"));

  // status: "ok" | "bad" | "na"
  function statusOf(ind, v) {
    if (isZeroNA(ind, v)) return "na";
    if (ind.lower_better) return v > ind.target ? "bad" : "ok";
    return v < ind.target ? "bad" : "ok";
  }

  // skor indikator per SA (untuk kartu "kehilangan skor" infografis)
  function skorOf(ind, v) {
    if (isZeroNA(ind, v)) return 0; // 0 = data belum input -> skor 0 di laporan H
    if (ind.lower_better) return ind.bobot; // semua di bawah target -> penuh
    return Math.min(ind.bobot, ind.bobot * v / ind.target);
  }

  const $$ = (s) => document.querySelector(s);

  // ---------- header ----------
  $$("h1").textContent = "LAP PENCAPAIAN KPI B2C";
  $("#hd").textContent = LAP.meta.h_date;
  $("#h1d").textContent = LAP.meta.h1_date;
  $("#gen").textContent = "Snapshot: " + LAP.meta.generated;
  // isi stat hero yang dinamis
  $("#infoRata").textContent = fmt(rk.rata);
  $("#infoDelta").textContent = (delta >= 0 ? "+" : "\u2212") + fmt(Math.abs(delta));
  $("#infoTurun").textContent = `${nTurun}/8`;
  $("#infoBest").textContent = SA[bestIdx].split(" ")[0];
  $("#infoWorst").textContent = SA[worstIdx].split(" ")[0];
  $("#infoMiss").textContent = String(missCells);

  // ---------- TABS ----------
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(t => t.addEventListener("click", () => {
    tabs.forEach(x => x.classList.toggle("active", x === t));
    document.querySelectorAll(".panel").forEach(p => p.classList.toggle("active", p.id === t.dataset.tab));
    window.dispatchEvent(new Event("resize")); // chart.js reflow saat panel tampil
  }));
  const showTab = (name) => document.querySelector(`.tab[data-tab="${name}"]`).click();

  // ---------- KPI STRIP ----------
  const rk = LAP.rekap["H"], rk1 = LAP.rekap["H-1"];
  const delta = rk.rata - rk1.rata;
  const bestIdx = rk.ach.indexOf(Math.max(...rk.ach));
  const worstIdx = rk.ach.indexOf(Math.min(...rk.ach));
  // indikator miss hari ini per laporan (H)
  let missCells = 0, missInds = new Set();
  LAP.indicators.forEach(ind => ind.H.forEach((v, i) => {
    const st = statusOf(ind, v);
    if (st === "bad" || st === "na") { missCells++; missInds.add(ind.name); }
  }));

  const kpis = [
    { lab: "Rata-rata H", num: fmt(rk.rata), sub: `vs H-1 ${fmt(rk1.rata)}`, cls: "acc" },
    { lab: "Perubahan", num: (delta >= 0 ? "+" : "\u2212") + fmt(Math.abs(delta)), sub: "H vs H-1 (poin)", cls: delta >= 0 ? "good" : "down" },
    { lab: "SA Tertinggi", num: SA[bestIdx].split(" ")[0], sub: fmt(rk.ach[bestIdx]) + " hari ini", cls: "good" },
    { lab: "SA Terendah", num: SA[worstIdx].split(" ")[0], sub: fmt(rk.ach[worstIdx]) + " \u2022 " + ABBR[SA[worstIdx]] + " jadi sorotan", cls: "down" },
    { lab: "Sel Belum Capai (H)", num: String(missCells), sub: `${missInds.size} indikator terlibat`, cls: "down" },
    { lab: "Arah KPI SA", num: "8\u25BC 0\u25B2", sub: "8 turun, 0 naik \u2022 branch stabil", cls: "warn" },
  ];
  $("#kpiStrip").innerHTML = kpis.map(k => `
    <div class="kpi"><div class="k-lab">${k.lab}</div>
    <div class="k-num ${k.cls}">${k.num}</div><div class="k-sub">${k.sub}</div></div>`).join("");

  // kartu KPI SA terendah -> lompat ke detail (jaga-jaga kalau .kpi belum ter-render)
  const kpiNodes = document.querySelectorAll(".kpi");
  if (kpiNodes[3]) {
    kpiNodes[3].classList.add("klick");
    kpiNodes[3].addEventListener("click", () => { selectSA(SA[worstIdx]); showTab("indicators"); });
  }

  // ---------- CHART DEFAULTS ----------
  Chart.defaults.font.family = "'Archivo', sans-serif";
  Chart.defaults.font.size = 11.5;
  Chart.defaults.color = SOFT;
  Chart.defaults.animation = { duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500 };

  const gridOpts = { color: "#ececec", drawTicks: false };

  // ---------- ACHIEVEMENT BAR ----------
  const achData = {
    labels: SA.map(s => s.length > 8 ? s.split(" ")[0] + "." : s),
    datasets: [
      { label: "H-1 (04/10)", data: rk1.ach, backgroundColor: "#d8dde3", borderRadius: 4, borderSkipped: false, maxBarThickness: 34 },
      { label: "H (05/10)", data: rk.ach, backgroundColor: ACC, borderRadius: 4, borderSkipped: false, maxBarThickness: 34 },
    ]
  };
  const achChart = new Chart($("#achChart"), {
    type: "bar",
    data: achData,
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", align: "end", labels: { boxWidth: 10, boxHeight: 10, useBorderRadius: true, borderRadius: 2 } },
        tooltip: { callbacks: {
          label: (c) => `${c.dataset.label}: ${fmt(c.parsed.y)}`,
          footer: (its) => { const i = its[0].dataIndex; return `Gap: ${fmt(rk.ach[i] - rk1.ach[i])}`; }
        }}
      },
      scales: {
        y: { min: 85, max: 101, grid: gridOpts, ticks: { callback: v => v + "%" } },
        x: { grid: { display: false } }
      },
      onClick: (e, els) => { if (els.length) { selectSA(SA[els[0].index]); showTab("indicators"); } }
    }
  });

  // ---------- GAP BAR (negatif) ----------
  const gaps = LAP.trend.filter(t => !t.isBranch);
  const gapChart = new Chart($("#gapChart"), {
    type: "bar",
    data: {
      labels: gaps.map(g => g.sa.length > 8 ? g.sa.split(" ")[0] + "." : g.sa),
      datasets: [{ data: gaps.map(g => g.gap), backgroundColor: c => c.raw < 0 ? "#e2621c" : GREEN, borderRadius: 4, borderSkipped: false, maxBarThickness: 26 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => `Gap: ${fmt(c.parsed.y)} poin` } }
      },
      scales: {
        y: { grid: gridOpts, title: { display: true, text: "GAP (poin)" }, ticks: { callback: v => v } },
        x: { grid: { display: false } }
      }
    }
  });

  // ---------- HEAT PETA SA (overview) ----------
  const heat = $("#heatGrid");
  heat.innerHTML = SA.map((s, i) => {
    const v = rk.ach[i], g = rk.ach[i] - rk1.ach[i];
    const lvl = v >= 96.5 ? "h-l1" : (v >= 95 ? "h-l2" : "h-l3");
    return `<div class="heat-cell ${lvl}">
      <div class="h-sa">${s}</div>
      <div class="h-val">${fmt(v)}</div>
      <div class="h-gap ${g < 0 ? "neg" : ""}">${g >= 0 ? "+" : "\u25BC"} ${fmt(Math.abs(g))} vs H-1</div>
    </div>`;
  }).join("");
  $("#catatanH").innerHTML = `<b>Catatan indikator perlu perhatian (H):</b> ${rk.catatan}`;

  // ---------- TAB 2: DETAIL INDIKATOR ----------
  let curDay = "H", curSA = "SEMUA", missOnly = false;

  // SA chips
  $("#saChips").innerHTML = ["SEMUA", ...SA].map(s =>
    `<span class="chip ${s === "SEMUA" ? "on" : ""}" data-sa="${s}">${s === "SEMUA" ? "Semua SA" : ABBR[s] || s}</span>`).join("");
  document.querySelectorAll(".chip").forEach(ch => ch.addEventListener("click", () => selectSA(ch.dataset.sa)));
  function selectSA(sa) {
    curSA = sa;
    document.querySelectorAll(".chip").forEach(ch => ch.classList.toggle("on", ch.dataset.sa === sa));
    renderIndChart();
  }

  $("#daySeg").querySelectorAll(".segbtn").forEach(b => b.addEventListener("click", () => {
    $("#daySeg").querySelectorAll(".segbtn").forEach(x => x.classList.toggle("active", x === b));
    curDay = b.dataset.day; renderIndChart(); renderTable(); renderHeatTable();
  }));
  $("#missOnly").addEventListener("change", (e) => { missOnly = e.target.checked; renderTable(); });

  // ---- grouped horizontal bar: indikator x SA ----
  const SA_COLORS = ["#c55a11", "#e2621c", "#2f5597", "#548235", "#7a5195", "#bc5090", "#3d7a2c", "#a33d00"];
  let indChart = null;
  function renderIndChart() {
    const day = curDay, data = LAP.indicators;
    const inds = data; // semua 17
    const short = (n) => n.replace(" (All Teknis)", "").replace("TTR Comply ", "TTR ").replace("Rasio INUSE to INSTOCK - ", "").replace("Jumlah Arc Count (3.000 ARC Count Splicer)", "Arc Count Splicer").replace("OutStanding Saldo Indihome", "Outstanding Saldo");
    const rows = curSA === "SEMUA"
      ? inds.map(ind => ({ ind, vals: ind[day].map((v, i) => ({ v, sa: SA[i] })) }))
      : (() => { const i = SA.indexOf(curSA); return inds.map(ind => ({ ind, vals: [{ v: ind[day][i], sa: curSA }] })); })();

    const datasets = curSA === "SEMUA"
      ? SA.map((s, si) => ({
          label: ABBR[s] || s, backgroundColor: SA_COLORS[si], borderRadius: 3, borderSkipped: false,
          data: rows.map(r => {
            const c = r.vals.find(x => x.sa === s);
            return pctName(r.ind) ? displayVal(r.ind, c.v) : c.v;
          })
        }))
      : [{
          label: curSA, backgroundColor: ACC, borderRadius: 3, borderSkipped: false,
          data: rows.map(r => displayVal(r.ind, r.vals[0].v))
        }];

    // target markers via custom plugin (garis target per indikator)
    const targetPlugin = {
      id: "targets",
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        meta.data.forEach((bar, i) => {
          const ind = rows[i].ind;
          const t = displayTgt(ind);
          const y = bar.y;
          const x = bar.x + (bar.width || 0) * (t / Math.max(...datasets.map(d => Math.max(...d.data)), t, 1));
          ctx.save();
          ctx.strokeStyle = RED; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
          ctx.beginPath(); ctx.moveTo(bar.x, y - bar.height / 2 - 4); ctx.lineTo(x, y - bar.height / 2 - 4);
          ctx.stroke();
          ctx.restore();
        });
      }
    };

    if (indChart) indChart.destroy();
    indChart = new Chart($("#indChart"), {
      type: "bar",
      data: { labels: rows.map(r => short(r.ind.name)), datasets },
      options: {
        indexAxis: "y", responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", align: "end", labels: { boxWidth: 10, boxHeight: 10 } },
          tooltip: { callbacks: {
            label: (c) => {
              const ind = rows[c.dataIndex].ind;
              return `${c.dataset.label}: ${fmt(c.parsed.x)}${pctName(ind) ? "%" : ""} (target ${fmt(displayTgt(ind))}${pctName(ind) ? "%" : ""})`;
            }
          }}
        },
        scales: {
          x: { grid: gridOpts, ticks: { callback: (v) => pctName(rows[0] && rows[0].ind) ? v + "%" : v } },
          y: { grid: { display: false }, ticks: { font: { size: 10.5 }, autoSkip: false } }
        }
      },
      plugins: [targetPlugin]
    });
    $("#indHint").textContent = curSA === "SEMUA"
      ? "Garis putus-putus merah = target. Semua 17 indikator tampil."
      : `SA terpilih: ${curSA}. Garis putus-putus merah = target.`;
  }

  // ---- tabel detail (persis sheet) ----
  function renderTable() {
    const day = curDay;
    let html = `<thead><tr><th class="tl">NO</th><th class="tl">INDIKATOR</th><th>BOBOT</th><th>TARGET</th>`;
    html += SA.map(s => `<th>${s}</th>`).join("");
    html += `</tr></thead><tbody>`;
    LAP.indicators.forEach(ind => {
      const hasMiss = ind[day].some(v => statusOf(ind, v) !== "ok");
      if (missOnly && !hasMiss) return;
      html += `<tr class="zebra"><td>${ind.no}</td><td class="name">${ind.name}${ind.note ? ` <span class="note">\u26A0</span>` : ""}</td>`;
      html += `<td class="bobot">${ind.bobot}</td>`;
      html += `<td class="target">${fmt(displayTgt(ind), pctName(ind) ? 2 : 2)}${pctName(ind) ? "%" : ""}</td>`;
      ind[day].forEach(v => {
        const st = statusOf(ind, v);
        const d = displayVal(ind, v);
        const cell = st === "ok" ? fmt(d) + (pctName(ind) ? "%" : "") : fmt(d) + (pctName(ind) ? "%" : "");
        html += `<td class="${st === "bad" ? "miss" : (st === "na" ? "zero" : "")}">${cell}</td>`;
      });
      html += `</tr>`;
    });
    const ach = LAP.rekap[day].ach;
    html += `<tr class="ach-row"><td></td><td class="name">ACHIEVEMENT</td><td>100</td><td></td>`;
    ach.forEach(a => html += `<td>${fmt(a)}</td>`);
    html += `</tr></tbody>`;
    $("#indTable").innerHTML = html;
    $("#indTitle").textContent = `Detail per indikator \u2014 ${day === "H" ? "hari H (" + LAP.meta.h_date + ")" : "H-1 (" + LAP.meta.h1_date + ")"}`;
  }

  // ---- heatmap status ----
  function renderHeatTable() {
    const day = curDay;
    let html = `<thead><tr><th class="tl">INDIKATOR</th><th>BOBOT</th><th class="tl">TARGET</th>`;
    html += SA.map(s => `<th>${ABBR[s] || s}</th>`).join("");
    html += `</tr></thead><tbody>`;
    LAP.indicators.forEach(ind => {
      html += `<tr class="zebra"><td class="name">${ind.name}</td><td class="bobot">${ind.bobot}</td>`;
      html += `<td class="target tl">${fmt(displayTgt(ind))}${pctName(ind) ? "%" : ""}${ind.lower_better ? " \u2264" : ""}</td>`;
      ind[day].forEach(v => {
        const st = statusOf(ind, v);
        const sym = st === "ok" ? "\u2713" : (st === "bad" ? "\u2717" : "?");
        const cls = st === "ok" ? "ok" : st;
        html += `<td class="heat-cell-td"><span class="hc ${cls}" title="${fmt(displayVal(ind, v))}${pctName(ind) ? "%" : ""} vs target ${fmt(displayTgt(ind))}${pctName(ind) ? "%" : ""}">${sym}</span></td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody>`;
    $("#heatTable").innerHTML = html;
  }

  // ---------- TAB 3: TREND ----------
  const trendData = LAP.trend.filter(t => !t.isBranch);
  new Chart($("#trendChart"), {
    type: "bar",
    data: {
      labels: trendData.map(t => t.sa.length > 8 ? t.sa.split(" ")[0] : t.sa).reverse(),
      datasets: [{
        data: trendData.map(t => t.gap).reverse(),
        backgroundColor: "#e2621c", borderRadius: 4, borderSkipped: false, maxBarThickness: 24
      }]
    },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => `${fmt(c.parsed.x)} poin` } }
      },
      scales: { x: { grid: gridOpts, title: { display: true, text: "Gap H vs H-1 (poin, 0 = stabil)" } }, y: { grid: { display: false } } }
    }
  });

  new Chart($("#distChart"), {
    type: "bar",
    data: {
      labels: SA.map(s => s.length > 8 ? s.split(" ")[0] : s),
      datasets: [
        { label: "H-1", data: rk1.ach, backgroundColor: "#d8dde3", borderRadius: 3, borderSkipped: false },
        { label: "H", data: rk.ach, backgroundColor: ACC, borderRadius: 3, borderSkipped: false },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: "top", align: "end", labels: { boxWidth: 10 } },
        annotation: undefined },
      scales: { y: { min: 88, max: 101, grid: gridOpts, ticks: { callback: v => v + "%" } }, x: { grid: { display: false } } }
    }
  });

  // analisa cards
  $("#analisaList").innerHTML = LAP.analisa.map(a => `
    <div class="sa-block">
      <div class="sa-block-head">
        <span class="sb-sa">${a.sa}</span>
        <span class="sb-gap">\u25BC ${fmt(Math.abs(a.gap))} poin</span>
        <span class="sb-pic">PIC: ${a.pic}</span>
      </div>
      <div class="sa-block-body">
        ${a.penyebab.map(p => `
          <div class="cause-row">
            <span class="cr-name">${p.name}</span>
            <span class="cr-real">real ${fmt(p.real)} / target ${fmt(p.target)}</span>
            <span class="cr-tgt">bobot ${p.bobot} \u2192 skor ${fmt(p.skor)}</span>
          </div>`).join("")}
        <div class="reko-lab">Rekomendasi</div>
        <ul class="reko">${a.rekomendasi.map(r => `<li>${r}</li>`).join("")}</ul>
      </div>
    </div>`).join("");

  // ---------- TAB 4: INFOGRAFIS ----------
  // arah donut
  const nTurun = LAP.trend.filter(t => !t.isBranch && t.gap < 0).length;
  const nNaik = LAP.trend.filter(t => !t.isBranch && t.gap > 0).length;
  const nStabil = LAP.trend.filter(t => !t.isBranch && t.gap === 0).length;
  new Chart($("#arahChart"), {
    type: "doughnut",
    data: {
      labels: ["Turun \u25BC", "Naik \u25B2", "Stabil \u25AC"],
      datasets: [{ data: [nTurun, nNaik, nStabil], backgroundColor: ["#e2621c", "#548235", "#a6a6a6"], borderWidth: 2, borderColor: "#fff" }]
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: "62%",
      plugins: { legend: { display: false } } }
  });
  $("#arahLegend").innerHTML = `
    <li><span class="dot" style="background:#e2621c"></span> Turun <b>${nTurun} SA</b></li>
    <li><span class="dot" style="background:#548235"></span> Naik <b>${nNaik} SA</b></li>
    <li><span class="dot" style="background:#a6a6a6"></span> Stabil <b>${nStabil} SA</b></li>
    <li style="margin-top:6px;color:var(--ink-faint)">Branch Bekasi: <b>99.7 \u2192 99.7</b> (stabil)</li>`;

  // indikator penyebab (frekuensi muncul di analisa / miss)
  const causeCount = {};
  LAP.indicators.forEach(ind => {
    const n = ind.H.filter(v => statusOf(ind, v) !== "ok").length;
    if (n > 0) causeCount[ind.name] = n;
  });
  const causeEntries = Object.entries(causeCount).sort((a, b) => b[1] - a[1]);
  new Chart($("#causeChart"), {
    type: "bar",
    data: {
      labels: causeEntries.map(([n]) => n.replace(" (All Teknis)", "").replace("Rasio INUSE to INSTOCK - ", "").replace("TTR Comply ", "TTR ")),
      datasets: [{ data: causeEntries.map(([, c]) => c), backgroundColor: "#c55a11", borderRadius: 3, borderSkipped: false }]
    },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.parsed.x} dari 8 SA` } } },
      scales: { x: { grid: gridOpts, max: 8, ticks: { stepSize: 2 } }, y: { grid: { display: false }, ticks: { font: { size: 10.5 } } } }
    }
  });

  // kehilangan skor branch per indikator (H)
  const loss = LAP.indicators.map(ind => {
    const totalLoss = ind.H.reduce((s, v, i) => {
      const ideal = ind.bobot;
      const actual = skorOf(ind, v);
      return s + (ideal - actual);
    }, 0);
    return { name: ind.name, loss: totalLoss, bobot: ind.bobot, na: ind.H.every(v => isZeroNA(ind, v)) };
  }).sort((a, b) => b.loss - a.loss).filter(x => x.loss > 0.01).slice(0, 6);
  $("#causeBars").innerHTML = loss.map(l => {
    const max = loss[0].loss;
    return `<div class="cbar">
      <div class="cb-top"><b>${l.name.replace(" (All Teknis)", "").replace("Rasio INUSE to INSTOCK - ", "")}${l.na ? " \u26A0" : ""}</b>
      <span>\u2212${fmt(l.loss)} poin (dari ${fmt(l.bobot * 8)})</span></div>
      <div class="cb-track"><div class="cb-fill" style="width:${(l.loss / max * 100).toFixed(1)}%"></div></div>
    </div>`;
  }).join("");

  // fokus tindakan per SA
  $("#focusList").innerHTML = LAP.analisa.map(a => `
    <div class="focus-row">
      <div class="focus-sa">${a.sa}</div>
      <div class="focus-txt">${a.rekomendasi[0]}</div>
    </div>`).join("");

  // ---------- init ----------
  renderIndChart();
  renderTable();
  renderHeatTable();

  // helper selector $
  function $(s) { return document.querySelector(s); }
})();
