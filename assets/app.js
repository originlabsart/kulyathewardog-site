/* Kulya the War Dog: parallax, embers, the scan, the supply line, the supply log. */
(() => {
  const C = window.K9 || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const shot = /[?&]shot\b/.test(location.search);
  if (shot) document.documentElement.classList.add("shot");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches || shot;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const short = (s) => (s ? s.slice(0, 4) + "…" + s.slice(-4) : "");

  /* ------------------------------------------------ parallax */
  const layers = $$("[data-plx]").map((el) => ({ el, depth: Number(el.dataset.depth || 0.2) * (coarse ? 0.6 : 1), sec: el.closest("section, header") }));
  let ticking = false;
  function frame() {
    ticking = false;
    const vh = innerHeight;
    for (const p of layers) {
      const r = p.sec.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      const prog = (vh - r.top) / (vh + r.height);          // 0 when the section enters, 1 when it leaves
      const off = (prog - 0.5) * r.height * p.depth;
      p.el.style.transform = `translate3d(0,${off.toFixed(1)}px,0)`;
    }
    const hero = $(".hero");
    if (hero) {
      const k = Math.min(1, Math.max(0, scrollY / (hero.offsetHeight || 1)));
      hero.style.setProperty("--fade", (1 - k * 1.3).toFixed(3));
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  if (!reduced) { addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); frame(); }

  /* ------------------------------------------------ reveals */
  const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }, { threshold: 0.18 });
  $$("[data-reveal]").forEach((el) => io.observe(el));

  /* ------------------------------------------------ embers over the hero */
  const cv = $("[data-embers]");
  if (cv && !reduced) {
    const ctx = cv.getContext("2d");
    let W, H, parts = [];
    const mk = () => ({ x: Math.random() * W, y: H + Math.random() * 40, r: 0.6 + Math.random() * 1.8, v: 0.25 + Math.random() * 0.7, d: (Math.random() - 0.5) * 0.3, a: 0.3 + Math.random() * 0.6, t: Math.random() * 6.28 });
    const size = () => { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; parts = Array.from({ length: Math.round(W / 14) }, () => ({ ...mk(), y: Math.random() * H })); };
    size(); addEventListener("resize", size);
    let visible = true;
    new IntersectionObserver((es) => (visible = es[0].isIntersecting)).observe(cv);
    (function loop() {
      if (visible) {
        ctx.clearRect(0, 0, W, H);
        for (const p of parts) {
          p.y -= p.v; p.x += p.d + Math.sin(p.t += 0.02) * 0.2;
          if (p.y < -10) Object.assign(p, mk());
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
          g.addColorStop(0, `rgba(255,190,90,${p.a})`); g.addColorStop(1, "rgba(255,120,40,0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3, 0, 6.28); ctx.fill();
        }
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ------------------------------------------------ the dog tag tilts */
  const tag = $("[data-tag]");
  if (tag && !coarse && !reduced) {
    tag.addEventListener("mousemove", (e) => {
      const r = tag.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      tag.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 14}deg)`;
    });
    tag.addEventListener("mouseleave", () => (tag.style.transform = ""));
  }

  /* ------------------------------------------------ days she has lived with the war around her */
  const since = new Date(Date.UTC(2022, 7, 31));                     // end of August 2022, so the count never overstates
  const days = Math.floor((Date.now() - since) / 86400000);
  $$("[data-days]").forEach((el) => (el.textContent = days.toLocaleString("en-GB")));

  /* ------------------------------------------------ the scan */
  const scan = $("[data-scan]");
  if (scan) {
    const range = $("[data-scan-range]", scan), clip = $("[data-scan-clip]", scan), line = $("[data-scan-line]", scan);
    const frag = $("[data-frag]", scan), btn = $("[data-scan-remove]", scan), msg = $("[data-scan-msg]", scan), tray = $("[data-tray]", scan);
    const FOUND_AT = 58; let found = false, removed = false;
    const draw = () => {
      const v = Number(range.value);
      clip.setAttribute("width", (600 * v) / 100);
      line.style.left = v + "%"; line.style.opacity = v > 0 && v < 100 ? 1 : 0;
      scan.classList.toggle("scanning", v > 0);
      if (!found && v >= FOUND_AT) { found = true; scan.classList.add("found"); btn.hidden = false; msg.textContent = "There. A fragment of shrapnel, embedded in her head. Nobody knew it was there."; }
      if (!found) msg.textContent = v === 0 ? "Drag the scan line across her head." : v < 30 ? "Hip: bruised, nothing broken." : "Keep going.";
    };
    range.addEventListener("input", draw);
    btn.addEventListener("click", () => {
      if (removed) return; removed = true;
      scan.classList.add("removed"); btn.disabled = true; btn.textContent = "Removed";
      msg.textContent = "Out. One small piece of the war, in a steel tray. She kept the ears.";
      tray.classList.add("has");
      if (navigator.vibrate) navigator.vibrate(20);
    });
    draw();
  }

  /* ------------------------------------------------ the supply line */
  const line = $("[data-supply]");
  if (line) {
    const path = $("[data-route]", line), parcel = $("[data-parcel]", line), stops = $$("[data-stop]", line);
    const L = path.getTotalLength(); path.style.strokeDasharray = L; path.style.strokeDashoffset = L;
    const run = () => {
      const r = line.getBoundingClientRect(), vh = innerHeight;
      const k = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.4)));
      path.style.strokeDashoffset = L * (1 - k);
      const pt = path.getPointAtLength(L * k);
      parcel.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
      stops.forEach((s) => s.classList.toggle("on", k >= Number(s.dataset.stop)));
      line.classList.toggle("arrived", k >= 0.98);
    };
    if (reduced) { path.style.strokeDashoffset = 0; const pt = path.getPointAtLength(L); parcel.setAttribute("transform", `translate(${pt.x} ${pt.y})`); stops.forEach((s) => s.classList.add("on")); }
    else { addEventListener("scroll", run, { passive: true }); addEventListener("resize", run); run(); }
  }

  /* ------------------------------------------------ the coin card */
  const mintEls = $$("[data-mint-only]");
  if (C.MINT) {
    mintEls.forEach((el) => (el.hidden = false));
    set("[data-mint]", C.MINT); set("[data-mint-short]", short(C.MINT));
    $$("[data-buy]").forEach((a) => { a.href = C.BUY_URL || "#"; a.hidden = !C.BUY_URL; });
    $$("[data-chart]").forEach((a) => { a.href = C.CHART_URL || "#"; a.hidden = !C.CHART_URL; });
    $$("[data-copy-mint]").forEach((b) => b.addEventListener("click", async () => { try { await navigator.clipboard.writeText(C.MINT); b.textContent = "Copied"; setTimeout(() => (b.textContent = "Copy"), 1500); } catch {} }));
  } else {
    mintEls.forEach((el) => (el.hidden = true));
    $$("[data-premint]").forEach((el) => (el.hidden = false));
  }
  set("[data-coin-name]", C.COIN_NAME || "Kulya the War Dog");
  set("[data-ticker]", C.TICKER ? "$" + C.TICKER : "");
  set("[data-wallet-short]", short(C.WALLET));
  set("[data-wallet]", C.WALLET || "");
  $$("[data-wallet-link]").forEach((a) => (a.href = `https://solscan.io/account/${C.WALLET}`));

  /* ------------------------------------------------ the supply log (live ledger) */
  const fmt = (n, d = 2) => Number(n || 0).toLocaleString("en-GB", { minimumFractionDigits: d, maximumFractionDigits: d });
  const usd = (n) => "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
  const when = (t) => new Date(t * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const ago = (t) => {
    if (!t) return "";
    const s = Math.max(1, Math.floor(Date.now() / 1000 - t));
    if (s < 60) return `${s}s ago`; if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`; if (s < 86400 * 60) return `${Math.floor(s / 86400)}d ago`;
    return when(t);
  };
  function set(sel, text) { $$(sel).forEach((e) => (e.textContent = text)); }
  let seen = new Set(), last = null;
  const mine = [];
  window.k9AddMine = (item) => { mine.unshift(item); if (last) render(last); setTimeout(load, 20000); setTimeout(load, 65000); };

  function animateNumber(sel, value, d) {
    $$(sel).forEach((el) => {
      const from = Number(el.dataset.v || 0); el.dataset.v = value;
      if (reduced || from === value) { el.textContent = fmt(value, d); return; }
      const s = performance.now();
      const step = (t) => { const k = Math.min(1, (t - s) / 900); el.textContent = fmt(from + (value - from) * (1 - Math.pow(1 - k, 3)), d); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }

  function render(s) {
    last = s;
    const price = s.solUsd || 0;
    animateNumber("[data-balance]", s.balanceSol, 2);
    set("[data-balance-usd]", price ? `≈ ${usd(s.balanceSol * price)} at ${usd(price)} per SOL` : "");
    const r = s.rewards || {};
    animateNumber("[data-rewards-sol]", r.totalSol || 0, 3);
    set("[data-rewards-usd]", s.launched ? (price ? `≈ ${usd((r.totalSol || 0) * price)} so far` : "") : "");
    set("[data-rewards-count]", String(r.count || 0));
    set("[data-rewards-last]", r.last ? `Last one ${ago(r.last)}` : (s.launched ? "Waiting for the first one" : "Switches on at launch"));
    const d = s.donations || {};
    animateNumber("[data-donations-sol]", d.totalSol || 0, 2);
    set("[data-donations-extra]", `${d.count || 0} gift${d.count === 1 ? "" : "s"}${d.totalUsdc ? ` + ${fmt(d.totalUsdc, 0)} USDC` : ""} since ${new Date((s.trackingSince || 0) * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`);
    if (C.GOAL_SOL > 0 && $("[data-goal]")) {
      $("[data-goal]").hidden = false;
      $("[data-goal-fill]").style.width = Math.min(100, ((r.totalSol || 0) / C.GOAL_SOL) * 100).toFixed(1) + "%";
      set("[data-goal-text]", `${fmt(r.totalSol || 0, 2)} of ${fmt(C.GOAL_SOL, 0)} SOL ${C.GOAL_LABEL}`);
    }
    const known = new Set((s.recent || []).map((x) => x.sig));
    for (let i = mine.length - 1; i >= 0; i--) if (known.has(mine[i].sig)) mine.splice(i, 1);
    const list = [...mine, ...(s.recent || [])];
    const rows = list.map((x, i) => {
      const amt = [x.sol ? `${fmt(x.sol, x.sol < 1 ? 3 : 2)} SOL` : "", x.usdc ? `${fmt(x.usdc, x.usdc < 10 ? 2 : 0)} USDC` : ""].filter(Boolean).join(" + ");
      const k = x.mine ? `<span class="k you">You</span>` : `<span class="k ${x.kind}">${x.kind === "reward" ? "Coin reward" : "Gift"}</span>`;
      return `<div class="lg-row${seen.size && !seen.has(x.sig) ? " new" : ""}" role="row">
        <span role="cell" class="n">${String(list.length - i).padStart(3, "0")}</span>
        <span role="cell" title="${new Date(x.time * 1000).toLocaleString("en-GB")}">${when(x.time)}</span>
        <span role="cell" class="amt">${amt}</span>
        <span role="cell" class="from">${short(x.from)}</span>
        <span role="cell">${k}</span>
        <span role="cell"><a href="https://solscan.io/tx/${x.sig}" target="_blank" rel="noopener">${short(x.sig)} ↗</a></span></div>`;
    });
    $("[data-feed]").innerHTML = rows.length ? rows.join("") : `<div class="lg-empty">Nothing logged yet. Be the first entry.</div>`;
    seen = new Set(list.map((x) => x.sig));
    const old = s.stale && (Date.now() / 1000 - (s.updatedAt || 0)) > 900;
    set("[data-updated]", `Updated ${ago(s.updatedAt)}${old ? " (reconnecting)" : ""}`);
  }

  async function load() {
    if (!C.TRACKER_URL || !$("[data-feed]")) return;
    try {
      const s = await (await fetch(C.TRACKER_URL, { cache: "no-store" })).json();
      if (s.error) throw new Error(s.error);
      render(s);
      window.K9_STATS = s;
      document.dispatchEvent(new CustomEvent("k9:stats", { detail: s }));
    } catch { set("[data-updated]", "Can't reach the chain right now. Retrying…"); }
  }
  load();
  setInterval(load, (C.REFRESH_SECONDS || 60) * 1000);

  /* ------------------------------------------------ film: reels play muted while on screen */
  const reels = $$("[data-reel]");
  const rio = new IntersectionObserver((es) => {
    for (const e of es) {
      const v = e.target.querySelector("video");
      if (e.isIntersecting && !reduced) { v.preload = "auto"; v.play().catch(() => {}); } else v.pause();
    }
  }, { threshold: 0.5 });
  reels.forEach((r) => {
    rio.observe(r);
    const v = r.querySelector("video"), b = r.querySelector("[data-reel-sound]");
    b.addEventListener("click", () => {
      const on = v.muted;
      if (on) reels.forEach((o) => { if (o !== r) { const ov = o.querySelector("video"), ob = o.querySelector("[data-reel-sound]"); ov.muted = true; ob.setAttribute("aria-pressed", "false"); ob.textContent = "Sound off"; } });
      v.muted = !on;
      b.setAttribute("aria-pressed", String(on));
      b.textContent = on ? "Sound on" : "Sound off";
      if (on) v.play().catch(() => {});
    });
  });

  /* ------------------------------------------------ nav: current chapter */
  const links = $$(".nav a[href^='#']");
  const secs = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  const nio = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
  }, { rootMargin: "-40% 0px -55% 0px" });
  secs.forEach((s) => nio.observe(s));
})();
