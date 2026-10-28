/* 极光画法（经典脚本，不是模块）
 *
 * 为什么单独拎出来：
 *   app.js 是 type="module"，会被推迟到解析完之后才执行。浏览器在那之前会先画一帧
 *   空白页面 —— 这就是打开新标签页时"闪一下"的第一层原因。
 *   这个文件用经典 <script> 加载，在解析阶段同步执行，能在首帧之前就把极光画到
 *   兜底画布上，于是第一帧就已经是完整背景。
 *
 * 同时把画法挂到 window.PerchAurora 上，供 app.js 交给 WebGL 渲染器当 artwork 复用。
 * 渲染器回调时会带上 scene（'aurora' / 'ocean'），据此切换配色。
 */
(function () {
  "use strict";

  const THEME_KEY = "perch:theme";

  const PALETTES = {
    aurora: {
      stops: ["#d3e8e3", "#badde8", "#9db7dc", "#929ee0", "#d3b4d2", "#eccbc1"],
      glow: "rgba(255,255,255,0.33)",
      shadow: "#38486830",
      edge: "rgba(255,255,255,0.27)",
      edge2: "rgba(255,255,255,0.15)"
    },
    ocean: {
      stops: ["#0a1a28", "#12324c", "#1b4a67", "#24607f", "#2f7a96", "#4fa8c0"],
      glow: "rgba(168,228,255,0.16)",
      shadow: "#00101866",
      edge: "rgba(159,224,255,0.20)",
      edge2: "rgba(159,224,255,0.12)"
    }
  };

  const paletteFor = scene => PALETTES[scene === "ocean" ? "ocean" : "aurora"];

  function paint(ctx, { width: w, height: h, dpr, scene }) {
    const p = paletteFor(scene);
    const A = p.stops;

    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, A[0]);
    g.addColorStop(.5, A[1]);
    g.addColorStop(1, A[5]);
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
      f.addColorStop(1, A[5]);
      ctx.save();
      ctx.shadowColor = p.shadow;
      ctx.shadowBlur = 27 * dpr;
      ctx.shadowOffsetY = -7 * dpr;
      ctx.fillStyle = f;
      ctx.fill(shape);
      ctx.restore();
      ctx.save();
      ctx.clip(shape);
      ctx.filter = `blur(${15 * dpr}px)`;
      ctx.strokeStyle = p.edge;
      ctx.lineWidth = 37 * dpr;
      ctx.stroke(contour);
      ctx.filter = "none";
      ctx.strokeStyle = p.edge2;
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke(contour);
      ctx.restore();
    };

    ribbon(-.31, A[1], A[2]);
    ribbon(-.10, A[2], A[3]);
    ribbon(.18, A[3], A[4]);
    ribbon(.44, A[4], A[5]);

    const glow = ctx.createRadialGradient(w * .12, h * .08, 0, w * .12, h * .08, w * .85);
    glow.addColorStop(0, p.glow);
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  }

  function savedDark() {
    try { return localStorage.getItem(THEME_KEY) === "dark"; } catch { return false; }
  }

  /** 把极光画到兜底画布；WebGL 接管后就不必再画了。 */
  function paintFallback() {
    const canvas = document.getElementById("fallback");
    const stage = document.getElementById("stage");
    if (!canvas || !stage) return;
    if (stage.classList.contains("webgl-ready")) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paint(ctx, { width: w, height: h, dpr, scene: savedDark() ? "ocean" : "aurora" });
  }

  /** 把已经画好的兜底画布直接 blit 给渲染器，省掉重跑贝塞尔 + 阴影 + 模糊的开销。 */
  function blit(ctx, { width, height }) {
    const src = document.getElementById("fallback");
    if (!src || !src.width || !src.height) return false;
    try {
      ctx.drawImage(src, 0, 0, width, height);
      return true;
    } catch {
      return false;
    }
  }

  window.PerchAurora = { paint, blit, paintFallback, paletteFor, savedDark, THEME_KEY };

  // 记住的主题要在首帧之前就生效，否则深色用户会先看到一片浅色
  document.body.classList.toggle("dark", savedDark());
  paintFallback();
  window.addEventListener("resize", paintFallback, { passive: true });
})();
