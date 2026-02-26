console.log("[mantra] app.js carregado");

const $ = (s) => document.querySelector(s);

function todayISO(){
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function toBR(iso){
  if (!iso) return "--/--";
  const [y,m,d] = iso.split("-");
  return `${d}/${m}`;
}

function parseBR(v){
  if (v == null) return null;
  const s = String(v)
    .trim()
    .replace(/\s/g,"")
    .replace("%","")
    .replace(/\./g,"")
    .replace(",",".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}
function fmtBR(n, dec=2){
  if (n == null || Number.isNaN(n)) return "--";
  return Number(n).toFixed(dec).replace(".", ",");
}
function fmtPct(n, dec=2){
  if (n == null || Number.isNaN(n)) return "--%";
  return `${fmtBR(n, dec)}%`.replace(",00%","%");
}
function fmtPct0(n){ return fmtPct(n, 0); }
function fmtDeltaPct(n){
  if (n == null || Number.isNaN(n)) return "--%";
  const isInt = Math.abs(n - Math.round(n)) < 1e-9;
  return isInt ? `${Math.round(n)}%` : fmtPct(n, 2);
}

function deltaText(atual, prev){
  if (atual == null || prev == null) return "";
  const diff = atual - prev;
  const abs = Math.abs(diff);
  if (abs < 1e-9) return " estável";
  if (diff > 0) return ` evolução de ${fmtDeltaPct(abs)}`;
  return ` piora de ${fmtDeltaPct(abs)}`;
}
function deltaHtml(atual, prev){
  if (atual == null || prev == null) return "";
  const diff = atual - prev;
  const abs = Math.abs(diff);
  if (abs < 1e-9) return ` <span class="t">estável</span>`;
  if (diff > 0) return ` <span class="g">evolução de ${fmtDeltaPct(abs)}</span>`;
  return ` <span class="r">piora de ${fmtDeltaPct(abs)}</span>`;
}

function headerLabels(){
  const diaAtual = $("#diaAtual")?.value || todayISO();
  const labelAnterior = ($("#labelDiaAnterior")?.value || "").trim();
  const diaAtualBR = toBR(diaAtual);
  const diaAnteriorLabel = labelAnterior ? `dia ${labelAnterior}` : "dia anterior";
  return { diaAtualBR, diaAnteriorLabel };
}

/* =========================
   MODE SWITCH
========================= */
function updateMode(){
  const sp = $("#subprocesso")?.value;
  if (!sp) return;

  const formPicking = $("#formPicking");
  const formMono = $("#formMono");
  const formPTW = $("#formPTW");

  if (!formPicking || !formMono || !formPTW){
    console.error("[mantra] Forms não encontrados. Verifique IDs: formPicking/formMono/formPTW");
    return;
  }

  formPicking.hidden = sp !== "picking";
  formMono.hidden = sp !== "mono";
  formPTW.hidden = sp !== "ptw";
}

$("#subprocesso")?.addEventListener("change", updateMode);

/* =========================
   READERS
========================= */
function readPicking(){
  return {
    metaLiq: parseBR($("#p_metaLiq").value), realLiq: parseBR($("#p_realLiq").value),
    metaEf: parseBR($("#p_metaEf").value), realEf: parseBR($("#p_realEf").value),
    metaUtil: parseBR($("#p_metaUtil").value), realUtil: parseBR($("#p_realUtil").value),
    indPlan: parseBR($("#p_indPlan").value), indReal: parseBR($("#p_indReal").value),

    vet: {
      gt: { a: parseBR($("#p_v_gt").value), p: parseBR($("#p_v_gt_prev").value), qtd: $("#p_v_gt_q").value.trim() },
      b80:{ a: parseBR($("#p_v_80").value), p: parseBR($("#p_v_80_prev").value), qtd: $("#p_v_80_q").value.trim() },
      b50:{ a: parseBR($("#p_v_50").value), p: parseBR($("#p_v_50_prev").value), qtd: $("#p_v_50_q").value.trim() },
      lt: { a: parseBR($("#p_v_lt").value), p: parseBR($("#p_v_lt_prev").value), qtd: $("#p_v_lt_q").value.trim() },
    },
    nov: {
      gt: { a: parseBR($("#p_n_gt").value), p: parseBR($("#p_n_gt_prev").value), qtd: $("#p_n_gt_q").value.trim() },
      b80:{ a: parseBR($("#p_n_80").value), p: parseBR($("#p_n_80_prev").value), qtd: $("#p_n_80_q").value.trim() },
      b50:{ a: parseBR($("#p_n_50").value), p: parseBR($("#p_n_50_prev").value), qtd: $("#p_n_50_q").value.trim() },
      lt: { a: parseBR($("#p_n_lt").value), p: parseBR($("#p_n_lt_prev").value), qtd: $("#p_n_lt_q").value.trim() },
    },
    week: {
      gt: { w: parseBR($("#p_w_gt").value), d: parseBR($("#p_d_gt").value) },
      b80:{ w: parseBR($("#p_w_80").value), d: parseBR($("#p_d_80").value) },
      b50:{ w: parseBR($("#p_w_50").value), d: parseBR($("#p_d_50").value) },
      lt: { w: parseBR($("#p_w_lt").value), d: parseBR($("#p_d_lt").value) },
    },
    causas: $("#p_causas").value.split("\n").map(s=>s.trim()).filter(Boolean)
  };
}

function readMono(){
  return {
    metaLiq: parseBR($("#m_metaLiq").value), realLiq: parseBR($("#m_realLiq").value),
    metaEf: parseBR($("#m_metaEf").value), realEf: parseBR($("#m_realEf").value),
    metaUtil: parseBR($("#m_metaUtil").value), realUtil: parseBR($("#m_realUtil").value),
    indPlan: parseBR($("#m_indPlan").value), indReal: parseBR($("#m_indReal").value),

    vet: {
      gt: { a: parseBR($("#m_v_gt").value), p: parseBR($("#m_v_gt_prev").value), qtd: $("#m_v_gt_q").value.trim() },
      b80:{ a: parseBR($("#m_v_80").value), p: parseBR($("#m_v_80_prev").value), qtd: $("#m_v_80_q").value.trim() },
      b50:{ a: parseBR($("#m_v_50").value), p: parseBR($("#m_v_50_prev").value), qtd: $("#m_v_50_q").value.trim() },
      lt: { a: parseBR($("#m_v_lt").value), p: parseBR($("#m_v_lt_prev").value), qtd: $("#m_v_lt_q").value.trim() },
    },
    nov: {
      gt: { a: parseBR($("#m_n_gt").value), p: parseBR($("#m_n_gt_prev").value), qtd: $("#m_n_gt_q").value.trim() },
      b80:{ a: parseBR($("#m_n_80").value), p: parseBR($("#m_n_80_prev").value), qtd: $("#m_n_80_q").value.trim() },
      b50:{ a: parseBR($("#m_n_50").value), p: parseBR($("#m_n_50_prev").value), qtd: $("#m_n_50_q").value.trim() },
      lt: { a: parseBR($("#m_n_lt").value), p: parseBR($("#m_n_lt_prev").value), qtd: $("#m_n_lt_q").value.trim() },
    },
    week: {
      gt: { w: parseBR($("#m_w_gt").value), d: parseBR($("#m_d_gt").value) },
      b80:{ w: parseBR($("#m_w_80").value), d: parseBR($("#m_d_80").value) },
      b50:{ w: parseBR($("#m_w_50").value), d: parseBR($("#m_d_50").value) },
      lt: { w: parseBR($("#m_w_lt").value), d: parseBR($("#m_d_lt").value) },
    },
    causas: $("#m_causas").value.split("\n").map(s=>s.trim()).filter(Boolean)
  };
}

function readPTW(){
  return {
    metaLiq: parseBR($("#t_metaLiq").value), realLiq: parseBR($("#t_realLiq").value),
    metaEf: parseBR($("#t_metaEf").value), realEf: parseBR($("#t_realEf").value),
    metaUtil: parseBR($("#t_metaUtil").value), realUtil: parseBR($("#t_realUtil").value),
    indPlan: parseBR($("#t_indPlan").value), indReal: parseBR($("#t_indReal").value),

    vet: {
      gt: { a: parseBR($("#t_v_gt").value), p: parseBR($("#t_v_gt_prev").value), qtd: $("#t_v_gt_q").value.trim() },
      b80:{ a: parseBR($("#t_v_80").value), p: parseBR($("#t_v_80_prev").value), qtd: $("#t_v_80_q").value.trim() },
      b50:{ a: parseBR($("#t_v_50").value), p: parseBR($("#t_v_50_prev").value), qtd: $("#t_v_50_q").value.trim() },
      lt: { a: parseBR($("#t_v_lt").value), p: parseBR($("#t_v_lt_prev").value), qtd: $("#t_v_lt_q").value.trim() },
    },
    nov: {
      gt: { a: parseBR($("#t_n_gt").value), p: parseBR($("#t_n_gt_prev").value), qtd: $("#t_n_gt_q").value.trim() },
      b80:{ a: parseBR($("#t_n_80").value), p: parseBR($("#t_n_80_prev").value), qtd: $("#t_n_80_q").value.trim() },
      b50:{ a: parseBR($("#t_n_50").value), p: parseBR($("#t_n_50_prev").value), qtd: $("#t_n_50_q").value.trim() },
      lt: { a: parseBR($("#t_n_lt").value), p: parseBR($("#t_n_lt_prev").value), qtd: $("#t_n_lt_q").value.trim() },
    },
    week: {
      gt: { w: parseBR($("#t_w_gt").value), d: parseBR($("#t_d_gt").value) },
      b80:{ w: parseBR($("#t_w_80").value), d: parseBR($("#t_d_80").value) },
      b50:{ w: parseBR($("#t_w_50").value), d: parseBR($("#t_d_50").value) },
      lt: { w: parseBR($("#t_w_lt").value), d: parseBR($("#t_d_lt").value) },
    },
    causas: $("#t_causas").value.split("\n").map(s=>s.trim()).filter(Boolean)
  };
}

/* =========================
   BUILDERS
========================= */
function buildText({ title, metaLines, indPlan, indReal, vetLines, novLines, weekTitle, weekLines, causas }){
  const out = [];
  out.push(title);
  out.push(...metaLines);
  out.push("");
  out.push(`% de indiretos Plan: ${indPlan} - % de indiretos real: ${indReal}`);
  out.push("");
  out.push("VETERANOS");
  out.push(...vetLines);
  out.push("");
  out.push("NOVINHOS");
  out.push(...novLines);
  out.push("");
  out.push(weekTitle);
  out.push(...weekLines);
  out.push("");
  out.push("ANÁLISE CAUSA RAIZ:");
  if (causas.length) out.push(...causas.map(c => c.startsWith("->") ? c : `-> ${c}`));
  else out.push("->");
  return out.join("\n");
}

function buildPreviewHTML({ title, metaLinesHTML, indPlanHTML, indRealHTML, vetLinesHTML, novLinesHTML, weekTitle, weekLinesHTML, causasHTML }){
  return [
    `<div class="t">${title}</div>`,
    ...metaLinesHTML.map(l => `<div class="t">${l}</div>`),
    `<br/>`,
    `<div class="t">% de indiretos Plan: ${indPlanHTML} - % de indiretos real: ${indRealHTML}</div>`,
    `<br/>`,
    `<div class="t">VETERANOS</div>`,
    ...vetLinesHTML.map(l => `<div>${l}</div>`),
    `<br/>`,
    `<div class="t">NOVINHOS</div>`,
    ...novLinesHTML.map(l => `<div>${l}</div>`),
    `<br/>`,
    `<div class="t">${weekTitle}</div>`,
    ...weekLinesHTML.map(l => `<div>${l}</div>`),
    `<br/>`,
    `<div class="t">ANÁLISE CAUSA RAIZ:</div>`,
    ...causasHTML.map(l => `<div>${l}</div>`)
  ].join("");
}

/* =========================
   PER SUBPROCESS
========================= */
function buildPicking(){
  const { diaAtualBR, diaAnteriorLabel } = headerLabels();
  const d = readPicking();

  const text = buildText({
    title: "PICKING",
    metaLines: [
      `Meta Líquida picking: ${fmtBR(d.metaLiq,1)} / Real ${fmtBR(d.realLiq,2)}`,
      `Meta Efetiva picking: ${fmtBR(d.metaEf,2)} / Real ${fmtBR(d.realEf,2)}`,
      `Meta utilização: ${fmtPct(d.metaUtil,0)} / Real ${fmtPct(d.realUtil,2)}`
    ],
    indPlan: fmtPct(d.indPlan,0),
    indReal: fmtPct(d.indReal,2),
    vetLines: [
      `-> ${fmtPct0(d.vet.gt.a)} veteranos > 100 de prod. líquida (${d.vet.gt.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.vet.gt.p,2)}${deltaText(d.vet.gt.a, d.vet.gt.p)}`,
      `-> ${fmtPct0(d.vet.b80.a)} veteranos entre 80 - 99% de prod. líquida (${d.vet.b80.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.vet.b80.p,2)}${deltaText(d.vet.b80.a, d.vet.b80.p)}`,
      `-> ${fmtPct0(d.vet.b50.a)} veteranos entre 50 - 79% (${d.vet.b50.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.vet.b50.p,2)}${deltaText(d.vet.b50.a, d.vet.b50.p)}`,
      `-> ${fmtPct0(d.vet.lt.a)} veteranos < 50% (${d.vet.lt.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.vet.lt.p,2)}${deltaText(d.vet.lt.a, d.vet.lt.p)}`
    ],
    novLines: [
      `-> ${fmtPct0(d.nov.gt.a)} novinhos > 100 de prod. líquida (${d.nov.gt.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.nov.gt.p,2)}${deltaText(d.nov.gt.a, d.nov.gt.p)}`,
      `-> ${fmtPct0(d.nov.b80.a)} novinhos entre 80 - 99% de prod. líquida (${d.nov.b80.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.nov.b80.p,2)}${deltaText(d.nov.b80.a, d.nov.b80.p)}`,
      `-> ${fmtPct0(d.nov.b50.a)} novinhos entre 50 - 79% de prod. líquida (${d.nov.b50.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.nov.b50.p,2)}${deltaText(d.nov.b50.a, d.nov.b50.p)}`,
      `-> ${fmtPct0(d.nov.lt.a)} novinhos < 50% (${d.nov.lt.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.nov.lt.p,2)}${deltaText(d.nov.lt.a, d.nov.lt.p)}`
    ],
    weekTitle: `WEEK 8 VS DIA ${diaAtualBR}`,
    weekLines: [
      `>100 DE PROD.LÍQUIDA: W-8: ${fmtPct0(d.week.gt.w)} - ${diaAtualBR}: ${fmtPct0(d.week.gt.d)}`,
      `80 < > 90% DE PROD. LÍQUIDA: W-8: ${fmtPct0(d.week.b80.w)} - ${diaAtualBR}: ${fmtPct0(d.week.b80.d)}`,
      `50 < > 79% DE PROD. LÍQUIDA: W-8: ${fmtPct0(d.week.b50.w)} - ${diaAtualBR}: ${fmtPct0(d.week.b50.d)}`,
      `50% < % DE PROD. LÍQUIDA: W-8: ${fmtPct0(d.week.lt.w)} - ${diaAtualBR}: ${fmtPct0(d.week.lt.d)}`
    ],
    causas: d.causas
  });

  const html = buildPreviewHTML({
    title: "PICKING",
    metaLinesHTML: [
      `Meta Líquida picking: ${fmtBR(d.metaLiq,1)} / Real ${fmtBR(d.realLiq,2)}`,
      `Meta Efetiva picking: ${fmtBR(d.metaEf,2)} / Real ${fmtBR(d.realEf,2)}`,
      `Meta utilização: ${fmtPct(d.metaUtil,0)} / Real ${fmtPct(d.realUtil,2)}`
    ],
    indPlanHTML: fmtPct(d.indPlan,0),
    indRealHTML: `<span class="r">${fmtPct(d.indReal,2)}</span>`,
    vetLinesHTML: [
      `-> ${fmtPct0(d.vet.gt.a)} veteranos > <span class="g">100 de prod. líquida</span> (${d.vet.gt.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.vet.gt.p,2)}${deltaHtml(d.vet.gt.a, d.vet.gt.p)}`,
      `-> ${fmtPct0(d.vet.b80.a)} veteranos entre 80 - 99% de prod. líquida (${d.vet.b80.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.vet.b80.p,2)}${deltaHtml(d.vet.b80.a, d.vet.b80.p)}`,
      `-> ${fmtPct0(d.vet.b50.a)} veteranos entre 50 - 79% (${d.vet.b50.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.vet.b50.p,2)}${deltaHtml(d.vet.b50.a, d.vet.b50.p)}`,
      `-> ${fmtPct0(d.vet.lt.a)} veteranos < 50% (${d.vet.lt.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.vet.lt.p,2)}${deltaHtml(d.vet.lt.a, d.vet.lt.p)}`
    ],
    novLinesHTML: [
      `-> ${fmtPct0(d.nov.gt.a)} novinhos > <span class="g">100 de prod. líquida</span> (${d.nov.gt.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.nov.gt.p,2)}${deltaHtml(d.nov.gt.a, d.nov.gt.p)}`,
      `-> ${fmtPct0(d.nov.b80.a)} novinhos entre 80 - 99% de prod. líquida (${d.nov.b80.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.nov.b80.p,2)}${deltaHtml(d.nov.b80.a, d.nov.b80.p)}`,
      `-> ${fmtPct0(d.nov.b50.a)} novinhos entre 50 - 79% de prod. líquida (${d.nov.b50.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.nov.b50.p,2)}${deltaHtml(d.nov.b50.a, d.nov.b50.p)}`,
      `-> ${fmtPct0(d.nov.lt.a)} novinhos < 50% (${d.nov.lt.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.nov.lt.p,2)}${deltaHtml(d.nov.lt.a, d.nov.lt.p)}`
    ],
    weekTitle: `WEEK 8 VS DIA ${diaAtualBR}`,
    weekLinesHTML: [
      `<span class="g">&gt;100 DE PROD.LÍQUIDA</span>: W-8: ${fmtPct0(d.week.gt.w)} - ${diaAtualBR}: ${fmtPct0(d.week.gt.d)}`,
      `80 < > 90% DE PROD. LÍQUIDA: W-8: ${fmtPct0(d.week.b80.w)} - ${diaAtualBR}: ${fmtPct0(d.week.b80.d)}`,
      `50 < > 79% DE PROD. LÍQUIDA: W-8: ${fmtPct0(d.week.b50.w)} - ${diaAtualBR}: ${fmtPct0(d.week.b50.d)}`,
      `50% < % DE PROD. LÍQUIDA: W-8: ${fmtPct0(d.week.lt.w)} - ${diaAtualBR}: ${fmtPct0(d.week.lt.d)}`
    ],
    causasHTML: (d.causas.length ? d.causas : ["->"]).map(c => c.startsWith("->") ? c : `-> ${c}`)
  });

  return { text, html };
}

function buildGeneric({ name, gtLabelText, gtGreenText, readFn, weekGtPrefix }){
  const { diaAtualBR, diaAnteriorLabel } = headerLabels();
  const d = readFn();

  const text = buildText({
    title: name,
    metaLines: [
      `Meta Líquida packing: ${fmtBR(d.metaLiq,1)} / Real ${fmtBR(d.realLiq,2)}`,
      `Meta Efetiva packing: ${fmtBR(d.metaEf,1)} / Real ${fmtBR(d.realEf,2)}`,
      `Meta utilização: ${fmtPct(d.metaUtil,0)} / Real ${fmtPct(d.realUtil,2)}`
    ],
    indPlan: fmtPct(d.indPlan,2),
    indReal: fmtPct(d.indReal,2),
    vetLines: [
      `-> ${fmtPct0(d.vet.gt.a)} veteranos > ${gtLabelText} de prod. líquida (${d.vet.gt.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.vet.gt.p,2)}${deltaText(d.vet.gt.a, d.vet.gt.p)}`,
      `-> ${fmtPct0(d.vet.b80.a)} veteranos entre 80 - 99% de prod. líquida (${d.vet.b80.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.vet.b80.p,2)}${deltaText(d.vet.b80.a, d.vet.b80.p)}`,
      `-> ${fmtPct0(d.vet.b50.a)} veteranos entre 50 - 79% (${d.vet.b50.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.vet.b50.p,2)}${deltaText(d.vet.b50.a, d.vet.b50.p)}`,
      `-> ${fmtPct0(d.vet.lt.a)} veteranos < 50% (${d.vet.lt.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.vet.lt.p,2)}${deltaText(d.vet.lt.a, d.vet.lt.p)}`
    ],
    novLines: [
      `-> ${fmtPct0(d.nov.gt.a)} novinhos > ${gtLabelText} de prod. líquida (${d.nov.gt.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.nov.gt.p,2)}${deltaText(d.nov.gt.a, d.nov.gt.p)}`,
      `-> ${fmtPct0(d.nov.b80.a)} novinhos entre 80 - 99% de prod. líquida (${d.nov.b80.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.nov.b80.p,2)}${deltaText(d.nov.b80.a, d.nov.b80.p)}`,
      `-> ${fmtPct0(d.nov.b50.a)} novinhos entre 50 - 79% de prod. líquida (${d.nov.b50.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.nov.b50.p,2)}${deltaText(d.nov.b50.a, d.nov.b50.p)}`,
      `-> ${fmtPct0(d.nov.lt.a)} novinhos < 50% (${d.nov.lt.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.nov.lt.p,2)}${deltaText(d.nov.lt.a, d.nov.lt.p)}`
    ],
    weekTitle: `WEEK 8 VS DIA ${diaAtualBR}`,
    weekLines: [
      `${weekGtPrefix} DE PROD.LÍQUIDA: W-8: ${fmtPct0(d.week.gt.w)} - ${diaAtualBR}: ${fmtPct0(d.week.gt.d)}`,
      `80 < > 90% DE PROD. LÍQUIDA: W-8: ${fmtPct0(d.week.b80.w)} - ${diaAtualBR}: ${fmtPct0(d.week.b80.d)}`,
      `50 < > 79% DE PROD. LÍQUIDA: W-8: ${fmtPct0(d.week.b50.w)} - ${diaAtualBR}: ${fmtPct0(d.week.b50.d)}`,
      `50% < % DE PROD. LÍQUIDA: W-8: ${fmtPct0(d.week.lt.w)} - ${diaAtualBR}: ${fmtPct0(d.week.lt.d)}`
    ],
    causas: d.causas
  });

  const html = buildPreviewHTML({
    title: name,
    metaLinesHTML: [
      `Meta Líquida packing: ${fmtBR(d.metaLiq,1)} / Real ${fmtBR(d.realLiq,2)}`,
      `Meta Efetiva packing: ${fmtBR(d.metaEf,1)} / Real ${fmtBR(d.realEf,2)}`,
      `Meta utilização: ${fmtPct(d.metaUtil,0)} / Real ${fmtPct(d.realUtil,2)}`
    ],
    indPlanHTML: fmtPct(d.indPlan,2),
    indRealHTML: `<span class="r">${fmtPct(d.indReal,2)}</span>`,
    vetLinesHTML: [
      `-> ${fmtPct0(d.vet.gt.a)} veteranos > <span class="g">${gtGreenText} de prod. líquida</span> (${d.vet.gt.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.vet.gt.p,2)}${deltaHtml(d.vet.gt.a, d.vet.gt.p)}`,
      `-> ${fmtPct0(d.vet.b80.a)} veteranos entre 80 - 99% de prod. líquida (${d.vet.b80.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.vet.b80.p,2)}${deltaHtml(d.vet.b80.a, d.vet.b80.p)}`,
      `-> ${fmtPct0(d.vet.b50.a)} veteranos entre 50 - 79% (${d.vet.b50.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.vet.b50.p,2)}${deltaHtml(d.vet.b50.a, d.vet.b50.p)}`,
      `-> ${fmtPct0(d.vet.lt.a)} veteranos < 50% (${d.vet.lt.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.vet.lt.p,2)}${deltaHtml(d.vet.lt.a, d.vet.lt.p)}`
    ],
    novLinesHTML: [
      `-> ${fmtPct0(d.nov.gt.a)} novinhos > <span class="g">${gtGreenText} de prod. líquida</span> (${d.nov.gt.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.nov.gt.p,2)}${deltaHtml(d.nov.gt.a, d.nov.gt.p)}`,
      `-> ${fmtPct0(d.nov.b80.a)} novinhos entre 80 - 99% de prod. líquida (${d.nov.b80.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.nov.b80.p,2)}${deltaHtml(d.nov.b80.a, d.nov.b80.p)}`,
      `-> ${fmtPct0(d.nov.b50.a)} novinhos entre 50 - 79% de prod. líquida (${d.nov.b50.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.nov.b50.p,2)}${deltaHtml(d.nov.b50.a, d.nov.b50.p)}`,
      `-> ${fmtPct0(d.nov.lt.a)} novinhos < 50% (${d.nov.lt.qtd}) - ${diaAnteriorLabel}: ${fmtPct(d.nov.lt.p,2)}${deltaHtml(d.nov.lt.a, d.nov.lt.p)}`
    ],
    weekTitle: `WEEK 8 VS DIA ${diaAtualBR}`,
    weekLinesHTML: [
      `<span class="g">${weekGtPrefix} DE PROD.LÍQUIDA</span>: W-8: ${fmtPct0(d.week.gt.w)} - ${diaAtualBR}: ${fmtPct0(d.week.gt.d)}`,
      `80 < > 90% DE PROD. LÍQUIDA: W-8: ${fmtPct0(d.week.b80.w)} - ${diaAtualBR}: ${fmtPct0(d.week.b80.d)}`,
      `50 < > 79% DE PROD. LÍQUIDA: W-8: ${fmtPct0(d.week.b50.w)} - ${diaAtualBR}: ${fmtPct0(d.week.b50.d)}`,
      `50% < % DE PROD. LÍQUIDA: W-8: ${fmtPct0(d.week.lt.w)} - ${diaAtualBR}: ${fmtPct0(d.week.lt.d)}`
    ],
    causasHTML: (d.causas.length ? d.causas : ["->"]).map(c => c.startsWith("->") ? c : `-> ${c}`)
  });

  return { text, html };
}

/* =========================
   GENERATE / COPY
========================= */
function gerar(){
  const mode = $("#subprocesso")?.value;
  console.log("[mantra] gerar() mode =", mode);

  let result;
  if (mode === "picking") {
    result = buildPicking();
  } else if (mode === "mono") {
    result = buildGeneric({
      name: "PACKING MONO",
      gtLabelText: "200",
      gtGreenText: "200",
      readFn: readMono,
      weekGtPrefix: ">200"
    });
  } else if (mode === "ptw") {
    result = buildGeneric({
      name: "PACKING PTW",
      gtLabelText: "360",
      gtGreenText: "360",
      readFn: readPTW,
      weekGtPrefix: ">360"
    });
  } else {
    console.error("[mantra] mode inválido:", mode);
    return;
  }

  const out = $("#saida1Celula");
  const prev = $("#preview");

  if (!out || !prev){
    console.error("[mantra] Elementos de saída não encontrados. IDs: saida1Celula, preview");
    return;
  }

  out.value = result.text;
  prev.innerHTML = result.html;
}

async function copiar1Celula(){
  const txt = $("#saida1Celula")?.value || "";
  await navigator.clipboard.writeText(txt);
}

// Wire (com validação)
window.addEventListener("DOMContentLoaded", () => {
  console.log("[mantra] DOMContentLoaded");

  const btnGerar = $("#btnGerar");
  const btnCopiar = $("#btnCopiar1Celula");

  if (!btnGerar) console.error("[mantra] Botão #btnGerar não encontrado (verifique o ID no HTML).");
  if (!btnCopiar) console.error("[mantra] Botão #btnCopiar1Celula não encontrado (verifique o ID no HTML).");

  btnGerar?.addEventListener("click", gerar);
  btnCopiar?.addEventListener("click", copiar1Celula);

  // init
  updateMode();
  gerar();
});
