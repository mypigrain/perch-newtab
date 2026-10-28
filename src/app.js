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
  ],
  archived: []
};

let DB = load() || clone(SEED);
// 老数据兼容：早期版本没有 archived
if (!Array.isArray(DB.archived)) DB.archived = [];
DB.occasional.forEach(o => { if (!o.group) o.group = "未分类"; });

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

/* 每个区域记一个"数据指纹"：指纹没变就不重绘。
   否则切换项目时固定区会被重建，入场动画会重播一遍。 */
const seen = { pinned: "", project: "", pills: "", sheet: "" };
const stable = v => JSON.stringify(v);
const tileSig = t => [t.id, t.title, t.url, t.size, t.icon];
const sigPinned = () => stable(DB.pinned.map(tileSig));
const sigProject = () => stable([DB.currentProject, currentTiles().map(tileSig)]);
const sigPills = () => stable([DB.currentProject, DB.projects.map(p => [p.id, p.name, (DB.projectTiles[p.id] || []).length])]);
const sigSheet = () => stable(DB.occasional.map(o => [o.id, o.title, o.url, o.icon, o.group]));

function renderPinned(force) {
  const s = sigPinned();
  if (!force && s === seen.pinned) return;
  seen.pinned = s;
  $("grid-pinned").innerHTML = DB.pinned.map((t, i) => tileHTML(t, "pinned", "", i)).join("");
}

function renderProject(force) {
  const s = sigProject();
  if (!force && s === seen.project) return;
  seen.project = s;
  $("grid-project").innerHTML = currentTiles().map((t, i) => tileHTML(t, "project", DB.currentProject, i)).join("");
}

function renderPills(force) {
  const s = sigPills();
  if (!force && s === seen.pills) return;
  seen.pills = s;
  const wrap = $("pills");
  wrap.innerHTML =
    DB.projects.map(p =>
      `<button class="pill lg-surface${p.id === DB.currentProject ? " on" : ""}" data-proj="${p.id}" type="button" data-glass="selected">${esc(p.name)}<span class="n mono">${(DB.projectTiles[p.id] || []).length}</span></button>`
    ).join("") + `<button class="pill ghost" id="newProj" type="button">＋ 新项目</button>`;
  wrap.querySelectorAll(".pill[data-proj]").forEach(el => {
    el.onclick = () => { DB.currentProject = el.dataset.proj; save(); renderAll(); };
  });
  $("newProj").onclick = addProject;
  wrap.querySelectorAll(".pill.on").forEach(el => el.style.setProperty("--glass-selection", "1"));
}

function renderSheet(force) {
  const s = sigSheet();
  if (!force && s === seen.sheet) return;
  seen.sheet = s;
  const groups = new Map();
  DB.occasional.forEach(o => {
    if (!groups.has(o.group)) groups.set(o.group, []);
    groups.get(o.group).push(o);
  });
  $("sheetTags").innerHTML = [...groups.keys()]
    .map(g => `<span data-group="${esc(g)}" title="右键可重命名 / 删除分组">${esc(g)}</span>`).join("");
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

function renderFooter() {
  const box = $("archiveBox");
  const n = DB.archived.length;
  box.hidden = n === 0;
  $("archCount").textContent = n ? `(${n})` : "";
}

function renderAll(force) {
  renderPills(force);
  renderPinned(force);
  renderProject(force);
  renderSheet(force);
  renderFooter();
}

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
  // DOM 已经是最新顺序，同步指纹，避免下次 renderAll 重绘并重播动画
  seen.pinned = sigPinned();
  seen.project = sigProject();
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
  const sitem = e.target.closest && e.target.closest(".sitem");
  if (sitem && sitem.dataset.occ) {
    e.preventDefault();
    openOccMenu(e, sitem.dataset.occ);
    return;
  }
  const tag = e.target.closest && e.target.closest("#sheetTags span");
  if (tag && tag.dataset.group) {
    e.preventDefault();
    openGroupMenu(e, tag.dataset.group);
    return;
  }
  const pill = e.target.closest && e.target.closest(".pill[data-proj]");
  if (pill) {
    e.preventDefault();
    openProjectMenu(e, pill.dataset.proj);
    return;
  }
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

/* ============================== 项目菜单 / 归档 ============================== */
function openProjectMenu(e, id) {
  const p = DB.projects.find(x => x.id === id);
  if (!p) return;
  ctxTarget = null; // 这条菜单不走磁贴那套
  const el = $("ctx");
  el.innerHTML = `
    <button class="cit" data-pact="rename">重命名项目</button>
    <button class="cit" data-pact="archive">归档「${esc(p.name)}」</button>`;
  el.classList.add("on");
  el.style.left = Math.min(e.clientX, innerWidth - 210) + "px";
  el.style.top = Math.min(e.clientY, innerHeight - 150) + "px";
  el.querySelectorAll("[data-pact]").forEach(b => {
    b.onclick = () => {
      const act = b.dataset.pact;
      closeCtx();
      if (act === "rename") renameProject(id);
      else if (act === "archive") archiveProject(id);
    };
  });
}

function renameProject(id) {
  const p = DB.projects.find(x => x.id === id);
  if (!p) return;
  const name = prompt("项目名称：", p.name);
  if (!name || !name.trim()) return;
  p.name = name.trim().slice(0, 40);
  save();
  renderAll(true);
}

function archiveProject(id) {
  const p = DB.projects.find(x => x.id === id);
  if (!p) return;
  if (DB.projects.length <= 1) { toast("至少要保留一个项目"); return; }
  const tiles = DB.projectTiles[p.id] || [];
  if (!confirm(`归档「${p.name}」？\n\n${tiles.length} 个磁贴会收进档案库，随时可以恢复。`)) return;
  DB.archived.unshift({ id: p.id, name: p.name, archivedAt: new Date().toISOString(), tiles });
  delete DB.projectTiles[p.id];
  DB.projects = DB.projects.filter(x => x.id !== id);
  if (DB.currentProject === id) DB.currentProject = DB.projects[0].id;
  save();
  renderAll(true);
  toast(`已归档「${p.name}」，可在底部档案库恢复`);
}

function restoreProject(id) {
  const i = DB.archived.findIndex(a => a.id === id);
  if (i < 0) return;
  const a = DB.archived[i];
  let pid = a.id;
  while (DB.projects.some(p => p.id === pid)) pid = uid("p");
  DB.archived.splice(i, 1);
  DB.projects.push({ id: pid, name: a.name });
  DB.projectTiles[pid] = Array.isArray(a.tiles) ? a.tiles : [];
  DB.currentProject = pid;
  save();
  renderAll(true);
  renderArchive();
  toast(`已恢复「${a.name}」`);
}

function dropArchived(id) {
  const i = DB.archived.findIndex(a => a.id === id);
  if (i < 0) return;
  const a = DB.archived[i];
  if (!confirm(`永久删除「${a.name}」？删除后无法恢复。`)) return;
  DB.archived.splice(i, 1);
  save();
  renderAll(true);
  renderArchive();
  toast(`已删除「${a.name}」`);
}

function fmtDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

function renderArchive() {
  const list = $("archList");
  if (!DB.archived.length) {
    list.innerHTML = `<div class="arch-empty">还没有归档的项目。右键项目标签即可归档。</div>`;
    return;
  }
  list.innerHTML = DB.archived.map(a => `
    <div class="arch-item">
      <span class="an">${esc(a.name)}</span>
      <span class="am mono">${(a.tiles || []).length} 个页面 · ${fmtDate(a.archivedAt)}</span>
      <span class="aa">
        <button class="lg-surface minibtn" data-restore="${a.id}" type="button" data-glass="small">恢复</button>
        <button class="lg-surface minibtn" data-drop="${a.id}" type="button" data-glass="small">删除</button>
      </span>
    </div>`).join("");
  list.querySelectorAll("[data-restore]").forEach(b => { b.onclick = () => restoreProject(b.dataset.restore); });
  list.querySelectorAll("[data-drop]").forEach(b => { b.onclick = () => dropArchived(b.dataset.drop); });
}

function openArchive() {
  renderArchive();
  $("veil").classList.add("on");
  $("archiveDlg").classList.add("on");
}

/* ============================== 收藏夹导入 ============================== */
function bookmarkIcon(url) {
  const u = url.toLowerCase();
  if (/docs|wiki|confluence|notion|yuque/.test(u)) return "doc";
  if (/jira|board|kanban/.test(u)) return "grid";
  if (/gitlab|github|bitbucket|code/.test(u)) return "code";
  if (/mail|outlook|gmail|exmail/.test(u)) return "mail";
  if (/grafana|monitor|dashboard|kibana|metric/.test(u)) return "gauge";
  if (/jenkins|pipeline|deploy|build/.test(u)) return "layers";
  if (/calendar|schedule/.test(u)) return "clock";
  return "link";
}

function collectBookmarks(nodes, group, out) {
  for (const n of nodes) {
    if (n.url) {
      if (/^https?:\/\//i.test(n.url)) out.push({ title: n.title || n.url, url: n.url, group: group || "未分类" });
    } else if (n.children) {
      collectBookmarks(n.children, group || n.title || "未命名", out);
    }
  }
}

function hostOf(url) {
  try { return new URL(url).hostname; } catch { return ""; }
}

const bm = { items: [], sel: new Set(), extra: 0 };

async function openBookmarkDialog() {
  const api = globalThis.chrome && chrome.bookmarks;
  if (!api || !api.getTree) { toast("只有在扩展里才能读取收藏夹"); return; }

  let tree;
  try { tree = await api.getTree(); }
  catch { toast("读取收藏夹失败，检查扩展是否被撤销了书签权限"); return; }

  const all = [];
  collectBookmarks(tree, "", all);
  if (!all.length) { toast("收藏夹是空的"); return; }

  const existing = new Set();
  const remember = t => { if (t && t.url) existing.add(t.url); };
  DB.pinned.forEach(remember);
  DB.occasional.forEach(remember);
  Object.values(DB.projectTiles).forEach(list => list.forEach(remember));
  DB.archived.forEach(a => (a.tiles || []).forEach(remember));

  const fresh = [];
  const seenUrl = new Set();
  for (const b of all) {
    if (existing.has(b.url) || seenUrl.has(b.url)) continue;
    seenUrl.add(b.url);
    fresh.push(b);
  }
  if (!fresh.length) { toast(`${all.length} 条书签都已经在页面上了`); return; }

  const MAX = 400;
  bm.items = fresh.slice(0, MAX);
  bm.extra = fresh.length - bm.items.length;
  bm.sel = new Set(bm.items.map((_, i) => i));

  renderBookmarkDialog();
  $("veil").classList.add("on");
  $("bmDlg").classList.add("on");
}

function renderBookmarkDialog() {
  // 目标下拉：固定区 / 每个项目 / 每个已有分组 / 新建分组
  const opts = ['<option value="pinned">固定区</option>'];
  DB.projects.forEach(p => opts.push(`<option value="project:${p.id}">项目 · ${esc(p.name)}</option>`));
  [...new Set(DB.occasional.map(o => o.group))]
    .forEach(g => opts.push(`<option value="occ:${esc(g)}">偶尔用 · ${esc(g)}</option>`));
  opts.push('<option value="occ:__new__">偶尔用 · 新建分组…</option>');
  const dest = $("bmDest");
  dest.innerHTML = opts.join("");
  dest.value = `project:${DB.currentProject}`;

  $("bmExtra").textContent = bm.extra > 0 ? `（只列出前 ${bm.items.length} 条，还有 ${bm.extra} 条可以再导一次）` : "";

  const byFolder = new Map();
  bm.items.forEach((b, i) => {
    const g = b.group || "未分类";
    if (!byFolder.has(g)) byFolder.set(g, []);
    byFolder.get(g).push(i);
  });

  $("bmList").innerHTML = [...byFolder.entries()].map(([folder, idxs]) => `
    <div class="bm-group">
      <label class="bm-ghead">
        <input type="checkbox" ${idxs.every(i => bm.sel.has(i)) ? "checked" : ""}>
        <span>${esc(folder)}</span><span class="bm-n mono">${idxs.length}</span>
      </label>
      ${idxs.map(i => `
        <label class="bm-item">
          <input type="checkbox" data-idx="${i}" ${bm.sel.has(i) ? "checked" : ""}>
          ${icon(bookmarkIcon(bm.items[i].url))}
          <span class="bm-t">${esc(bm.items[i].title)}</span>
          <span class="bm-u mono">${esc(hostOf(bm.items[i].url))}</span>
        </label>`).join("")}
    </div>`).join("");

  $("bmList").querySelectorAll(".bm-group").forEach(groupEl => {
    const head = groupEl.querySelector(".bm-ghead input");
    const boxes = [...groupEl.querySelectorAll(".bm-item input")];
    head.onchange = () => {
      boxes.forEach(box => {
        box.checked = head.checked;
        const i = Number(box.dataset.idx);
        head.checked ? bm.sel.add(i) : bm.sel.delete(i);
      });
      updateBmCount();
    };
    boxes.forEach(box => {
      box.onchange = () => {
        const i = Number(box.dataset.idx);
        box.checked ? bm.sel.add(i) : bm.sel.delete(i);
        head.checked = boxes.every(b => b.checked);
        updateBmCount();
      };
    });
  });
  updateBmCount();
}

function updateBmCount() {
  $("bmCount").textContent = `已选 ${bm.sel.size} / ${bm.items.length}`;
}

function confirmBookmarks() {
  if (!bm.sel.size) { toast("至少选一个"); return; }
  const dest = $("bmDest").value;
  let target;
  if (dest === "pinned") target = { kind: "pinned" };
  else if (dest.startsWith("project:")) target = { kind: "project", id: dest.slice(8) };
  else {
    let g = dest.slice(4);
    if (g === "__new__") {
      const name = prompt("新分组名称：", "");
      if (!name || !name.trim()) return;
      g = name.trim().slice(0, 20);
    }
    target = { kind: "occ", group: g };
  }

  const picked = [...bm.sel].sort((a, b) => a - b).map(i => bm.items[i]);
  picked.forEach(b => {
    const t = { id: uid("b"), title: (b.title || b.url).slice(0, 60), url: b.url, icon: bookmarkIcon(b.url), size: "s" };
    if (target.kind === "pinned") DB.pinned.push(t);
    else if (target.kind === "project") (DB.projectTiles[target.id] ||= []).push(t);
    else DB.occasional.push({ ...t, group: target.group });
  });
  save();
  renderAll(true);
  if (target.kind === "occ") $("sheet").classList.add("open");
  const where = target.kind === "pinned" ? "固定区"
    : target.kind === "project" ? `项目「${(DB.projects.find(p => p.id === target.id) || {}).name || ""}」`
      : `偶尔用 · ${target.group}`;
  closeAll();
  toast(`已把 ${picked.length} 条书签导入${where}`);
}

/* ============================== 偶尔用的分组 ============================== */
function allGroups() {
  return [...new Set(DB.occasional.map(o => o.group))];
}

function moveToGroup(id, group) {
  const item = DB.occasional.find(o => o.id === id);
  if (!item) return;
  item.group = group;
  save();
  renderAll(true);
  toast(`已移到「${group}」`);
}

function renameGroup(from) {
  const name = prompt("分组名：", from);
  if (!name || !name.trim() || name.trim() === from) return;
  const to = name.trim().slice(0, 20);
  DB.occasional.forEach(o => { if (o.group === from) o.group = to; });
  save();
  renderAll(true);
}

function dropGroup(group) {
  const n = DB.occasional.filter(o => o.group === group).length;
  if (!confirm(`删除分组「${group}」？\n组内 ${n} 个页面会移到「未分类」，不会丢。`)) return;
  DB.occasional.forEach(o => { if (o.group === group) o.group = "未分类"; });
  save();
  renderAll(true);
}

function openOccMenu(e, id) {
  const item = DB.occasional.find(o => o.id === id);
  if (!item) return;
  ctxTarget = null;
  const others = allGroups().filter(g => g !== item.group);
  const el = $("ctx");
  el.innerHTML =
    others.map(g => `<button class="cit" data-move="${esc(g)}">移到「${esc(g)}」</button>`).join("") +
    `<button class="cit" data-move="__new__">移到新分组…</button>` +
    `<div class="sep"></div><button class="cit danger" data-del="1">删除这一项</button>`;
  el.classList.add("on");
  el.style.left = Math.min(e.clientX, innerWidth - 210) + "px";
  el.style.top = Math.min(e.clientY, innerHeight - 250) + "px";
  el.querySelectorAll("[data-move]").forEach(b => {
    b.onclick = () => {
      let g = b.dataset.move;
      closeCtx();
      if (g === "__new__") {
        const name = prompt("新分组名称：", "");
        if (!name || !name.trim()) return;
        g = name.trim().slice(0, 20);
      }
      moveToGroup(id, g);
    };
  });
  el.querySelector("[data-del]").onclick = () => {
    closeCtx();
    const i = DB.occasional.findIndex(o => o.id === id);
    if (i >= 0) DB.occasional.splice(i, 1);
    save();
    renderAll(true);
    toast("已删除");
  };
}

function openGroupMenu(e, group) {
  ctxTarget = null;
  const el = $("ctx");
  el.innerHTML =
    `<button class="cit" data-gact="rename">重命名分组</button>` +
    `<button class="cit danger" data-gact="del">删除分组</button>`;
  el.classList.add("on");
  el.style.left = Math.min(e.clientX, innerWidth - 210) + "px";
  el.style.top = Math.min(e.clientY, innerHeight - 140) + "px";
  el.querySelectorAll("[data-gact]").forEach(b => {
    b.onclick = () => {
      const act = b.dataset.gact;
      closeCtx();
      if (act === "rename") renameGroup(group);
      else dropGroup(group);
    };
  });
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
  $("archiveDlg").classList.remove("on");
  $("bmDlg").classList.remove("on");
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
  syncGroupField();
  setTimeout(() => $("mTitle").focus(), 40);
}

/** 「偶尔用」才需要选分组，其余分区把分组字段藏起来。 */
function syncGroupField() {
  const isOcc = $("mZone").value === "occasional";
  $("mGroupWrap").hidden = !isOcc;
  if (!isOcc) return;
  const groups = allGroups();
  $("mGroup").innerHTML =
    groups.map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join("") +
    `<option value="__new__">＋ 新建分组…</option>`;
  if (!groups.length) $("mGroup").value = "__new__";
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
  else {
    let group = $("mGroup").value;
    if (!group || group === "__new__") {
      const name = prompt("新分组名称：", "未分类");
      if (!name || !name.trim()) return;
      group = name.trim().slice(0, 20);
    }
    DB.occasional.push({ ...t, group });
  }
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

/* ============================== 布局导入 / 导出 ============================== */
const FORMAT = "lens-newtab";
const FORMAT_VERSION = 1;
let uidCounter = 0;
const uid = prefix => `${prefix}${Date.now().toString(36)}${(++uidCounter).toString(36)}`;

function cleanTile(raw, used) {
  if (!raw || typeof raw !== "object") return null;
  const url = typeof raw.url === "string" ? raw.url.trim() : "";
  if (!/^https?:\/\//i.test(url)) return null;
  const title = typeof raw.title === "string" && raw.title.trim() ? raw.title.trim().slice(0, 80) : url;
  const size = ["s", "w", "b"].includes(raw.size) ? raw.size : "s";
  const iconName = ICONS[raw.icon] ? raw.icon : "link";
  const id = typeof raw.id === "string" && raw.id && !used.has(raw.id) ? raw.id : uid("t");
  used.add(id);
  return { id, title, url, icon: iconName, size };
}

/** 把任意来源的 JSON 收敛成合法的 DB；不认识的东西直接丢掉，不抛异常到 UI 之外。 */
function normalizeLayout(raw) {
  const src = raw && typeof raw === "object" && raw.data && typeof raw.data === "object" ? raw.data : raw;
  if (!src || typeof src !== "object") throw new Error("文件结构不对");
  if (!Array.isArray(src.projects) || !src.projects.length) throw new Error("缺少 projects 列表");

  const projects = src.projects.slice(0, 30).map((p, i) => ({
    id: typeof p?.id === "string" && p.id ? p.id : `p${i + 1}`,
    name: typeof p?.name === "string" && p.name.trim() ? p.name.trim().slice(0, 40) : `项目 ${i + 1}`
  }));
  const seenP = new Set();
  projects.forEach((p, i) => {
    let id = p.id;
    let n = 0;
    while (seenP.has(id)) id = `p${i + 1}_${++n}`;
    seenP.add(id);
    p.id = id;
  });

  const used = new Set();
  const pinned = (Array.isArray(src.pinned) ? src.pinned : []).map(t => cleanTile(t, used)).filter(Boolean);

  const srcTiles = src.projectTiles && typeof src.projectTiles === "object" ? src.projectTiles : {};
  const projectTiles = {};
  projects.forEach(p => {
    const list = Array.isArray(srcTiles[p.id]) ? srcTiles[p.id] : [];
    projectTiles[p.id] = list.map(t => cleanTile(t, used)).filter(Boolean);
  });

  const occasional = (Array.isArray(src.occasional) ? src.occasional : [])
    .map(t => {
      const cleaned = cleanTile(t, used);
      if (!cleaned) return null;
      const group = typeof t.group === "string" && t.group.trim() ? t.group.trim().slice(0, 20) : "未分类";
      return { ...cleaned, group };
    })
    .filter(Boolean);

  const archived = (Array.isArray(src.archived) ? src.archived : [])
    .map(a => {
      if (!a || typeof a !== "object") return null;
      const name = typeof a.name === "string" && a.name.trim() ? a.name.trim().slice(0, 40) : "未命名项目";
      const tiles = (Array.isArray(a.tiles) ? a.tiles : []).map(t => cleanTile(t, used)).filter(Boolean);
      const archivedAt = typeof a.archivedAt === "string" ? a.archivedAt : new Date().toISOString();
      return { id: typeof a.id === "string" && a.id ? a.id : uid("a"), name, archivedAt, tiles };
    })
    .filter(Boolean);

  const currentProject = projects.some(p => p.id === src.currentProject) ? src.currentProject : projects[0].id;
  return { currentProject, projects, pinned, projectTiles, occasional, archived };
}

function exportLayout() {
  const payload = {
    format: FORMAT,
    version: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    data: DB
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `lens-newtab-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  const n = DB.pinned.length + DB.occasional.length + Object.values(DB.projectTiles).reduce((s, l) => s + l.length, 0);
  toast(`已导出 ${DB.projects.length} 个项目 · ${n} 个页面`);
}

function importLayout(file) {
  const reader = new FileReader();
  reader.onload = () => {
    let next;
    try {
      const parsed = JSON.parse(String(reader.result));
      if (parsed && parsed.format && parsed.format !== FORMAT) throw new Error("不是本扩展的布局文件");
      next = normalizeLayout(parsed);
    } catch (err) {
      toast(`导入失败：${err && err.message ? err.message : "无法解析"}`);
      return;
    }
    const n = next.pinned.length + next.occasional.length + Object.values(next.projectTiles).reduce((s, l) => s + l.length, 0);
    if (!confirm(`将导入 ${next.projects.length} 个项目、${n} 个页面，并覆盖当前布局。继续？`)) return;
    DB = next;
    save();
    renderAll(true);
    toast(`已导入 ${next.projects.length} 个项目 · ${n} 个页面`);
  };
  reader.onerror = () => toast("读取文件失败");
  reader.readAsText(file);
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
  $("sheeth").onclick = () => {
    const sheet = $("sheet");
    const open = sheet.classList.toggle("open");
    // 展开后可能超出可视区，滚到能看全的位置（高度不变，不会触发画布 resize）
    if (open) setTimeout(() => sheet.scrollIntoView({ block: "nearest", behavior: "smooth" }), 260);
  };
  $("veil").onclick = closeAll;
  document.querySelectorAll("[data-add]").forEach(b => {
    b.onclick = e => { e.stopPropagation(); openAdd(b.dataset.add); };
  });
  $("mCancel").onclick = closeAll;
  $("mOk").onclick = submitAdd;
  $("openAll").onclick = () => toast(`将打开「${currentProject().name}」的 ${currentTiles().length} 个页面`);
  $("openAllPinned").onclick = () => toast(`固定区共 ${DB.pinned.length} 个页面`);
  $("reset").onclick = () => {
    if (confirm("恢复初始示例数据？当前布局会被覆盖，建议先导出备份。")) {
      DB = clone(SEED);
      save();
      renderAll(true);
      toast("已恢复示例数据");
    }
  };
  $("export").onclick = exportLayout;
  $("import").onclick = () => $("importFile").click();
  $("importFile").addEventListener("change", e => {
    const file = e.target.files && e.target.files[0];
    if (file) importLayout(file);
    e.target.value = ""; // 允许连续导入同一个文件
  });
  $("importBookmarks").onclick = openBookmarkDialog;
  $("bmCancel").onclick = closeAll;
  $("bmOk").onclick = confirmBookmarks;
  $("mZone").addEventListener("change", syncGroupField);
  $("archiveBox").onclick = openArchive;
  $("archClose").onclick = closeAll;
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
  window.addEventListener("resize", () => { closeCtx(); });
}

/* ============================== 背景 ============================== */
/* 极光画法在 src/aurora.js（经典脚本）：它在解析阶段就把背景画到兜底画布上，
   保证首帧不是空白，同时把画法暴露出来给 WebGL 渲染器当 artwork 复用。 */
const aurora = window.LensAurora;
if (!aurora) console.warn("[lens] aurora.js 没有加载，背景会退化成纯色");
const paintAurora = aurora ? aurora.paint : () => {};
const paintFallback = aurora ? aurora.paintFallback : () => {};

/** WebGL 出第一帧之后再淡出兜底画布，避免"CSS 玻璃 → 真玻璃"之间闪一帧空白。 */
function fadeFallback() {
  const c = $("fallback");
  if (!c) return;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    c.style.opacity = "0";
    setTimeout(() => { c.style.display = "none"; }, 280);
  }));
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
      audio: { enabled: false }
      // 注意：WebGL 失败时不要隐藏兜底画布——它是唯一的背景
    });
    window.lensSystem = system;
  } catch (err) {
    // 没有 WebGL2：保持 Canvas2D 极光 + CSS 玻璃，功能不受影响
    console.warn("[lens] WebGL 不可用，使用 CSS 玻璃兜底", err);
    return;
  }

  // 渲染器就绪后会加上 webgl-ready
  if (stage.classList.contains("webgl-ready")) { fadeFallback(); return; }
  const mo = new MutationObserver(() => {
    if (stage.classList.contains("webgl-ready")) { mo.disconnect(); fadeFallback(); }
  });
  mo.observe(stage, { attributes: true, attributeFilter: ["class"] });
  // 兜底：6 秒内没就绪就保持现状，别让观察器一直挂着
  setTimeout(() => mo.disconnect(), 6000);
}

/* ============================== 启动 ============================== */
tickClock();
setInterval(tickClock, 10_000);

renderAll();
bind();
paintFallback();

// 第一帧画完就立刻上 WebGL：页面是本地文件，没必要等空闲——
// 等空闲会让"CSS 玻璃兜底"的状态多停留几百毫秒，看起来就像闪一下。
requestAnimationFrame(() => requestAnimationFrame(startGlass));
