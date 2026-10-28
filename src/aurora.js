/* 极光画法（经典脚本，不是模块）
 *
 * 为什么单独拎出来：
 *   app.js 是 type="module"，会被推迟到解析完之后才执行。浏览器在那之前会先画一帧
 *   空白页面 —— 这就是打开新标签页时"闪一下"的第一层原因。
 *   这个文件用经典 <script> 加载，在解析阶段同步执行，能在首帧之前就把极光画到
 *   兜底画布上，于是第一帧就已经是完整背景。
 *
 * 同时把画法挂到 window.LensAurora 上，供 app.js 交给 WebGL 渲染器当 artwork 复用。
 */
(function () {
  "use strict";

  const AURORA = ["#d3e8e3", "#badde8", "#9db7dc", "#929ee0", "#d3b4d2", "#eccbc1"];

  function paint(ctx, { width: w, height: h, dpr }) {
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
    paint(ctx, { width: w, height: h, dpr });
  }

  window.LensAurora = { paint, paintFallback };

  // 解析阶段立刻画一次：保证首帧就有背景
  paintFallback();
  window.addEventListener("resize", paintFallback, { passive: true });
})();
