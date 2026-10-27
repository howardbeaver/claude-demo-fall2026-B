# MyVideoPlayer

One-page video portfolio: a hero `<video>` above a scrolling strip of
thumbnails. Clicking a thumbnail plays that video in the hero. Plain HTML, CSS
and JavaScript (an ES module), with no framework, build step or npm.

- Live: https://demo-fall2026-b.vercel.app
- Repo: https://github.com/howardbeaver/claude-demo-fall2026-B (every push to
  `main` redeploys on Vercel)

## Files

```
index.html        the page: header + nav, hero video, gallery strip, footer
css/style.css     all styles; design tokens on :root
js/main.js        thumbnail clicks, poster preloading, strip arrows, phone menu
dev-server.py     local server with HTTP Range support (dev only)
images/           background.jpg, favicon.svg
posters/          <name>-thumb.png (143x105) and <name>-frame.jpg per video
video/            sue-vid1–3.mp4 (1472x1080, no audio), sample-1–2.mp4 (640x360, audio)
.vercelignore     keeps dev-only files (dev-server.py, README, CLAUDE.md, .claude/) off the live site
```

`cursor-demo.jpg` (the design mockup) and `Claude prompts 2.rtf` are local
reference files. They are intentionally untracked, so don't commit them.

## Run locally

```bash
python3 dev-server.py 8001
```

Then open http://localhost:8001. With no argument it uses port 8000, but the
user's older project often already holds 8000 (`.claude/launch.json` still
points at 8000).

- **Don't use `python3 -m http.server`.** It ignores Range requests, and Safari
  won't play `<video>` without them.
- Start the server in a Terminal-panel tab, then open the preview by URL.
- Editing `index.html` makes the app open a `file://` preview tab, which shows
  the page without working video. Close it and use the localhost tab.

## Design

Desktop is measured from the 1200x800 mockup, so keep it pixel-faithful. At
1200x800 the page fits exactly with no scrolling.

- **Header/footer:** 68px bars of `--glass` (white at 60%). Logo is bold Courier
  New 30px at x=46. Nav (About, Events, Contact) is Helvetica 18px, held where
  the mockup puts it by `padding-right: clamp(24px, 19vw, 228px)`. Footer text
  is 14.5px, sitting 10px below centre.
- **Hero:** 656px wide, 8px `--navy` border, soft shadow, video at
  `aspect-ratio: 1472 / 1080`. Videos of another shape show whole, with black
  bars.
- **Gallery strip:** `--navy-strip`, same 656px width as the hero, 21px below
  it. One row of fixed 143x105 thumbnails, 14px gaps, 21px edges, so exactly 4
  fit. It scrolls by swipe or trackpad with no visible scrollbar, and snaps to
  whole thumbnails.
- **‹ › arrows:** 28x60 and overlaid on the strip's ends. Each click scrolls one
  page of whole thumbnails (4 on desktop, 2 at 375px, 1 at 320px). Each arrow
  is disabled (hidden) at its end of the row, and both hide when nothing
  overflows.
- **Playing thumbnail:** bright yellow glow (`--glow`) plus `aria-current="true"`.
- **Centring:** hero, strip and footer text are centred on the page. The
  mockup has them slightly right of centre; centring was a deliberate choice.
- **Background:** `images/background.jpg` on a fixed `body::before` layer,
  because iOS Safari ignores `background-attachment: fixed`.
- **Breakpoint at 600px.** At that width and below, the nav collapses behind a
  hamburger dropdown, which closes on a link, an outside click, Escape, or
  widening past 600px. The strip stays a full-size scrolling row.
- Colors live in `:root` (`--navy`, `--navy-strip`, `--ink`, `--glow`,
  `--glass`, `--glass-menu`). Reuse them rather than adding new hex values.
- There's no Sign in link (deliberately left out). About, Events, Contact and
  the footer text are placeholders (`href="#"`).

## Player behavior (js/main.js)

- sue-vid1 autoplays on load (`autoplay muted loop playsinline`, with
  `controls`). Every video loops, and the hero stays muted; visitors unmute
  with the controls.
- Clicking a thumbnail swaps the hero's `src` and `poster` and calls
  `hero.play()`. **Call `play()` synchronously inside the click handler**,
  because Safari only allows playback started directly by a user action.
- Clicking the playing thumbnail restarts its video instead of reloading it.
- A visually hidden `#now-playing` live region announces "Now playing: Video N".
- All poster frames are preloaded after `load`, so switching never shows a
  blank player.

## Adding a video

No JavaScript changes are needed; the gallery is the list in `index.html`.

1. Put the MP4 in `video/`. Check it's faststart (`moov` before `mdat`); if
   not, run `ffmpeg -i in.mp4 -c copy -movflags +faststart out.mp4`.
2. Make the still frame and the thumbnail from the same moment (`-ss`):

   ```bash
   ffmpeg -ss 2 -i video/NAME.mp4 -frames:v 1 -q:v 3 posters/NAME-frame.jpg
   ffmpeg -ss 2 -i video/NAME.mp4 -frames:v 1 -vf "crop=ih*143/105:ih,scale=143:105:flags=lanczos" posters/NAME-thumb.png
   ```

   The thumbnail is cropped to fill 143x105. The frame keeps the video's own
   shape. For a frame narrower than 143:105, crop the height instead.
3. Add an `<li>` to `ul.gallery` in `index.html`, copying an existing one:
   `data-video`, `data-poster`, the thumbnail `src`, and `alt="Video N"`.

## Deploy

Vercel serves the repo root as a static site (Framework Preset: Other, no
build command). Every push to `main` redeploys within about a minute. Asset
paths must stay relative and match the filenames' case exactly, because
Vercel's filesystem is case-sensitive and macOS isn't.

## Working agreements

- Work in milestones, and commit at the end of each one with a message starting
  with its ID (`M8: …`). Push to GitHub only when the user asks.
- When something needs clarifying, ask the user one question at a time, and
  don't make assumptions. Only start building when the user asks.
- Verify changes in the browser preview at 1200x800 (desktop) and 375px
  (phone), plus 320px for layout changes, before committing.
- This project was started from scratch. Don't copy code from the user's older
  video player project (`Desktop/claude-demo-fall2026`).
- Keep this file up to date when the site changes.

## Milestones so far

M1 setup and dev server · M2 desktop layout from the mockup · M3 thumbnail
clicks (yellow glow) · M4 phone layout and hamburger · M5 polish (poster
preloading, favicon, 320px fixes) · M6 Vercel deploy · M7 sample-1/2 videos and
the scrolling strip.
