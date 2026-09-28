# Sebastin Jojo — portfolio website

A single-page static site. No framework, no build step, no CMS. The folder you
edit is the folder you deploy.

```
index.html          the whole page — all seven sections
css/style.css       one stylesheet; every colour is a token at the top
js/main.js          nav, scroll reveals, filters, lightbox, video façades
assets/img/         hero, about, works, gallery images
assets/og-image.jpg the card that shows when the link is shared
tools/              optional image-prep helper (not needed to deploy)
robots.txt sitemap.xml 404.html
```

---

## Look at it locally

Double-clicking `index.html` mostly works, but a few things (the lightbox)
behave better over a real server. From this folder:

```bash
python -m http.server 8123
```

Then open <http://localhost:8123>.

## Put it live

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag this whole folder onto the page.
3. It is live in about ten seconds, with HTTPS included.

To use a real domain, add it under **Site settings → Domain management**.
Netlify handles the certificate.

### One thing to do before launch

The site currently points at `https://sebastinjojo.com/`. Once the real domain
is decided, find and replace that address in three files:

- `index.html` — canonical link, `og:url`, `og:image`, `twitter:image`, JSON-LD `url`
- `robots.txt`
- `sitemap.xml`

Until that is done, the WhatsApp/Instagram preview card will not load its image.

---

## Editing the content

Everything repeatable is fenced with an HTML comment that says what it is.
Search `index.html` for the fence, copy the block between the fences, paste it
below, change the words. Nothing else needs touching.

### Add a credit to Experience

Search for `<!-- CREDIT ROW`. Copy the whole `<li>` and edit:

```html
<li class="credit">
  <a class="credit__row" href="#client-bosch">   <!-- where it jumps to -->
    <span class="credit__role">Assistant Director</span>
    <span class="credit__project">Client name</span>
    <span class="credit__meta">Commercial <b>&times;4</b></span>
  </a>
</li>
```

Then update the three numbers in the stat strip just above it (search for
`class="stats"`) so they still add up.

### Add a film to Works

Search for `<!-- WORK CARD`. Copy the whole `<li>` and change four things:

| What | Where |
|---|---|
| The public link | `href="https://www.instagram.com/reel/XXXX/"` |
| `instagram` or `youtube` | `data-platform="..."` |
| The reel shortcode, or YouTube video id | `data-id="..."` |
| The thumbnail | `src="assets/img/works/thumb-....jpg"` |

The `href` and the `data-id` must point at the same video. `href` is what
Google follows and what opens if JavaScript is off; `data-id` is what plays in
the lightbox.

To add a whole new client, copy an entire `<!-- ===== CLIENT GROUP` block, give
it a new `data-client="..."` and `id="client-..."`, then add a matching filter
button in the `class="filters"` group:

```html
<button class="filter" type="button" data-filter="newclient" aria-pressed="false">New Client</button>
```

The `data-filter` value must match the `data-client` value exactly.

### Add gallery images

Search for `<!-- GALLERY IMAGE`. Copy the whole `<button>`, change the two
paths (`data-full` and `src` — they are the same file), the `alt` text, and the
`width`/`height` to the real pixel size of the image.

**Always set `width` and `height`.** They are what stops the page jumping
around while photos load.

Anything past the first twelve gets `class="tile is-extra"` so it stays behind
the "Show more" button.

### Change a colour

Top of `css/style.css`, in the `:root` block. `--accent` is the gold; changing
that one line restyles every link, button, focus ring and active nav item.

---

## Preparing images before you add them

Photos straight off a camera or out of Drive are far too heavy. Every image on
this site is capped at **250 KB** and saved in three formats so browsers pick
the smallest one they understand.

The easy way — [squoosh.app](https://squoosh.app):
resize to the width in the table below, export AVIF at quality 55, WebP at 75,
and JPG at 82.

The repeatable way:

```bash
pip install pillow
python tools/optimise-images.py "C:/path/to/photos" gallery
```

| Kind | Width | Goes in |
|---|---|---|
| Hero portrait | 640 / 1000 / 1280 | `assets/img/hero/` |
| Poster | 800 × 1200 (2:3) | `assets/img/works/` |
| Frame grabs | 1400 | `assets/img/works/` |
| Video thumbnails | **1080 × 1350 (4:5)** | `assets/img/works/` |
| Gallery stills | 1400 | `assets/img/gallery/` |

Export every video thumbnail at 4:5. The cards are built for that shape, and
mixing ratios is what makes a grid look untidy.

### YouTube thumbnails

The three DMK YouTube films have thumbnails you can pull straight from Google
rather than screenshotting:

```bash
curl -o thumb-dmk-yt-01.jpg https://i.ytimg.com/vi/-RH0utOxvyc/maxresdefault.jpg
curl -o thumb-dmk-yt-02.jpg https://i.ytimg.com/vi/Nji6wbfoltU/maxresdefault.jpg
curl -o thumb-dmk-yt-03.jpg https://i.ytimg.com/vi/onp4bkOl0uI/maxresdefault.jpg
```

They arrive 16:9, so crop to 4:5 before dropping them in `assets/img/works/`.

Instagram has no equivalent — those stills have to be captured by hand from
each reel and exported at 1080 × 1350.

---

## What is still a placeholder

Every grey box with a label in it is a placeholder SVG waiting for a real
photo. Replace the file, change the extension in the markup from `.svg` to
`.jpg`, and update `width`/`height`. Nothing else changes.

| Placeholder | Count | Waiting on |
|---|---|---|
| `works/athiru-poster.svg` | 1 | The poster from Drive |
| `works/athiru-grab-*.svg` | 8 | Frame grabs from Drive |
| `works/thumb-*.svg` | 14 | Stills captured from each reel |
| `gallery/bts-*.svg` | 18 | Behind-the-scenes stills from Drive |

The hero portrait and the About photo are real — both are crops of the
photograph supplied in the brief.

Google Drive links are deliberately **not** used anywhere in the site. Drive
rate-limits, breaks hotlinks and asks people to sign in; it is not a CDN.
Download, optimise, and serve from `assets/`.

---

## Open items from the PRD

These are the things that were not answerable from the brief. Each one names
the exact place in the code that is waiting for it.

| # | Needed | Where it goes |
|---|---|---|
| Q1 | **Three correct Bosch reel URLs.** Three of the four in the brief were duplicates of the Vivo reel, so only the one genuine Bosch film was published. | `index.html`, Bosch client group — three ready-made cards are commented out, paste the shortcodes and delete the comment markers |
| Q2 | Year, runtime, genre and a one-line logline for *Athiru* | `index.html`, search `TODO (PRD Q2` — the rows are written and commented out |
| Q3 | A trailer or full-film link for *Athiru* | `index.html`, search `TODO (PRD Q3` |
| Q4 | Which Drive images to use, curated to 15–20 per gallery | `assets/img/gallery/` |
| Q5 | "Thoomai Mission" or "Toomai mission" — the brief uses both. **Thoomai Mission** is used throughout. | 3 places in `index.html` |
| Q6 | The domain | 3 files, see "One thing to do before launch" |
| Q7 | A second photograph for About (an on-set candid). Currently a tighter crop of the same portrait. | `assets/img/about/` |
| Q8 | Base location. **Kerala, India** is used. | Footer and JSON-LD in `index.html` |
| Q9 | "Problem Solver" → **Problem Solving** was applied for grammatical parallelism. | Skills section |
| Q10 | Whether to offer a downloadable CV | Not built |
| Q11 | The DMK brief lists 8 links but credits "7 ads". All 8 are published; Experience says 7. | DMK client group |
| Q12 | Written permission to show client work publicly | — |

## Things in the brief that did not match, and what was done

- **Phone number.** The source PDF says `+91 8921971766`; the PRD wrote it as
  `+91 89217 91766`. Those are different numbers. The site uses the PDF's
  version. **This needs confirming before launch** — a wrong phone number on a
  hiring page is the single most expensive error here.
- **YouTube link.** The PRD's `Nji6wbfoItU` returns a 404; the PDF's
  `Nji6wbfoltU` (lowercase L) is the real video. The working one is used.
- **Thoomai reel.** The PDF says `DbVgCjGx_Jh`; the PRD wrote `DbVqCjGx_Jh`.
  The PDF's version is used.
- **Stat strip.** The PRD asked for "14 ads". The five credits add up to
  4 + 1 + 7 + 1 = **13**. The strip says 13.
- **The Malayalam note** on page 2 of the PDF is a message to the designer, not
  copy. It does not appear on the site.
- **Fonts.** The PRD asks for self-hosted WOFF2 files; none were supplied, so
  the site uses a system font stack — a high-contrast serif for headings, the
  platform UI sans for body. This costs zero requests and renders instantly.
  To swap in real fonts later, drop the WOFF2 files into `assets/fonts/`, add
  `@font-face` rules, and change `--font-display` / `--font-body` in
  `css/style.css`. Nothing else needs to change.

---

## Performance notes

Measured locally at 1200 × 800:

- Largest Contentful Paint is the hero portrait, and it is preloaded.
- Cumulative Layout Shift is **0** — every image has explicit dimensions.
- `js/main.js` is 4 KB gzipped, well inside the 10 KB budget.
- No video embed exists until someone clicks a card. Closing the lightbox
  removes the iframe from the page, which is what actually stops the audio.

One caveat on the PRD's "under 30 requests" target: the site as specified
contains 33 images (1 poster + 8 grabs + 14 thumbnails + 18 stills, minus
overlap), so 30 is only reachable because everything below the fold is
`loading="lazy"` and does not load until it is scrolled near. If the number
matters, the lever is showing fewer gallery tiles before "Show more" — change
which `.tile` elements carry `is-extra`.

## Analytics

Not installed. When you want it, add one line before `</body>`:

```html
<script defer data-domain="sebastinjojo.com" src="https://plausible.io/js/script.js"></script>
```

Plausible and Fathom are both cookieless, so no consent banner is needed.
Google Analytics would require one.
