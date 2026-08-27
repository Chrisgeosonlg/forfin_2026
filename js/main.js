/* ===================================================================
   FORFIN 2026 — main.js
=================================================================== */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- image preloader ---------- */
  const preloader = $("#sitePreloader");
  const preloaderBar = $("#preloaderBar");
  const preloaderText = $("#preloaderText");
  const pageImages = $$("img");
  const preloaderSeen = document.documentElement.classList.contains("has-preloaded");
  let settledImages = 0;
  let preloaderFinished = false;

  const updatePreloader = () => {
    const total = pageImages.length || 1;
    const progress = Math.round((settledImages / total) * 100);
    if (preloaderBar) preloaderBar.style.width = `${progress}%`;
    if (preloaderText) preloaderText.textContent = `${progress}%`;
  };

  const finishPreloader = () => {
    if (preloaderFinished) return;
    preloaderFinished = true;
    try { sessionStorage.setItem("forfin-preloaded", "1"); } catch (e) {}
    if (preloaderBar) preloaderBar.style.width = "100%";
    if (preloaderText) preloaderText.textContent = "100%";
    window.setTimeout(() => {
      preloader?.classList.add("is-ready");
      document.documentElement.classList.remove("is-loading");
      window.setTimeout(() => preloader?.remove(), reduceMotion ? 0 : 500);
    }, reduceMotion ? 0 : 250);
  };

  if (preloaderSeen) {
    preloader?.remove();
  } else if (!pageImages.length) {
    finishPreloader();
  } else {
    const imageSettled = () => {
      settledImages += 1;
      updatePreloader();
      if (settledImages >= pageImages.length) finishPreloader();
    };
    pageImages.forEach(img => {
      img.loading = "eager";
      if (img.complete) imageSettled();
      else {
        img.addEventListener("load", imageSettled, { once: true });
        img.addEventListener("error", imageSettled, { once: true });
      }
    });
    updatePreloader();
  }

  /* ---------- sticky nav state ---------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  const burger = $("#burger");
  const links = $("#navLinks");
  burger.addEventListener("click", () => {
    links.classList.toggle("is-open");
    burger.classList.toggle("is-open");
  });
  $$("#navLinks a").forEach(a =>
    a.addEventListener("click", () => links.classList.remove("is-open"))
  );

  /* ---------- countdown ---------- */
  const target = new Date("2026-10-01T09:00:00+03:00").getTime();
  const cd = {
    d: $("[data-days]"), h: $("[data-hours]"),
    m: $("[data-mins]"), s: $("[data-secs]"),
  };
  const pad = n => String(n).padStart(2, "0");
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      cd.d.textContent = cd.h.textContent = cd.m.textContent = cd.s.textContent = "00";
      return;
    }
    const dd = Math.floor(diff / 86400000);
    const hh = Math.floor((diff % 86400000) / 3600000);
    const mm = Math.floor((diff % 3600000) / 60000);
    const ss = Math.floor((diff % 60000) / 1000);
    cd.d.textContent = dd;
    cd.h.textContent = pad(hh);
    cd.m.textContent = pad(mm);
    cd.s.textContent = pad(ss);
  }
  if (cd.d) { tick(); setInterval(tick, 1000); }

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("is-in"));
  }

  /* ---------- animated counters ---------- */
  const counters = $$(".stat__n");
  const animateCount = (el) => {
    const end = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    const dur = 1400; const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * eased) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window && !reduceMotion) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(c => cio.observe(c));
  } else {
    counters.forEach(c => c.textContent = c.dataset.count + (c.dataset.suffix || ""));
  }

  /* ---------- agenda tabs ---------- */
  $$(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const day = tab.dataset.day;
      $$(".tab").forEach(t => t.classList.toggle("is-active", t === tab));
      $$(".agenda__panel").forEach(p => { p.hidden = p.dataset.panel !== day; });
    });
  });

  /* ---------- hero particle network ---------- */
  const canvas = $("#net");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    let w, h, dpr, nodes;
    const CYAN = "18,197,216";

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(Math.floor((w * h) / 22000), 70);
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.8,
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 140) {
            ctx.strokeStyle = `rgba(${CYAN},${(1 - dist / 140) * 0.28})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${CYAN},0.85)`;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    size();
    frame();
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(size, 200); });
  }

  /* ---------- gallery: filter + lightbox ---------- */
  const filterWrap = $("#glFilter");
  if (filterWrap) {
    const chips = $$(".gl-chip", filterWrap);
    const tiles = $$("#bento .tile");
    const empty = $("#glEmpty");
    filterWrap.addEventListener("click", (e) => {
      const chip = e.target.closest(".gl-chip");
      if (!chip) return;
      const f = chip.dataset.filter;
      chips.forEach(c => c.classList.toggle("is-active", c === chip));
      let shown = 0;
      tiles.forEach(t => {
        const ok = f === "all" || t.dataset.cat === f;
        t.classList.toggle("is-hidden", !ok);
        if (ok) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
    });
  }

  // lightbox works for any .tile on the page (gallery + home teaser)
  const lb = $("#lightbox");
  if (lb) {
    const lbImg = $("#lbImg"), lbCap = $("#lbCap"), lbCount = $("#lbCount");
    let list = [], idx = 0;

    const visibleTiles = () => $$(".tile").filter(t => !t.classList.contains("is-hidden") && t.offsetParent !== null);

    const show = (i) => {
      if (!list.length) return;
      idx = (i + list.length) % list.length;
      const t = list[idx];
      const img = t.querySelector("img");
      lbImg.src = img.src;
      lbImg.alt = img.alt || "";
      const cap = t.querySelector(".tile__cap");
      const cat = t.querySelector(".tile__cat");
      lbCap.textContent = (cat ? cat.textContent + " — " : "") + (cap ? cap.textContent : "");
      lbCount.textContent = (idx + 1) + " / " + list.length;
    };
    const open = (t) => {
      list = visibleTiles();
      const i = list.indexOf(t);
      if (i < 0) return;
      show(i);
      lb.classList.add("is-open");
      lb.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
    const close = () => {
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    document.addEventListener("click", (e) => {
      const t = e.target.closest(".tile");
      if (t && lb.contains(t) === false) { e.preventDefault(); open(t); }
    });
    $("#lbClose").addEventListener("click", close);
    $("#lbPrev").addEventListener("click", () => show(idx - 1));
    $("#lbNext").addEventListener("click", () => show(idx + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") show(idx + 1);
      else if (e.key === "ArrowLeft") show(idx - 1);
    });
    // basic swipe on touch
    let sx = 0;
    lb.addEventListener("touchstart", e => sx = e.touches[0].clientX, { passive: true });
    lb.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ---------- footer year ---------- */
})();
