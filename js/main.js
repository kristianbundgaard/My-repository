/* ============================================================
   Aria Solenne — interactions
   GSAP + ScrollTrigger + Lenis smooth scroll
   ============================================================ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof gsap !== "undefined";
  if (hasGSAP && typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------------
     1. Smooth scroll (Lenis) wired into GSAP ScrollTrigger
     --------------------------------------------------------- */
  let lenis = null;
  function initLenis() {
    if (reduceMotion || typeof Lenis === "undefined") return;
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", () => { if (typeof ScrollTrigger !== "undefined") ScrollTrigger.update(); });
    if (hasGSAP) {
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* ---------------------------------------------------------
     2. Loader
     --------------------------------------------------------- */
  function runLoader(onDone) {
    const loader = document.getElementById("loader");
    const countEl = document.getElementById("loaderCount");
    const barEl = document.getElementById("loaderBar");
    if (!loader) { onDone(); return; }

    const names = loader.querySelectorAll(".loader__line em");
    if (hasGSAP) gsap.to(names, { y: 0, duration: 1, ease: "power3.out", stagger: 0.08, delay: 0.1 });

    let pct = 0;
    const dur = reduceMotion ? 400 : 1500;
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / dur);
      pct = Math.round((1 - Math.pow(1 - t, 3)) * 100);
      if (countEl) countEl.textContent = pct;
      if (barEl) barEl.style.width = pct + "%";
      if (t < 1) { requestAnimationFrame(step); }
      else { finish(); }
    }
    function finish() {
      if (hasGSAP) {
        gsap.to(loader, {
          yPercent: -100, duration: 1, ease: "power4.inOut", delay: 0.15,
          onStart: onDone,
          onComplete: () => loader.remove(),
        });
      } else {
        loader.style.display = "none"; onDone();
      }
    }
    requestAnimationFrame(step);
  }

  /* ---------------------------------------------------------
     3. Hero intro animation
     --------------------------------------------------------- */
  function introAnim() {
    if (!hasGSAP) {
      document.querySelectorAll("[data-stagger],[data-reveal]").forEach((el) => {
        el.style.transform = "none"; el.style.opacity = 1;
      });
      return;
    }
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.fromTo(".hero__word", { yPercent: 105, y: 0 }, { yPercent: 0, duration: 1.1, stagger: 0.08 }, 0.1)
      .from(".hero__meta-item", { y: 20, opacity: 0, duration: 0.8, stagger: 0.1 }, 0.5)
      .from(".hero__intro", { y: 20, opacity: 0, duration: 0.9 }, 0.7)
      .from(".hero__scroll", { y: 20, opacity: 0, duration: 0.9 }, 0.8)
      .from(".nav", { y: -20, opacity: 0, duration: 0.9 }, 0.4);
  }

  /* ---------------------------------------------------------
     4. Scroll-triggered reveals
     --------------------------------------------------------- */
  function scrollReveals() {
    if (!hasGSAP || typeof ScrollTrigger === "undefined") return;

    // Generic reveal
    gsap.utils.toArray("[data-reveal]").forEach((el) => {
      gsap.from(el, {
        y: 40, opacity: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    // Line-by-line text reveal
    gsap.utils.toArray("[data-line]").forEach((line) => {
      const inner = document.createElement("span");
      inner.style.display = "block";
      while (line.firstChild) inner.appendChild(line.firstChild);
      line.appendChild(inner);
      gsap.set(inner, { yPercent: 110 });
      gsap.to(inner, {
        yPercent: 0, duration: 1.1, ease: "power4.out",
        scrollTrigger: { trigger: line, start: "top 90%" },
      });
    });

    // Project rows slide in
    gsap.utils.toArray(".project").forEach((p, i) => {
      gsap.from(p, {
        y: 30, opacity: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: p, start: "top 92%" },
        delay: (i % 3) * 0.05,
      });
    });

    // Subtle parallax on the hero title as you scroll away
    gsap.to(".hero__title", {
      yPercent: 18, opacity: 0.4, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });

    // Section heads slight parallax index
    gsap.utils.toArray(".section-head__index").forEach((el) => {
      gsap.fromTo(el, { y: 20 }, {
        y: -20, ease: "none",
        scrollTrigger: { trigger: el.closest(".section-head"), start: "top bottom", end: "bottom top", scrub: true },
      });
    });
  }

  /* ---------------------------------------------------------
     5. Counters
     --------------------------------------------------------- */
  function counters() {
    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      const animate = () => {
        const dur = 1400; const start = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - start) / dur);
          el.textContent = Math.round((1 - Math.pow(1 - t, 3)) * target);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      };
      if (hasGSAP && typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: animate });
      } else {
        animate();
      }
    });
  }

  /* ---------------------------------------------------------
     6. Marquee — direction reacts to scroll
     --------------------------------------------------------- */
  function marquee() {
    const track = document.getElementById("marquee");
    if (!track || !hasGSAP) return;
    const half = track.scrollWidth / 2;
    let x = 0, dir = 1, speed = 0.6;

    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.create({
        trigger: document.body, start: "top top", end: "bottom bottom",
        onUpdate: (self) => { dir = self.direction; },
      });
    }
    gsap.ticker.add(() => {
      x -= speed * dir;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
  }

  /* ---------------------------------------------------------
     7. Custom cursor + magnetic + project preview
     --------------------------------------------------------- */
  function cursor() {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!finePointer) return;

    const cur = document.querySelector(".cursor");
    const dot = document.querySelector(".cursor__dot");
    const ring = document.querySelector(".cursor__ring");
    const label = document.querySelector(".cursor__label");
    if (!cur) return;

    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { x: pos.x, y: pos.y };
    window.addEventListener("pointermove", (e) => { pos.x = e.clientX; pos.y = e.clientY; });

    function render() {
      requestAnimationFrame(render);
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      dot.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%,-50%)`;
      label.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%,-50%)`;
    }
    render();

    document.querySelectorAll("[data-cursor]").forEach((el) => {
      el.addEventListener("pointerenter", () => {
        document.body.classList.add("cursor-active");
        label.textContent = el.dataset.cursor || "";
      });
      el.addEventListener("pointerleave", () => {
        document.body.classList.remove("cursor-active");
        label.textContent = "";
      });
    });

    // Magnetic buttons
    if (hasGSAP) {
      document.querySelectorAll(".nav__link, .hero__scroll, .footer__top-btn, .contact__cta").forEach((el) => {
        el.addEventListener("pointermove", (e) => {
          const r = el.getBoundingClientRect();
          const mx = e.clientX - (r.left + r.width / 2);
          const my = e.clientY - (r.top + r.height / 2);
          gsap.to(el, { x: mx * 0.25, y: my * 0.35, duration: 0.6, ease: "power3.out" });
        });
        el.addEventListener("pointerleave", () => {
          gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" });
        });
      });
    }
  }

  /* ---------------------------------------------------------
     8. Project preview that follows the cursor
        (SVG gradient placeholders per project color)
     --------------------------------------------------------- */
  function projectPreviews() {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!finePointer) return;
    const preview = document.getElementById("projectPreview");
    if (!preview) return;

    const pos = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    let active = false;

    function svgFor(color, label) {
      const c = encodeURIComponent(color);
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
        <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='${color}'/>
        <stop offset='1' stop-color='#111113'/></linearGradient></defs>
        <rect width='400' height='300' fill='url(#g)'/>
        <circle cx='320' cy='70' r='120' fill='${color}' opacity='0.35'/>
        <text x='30' y='270' fill='white' font-family='sans-serif' font-size='20' opacity='0.9'>${label}</text>
      </svg>`;
      return "data:image/svg+xml," + encodeURIComponent(svg);
    }

    document.querySelectorAll(".project").forEach((p) => {
      const color = p.dataset.color || "#e8553f";
      const name = p.querySelector(".project__name")?.textContent || "";
      p.addEventListener("pointerenter", () => {
        preview.style.backgroundImage = `url("${svgFor(color, name)}")`;
        preview.classList.add("is-visible");
        active = true;
      });
      p.addEventListener("pointerleave", () => {
        preview.classList.remove("is-visible");
        active = false;
      });
    });

    window.addEventListener("pointermove", (e) => { pos.x = e.clientX; pos.y = e.clientY; });
    (function loop() {
      requestAnimationFrame(loop);
      if (!active) return;
      cur.x += (pos.x - cur.x) * 0.12;
      cur.y += (pos.y - cur.y) * 0.12;
      preview.style.left = cur.x + "px";
      preview.style.top = cur.y + "px";
    })();
  }

  /* ---------------------------------------------------------
     9. Nav: hide on scroll-down, mobile menu, scroll progress
     --------------------------------------------------------- */
  function navAndProgress() {
    const progress = document.getElementById("scrollProgress");
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("mobileMenu");

    function onScroll() {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? (h.scrollTop || window.scrollY) / max : 0;
      if (progress) progress.style.width = (p * 100) + "%";
      if (window.__glSetScroll) window.__glSetScroll(p);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        const open = document.body.classList.toggle("menu-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        menu.setAttribute("aria-hidden", open ? "false" : "true");
        if (lenis) open ? lenis.stop() : lenis.start();
      });
      menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => {
        document.body.classList.remove("menu-open");
        toggle.setAttribute("aria-expanded", "false");
        if (lenis) lenis.start();
      }));
    }
  }

  /* ---------------------------------------------------------
     10. Anchor links via Lenis, back-to-top, local clock
     --------------------------------------------------------- */
  function misc() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id === "#" || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
        else target.scrollIntoView({ behavior: "smooth" });
      });
    });

    const backTop = document.getElementById("backTop");
    if (backTop) backTop.addEventListener("click", () => {
      if (lenis) lenis.scrollTo(0, { duration: 1.4 }); else window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Local time (Copenhagen)
    const timeEl = document.getElementById("localTime");
    if (timeEl) {
      const update = () => {
        try {
          const s = new Intl.DateTimeFormat("en-GB", {
            hour: "2-digit", minute: "2-digit", timeZone: "Europe/Copenhagen",
          }).format(new Date());
          timeEl.textContent = `Copenhagen · ${s}`;
        } catch (e) { timeEl.textContent = "Copenhagen"; }
      };
      update(); setInterval(update, 1000 * 30);
    }
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  function init() {
    initLenis();
    cursor();
    projectPreviews();
    navAndProgress();
    misc();
    marquee();
    counters();
    scrollReveals();
    if (lenis) lenis.stop();
    runLoader(() => {
      if (lenis) lenis.start();
      introAnim();
      if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
