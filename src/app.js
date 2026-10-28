/* ============================================================================
   透镜新标签页 — 应用入口
   结构：图标 / 数据 / 渲染 / 交互 / 玻璃启动
   ========================================================================== */

import { createGlassSystem } from "../vendor/lens/runtime.js";

/* ============================== 图标 ============================== */
const ICONS = {
  server: '<rect x="4" y="4.5" width="16" height="6" rx="2"/><rect x="4" y="13.5" width="16" height="6" rx="2"/><path d="M8.2 7.5h.01M8.2 16.5h.01"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.8"/><rect x="13" y="4" width="7" height="7" rx="1.8"/><rect x="4" y="13" width="7" height="7" rx="1.8"/><rect x="13" y="13" width="7" height="7" rx="1.8"/>',
  doc: '<path d="M7 3.5h6.5L18 8v12.5H7z"/><path d="M13.5 3.5V8H18"/><path d="M10 12h5M10 15.5h5"/>',
  code: '<path d="M9.5 8 5 12l4.5 4M14.5 8 19 12l-4.5 4"/>',
  mail: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m3.5 8 8.5 5.5L20.5 8"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  chart: '<path d="M4 19.5V9.5M10 19.5v-13M16 19.5v-6.5M22 19.5H2"/>',
  layers: '<path d="m12 3 8 4.5-8 4.5L4 7.5z"/><path d="m4 12 8 4.5 8-4.5"/>',
  link: '<path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.5-2.5a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M13.5 10.5a4 4 0 0 0-5.7 0L5.3 13a4 4 0 0 0 5.7 5.7l1-1"/>',
  bell: '<path d="M18 15V10a6 6 0 1 0-12 0v5l-1.5 3h15z"/><path d="M10 21h4"/>',
  gauge: '<path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l4-4"/>'
};
const icon = name => `<svg class="lg-icon" viewBox="0 0 24 24">${ICONS[name] || ICONS.link}</svg>`;

/* ============================== 数据 ============================== */
const KEY = "lens-newtab:v1";
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const clone = o => JSON.parse(JSON.stringify(o));

const T = (id, title, url, iconName, size) => ({ id, title, url, icon: iconName, size: size || "s" });

const SEED = {
  currentProject: "p1",
  projects: [
    { id: "p1", name: "Power 优化" },
    { id: "p2", name: "Q4 重构" },
    { id: "p3", name: "运维值班" }
  ],
  pinned: [
    T("t1", "堡垒机", "https://bastion.corp.example", "server"),
    T("t2", "Jira", "https://jira.corp.example", "grid"),
    T("t3", "Confluence", "https://confluence.corp.example", "doc"),
    T("t4", "GitLab", "https://gitlab.corp.example", "code"),
    T("t5", "邮箱", "https://mail.corp.example", "mail"),
    T("t6", "工时填报", "https://timesheet.corp.example", "clock")
  ],
  projectTiles: {
    p1: [
      T("a1", "Power 优化 · 项目文档", "https://confluence.corp.example/pages/power", "doc", "w"),
      T("a2", "优化任务看板", "https://jira.corp.example/board/power", "grid", "w"),
      T("a3", "性能基线数据", "https://metrics.corp.example/baseline", "chart"),
      T("a4", "功耗对比曲线", "https://grafana.corp.example/d/power", "gauge"),
      T("a5", "周会纪要", "https://docs.corp.example/power-weekly", "doc"),
      T("a6", "需求池", "https://jira.corp.example/pool", "layers")
    ],
    p2: [
      T("b1", "重构设计文档", "https://confluence.corp.example/pages/refactor", "doc", "w"),
      T("b2", "重构任务看板", "https://jira.corp.example/board/refactor", "grid", "w"),
      T("b3", "接口契约", "https://gitlab.corp.example/api-spec", "code")
    ],
    p3: [
      T("c1", "值班表", "https://docs.corp.example/oncall", "clock", "w"),
      T("c2", "告警面板", "https://grafana.corp.example/d/alerts", "bell", "w"),
      T("c3", "故障复盘库", "https://confluence.corp.example/pages/postmortem", "doc")
    ]
  },
  occasional: [
    { id: "o1", title: "测试数据平台", url: "https://metrics.corp.example/testdata", icon: "chart", group: "测试数据" },
    { id: "o2", title: "历史数据查询", url: "https://metrics.corp.example/history", icon: "gauge", group: "测试数据" },
    { id: "o3", title: "性能对比报表", url: "https://metrics.corp.example/report", icon: "chart", group: "测试数据" },
    { id: "o4", title: "Grafana 监控", url: "https://grafana.corp.example", icon: "gauge", group: "监控告警" },
    { id: "o5", title: "ELK 日志平台", url: "https://elk.corp.example", icon: "doc", group: "监控告警" },
    { id: "o6", title: "发布流水线", url: "https://ci.corp.example", icon: "layers", group: "运维工具" },
    { id: "o7", title: "权限申请", url: "https://it.corp.example/access", icon: "link", group: "运维工具" },
    { id: "o8", title: "历史版本下载", url: "https://nexus.corp.example", icon: "server", group: "历史存档" }
  ]
};

let DB = load() || clone(SEED);

function load() {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch { /* 存不下也不影响使用 */ }
}

const currentTiles = () => DB.projectTiles[DB.currentProject] || [];
const currentProject = () => DB.projects.find(p => p.id === DB.currentProject) || DB.projects[0];

let toastTimer = 0;
function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("on"), 2000);
}

/* ============================== 渲染 ============================== */
function tileHTML(t, zone, project, i) {
  const size = t.size || "s";
  const host = (() => { try { return new URL(t.url).hostname; } catch { return ""; } })();
  const cls = `tile lg-surface ${size}`;
  const kind = size === "s" ? "small" : "panel";
  const attrs = `data-id="${t.id}" data-zone="${zone}" data-proj="${project || ""}" data-glass="${kind}" style="--i:${i}"`;
  if (size === "s") {
    return `<button class="${cls}" ${attrs} type="button">${icon(t.icon)}<span class="t-name">${esc(t.title)}</span></button>`;
  }
  return `<button class="${cls}" ${attrs} type="button">${icon(t.icon)}<span class="col"><span class="t-name">${esc(t.title)}</span><span class="t-meta mono">${esc(host)}</span></span></button>`;
}

function renderPinned() {
  $("grid-pinned").innerHTML = DB.pinned.map((t, i) => tileHTML(t, "pinned", "", i)).join("");
}

function renderProject() {
  $("grid-project").innerHTML = currentTiles().map((t, i) => tileHTML(t, "project", DB.currentProject, i)).join("");
}

function renderPills() {
  const wrap = $("pills");
  const sig = DB.currentProject + "|" + DB.projects.map(p => p.id + (DB.projectTiles[p.id] || []).length).join(",");
  const same = wrap.dataset.sig === sig;
  wrap.innerHTML =
    DB.projects.map(p =>
      `<button class="pill lg-surface${p.id === DB.currentProject ? " on" : ""}" data-proj="${p.id}" type="button" data-glass="selected">${esc(p.name)}<span class="n mono">${(DB.projectTiles[p.id] || []).length}</span></button>`
    ).join("") + `<button class="pill ghost" id="newProj" type="button">＋ 新项目</button>`;
  wrap.dataset.sig = sig;
  wrap.querySelectorAll(".pill[data-proj]").forEach(el => {
    el.onclick = () => { DB.currentProject = el.dataset.proj; save(); renderAll(); };
  });
  $("newProj").onclick = addProject;
  wrap.querySelectorAll(".pill.on").forEach(el => el.style.setProperty("--glass-selection", "1"));
  if (!same) wrap.classList.add("repaint");
  requestAnimationFrame(() => wrap.classList.remove("repaint"));
}

function renderSheet() {
  const groups = new Map();
  DB.occasional.forEach(o => {
    if (!groups.has(o.group)) groups.set(o.group, []);
    groups.get(o.group).push(o);
  });
  $("sheetTags").innerHTML = [...groups.keys()].map(g => `<span>${esc(g)}</span>`).join("");
  $("sheetin").innerHTML = [...groups.entries()].map(([g, items]) => `
    <div class="sgroup"><div class="sgl mono">${esc(g)}</div><div class="sitems">
      ${items.map(o => `<button class="sitem lg-surface" data-occ="${o.id}" type="button" data-glass="small">${icon(o.icon)}<span>${esc(o.title)}</span></button>`).join("")}
    </div></div>`).join("");
  $("sheetin").querySelectorAll("[data-occ]").forEach(el => {
    el.onclick = () => {
      const o = DB.occasional.find(x => x.id === el.dataset.occ);
      if (o) openUrl(o.url, o.title);
    };
  });
}

function renderAll() { renderPills(); renderPinned(); renderProject(); renderSheet(); }

/* ============================== 打开页面 ============================== */
function openUrl(url, title) {
  if (!url) { toast("没有网址"); return; }
  window.location.href = url;
}

/* ============================== 时钟 ============================== */
const WEEK = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
function tickClock() {
  const d = new Date();
  $("clockT").textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  $("clockD").textContent = `${d.getMonth() + 1} 月 ${d.getDate()} 日 · ${WEEK[d.getDay()]}`;
}

/* ============================== 查找 ============================== */
function findList(zone, proj) {
  if (zone === "pinned") return DB.pinned;
  if (zone === "project") return DB.projectTiles[proj] || null;
  return null;
}
function findTile(id, zone, proj) {
  const L = findList(zone, proj);
  return L ? L.find(x => x.id === id) : null;
}
function allTiles() {
  const out = [];
  DB.pinned.forEach(t => out.push({ t, ctx: "固定" }));
  DB.projects.forEach(p => (DB.projectTiles[p.id] || []).forEach(t => out.push({ t, ctx: "项目 · " + p.name })));
  DB.occasional.forEach(t => out.push({ t, ctx: "偶尔用 · " + t.group }));
  return out;
}

/* ============================== 拖拽排序 ============================== */
let drag = null;
let suppressClick = false;

function onPointerDown(e) {
  if (e.button !== 0) return;
  const tile = e.target.closest && e.target.closest(".tile");
  if (!tile || !tile.dataset.id) return;
  drag = { el: tile, sx: e.clientX, sy: e.clientY, started: false, ghost: null, offX: 0, offY: 0 };
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", endDrag);
  document.addEventListener("pointercancel", endDrag);
}

function startDrag(e) {
  const tile = drag.el;
  const r = tile.getBoundingClientRect();
  drag.started = true;
  drag.offX = e.clientX - r.left;
  drag.offY = e.clientY - r.top;
  const g = tile.cloneNode(true);
  g.classList.add("drag-ghost");
  g.style.width = r.width + "px";
  g.style.height = r.height + "px";
  g.style.animation = "none";
  document.body.appendChild(g);
  drag.ghost = g;
  tile.classList.add("dragging-src");
  document.body.classList.add("is-dragging");
}

function onPointerMove(e) {
  if (!drag) return;
  if (!drag.started) {
    if (Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) < 8) return;
    startDrag(e);
  }
  e.preventDefault();
  const g = drag.ghost;
  if (g) g.style.transform = `translate3d(${e.clientX - drag.offX}px,${e.clientY - drag.offY}px,0)`;
  movePlaceholder(e);
}

function movePlaceholder(e) {
  const under = document.elementFromPoint(e.clientX, e.clientY);
  if (!under) return;
  const over = under.closest(".tile");
  const grid = under.closest(".grid");
  if (over && over !== drag.el && over.dataset.id) {
    const r = over.getBoundingClientRect();
    const before = e.clientX < r.left + r.width / 2;
    over.parentNode.insertBefore(drag.el, before ? over : over.nextSibling);
  } else if (grid && !grid.contains(drag.el)) {
    grid.appendChild(drag.el);
  }
}

function endDrag() {
  document.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("pointerup", endDrag);
  document.removeEventListener("pointercancel", endDrag);
  const d = drag;
  drag = null;
  document.body.classList.remove("is-dragging");
  if (!d || !d.started) return;
  if (d.ghost) d.ghost.remove();
  d.el.classList.remove("dragging-src");
  suppressClick = true;
  setTimeout(() => { suppressClick = false; }, 60);
  persistOrder();
}

function persistOrder() {
  const map = {};
  allTiles().forEach(x => { map[x.t.id] = x.t; });
  DB.pinned = [...document.querySelectorAll("#grid-pinned .tile")].map(el => {
    const t = map[el.dataset.id];
    if (t) { el.dataset.zone = "pinned"; el.dataset.proj = ""; }
    return t;
  }).filter(Boolean);
  DB.projectTiles[DB.currentProject] = [...document.querySelectorAll("#grid-project .tile")].map(el => {
    const t = map[el.dataset.id];
    if (t) { el.dataset.zone = "project"; el.dataset.proj = DB.currentProject; }
    return t;
  }).filter(Boolean);
  save();
}

/* ============================== 点击 / 右键 ============================== */
document.addEventListener("click", e => {
  if (suppressClick) return;
  const tile = e.target.closest && e.target.closest(".tile");
  if (!tile || !tile.dataset.id) return;
  const t = findTile(tile.dataset.id, tile.dataset.zone, tile.dataset.proj);
  if (t) openUrl(t.url, t.title);
});

document.addEventListener("contextmenu", e => {
  const tile = e.target.closest && e.target.closest(".tile");
  if (!tile || !tile.dataset.id) return;
  e.preventDefault();
  openCtx(e, tile.dataset.id, tile.dataset.zone, tile.dataset.proj);
});

let ctxTarget = null;
function openCtx(e, id, zone, proj) {
  const el = $("ctx");
  ctxTarget = { id, zone, proj };
  const t = findTile(id, zone, proj);
  if (!t) return;
  const cur = t.size === "w" ? "2×1" : t.size === "b" ? "2×2" : "1×1";
  let html = `<button class="cit" data-act="cycle">改大小（当前 ${cur}）</button>`;
  if (zone !== "pinned") html += `<button class="cit" data-act="pinned">移到固定区</button>`;
  if (zone === "pinned") html += `<button class="cit" data-act="project">移到项目区</button>`;
  html += `<button class="cit" data-act="occasional">收进偶尔用</button>`;
  html += `<button class="cit" data-act="del">删除</button>`;
  el.innerHTML = html;
  el.classList.add("on");
  el.style.left = Math.min(e.clientX, innerWidth - 200) + "px";
  el.style.top = Math.min(e.clientY, innerHeight - 240) + "px";
  el.querySelectorAll(".cit").forEach(b => { b.onclick = () => doCtx(b.dataset.act); });
}
function closeCtx() { $("ctx").classList.remove("on"); ctxTarget = null; }

function doCtx(act) {
  if (!ctxTarget) return;
  const c = ctxTarget;
  const t = findTile(c.id, c.zone, c.proj);
  if (!t) { closeCtx(); return; }
  const L = findList(c.zone, c.proj);
  const i = L ? L.findIndex(x => x.id === t.id) : -1;
  if (act === "cycle") t.size = t.size === "s" ? "w" : t.size === "w" ? "b" : "s";
  else if (act === "del") { if (i >= 0) L.splice(i, 1); }
  else if (act === "pinned") { if (i >= 0) L.splice(i, 1); DB.pinned.push(t); }
  else if (act === "project") { if (i >= 0) L.splice(i, 1); (DB.projectTiles[DB.currentProject] ||= []).push(t); }
  else if (act === "occasional") { if (i >= 0) L.splice(i, 1); DB.occasional.push({ id: t.id, title: t.title, url: t.url, icon: t.icon, group: "新收起" }); }
  save(); renderAll(); closeCtx();
}

/* ============================== 命令面板 ============================== */
let palItems = [];
let palSel = 0;

function openPalette() {
  $("veil").classList.add("on");
  $("palette").classList.add("on");
  const inp = $("palInput");
  inp.value = "";
  renderPalette("");
  inp.focus();
}
function closeAll() {
  $("veil").classList.remove("on");
  $("palette").classList.remove("on");
  $("modal").classList.remove("on");
  closeCtx();
}
function renderPalette(q) {
  q = (q || "").trim().toLowerCase();
  const list = allTiles().filter(x => !q || `${x.t.title} ${x.t.url} ${x.ctx}`.toLowerCase().includes(q));
  palItems = list.slice(0, 40);
  palSel = 0;
  if (!palItems.length) {
    $("palRes").innerHTML = `<div class="pal-empty">没有匹配 · 回车直接在浏览器里搜索「${esc(q)}」</div>`;
    return;
  }
  $("palRes").innerHTML = palItems.map((x, i) =>
    `<button class="pal-it${i === 0 ? " sel" : ""}" data-i="${i}">${icon(x.t.icon)}<span class="tt">${esc(x.t.title)}</span><span class="dd mono">${esc(x.ctx)}</span></button>`
  ).join("");
  $("palRes").querySelectorAll(".pal-it").forEach(el => {
    el.onclick = () => choose(+el.dataset.i);
  });
}
function choose(i) {
  const x = palItems[i];
  if (!x) return;
  closeAll();
  openUrl(x.t.url, x.t.title);
}
function moveSel(d) {
  if (!palItems.length) return;
  palSel = (palSel + d + palItems.length) % palItems.length;
  const nodes = $("palRes").querySelectorAll(".pal-it");
  nodes.forEach((n, i) => n.classList.toggle("sel", i === palSel));
  nodes[palSel]?.scrollIntoView({ block: "nearest" });
}
function chooseSel() {
  if (palItems.length) choose(palSel);
  else toast("回车将用默认搜索引擎搜索「" + $("palInput").value + "」");
}

/* ============================== 新增 / 项目 ============================== */
const NEW_ICONS = ["server", "grid", "doc", "code", "mail", "clock", "chart", "layers", "link", "bell", "gauge"];

function openAdd(zone) {
  $("veil").classList.add("on");
  $("modal").classList.add("on");
  $("mTitle").value = "";
  $("mUrl").value = "";
  $("mZone").value = zone === "pinned" ? "pinned" : "project";
  setTimeout(() => $("mTitle").focus(), 40);
}
function submitAdd() {
  const title = $("mTitle").value.trim();
  let url = $("mUrl").value.trim();
  const zone = $("mZone").value;
  if (!title) { toast("先给个名字吧"); return; }
  if (!url) { toast("填一下网址"); return; }
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  const t = { id: "t" + Date.now(), title, url, icon: NEW_ICONS[Math.floor(Math.random() * NEW_ICONS.length)], size: "s" };
  if (zone === "pinned") DB.pinned.push(t);
  else if (zone === "project") (DB.projectTiles[DB.currentProject] ||= []).push(t);
  else DB.occasional.push({ id: t.id, title, url, icon: t.icon, group: "新收起" });
  save(); closeAll(); renderAll(); toast(`已添加「${title}」`);
}
function addProject() {
  const name = prompt("新项目名称：");
  if (!name) return;
  const id = "p" + Date.now();
  DB.projects.push({ id, name: name.trim() });
  DB.projectTiles[id] = [];
  DB.currentProject = id;
  save(); renderAll();
}

/* ============================== 绑定 ============================== */
function bind() {
  $("searchBtn").onclick = openPalette;
  $("addBtn").onclick = () => openAdd("project");
  $("palInput").addEventListener("input", e => renderPalette(e.target.value));
  $("palInput").addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); moveSel(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveSel(-1); }
    else if (e.key === "Enter") { e.preventDefault(); chooseSel(); }
  });
  $("sheeth").onclick = () => $("sheet").classList.toggle("open");
  $("veil").onclick = closeAll;
  document.querySelectorAll("[data-add]").forEach(b => {
    b.onclick = e => { e.stopPropagation(); openAdd(b.dataset.add); };
  });
  $("mCancel").onclick = closeAll;
  $("mOk").onclick = submitAdd;
  $("openAll").onclick = () => toast(`将打开「${currentProject().name}」的 ${currentTiles().length} 个页面`);
  $("openAllPinned").onclick = () => toast(`固定区共 ${DB.pinned.length} 个页面`);
  $("reset").onclick = () => {
    if (confirm("恢复初始示例数据？当前布局会被覆盖。")) { DB = clone(SEED); save(); renderAll(); }
  };
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) { e.preventDefault(); openPalette(); }
    if (e.key === "Escape") closeAll();
  });
  document.addEventListener("click", e => { if (!$("ctx").contains(e.target)) closeCtx(); });
  document.addEventListener("pointerdown", onPointerDown);
  ["grid-pinned", "grid-project"].forEach(id => {
    const g = $(id);
    g.addEventListener("dblclick", e => { if (e.target === g) openAdd(id === "grid-pinned" ? "pinned" : "project"); });
  });
  window.addEventListener("resize", () => { closeCtx(); paintFallback(); });
}

/* ============================== 背景：秒开的 Canvas2D 极光 ============================== */
const AURORA = ["#d3e8e3", "#badde8", "#9db7dc", "#929ee0", "#d3b4d2", "#eccbc1"];

function paintAurora(ctx, { width: w, height: h, dpr }) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, AURORA[0]);
  g.addColorStop(.5, AURORA[1]);
  g.addColorStop(1, AURORA[5]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const ribbon = (o, c1, c2) => {
    const contour = new Path2D();
    contour.moveTo(-w * .1, h * (.98 + o));
    contour.bezierCurveTo(w * .13, h * (.39 + o), w * .48, h * (.86 + o), w * 1.1, h * (-.32 + o));
    const shape = new Path2D(contour);
    shape.lineTo(w * 1.15, h * 1.4);
    shape.lineTo(-w * .1, h * 1.4);
    shape.closePath();
    const f = ctx.createLinearGradient(w * .05, h * .1, w * .87, h * .92);
    f.addColorStop(0, c1);
    f.addColorStop(.48, c2);
    f.addColorStop(1, AURORA[5]);
    ctx.save();
    ctx.shadowColor = "#38486830";
    ctx.shadowBlur = 27 * dpr;
    ctx.shadowOffsetY = -7 * dpr;
    ctx.fillStyle = f;
    ctx.fill(shape);
    ctx.restore();
    ctx.save();
    ctx.clip(shape);
    ctx.filter = `blur(${15 * dpr}px)`;
    ctx.strokeStyle = "#ffffff45";
    ctx.lineWidth = 37 * dpr;
    ctx.stroke(contour);
    ctx.filter = "none";
    ctx.strokeStyle = "#ffffff25";
    ctx.lineWidth = 1.2 * dpr;
    ctx.stroke(contour);
    ctx.restore();
  };

  ribbon(-.31, AURORA[1], AURORA[2]);
  ribbon(-.10, AURORA[2], AURORA[3]);
  ribbon(.18, AURORA[3], AURORA[4]);
  ribbon(.44, AURORA[4], AURORA[5]);

  const glow = ctx.createRadialGradient(w * .12, h * .08, 0, w * .12, h * .08, w * .85);
  glow.addColorStop(0, "#ffffff55");
  glow.addColorStop(1, "#ffffff00");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

function paintFallback() {
  const canvas = $("fallback");
  if (!canvas || document.getElementById("stage").classList.contains("webgl-ready")) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(innerWidth * dpr);
  canvas.height = Math.round(innerHeight * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  paintAurora(ctx, { width: innerWidth, height: innerHeight, dpr });
}

/* ============================== 玻璃：空闲时接管 ============================== */
function startGlass() {
  const stage = $("stage");
  let system = null;
  try {
    system = createGlassSystem(stage, {
      scene: "aurora",
      artwork: paintAurora,
      material: "thick",
      motion: !matchMedia("(prefers-reduced-motion: reduce)").matches,
      audio: { enabled: false },
      onFallback() { canvasSafeHide(); }
    });
    window.lensSystem = system;
  } catch (err) {
    // 没有 WebGL2：保持 CSS 玻璃兜底，功能不受影响
    console.warn("[lens] WebGL 不可用，使用 CSS 玻璃兜底", err);
    canvasSafeHide();
  }

  function canvasSafeHide() {
    const c = $("fallback");
    if (c) c.style.display = "none";
  }

  // 渲染器就绪后会加上 webgl-ready，此时可以关掉 Canvas2D 兜底
  if (system) {
    const check = () => {
      if (stage.classList.contains("webgl-ready")) { canvasSafeHide(); return true; }
      return false;
    };
    if (!check()) {
      const mo = new MutationObserver(() => { if (check()) mo.disconnect(); });
      mo.observe(stage, { attributes: true, attributeFilter: ["class"] });
      setTimeout(() => mo.disconnect(), 6000);
    }
  }
}

/* ============================== 启动 ============================== */
tickClock();
setInterval(tickClock, 10_000);

renderAll();
bind();
paintFallback();

if ("requestIdleCallback" in window) {
  requestIdleCallback(startGlass, { timeout: 700 });
} else {
  setTimeout(startGlass, 180);
}
