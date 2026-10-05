/* ==========================================================================
   R.V. SAI KRISHNA REDROUTHU — PORTFOLIO SCRIPT
   Vanilla JS, no dependencies.
   ========================================================================== */
(function () {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EMAIL = "vsaikrishnaredrouthu@gmail.com";

  /* ------------------------------------------------------------------
     1. PRELOADER
  ------------------------------------------------------------------ */
  (function preloader() {
    const el = $("#preloader");
    if (!el) return;

    const hide = () => {
      el.classList.add("is-done");
      document.body.style.overflow = "";
      // Kick off hero animations once the curtain lifts.
      setTimeout(() => {
        $$(".hero .reveal").forEach((n) => n.classList.add("is-visible"));
        startCounters();
      }, 180);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("load", () => setTimeout(hide, reduceMotion ? 0 : 550));
    // Safety net: never trap the user if `load` already fired.
    setTimeout(hide, 3000);
  })();

  /* ------------------------------------------------------------------
     2. THEME TOGGLE  (persisted)
  ------------------------------------------------------------------ */
  (function theme() {
    const btn = $("#themeToggle");
    const root = document.documentElement;
    const meta = $('meta[name="theme-color"]');
    const STORAGE_KEY = "sk-portfolio-theme";

    const apply = (mode) => {
      root.setAttribute("data-theme", mode);
      if (meta) meta.setAttribute("content", mode === "dark" ? "#070b14" : "#f6f8fc");
      if (btn) {
        btn.setAttribute(
          "aria-label",
          mode === "dark" ? "Switch to light theme" : "Switch to dark theme"
        );
      }
    };

    let stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (_) {}

    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    apply(stored || (prefersLight ? "light" : "dark"));

    if (btn) {
      btn.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        apply(next);
        try { localStorage.setItem(STORAGE_KEY, next); } catch (_) {}
      });
    }
  })();

  /* ------------------------------------------------------------------
     3. HEADER STICKY STATE
  ------------------------------------------------------------------ */
  (function stickyHeader() {
    const header = $("#header");
    if (!header) return;
    const onScroll = () => header.classList.toggle("is-stuck", window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  })();

  /* ------------------------------------------------------------------
     4. SCROLL PROGRESS BAR
  ------------------------------------------------------------------ */
  (function scrollProgress() {
    const bar = $("#scrollProgress");
    if (!bar) return;

    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = pct.toFixed(2) + "%";
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });

    update();
  })();

  /* ------------------------------------------------------------------
     5. MOBILE NAVIGATION
  ------------------------------------------------------------------ */
  (function mobileNav() {
    const toggle = $("#navToggle");
    const menu   = $("#navMenu");
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.classList.toggle("is-open", open);
    };

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close after tapping a link.
    $$("a", menu).forEach((a) => a.addEventListener("click", () => setOpen(false)));

    // Close on Escape.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });

    // Close when clicking outside on small screens.
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });

    // Reset when going back to desktop.
    window.addEventListener("resize", () => {
      if (window.innerWidth > 860) setOpen(false);
    });
  })();

  /* ------------------------------------------------------------------
     6. SCROLL REVEAL

     Content must NEVER stay at opacity:0, so besides the observer we run a
     cheap viewport sweep on load and on scroll as a safety net.
  ------------------------------------------------------------------ */
  (function reveal() {
    const items = $$(".reveal");
    if (!items.length) return;

    // Apply stagger offsets declared via data-delay in the markup.
    items.forEach((el) => {
      const d = parseInt(el.dataset.delay || "0", 10);
      el.style.setProperty("--d", String(d));
    });

    const revealAll = () => {
      items.forEach((el) => el.classList.add("is-visible"));
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealAll();
      return;
    }

    // Items still waiting to be shown; the sweep empties this list.
    let pending = items.slice();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
          pending = pending.filter((el) => el !== entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach((el) => io.observe(el));

    // Safety net: reveal anything already on screen that the observer missed.
    const sweep = () => {
      if (!pending.length) return;
      const h = window.innerHeight;
      pending = pending.filter((el) => {
        const r = el.getBoundingClientRect();
        const onScreen = r.top < h * 0.94 && r.bottom > 0;
        if (!onScreen) return true;
        el.classList.add("is-visible");
        io.unobserve(el);
        return false;
      });
    };

    window.addEventListener("scroll", sweep, { passive: true });
    window.addEventListener("resize", sweep, { passive: true });
    setTimeout(sweep, 1200);
  })();

  /* ------------------------------------------------------------------
     7. TYPEWRITER EFFECT
  ------------------------------------------------------------------ */
  const ROLES = [
    "Embedded Systems Professional",
    "Technical Coach @ Vector India",
    "C / Embedded C Programmer",
    "Microcontroller & GPIO Interfacing",
    "ECE Graduate (B.Tech, 2024)"
  ];

  (function typewriter() {
    const el = $("#typewriter");
    if (!el) return;

    if (reduceMotion) {
      el.textContent = ROLES[0];
      return;
    }

    let role = 0;
    let char = 0;
    let deleting = false;

    const tick = () => {
      const word = ROLES[role];
      char += deleting ? -1 : 1;
      el.textContent = word.slice(0, char);

      let delay = deleting ? 45 : 85;
      if (!deleting && char === word.length) {
        deleting = true;
        delay = 1700;
      } else if (deleting && char === 0) {
        deleting = false;
        role = (role + 1) % ROLES.length;
        delay = 380;
      }
      setTimeout(tick, delay);
    };

    setTimeout(tick, 500);
  })();

  /* ------------------------------------------------------------------
     8. NUMBER COUNTERS

     The real values live in the HTML, so they are correct without JS and are
     never wrong for crawlers. The count-up is purely decorative: `run()` only
     ever animates elements that the observer has confirmed are on screen, and
     a timer guarantees the true value is restored if animation stalls.
  ------------------------------------------------------------------ */
  let countersStarted = false;
  const counted = new WeakSet();

  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;

    const nums = $$(".counter");
    if (!nums.length) return;

    const decimalsOf = (el) => parseInt(el.dataset.decimals || "0", 10);
    const targetOf   = (el) => parseFloat(el.dataset.target);
    const finish     = (el) => { el.textContent = targetOf(el).toFixed(decimalsOf(el)); };

    const run = (el) => {
      if (counted.has(el)) return;
      counted.add(el);

      const target   = targetOf(el);
      const decimals = decimalsOf(el);
      const duration = 1500;

      if (reduceMotion || isNaN(target)) { finish(el); return; }

      el.textContent = (0).toFixed(decimals);
      const startTime = performance.now();

      const step = (now) => {
        const p = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);           // easeOutCubic
        el.textContent = (target * eased).toFixed(decimals);
        if (p < 1) requestAnimationFrame(step);
        else finish(el);
      };
      requestAnimationFrame(step);

      // Guarantee the true value even if requestAnimationFrame never advances.
      setTimeout(() => finish(el), duration + 150);
    };

    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
        });
      },
      { threshold: 0.4 }
    );
    nums.forEach((n) => io.observe(n));

    // Safety net, and deliberately NOT `run`: elements the observer never
    // reported keep their correct static value instead of flashing to 0.
    setTimeout(() => nums.forEach(finish), 2400);
  }

  // Covers pages without the preloader element.
  if (!$("#preloader")) startCounters();

  /* ------------------------------------------------------------------
     9. ACTIVE NAV LINK (scroll spy)
  ------------------------------------------------------------------ */
  (function scrollSpy() {
    const links = $$(".nav__link");
    if (!links.length) return;

    const map = new Map();
    links.forEach((l) => {
      const id = l.getAttribute("href");
      if (id && id.startsWith("#")) {
        const sec = document.querySelector(id);
        if (sec) map.set(sec, l);
      }
    });
    if (!map.size) return;

    if (!("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const link = map.get(e.target);
          if (!link) return;
          if (e.isIntersecting) {
            links.forEach((l) => l.classList.remove("is-active"));
            link.classList.add("is-active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    map.forEach((_, sec) => io.observe(sec));
  })();

  /* ------------------------------------------------------------------
     10. BACK TO TOP
  ------------------------------------------------------------------ */
  (function backToTop() {
    const btn = $("#toTop");
    if (!btn) return;

    const onScroll = () => btn.classList.toggle("is-visible", window.scrollY > 550);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  })();

  /* ------------------------------------------------------------------
     11. CONTACT FORM  (validates, then opens the mail client)
  ------------------------------------------------------------------ */
  (function contactForm() {
    const form = $("#contactForm");
    if (!form) return;

    const status = $("#formStatus");
    const nameEl  = $("#cfName");
    const mailEl  = $("#cfEmail");
    const subjEl  = $("#cfSubject");
    const msgEl   = $("#cfMessage");

    const setStatus = (msg, kind) => {
      if (!status) return;
      status.textContent = msg;
      status.className = "form-status" + (kind ? " is-" + kind : "");
    };

    const markError = (el, bad) => {
      const field = el.closest(".field");
      if (field) field.classList.toggle("has-error", bad);
    };

    const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = nameEl.value.trim();
      const mail = mailEl.value.trim();
      const subj = subjEl.value.trim();
      const msg  = msgEl.value.trim();

      let valid = true;

      if (!name)     { markError(nameEl, true); valid = false; } else markError(nameEl, false);
      if (!isEmail(mail)) { markError(mailEl, true); valid = false; } else markError(mailEl, false);
      if (!msg)      { markError(msgEl, true);  valid = false; } else markError(msgEl, false);

      if (!valid) {
        setStatus("Please fill in your name, a valid email and a message.", "err");
        return;
      }

      const subject = subj || "Enquiry via portfolio";
      const body =
        `Name: ${name}\n` +
        `Email: ${mail}\n\n` +
        `${msg}\n\n` +
        `---\nSent from vsaikrishnaredrouthu.com portfolio`;

      const href =
        `mailto:${EMAIL}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

      window.location.href = href;

      setStatus("Opening your email app… If nothing happened, email me directly at " + EMAIL, "ok");
    });

    // Clear error styling as the user types.
    [nameEl, mailEl, msgEl].forEach((el) =>
      el.addEventListener("input", () => markError(el, false))
    );
  })();

  /* ------------------------------------------------------------------
     12. SMOOTH ANCHOR FALLBACK (offset for fixed header)
  ------------------------------------------------------------------ */
  (function anchors() {
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        const headerH = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
          10
        ) || 76;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;

        window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
        history.replaceState(null, "", id);
      });
    });
  })();

  /* ------------------------------------------------------------------
     13. FOOTER YEAR
  ------------------------------------------------------------------ */
  (function year() {
    const el = $("#year");
    if (el) el.textContent = String(new Date().getFullYear());
  })();

})();
