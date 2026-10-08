// Deterministic timeline: window.renderAt(seconds) draws exactly one frame.
// render.mjs steps through it frame by frame; opening index.html in a browser
// plays it live (append ?t=12.5 to freeze on a moment).
(() => {
  const C = window.CONFIG, S = window.SHEET, T = C.text;
  const params = new URLSearchParams(location.search);
  if (params.get("mode")) C.whatsappMode = params.get("mode");
  const $ = (id) => document.getElementById(id);

  // ── easing helpers ─────────────────────────────────────────────────
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const seg = (t, a, d, f = ease) => f(clamp((t - a) / d));
  const lerp = (a, b, k) => a + (b - a) * k;
  // fade in at [a, a+d], fade out at [b, b+d2]
  const win = (t, a, d, b, d2 = d) => seg(t, a, d) * (1 - seg(t, b, d2));
  // piecewise-linear-with-easing over [[t, value], ...]
  const keys = (t, ks) => {
    if (t <= ks[0][0]) return ks[0][1];
    for (let i = 0; i < ks.length - 1; i++) {
      const [t0, v0] = ks[i], [t1, v1] = ks[i + 1];
      if (t <= t1) return lerp(v0, v1, ease((t - t0) / (t1 - t0)));
    }
    return ks[ks.length - 1][1];
  };

  // ── build the sheet grid ───────────────────────────────────────────
  const GRID = { x: 40, y: 180 };            // grid origin in stage coords
  const GUT = 46, COLH = 22, HEADH = 34, ROWH = 30;
  const W = [190, 80, 190, 118, 150, 200, 210, 150, 140, 150, 110, 100, 120];
  const colX = [GUT]; W.forEach((w) => colX.push(colX[colX.length - 1] + w));
  const rowY = (i) => COLH + HEADH + ROWH * i; // data row i (0-based)
  const grid = $("grid");
  const el = (cls, css, html = "") => {
    const d = document.createElement("div");
    d.className = cls; Object.assign(d.style, css); d.innerHTML = html; grid.appendChild(d); return d;
  };
  const px = (n) => n + "px";
  $("docTitle").textContent = S.title;

  el("colhead", { left: 0, top: 0, width: px(GUT), height: px(COLH) });
  W.forEach((w, c) => el("colhead", { left: px(colX[c]), top: 0, width: px(w), height: px(COLH) }, String.fromCharCode(65 + c)));
  el("rowhead", { left: 0, top: px(COLH), width: px(GUT), height: px(HEADH) }, "1");
  S.headers.forEach((h, c) => el("cell th", { left: px(colX[c]), top: px(COLH), width: px(W[c]), height: px(HEADH) }, `<span>${h}</span>`));
  el("cell", { left: px(colX[12]), top: px(COLH), width: px(W[12]), height: px(HEADH) });

  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const branchFills = [];
  let demoLinkSpan = null;
  const demoIdx = C.demoRow - S.firstRow;
  S.rows.forEach((r, i) => {
    const y = rowY(i), band = i % 2 === 1 ? " band" : "";
    el("rowhead", { left: 0, top: px(y), width: px(GUT), height: px(ROWH) }, String(S.firstRow + i));
    const vals = [...r, r[6], "", ""];
    vals.forEach((v, c) => {
      let html = esc(v);
      if (c === 7) html = `<span class="blur">${esc(v)}</span>`;
      if (c === 9) html = `<a>${esc(v)}</a>`;
      if (c === 8) html = `<div class="branchFill"></div><span>${esc(v)}</span>`;
      const d = el("cell" + band, { left: px(colX[c]), top: px(y), width: px(W[c]), height: px(ROWH) }, html);
      if (c === 8 && v) branchFills.push(d.firstChild);
      if (c === 9 && i === demoIdx) demoLinkSpan = d.querySelector("a");
    });
    el("cell", { left: px(colX[12]), top: px(y), width: px(W[12]), height: px(ROWH) });
  });
  el("tableEdge", { left: px(GUT), top: px(COLH), width: px(colX[12] - GUT), height: px(HEADH + ROWH * S.rows.length) });

  // geometry in stage coords
  const cellRect = (c, i) => ({ x: GRID.x + colX[c], y: GRID.y + rowY(i), w: W[c], h: ROWH });
  const colRect = { x: GRID.x + colX[8], y: GRID.y + COLH, w: W[8], h: HEADH + ROWH * S.rows.length };
  const rowRect = { x: GRID.x + GUT, y: GRID.y + rowY(demoIdx), w: colX[12] - GUT, h: ROWH };
  const nameCell = cellRect(6, demoIdx), linkCell = cellRect(9, demoIdx);
  const linkTextW = demoLinkSpan.getBoundingClientRect().width;
  const linkPt = { x: linkCell.x + 7 + linkTextW / 2, y: linkCell.y + ROWH / 2 + 1 };
  const namePt = { x: nameCell.x + 7 + 26, y: nameCell.y + ROWH / 2 + 2 };
  const demoName = S.rows[demoIdx][6];

  // ── static content ─────────────────────────────────────────────────
  $("introTop").textContent = T.introTop;
  $("introBottom").textContent = T.introBottom;
  $("u1Num").textContent = T.u1Num; $("u1Title").textContent = T.u1Title;
  $("u1Sub").textContent = T.u1Sub; $("u1Sub2").textContent = T.u1Sub2;
  $("u1Chips").innerHTML = T.u1Chips.map((c) => `<div class="chip">${c}</div>`).join("");
  $("u2Num").textContent = T.u2Num; $("u2Title").textContent = T.u2Title;
  $("u2Sub").textContent = T.u2Sub;
  $("u2Sub2").textContent = C.whatsappMode === "prefill" ? T.u2Sub2Prefill : T.u2Sub2Chat;
  const check = `<svg width="26" height="26" viewBox="0 0 26 26"><path pathLength="1" d="M5 13.5l5.2 5.2L21 7.8"/></svg>`;
  $("outroList").innerHTML = T.outro.map((o) => `<div class="oitem">${check}<span>${o}</span></div>`).join("");
  $("lcUrl").textContent = C.demoLinkMasked;
  $("waName").textContent = demoName;
  $("waAv").textContent = demoName[0].toUpperCase();
  $("waPhone").textContent = C.demoPhoneMasked;
  $("waList").innerHTML = Array.from({ length: 10 }, (_, i) =>
    `<div class="wa-item"><div class="av"></div><div class="ln"><div class="l1" style="width:${40 + ((i * 37) % 35)}%"></div><div class="l2" style="width:${60 + ((i * 53) % 30)}%"></div></div></div>`).join("");
  const input = $("waInput");
  let hlEl;
  if (C.whatsappMode === "prefill") {
    const [a, b] = C.messageTemplate.split("{name}");
    input.innerHTML = `<span>${esc(a)}<span class="hl" id="hlName">${esc(demoName)}</span>${esc(b || "")}</span>`;
    hlEl = $("hlName");
  } else {
    input.classList.add("ph"); input.textContent = "Type a message";
    $("waName").classList.add("hl"); hlEl = $("waName");
  }

  const chips = [...document.querySelectorAll(".chip")];
  const oitems = [...document.querySelectorAll(".oitem")];

  // ── frame renderer ─────────────────────────────────────────────────
  const setRect = (r, o) => { r.setAttribute("x", o.x); r.setAttribute("y", o.y); r.setAttribute("width", o.w); r.setAttribute("height", o.h); };
  const show = (e, o, dy = 0) => { e.style.opacity = o; e.style.transform = dy ? `translateY(${dy}px)` : ""; };
  const capIn = (e, t, a, b) => { const k = seg(t, a, 0.55); show(e, k * (1 - seg(t, b, 0.4)), (1 - k) * 10); };

  window.renderAt = (t) => {
    // camera
    const s = keys(t, [[0, 1], [3.0, 1.02], [4.7, 1.7], [10.8, 1.76], [12.3, 1.8], [15.3, 1.86], [21.4, 1.86], [22.8, 1]]);
    const cx = keys(t, [[0, 960], [3.0, 960], [4.7, 1444], [10.8, 1444], [12.3, 1300], [21.4, 1300], [22.8, 960]]);
    const cy = keys(t, [[0, 540], [3.0, 540], [4.7, 515], [10.8, 515], [12.3, 495], [21.4, 495], [22.8, 540]]);
    // keep the frame inside the sheet window once zoomed in (no dark edges)
    const kz = clamp((s - 1) / 0.12);
    const tx = lerp(clamp(960 - cx * s, 1920 - 1920 * s, 0), clamp(960 - cx * s, 1920 - 1880 * s, -40 * s), kz);
    const ty = lerp(clamp(540 - cy * s, 1080 - 1080 * s, 0), clamp(540 - cy * s, 1080 - 1040 * s, -40 * s), kz);
    $("stage").style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    const toScreen = (p) => ({ x: tx + p.x * s, y: ty + p.y * s });

    // focus: column I → demo row
    const m = seg(t, 10.9, 1.3);
    const fr = { x: lerp(colRect.x, rowRect.x, m), y: lerp(colRect.y, rowRect.y, m), w: lerp(colRect.w, rowRect.w, m), h: lerp(colRect.h, rowRect.h, m) };
    const fxOut = 1 - seg(t, 15.3, 0.5);
    const dimA = 0.30 * seg(t, 3.6, 1.0) * fxOut;
    Object.assign($("dim").style, { left: px(fr.x), top: px(fr.y), width: px(fr.w), height: px(fr.h), boxShadow: `0 0 0 4000px rgba(14,17,18,${dimA})` });
    const focus = $("focusRect"); setRect(focus, fr);
    focus.style.strokeDashoffset = 1 - seg(t, 3.9, 1.0);
    focus.style.opacity = lerp(1, 0.55, m) * fxOut;

    branchFills.forEach((f, k) => { f.style.opacity = 0.16 * seg(t, 5.0 + 0.05 * k, 0.35) * (1 - seg(t, 10.6, 0.6)); });

    // name → link
    const cn = $("cellName"), cl = $("cellLink"), conn = $("connector");
    setRect(cn, { x: nameCell.x + 1, y: nameCell.y + 1, w: nameCell.w - 2, h: ROWH - 2 });
    setRect(cl, { x: linkCell.x + 1, y: linkCell.y + 1, w: linkCell.w - 2, h: ROWH - 2 });
    cn.style.strokeDashoffset = 1 - seg(t, 12.8, 0.5); cn.style.opacity = fxOut;
    cl.style.strokeDashoffset = 1 - seg(t, 14.25, 0.5); cl.style.opacity = fxOut;
    const a = { x: nameCell.x + nameCell.w / 2, y: nameCell.y - 2 }, b = { x: linkCell.x + linkCell.w / 2, y: linkCell.y - 2 };
    conn.setAttribute("d", `M${a.x},${a.y} C${a.x + 60},${a.y - 46} ${b.x - 60},${b.y - 46} ${b.x},${b.y}`);
    conn.style.strokeDashoffset = 1 - seg(t, 13.6, 0.75); conn.style.opacity = fxOut;
    const dot = $("connDot"); dot.setAttribute("cx", b.x); dot.setAttribute("cy", b.y);
    dot.style.opacity = seg(t, 14.3, 0.2) * fxOut;
    Object.assign($("tagName").style, { left: px(nameCell.x + 4), top: px(nameCell.y + ROWH + 6), opacity: seg(t, 13.0, 0.4) * fxOut });
    Object.assign($("tagLink").style, { left: px(linkCell.x + 4), top: px(linkCell.y + ROWH + 6), opacity: seg(t, 14.4, 0.4) * fxOut * (1 - seg(t, 14.6, 0.15)) });

    // link hover chip, click, formula bar
    const chipA = seg(t, 14.65, 0.2) * (1 - seg(t, 15.25, 0.2));
    Object.assign($("linkChip").style, { left: px(linkCell.x - 4), top: px(linkCell.y + ROWH + 4), opacity: chipA });
    const rp = clamp((t - 15.0) / 0.6);
    const rr = 6 + 30 * easeOut(rp);
    Object.assign($("ripple").style, { left: px(linkPt.x - rr), top: px(linkPt.y - rr), width: px(rr * 2), height: px(rr * 2), opacity: t >= 15.0 ? 0.9 * (1 - rp) : 0, borderWidth: px(2 / s) });
    if (t >= 15.0) { $("namebox").textContent = `J${C.demoRow}`; $("fcontent").textContent = `=IF(OR(ISBLANK(H${C.demoRow}), H${C.demoRow}=""), "", HYPERLINK("https://wa.me/" & REGEXREPLACE(TO_TEXT(H${C.demoRow}), "[^0-9]", ""), IF(ISBLANK(G${C.demoRow}), "WhatsApp", G${C.demoRow})))`; }
    else { $("namebox").textContent = "A1"; $("fcontent").textContent = "Date"; }

    // cursor (stage-space path → screen)
    const start = { x: 1340, y: 680 };
    const k1 = seg(t, 12.45, 0.85), k2 = seg(t, 13.75, 0.85);
    let cp = { x: lerp(start.x, namePt.x, k1), y: lerp(start.y, namePt.y, k1) };
    cp = { x: lerp(cp.x, linkPt.x, k2), y: lerp(cp.y, linkPt.y, k2) };
    const press = t > 14.97 && t < 15.12 ? 0.88 : 1;
    const csp = toScreen(cp);
    const hand = t > 14.45 && t < 15.6;
    $("curArrow").style.display = hand ? "none" : ""; $("curHand").style.display = hand ? "" : "none";
    const off = hand ? { x: 13, y: 5 } : { x: 6, y: 3 };
    Object.assign($("cursor").style, { transform: `translate(${csp.x - off.x}px, ${csp.y - off.y}px) scale(${press})`, opacity: seg(t, 12.4, 0.3) * (1 - seg(t, 15.45, 0.3)) });

    // WhatsApp
    const bd = keys(t, [[15.25, 0], [15.9, 0.72], [21.3, 0.72], [22.2, 0], [22.9, 0], [23.5, 0.5]]);
    $("backdrop").style.opacity = bd;
    const waIn = seg(t, 15.4, 0.7), waOut = seg(t, 21.15, 0.6);
    const wa = $("wa");
    wa.style.opacity = waIn * (1 - waOut);
    // gentle push-in on the whole WhatsApp window (keeps header + compose box in frame)
    const z = 1 + 0.07 * seg(t, 16.8, 1.4);
    wa.style.transformOrigin = C.whatsappMode === "prefill" ? "50% 92%" : "50% 8%";
    wa.style.transform = `translateY(${(1 - waIn) * 14}px) scale(${(lerp(0.97, 1, waIn) - 0.015 * waOut) * z})`;
    hlEl.style.setProperty("--hl", seg(t, 18.3, 0.6));
    const tag = $("tagMsg"), wr = wa.getBoundingClientRect(), hr = hlEl.getBoundingClientRect();
    const sc = wr.width / 1540 || 1;
    const below = C.whatsappMode !== "prefill";
    tag.style.left = px(below ? (hr.right - wr.left) / sc + 14 : (hr.left - wr.left) / sc - 3);
    tag.style.top = px(below ? (hr.top - wr.top) / sc - 3 : (hr.top - wr.top) / sc - 38);
    tag.style.opacity = seg(t, 18.7, 0.4);

    // captions
    const ci = $("capIntro"); capIn(ci, t, 0.3, 2.65);
    $("introLine").style.transform = `scaleX(${seg(t, 0.6, 0.8)})`;
    capIn($("cap1"), t, 3.9, 10.6);
    capIn($("u1Sub"), t, 4.35, 7.4); capIn($("u1Sub2"), t, 7.7, 99);
    chips.forEach((c, k) => capIn(c, t, 5.3 + 0.2 * k, 99));
    capIn($("cap2"), t, 12.4, 21.15);
    capIn($("u2Sub"), t, 12.85, 17.9); capIn($("u2Sub2"), t, 18.25, 99);

    // outro
    const op = seg(t, 23.0, 0.55);
    const ob = $("outro"); ob.style.opacity = op; ob.style.transform = `translate(-50%, calc(-50% + ${(1 - op) * 10}px))`;
    oitems.forEach((it, k) => {
      const kk = seg(t, 23.35 + 0.4 * k, 0.45);
      it.style.opacity = kk; it.style.transform = `translateY(${(1 - kk) * 6}px)`;
      it.querySelector("path").style.strokeDashoffset = 1 - seg(t, 23.45 + 0.4 * k, 0.45);
    });

    $("progressFill").style.width = (100 * clamp(t / C.duration)) + "%";
    $("fade").style.opacity = seg(t, 26.1, 0.9);
  };

  // live preview when opened directly in a browser
  window.__ready = document.fonts.ready.then(() => true);
  if (!params.has("render")) {
    const fixed = params.get("t");
    window.__ready.then(() => {
      if (fixed !== null) return window.renderAt(parseFloat(fixed));
      const t0 = performance.now();
      const loop = () => { window.renderAt(((performance.now() - t0) / 1000) % C.duration); requestAnimationFrame(loop); };
      loop();
    });
  }
})();
