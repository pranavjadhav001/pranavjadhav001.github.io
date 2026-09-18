# Blog design guidelines

Canonical design system for everything under `blogs/*.md` (front matter `layout: blog`, distinct from the Phantom home/theme). Sourced from `blogs/unraveling-paligemma.md`, the most complete post and the one every component below was pulled from directly. When writing or editing a post, reuse these patterns instead of inventing new markup or CSS ad hoc — new components should still go through `_sass/_blogs.scss` so every post gets them for free.

Related: [[blog_shared_libraries]] (memory) for the history/rationale behind this system.

## Page shell

Front matter fields `_layouts/blog.html` reacts to:

```yaml
---
layout: blog
permalink: /blogs/<slug>/
title: 'Post Title'
lead: "One-sentence description, used as <meta name=description> and OG/Twitter card text."
date: 2026-09-12
mathjax: true      # wires in MathJax 3 (tex-mml-chtml.js via jsdelivr) — only if the post has real LaTeX
code: false        # wires in Prism.js core+clike+python — only if the post has fenced Python code
social_image: /img/blogs/<slug>/<name>.png   # optional; enables OG/Twitter card meta
---
```

Don't set `mathjax`/`code` to `true` speculatively — they pull in render-blocking scripts. Only flip them on once the post actually has a `$...$`/`$$...$$` formula or a Python code block.

Body markup, every post:

```html
<div class="back-link-wrap"><a class="back-link" href="/">&larr; Home</a></div>

<div class="page">
  <header class="masthead">
    <div>
      <div class="eyebrow">category &middot; another tag</div>
      <h1>Post Title</h1>
      <p class="subtitle">Same sentence as `lead`, or a close variant.</p>
      <p class="meta-line"><b>Short label</b><span class="sep">&middot;</span>Tag1 &middot; Tag2 &middot; Tag3</p>
    </div>
    <button class="theme-toggle" id="themeToggle" type="button" aria-label="Toggle color theme"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="6" ry="9" fill="currentColor"/><path d="M12 4 C9 8 15 8 12 12 C9 16 15 16 12 20" fill="none" stroke-width="1.4" stroke-linecap="round" style="stroke:var(--paper)"/></svg></button>
  </header>

  <nav class="toc" aria-label="Table of contents">
    <p class="toc-title">Contents</p>
    <ol>
      <li><a href="#section-id">Section title</a>
        <ol><li><a href="#sub-id">Sub-section</a></li></ol>
      </li>
    </ol>
  </nav>

  <div class="prose">
    <section>
      <h2 id="section-id">Section title</h2>
      <!-- content -->
    </section>
  </div>
</div>

<script>
  (function () {
    var toggle = document.getElementById("themeToggle");
    if (!toggle) return;
    var root = document.documentElement;
    toggle.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var effectiveIsDark = current ? current === "dark" : prefersDark;
      root.setAttribute("data-theme", effectiveIsDark ? "light" : "dark");
    });
  })();
</script>
```

**Important nuance**: the theme-toggle script above is **not** shared in `_layouts/blog.html` — every post carries its own copy inline, right before `</body>` (after the closing `</div>`). The lightbox overlay (below) *is* shared, injected once by the layout. Don't confuse the two when copying a post as a template.

There is no `@media (prefers-color-scheme)` CSS fallback — `:root` (undecorated) always resolves to the light-mode values. Dark mode only activates once the toggle sets `data-theme="dark"` on `<html>`; the toggle's own JS is what consults `prefers-color-scheme` to pick a sensible first flip.

## Tokens

Defined once in `_sass/_blogs.scss`, shared by every post and every component below. Redefine none of these per-post.

| Token | Light | Dark | Used for |
| --- | --- | --- | --- |
| `--paper` | `#F7F0E7` | `#0F172A` | page background base |
| `--ink` | `#272027` | `#F2F2F2` | body text, headings |
| `--rule` | `#E4DBC9` | `#263449` | borders, dividers, dotted underlines |
| `--muted` | `#7C6F64` | `#94A3B8` | secondary text (eyebrow, captions, meta) |
| `--bg-highlight` | `#FFFFFF` | `#16233A` | radial-gradient highlight corner |
| `--bg-fade` | `#F7F0E7` | `#000000` | radial-gradient fade corner |
| `--highlight` | `#F0C36D` | `#475569` | accent (pull-quote rule, timeline dot, table `.hl`) |
| `--code-bg` / `--code-keyword` / `--code-string` / `--code-number` / `--code-function` / `--code-comment` | rose-pine-dawn palette | dark variants | Prism.js + Rouge token colors |

Fonts: **Geist** (variable, body text) and **JetBrains Mono** (variable, code/formulas/diagram labels), both self-hosted under `/fonts/`, loaded via `@font-face` in `_sass/_blogs.scss`.

Body text is `14px` base; most components then set their own `rem`-relative size on top.

## Layout primitives

- `.page` — `max-width: 820px`, centered, is the outermost content column for everything except `.back-link-wrap`.
- `.masthead` — eyebrow / `h1` / subtitle / meta-line on the left, theme-toggle button on the right, bottom-ruled.
- `.toc` — boxed nav, auto-numbered via CSS counters (`counter(toc)`), supports one level of nesting (sub-`<ol>` renders smaller and indented, un-numbered).
- `.prose` — everything else. `section` is the unit (`margin-bottom: 3.25rem`); `h2`/`h3`/`h4` step down in weight and add `scroll-margin-top` so anchor jumps clear the sticky-ish top. Paragraphs and lists cap at `68ch`/`66ch` for readability regardless of column width.
- `.prose details.collapsible` — native `<details>`/`<summary>` with a rotating `▸` marker and no default marker; put an `h3`/`h4` directly inside `<summary>` for a collapsible sub-section.

## Components

Each is opt-in per post; only pull in the markup for what the post actually needs. All are already live in `_sass/_blogs.scss` — none require new CSS unless you're adding a genuinely new pattern (in which case, add it there, not inline).

### Formula box

Two distinct mechanisms, pick based on content:

- **Plain / arrow-notation** (no real LaTeX): `<pre class="formula">a = b − c</pre>` or `<div class="formula">...</div>`. Monospace, boxed, no MathJax needed.
- **Real LaTeX**: set `mathjax: true` in front matter, then `<div class="formula">$$\text{softmax}(x_i) = \frac{\exp(x_i)}{\sum_j \exp(x_j)}$$</div>` (display) or inline `$...$`. MathJax config lives in `_layouts/blog.html`, not per-post.

### Figures (with lightbox)

```html
<figure class="figure">
  <div class="figure-frame">
    <a href="<full-res-src>" target="_blank" rel="noopener"><img src="<src>" alt="<real description>"></a>
  </div>
  <figcaption class="figure-caption">Fig. N. Caption text. Source: <a href="..." target="_blank" rel="noopener">short link text</a>.</figcaption>
</figure>
```

- The `<a target="_blank">` wrapper is kept for no-JS/crawler fallback, but a delegated click listener in `_layouts/blog.html` intercepts clicks on any `.figure-frame img` and opens the shared in-page lightbox overlay instead (`preventDefault()`s the anchor). You never need to write lightbox markup yourself — one overlay is injected once per page.
- Add `.is-wide` on `.figure-frame` for a fixed-height (420px desktop / 260px mobile), horizontally-scrollable frame instead of a width-constrained image — for very wide screenshots.
- Write a real, descriptive `alt` (accessibility, and it's what shows while the image loads) — every example in the reference post does.

### Architecture diagrams (hand-drawn inline SVG)

The heaviest component, worth getting right. Structure:

```html
<div class="diagram-wrap">
  <div class="legend">
    <div class="legend-item"><span class="swatch module"></span>module / op</div>
    <div class="legend-item"><span class="swatch repeat"></span>repeated block (&times; N, stacked)</div>
    <div class="legend-item"><span class="swatch flow"></span>tensor flow</div>
    <div class="legend-item"><span class="swatch add"></span>&oplus; residual add</div>
  </div>
  <figure>
    <svg viewBox="0 0 900 500" role="img" aria-label="Full prose description of what the diagram shows, mechanism first.">
      <defs>
        <marker id="<unique>-arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7.5" markerHeight="7.5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--d-red)"/>
        </marker>
        <filter id="<unique>-rough" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="2" seed="11" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4.2" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
      <polygon class="term" points="..." filter="url(#<unique>-rough)"/>
      <text x="..." y="..." class="lbl" text-anchor="middle">Input Image</text>
      <text x="..." y="..." class="sub" text-anchor="middle">(B, 256, dim)</text>
      <!-- ... -->
    </svg>
  </figure>
  <figcaption>
    <p>Optional prose paragraph, or a <code>dt</code>/<code>dd</code> glossary of the diagram's components.</p>
  </figcaption>
</div>
```

**Non-obvious rules**, all learned from the reference post:

1. **Every diagram declares its own turbulence filter, uniquely named** (`#rough`, `#cls-rough`, `#mha-rough`, ...). SVG ids are document-global — reusing `#rough` across two diagrams on the same page means the second one silently breaks (or both just reference whichever def parses last). Never share a filter id between diagrams.
2. **Only include legend items the diagram actually uses.** Not every diagram needs all four of module/repeat/flow/add — one diagram in the reference post uses only module + flow, another only defines its own one-off swatch (`<span class="actgrowth-lineswatch" style="background:var(--d-teal-strong)">`) for something outside the standard vocabulary (a line-chart legend). Extend the legend with an inline-styled custom swatch rather than forcing a concept into module/repeat/flow/add if it doesn't fit.
3. **Shape classes**: `.term` (rounded/chamfered polygon, start/end), `.proc` (rect, an op), `.container`/`.containerOuter` (a repeated-block wrapper, with `.ghost` copies stacked behind it for the "×N" effect), `.addnode` (circle, residual add), `.shapepill` (a small annotation pill), `.arrow`/`.skip` (flow lines, `.skip` for skip-connections at lower opacity).
4. **Text classes**: `.lbl` (bold, primary label), `.sub` (secondary, e.g. tensor shape), `.clbl` (teal, a repeated-block's "× N" caption), `.shapetxt` (red, calls out a shape/dimension inline on the diagram itself).
5. **Color roles** are all `--d-*` custom properties scoped to `.diagram-wrap`, with a `:root[data-theme="dark"] .diagram-wrap` override block right below the light values — teal for structure/flow, red for arrows/residual-adds/annotations. Never hardcode a hex color inside a diagram's `<style>` or inline `fill`/`stroke` — always the `--d-*` var, so dark mode falls out for free.
6. Wrap the whole `.diagram-wrap` in `.is-compact` (adds the modifier class) when the diagram is small enough to not need horizontal scroll on mobile (`overflow-x: visible`, no `min-width: 640px` floor).
7. Building the SVG is the real work; there's no generator. Lay it out with throwaway coordinate-computing Python (or by hand for small diagrams), preview in a headless browser or local server, iterate, then paste the final SVG in. Do not hand-guess pixel coordinates for anything non-trivial.

### Tables

```html
<div class="table-wrap">
  <table class="blog-table">
    <thead><tr><th>Variant</th><th>...</th></tr></thead>
    <tbody>
      <tr><td>Row</td><td>...</td></tr>
      <tr class="hl"><td>Highlighted row</td><td>...</td></tr>
    </tbody>
  </table>
  <p class="table-caption">Table N. One-line caption.</p>
</div>
```

`.table-wrap` gives horizontal scroll on narrow viewports (`min-width: 480px` on the table itself) instead of squeezing columns. Use `class="hl"` on a `<tr>`, or `class="hl"` on an individual `<td>`, to call out one row/cell (e.g. the "chosen" option in a comparison table).

### Stage flow (horizontal pipeline)

For a small, fixed number of named stages/phases in sequence (training stages, a pipeline):

```html
<div class="stage-flow">
  <div class="stage-col">
    <p class="stage-label">Stage 0</p>
    <p class="stage-name">Unimodal Pretrain</p>
    <p class="stage-desc">What happens in this stage.</p>
    <p class="stage-outcome">What you get out of it.</p>
  </div>
  <div class="stage-connector">&rarr;</div>
  <!-- repeat stage-col / stage-connector -->
</div>
```

Collapses to a vertical stack (connector rotates 90°) under 640px automatically — no per-post responsive work needed.

### Other components available in `_sass/_blogs.scss` (not used in the reference post, but part of the same system — reach for these before inventing something new)

| Component | Classes | Use for |
| --- | --- | --- |
| Callout note | `.note` + `.note-label` | A short aside that isn't quite a blockquote (a caveat, a "why this matters") |
| Pull quote | `.pull-quote` (+ `cite`) | A standalone emphasized quote/claim, with attribution |
| Portrait | `.portrait` (+ `.portrait-caption`) | A floated image with text wrapping around it |
| Vertical flow diagram | `.flow-diagram` > `.flow-step` / `.flow-arrow` | A simple linear pipeline drawn top-to-bottom (vs. `.stage-flow`'s horizontal layout) |
| Timeline | `.timeline` > `.timeline-item` (+ `.timeline-date`/`.timeline-title`/`.timeline-desc`) | A chronological list of events (used in the EchoJEPA post) |
| Interactive chart | `.lr-widget` / `.lr-frame` / `.lr-*` (see `dl-101.md`) | Any small interactive SVG chart the reader steps through (not limited to linear regression despite the class prefix) |
| Section label | `.section-label` | A small uppercase eyebrow heading used inside a deep-dive, above a sub-block that isn't a full `h3`/`h4` |
| Code block (client) | Prism.js, `<pre><code class="language-python">` | Only with `code: true` in front matter |
| Code block (build-time) | Rouge / kramdown fences | Same `--code-*` token colors as Prism, no client JS — prefer this over Prism unless you specifically need client-side highlighting |

### Closing / sources

```html
<p>Closing thoughts paragraph(s), inside the last <section>.</p>

<section class="sources">
  <h2 id="sources">Sources</h2>
  <ol>
    <li>Author: <em>Title</em>, <a href="..." target="_blank" rel="noopener">arXiv:xxxx.xxxxx</a> (year)</li>
  </ol>
</section>
```

`.closing-note` (italic, muted, narrower column) is available for a standalone editorial closing line, as an alternative to ending on a plain `<p>` inside the last section — the reference post ends on a plain paragraph, both are valid.

## Content conventions

- **Avoid em dash** (already in `CLAUDE.md`) — use a period, colon, or parenthetical instead. Older posts predate this rule and still use `&mdash;` throughout; don't mass-edit them, just don't add new ones.
- Write `alt` text as a real description of what the image shows, not a filename or "screenshot of X" — it doubles as loading-state text and an accessibility label.
- Sources go in numbered `<li>` entries, author-first, linked, with `target="_blank" rel="noopener"`.
- Prefer the plain `.formula` box for arrow/pseudocode-style math; reach for MathJax only when the notation genuinely needs LaTeX rendering (fractions, sums, subscripts stacked deeply).

## Animated/explainer figures: the chalkboarding skill

For a figure that needs to **animate a mechanism as a sequence of beats** (something is drawn, then something else appears in response, then a conclusion) rather than sit as a static technical diagram, use the **chalkboarding** skill (`/chalkboarding`) instead of hand-rolling `.diagram-wrap` animation. It produces a self-contained, hand-drawn-chalk-style HTML figure (dark green board, chalk font, an eraser/replay button) that steps through beats like a lecture.

**When to reach for it**:
- Explaining a concept "in motion" — a residual forming, a training loop step, a comparison that resolves over a few seconds — where the *order* things appear in is part of the explanation.
- A playful, everyday-story framing is a better teaching tool than another boxes-and-arrows diagram (it explicitly favors a character/story over abstract shapes).
- Iterating on an existing `*_chalk.html` file — just point the skill at it.

**When *not* to**: precise architecture/tensor-shape diagrams (`.diagram-wrap` is the right register for those — it's the "paper" technical-diagram look, not the chalkboard one), or anything that's just a static illustration with no sequencing to it.

**Wiring it into a post** (see `blogs/dl-101.md` + `blogs/dl-101/gradient_descent_chalk.html` for a worked example):
1. Output the figure's `.html` file (plus its copy of `PencilPete.ttf`) into a `blogs/<slug>/` subdirectory next to the post.
2. Embed it via `<div class="lr-widget"><iframe id="..." src="/blogs/<slug>/<name>.html" title="..." loading="lazy" style="width:100%;height:420px;border:0;display:block"></iframe><p class="lr-caption">...</p></div>`.
3. Add the small `postMessage` listener script (the figure posts `{chalkHeight, chalkSrc}` on load/resize; the post-side listener resizes the iframe to match, so there's no dead space or scrollbar) — copy the exact snippet from `dl-101.md`, don't reinvent it.
4. Run the skill's own QA (`bash scripts/qa.sh <file>.html --beats <start>,<mid>,<end> --replay`) before wiring it in, and again after any edit to the figure.
