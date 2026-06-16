# Aria Solenne — UI/UX Designer Portfolio

An awwwards-style landing page for a fictional independent UI/UX designer.
Built as a self-contained static site with an immersive WebGL background,
buttery smooth scrolling, and choreographed scroll-driven motion.

![Hero](https://img.shields.io/badge/status-live-e8553f) ![Deps](https://img.shields.io/badge/runtime%20deps-none-1faa6b)

## ✦ Highlights

- **WebGL hero background** — a full-screen GLSL shader (domain-warped
  simplex noise) that reacts to the pointer and scroll position, rendered
  with Three.js. Degrades gracefully if WebGL is unavailable.
- **Smooth scroll** — Lenis-powered inertia scrolling, synced into GSAP
  ScrollTrigger.
- **Choreographed motion** — preloader, masked text reveals line-by-line,
  staggered hero intro, scroll parallax, animated stat counters, and a
  scroll-reactive marquee, all via GSAP.
- **Custom cursor** — blend-mode cursor with contextual labels, magnetic
  buttons, and a project preview that follows the pointer.
- **Fully responsive** — fluid `clamp()` typography, a single-column mobile
  layout, and a full-screen animated mobile menu.
- **Accessible & resilient** — honors `prefers-reduced-motion`, keeps the
  cursor native on touch devices, and works even if the JS libraries fail
  to load.

## ✦ Tech

| Concern        | Tool                          |
|----------------|-------------------------------|
| 3D / shaders   | Three.js (r128)               |
| Animation      | GSAP 3 + ScrollTrigger        |
| Smooth scroll  | Lenis                         |
| Type           | Fraunces (serif) + Space Grotesk |

All libraries are **vendored locally** in `js/vendor/`, so the site has no
external runtime dependencies and runs fully offline (fonts load from
Google Fonts with system-serif/sans fallbacks).

## ✦ Run it

It's a static site — just serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## ✦ Structure

```
index.html        # markup + content
css/style.css     # design tokens, layout, responsive rules
js/webgl.js       # Three.js shader background
js/main.js        # Lenis + GSAP interactions
js/vendor/        # vendored gsap, scrolltrigger, lenis, three
```

## ✦ Notes

This is a fictional portfolio created as a design/engineering showcase.
"Aria Solenne", the projects, and all copy are invented.
