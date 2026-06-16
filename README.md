# Kristian Bundgaard — Ideamaker

A portfolio that is not a portfolio.
It is a manifesto that happens to have a contact button.

> *What does the world need more of?*
> **Health.**

## ✦ The feeling

Like entering a dark library at 11pm. Everything is still, everything in its
place. One person who knows exactly what they want to say to you. Not loud,
not a gallery, not a brochure — calm, intentional, memorable. Sacred, but
never solemn.

## ✦ Design

- **Near-black** `#0F0F0E` ground, **off-white** `#F0EDE8` text, a single
  **lamplight-gold** accent `#C9A35B` used sparingly.
- Editorial serif (**Playfair Display**) for voice; clean sans (**Inter**)
  for body.
- No gradients, no decoration, no spectacle. Only typography, space and
  intention.

## ✦ Structure

1. **Hero** — the question, its answer, the name. Nothing else.
2. **Credo** — *"I don't build answers. I build better questions."*
3. **The ideas** — Claire · The Daily Reader · The Human Renaissance
   (accordion, one open at a time).
4. **About** — five lines, one ambition: Health.
5. **Contact** — *Sacred, but never solemn.* → Get in touch.

Content is drawn from Kristian's own words — *"Same truth. Different forms."*,
*The Multiplier* thesis, and his work-in-progress book *The Renaissance*.

## ✦ Motion

GSAP + ScrollTrigger, used quietly:
- Slow, deliberate staggered fade-in on load (question → answer → name).
- Scroll-triggered reveals — each section enters calmly.
- Smooth accordion expansion; hover is a subtle underline / colour shift only.

No parallax. No scroll-jacking. Honors `prefers-reduced-motion`.

## ✦ Technical

- A single `index.html` with embedded CSS and JS — no frameworks, no build step.
- **Self-hosted** fonts (`assets/fonts/`) and a **local** copy of GSAP +
  ScrollTrigger (`js/vendor/`), so the site loads fast and works fully
  offline with zero external runtime dependencies.
- Mobile-first and responsive — verified at 375px and on desktop.

## ✦ Run it

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

---

*Same truth. Different forms.*
