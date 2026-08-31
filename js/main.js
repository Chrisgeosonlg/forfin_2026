/* ===================================================================
   FORFIN 2026 — main.js
=================================================================== */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- per-image spiral loaders ---------- */
  $$(".gl-video img, .tile img, .plogo img, .strip__logo img, .partner-hero__plate img").forEach(img => {
    if (img.complete) return;
    const target = img.closest(".gl-video, .tile, .plogo, .strip__logo, .partner-hero__plate");
    if (!target) return;
    const spinner = document.createElement("span");
    spinner.className = "image-loader";
    spinner.setAttribute("aria-hidden", "true");
    target.classList.add("image-load-target", "is-image-loading");
    target.appendChild(spinner);

    const revealImage = () => {
      target.classList.remove("is-image-loading");
      spinner.classList.add("is-done");
      window.setTimeout(() => spinner.remove(), reduceMotion ? 0 : 220);
    };
    img.addEventListener("load", revealImage, { once: true });
    img.addEventListener("error", revealImage, { once: true });
  });

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
    burger.setAttribute("aria-expanded", links.classList.contains("is-open"));
  });
  $$("#navLinks a").forEach(a =>
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  /* ---------- FAQ chat + WhatsApp handoff ---------- */
  const chat = document.createElement("aside");
  chat.className = "faq-chat";
  chat.innerHTML = `
    <button class="faq-chat__toggle" type="button" aria-label="Open FORFIN help" aria-expanded="false">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H10l-5 3v-3a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z"/><path d="M8 10h8M8 13.5h5"/></svg>
      <span>Ask FORFIN</span>
    </button>
    <section class="faq-chat__panel" aria-label="FORFIN frequently asked questions" aria-hidden="true">
      <header class="faq-chat__head"><div><strong>FORFIN Help</strong><small>Quick event answers</small></div><button type="button" class="faq-chat__close" aria-label="Close help">×</button></header>
      <div class="faq-chat__body" aria-live="polite">
        <div class="faq-msg faq-msg--bot">Hello! Ask me about FORFIN 2026, or choose a common question below.</div>
        <div class="faq-chat__quick">
          <button type="button" data-question="When and where is FORFIN 2026?">Date &amp; venue</button>
          <button type="button" data-question="How can I attend?">Attendance</button>
          <button type="button" data-question="Where can I see the agenda?">Agenda</button>
          <button type="button" data-question="Who are the speakers?">Speakers</button>
        </div>
      </div>
      <form class="faq-chat__form">
        <label class="sr-only" for="faqQuestion">Ask a question</label>
        <input id="faqQuestion" type="text" placeholder="Type your question…" autocomplete="off" required>
        <button type="submit" aria-label="Send question">➜</button>
      </form>
    </section>`;
  document.body.appendChild(chat);

  const chatToggle = $(".faq-chat__toggle", chat);
  const chatPanel = $(".faq-chat__panel", chat);
  const chatBody = $(".faq-chat__body", chat);
  const chatInput = $("#faqQuestion", chat);
  const setChatOpen = open => {
    chat.classList.toggle("is-open", open);
    chatToggle.setAttribute("aria-expanded", String(open));
    chatPanel.setAttribute("aria-hidden", String(!open));
    if (open) window.setTimeout(() => chatInput.focus(), 200);
  };
  chatToggle.addEventListener("click", () => setChatOpen(!chat.classList.contains("is-open")));
  $(".faq-chat__close", chat).addEventListener("click", () => setChatOpen(false));

  const faqVocabulary = [
    "accommodation", "accessibility", "agenda", "attend", "attendance", "badge",
    "certificate", "colleague", "complimentary", "confirmation", "contact", "deadline",
    "dietary", "dress", "emergency", "exhibition", "invitation", "networking", "organizer",
    "parking", "partner", "programme", "register", "registration", "schedule", "speaker",
    "sponsorship", "transport", "venue", "virtual", "whatsapp"
  ];
  const editDistance = (a, b) => {
    const row = Array.from({ length: b.length + 1 }, (_, index) => index);
    for (let i = 1; i <= a.length; i += 1) {
      let previous = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const saved = row[j];
        row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
        previous = saved;
      }
    }
    return row[b.length];
  };
  const normalizeFaqQuestion = question => {
    let normalized = question.toLowerCase().normalize("NFKD").replace(/[’']/g, "").replace(/[^a-z0-9&]+/g, " ").trim();
    normalized = normalized.split(" ").map(word => {
      if (word.length < 5 || faqVocabulary.includes(word)) return word;
      return faqVocabulary.find(candidate => Math.abs(candidate.length - word.length) <= 1 && editDistance(word, candidate) <= 1) || word;
    }).join(" ");
    const aliases = [
      [/\b(who can come|who can join|who is it for|target audience)\b/g, "who should attend audience"],
      [/\b(sign ?up|enrol|enroll|apply|join|participate)\b/g, "register attend"],
      [/\b(coworker|co worker|workmate|team ?mate|plus one)\b/g, "colleague"],
      [/\b(where is it held|where will it be|place of the event|event place)\b/g, "venue location"],
      [/\b(when is it held|which day|what day|event day)\b/g, "event date"],
      [/\b(run of show|timetable|line ?up)\b/g, "agenda schedule"],
      [/\b(host|presenting|talking at the event)\b/g, "speaker presenter"],
      [/\b(how much|is there a charge|do i have to pay|paid event)\b/g, "cost payment"],
      [/\b(stay|lodging|sleeping arrangements?)\b/g, "accommodation hotel"],
      [/\b(get there|ride|shuttle|car park)\b/g, "transport parking"],
      [/\b(eat|lunch|breakfast|snacks?|drinks?)\b/g, "meal food"],
      [/\b(clothes|clothing|outfit)\b/g, "dress attire"],
      [/\b(subjects?|what will be covered|what will i learn)\b/g, "topics content"],
      [/\b(what is this event|tell me about (this|the) event|what is the event about)\b/g, "what is forfin"],
      [/\b(internet connection|wireless internet)\b/g, "wifi internet"],
      [/\b(wheelchair|disabled|disability)\b/g, "accessibility"],
      [/\b(real|legit|authentic|scam)\b/g, "genuine verify message"],
      [/\b(talk to someone|customer support|need help)\b/g, "speak person organizing team"]
    ];
    aliases.forEach(([pattern, replacement]) => { normalized = normalized.replace(pattern, replacement); });
    return normalized;
  };
  const faqAnswer = question => {
    const q = normalizeFaqQuestion(question);
    const escalate = "This requires confirmation from the FORFIN organizing team. Please continue on WhatsApp with your full name, organization, email address, mobile number and question.";
    if (/emergency|urgent|medical/.test(q)) return "For event-day urgent assistance, visit the FORFIN registration or information desk at White Sands Hotel, or speak to the nearest FORFIN staff member immediately.";
    if (/complaint|dispute|sponsorship price|sponsorship cost|sponsorship package|delegate limit|how many delegates|registration deadline|closing date|airport transfer|start time|finish time|registration time|what time|check-in time|checkout time|check-out time|certificate|giveaway|detailed menu|visa requirement|my registration|my invitation|my accommodation|registration status|accommodation status/.test(q)) return escalate;
    if (/agenda|programme|program|schedule|session/.test(q)) return 'You can view the programme in the <a href="index.html#agenda">Agenda section</a>.';
    if (/when|date|time|where|venue|location/.test(q)) return "FORFIN 2026 takes place on 1st and 2nd October 2026 at White Sands Resort & Conference Centre, Jangwani Beach, Dar es Salaam.";
    if (/what is forfin|about forfin/.test(q)) return "FORFIN 2026 is an invitation-only executive technology forum organized by Computer Centre Tanzania Ltd for leaders in finance, government and technology.";
    if (/what does forfin|forfin mean|stand for/.test(q)) return "FORFIN stands for Fortifying Finance Forum.";
    if (/first edition|second edition|which edition/.test(q)) return "FORFIN 2026 is the second edition. The first edition was held in 2025.";
    if (/theme/.test(q)) return "The FORFIN 2026 theme is “AI-Driven Cyber Resilience for the Digital Future.”";
    if (/purpose|objective|why forfin/.test(q)) return "The forum explores how AI, cybersecurity and modern technology can strengthen resilience, protect information, prevent fraud and support secure digital transformation.";
    if (/virtual|online|physical|in.person/.test(q)) return "FORFIN 2026 is an in-person event lasting two days.";
    if (/who should attend|audience|eligible|eligibility/.test(q)) return "FORFIN is intended for senior leaders in banking, financial services, insurance, microfinance, fintech, government and regulatory institutions.";
    if (/student/.test(q)) return "The forum is primarily for senior professionals. Students may attend only with a specific invitation or organizer approval.";
    if (/colleague|guest|bring someone/.test(q)) return "You may recommend a colleague, but they must register separately and receive confirmation. Unregistered guests cannot be guaranteed entry.";
    if (/vendor/.test(q)) return "Only participating technology partners, invited vendors and approved representatives may attend.";
    if (/free|complimentary|registration fee|attendance fee|cost|price|payment/.test(q)) return "Attendance is complimentary for invited and confirmed delegates unless the organizers communicate otherwise.";
    if (/how.*register|registration link/.test(q)) return "Use the official registration link included in your invitation. Every submission is reviewed and does not guarantee attendance.";
    if (/confirm|confirmation/.test(q)) return "Confirmed delegates will receive an email, phone call or WhatsApp message from the organizing team. If you registered but received nothing, check your spam folder and contact the team.";
    if (/transfer.*invitation|replace.*delegate/.test(q)) return "Invitations cannot be transferred without approval. Contact the organizing team with the proposed replacement delegate’s details.";
    if (/cannot attend|can.t attend|cancel attendance/.test(q)) return "Notify the organizing team as early as possible so registration, catering and accommodation arrangements can be updated.";
    if (/attend|register|registration|invite|ticket|entry/.test(q)) return "FORFIN 2026 is invitation-only. Attendance requires registration and confirmation by the organizing team.";
    if (/what.*bring|bring.*event/.test(q)) return "Bring valid identification, your invitation or confirmation message, and business cards if available.";
    if (/badge|lanyard/.test(q)) return "Confirmed delegates will receive an event badge or lanyard and should wear it throughout the forum.";
    if (/check.?in|registration desk/.test(q)) return "Check-in will be at the designated FORFIN registration desk at White Sands Hotel. Signs and event staff will provide directions.";
    if (/topic|discuss|content/.test(q)) return "Topics include AI and cybersecurity, cyber resilience, incident response, cloud and data security, fraud prevention, identity, compliance, governance and resilient infrastructure.";
    if (/format|keynote|panel|breakout|demonstration|demo|q&a|questions/.test(q)) return "The programme includes keynotes, executive presentations, demonstrations, panels, breakout sessions, Q&A and networking activities.";
    if (/slide|presentation material|materials shared/.test(q)) return "Presentation materials may be shared after the event where the relevant speakers and partners grant permission.";
    if (/speaker|presenter|panelist/.test(q)) return 'Confirmed experts are listed in the <a href="index.html#speakers">Speakers section</a>.';
    if (/meeting.*presenter|meeting.*partner|request.*meeting/.test(q)) return "You may request a meeting through a Computer Centre Tanzania representative during the event or through the official contact channel.";
    if (/partner|sponsor|company.*present/.test(q)) return 'Participating organisations are shown in the <a href="index.html#partners">Partners section</a>. Speaking and partnership opportunities require organizer approval.';
    if (/accommodation|hotel|room|extra night|special rate/.test(q)) return "One night may be provided to selected invited and confirmed delegates. Check your invitation or confirmation; extra nights and personal expenses are normally paid by the attendee.";
    if (/transport|travel|parking|international delegate|visa support/.test(q)) return "Transport is not automatically included. Parking is expected subject to hotel capacity. Confirmed international delegates may request a visa-support letter, but remain responsible for travel and entry requirements.";
    if (/meal|food|refreshment|dinner|dietary/.test(q)) return "Meals and refreshments are provided according to the final programme, including a planned networking dinner for eligible confirmed attendees. Share dietary requirements early.";
    if (/dress|attire|wear/.test(q)) return "Business formal or smart business attire is recommended.";
    if (/laptop|charger|charging|power bank/.test(q)) return "A laptop is not required unless specifically requested. Bring your charger or power bank and arrive with devices charged.";
    if (/wi.?fi|internet/.test(q)) return "Internet access is expected at the venue. Connection details will be provided where applicable.";
    if (/networking|promote.*business|exhibition|booth/.test(q)) return "Executive networking is a core part of FORFIN. Unauthorized selling or promotional displays may be restricted; branded areas are arranged by the organizers.";
    if (/photo|video|record|media/.test(q)) return "Official photos and videos may be used for event communication. Tell the registration desk if you prefer not to appear. Recording sessions may require permission.";
    if (/privacy|personal data|information used|details shared|confidential/.test(q)) return "Registration data is used for event delivery and approved follow-up. Follow confidentiality instructions, and never share passwords, card details or unnecessary sensitive information.";
    if (/accessible|accessibility|special seating|personal assistant/.test(q)) return "Notify the organizing team early about accessibility, seating or assistant requirements so approval and arrangements can be coordinated.";
    if (/latest information|latest update|genuine|verify.*message/.test(q)) return "Use official FORFIN invitations, emails, WhatsApp messages, the event website or Computer Centre Tanzania communication. Verify uncertain messages before sharing information.";
    if (/speak.*person|human|organizing team|organiser|organizer/.test(q)) return escalate;
    if (/contact|email|phone|call/.test(q)) return 'Email <a href="mailto:forfin@cctz.co.tz">forfin@cctz.co.tz</a>, use our <a href="contact.html">contact page</a>, or continue on WhatsApp.';
    return null;
  };
  const addChatMessage = (content, type, asHtml = false) => {
    const message = document.createElement("div");
    message.className = `faq-msg faq-msg--${type}`;
    if (asHtml) message.innerHTML = content; else message.textContent = content;
    chatBody.appendChild(message);
    chatBody.scrollTop = chatBody.scrollHeight;
  };
  const askFaq = question => {
    const clean = question.trim();
    if (!clean) return;
    addChatMessage(clean, "user");
    const answer = faqAnswer(clean);
    if (answer) {
      addChatMessage(answer, "bot", true);
      if (/requires confirmation|organizing team/.test(answer)) {
        const whatsapp = `https://wa.me/255655007491?text=${encodeURIComponent("Hello FORFIN team, I need help with this enquiry:\n\n" + clean)}`;
        addChatMessage(`<a class="faq-chat__whatsapp" href="${whatsapp}" target="_blank" rel="noopener">Continue on WhatsApp</a>`, "bot", true);
      }
    } else {
      const whatsapp = `https://wa.me/255655007491?text=${encodeURIComponent("Hello FORFIN team, I need help with this enquiry:\n\n" + clean)}`;
      addChatMessage(`That question needs help from our team. <a class="faq-chat__whatsapp" href="${whatsapp}" target="_blank" rel="noopener">Continue on WhatsApp</a>`, "bot", true);
    }
  };
  $(".faq-chat__form", chat).addEventListener("submit", event => {
    event.preventDefault();
    askFaq(chatInput.value);
    chatInput.value = "";
  });
  $$("[data-question]", chat).forEach(button => button.addEventListener("click", () => askFaq(button.dataset.question)));

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
  revealEls.forEach(el => {
    const siblings = [...el.parentElement.children].filter(child => child.classList.contains("reveal"));
    const index = siblings.indexOf(el);
    if (siblings.length > 1 && index > 0) el.style.setProperty("--reveal-delay", `${Math.min(index * 70, 280)}ms`);
  });
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

    const visibleTiles = () => $$(".tile:not(.tile--video)").filter(t => !t.classList.contains("is-hidden") && t.offsetParent !== null);

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
      const t = e.target.closest(".tile:not(.tile--video)");
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

  /* ---------- privacy consent ---------- */
  const consentKey = "forfin-privacy-consent";
  let savedConsent = null;
  try { savedConsent = localStorage.getItem(consentKey); } catch (_) {}
  if (!savedConsent) {
    const banner = document.createElement("section");
    banner.className = "consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Privacy choices");
    banner.setAttribute("aria-live", "polite");
    banner.innerHTML = '<div class="consent-banner__inner"><div class="consent-banner__copy"><strong>Your privacy choices</strong><p>We use essential browser storage to remember your choice. We do not currently use analytics or advertising cookies. <a href="privacy.html">Read our Privacy Policy</a>.</p></div><div class="consent-banner__actions"><button class="consent-btn consent-btn--secondary" type="button" data-consent="essential">Essential only</button><button class="consent-btn consent-btn--primary" type="button" data-consent="accepted">Accept</button></div></div>';
    document.body.appendChild(banner);
    banner.addEventListener("click", (event) => {
      const button = event.target.closest("[data-consent]");
      if (!button) return;
      try { localStorage.setItem(consentKey, button.dataset.consent); } catch (_) {}
      banner.classList.add("is-closing");
      window.setTimeout(() => banner.remove(), 260);
    });
  }

  /* ---------- footer year ---------- */
})();
