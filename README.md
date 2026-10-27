# MyVideoPlayer

A one-page video portfolio: a hero video player with a gallery of thumbnails
below it. Clicking a thumbnail plays that video in the hero. Plain HTML, CSS
and JavaScript, with no framework or build step.

- Live: https://demo-fall2026-b.vercel.app
- Hosted on Vercel as a static site (Framework Preset: Other, no build
  command). Every push to `main` redeploys it.

## Run locally

From this folder:

```bash
python3 dev-server.py
```

Then open http://localhost:8000. Stop the server with Ctrl+C.

To use another port, pass it as an argument: `python3 dev-server.py 8001`.

Use `dev-server.py` rather than `python3 -m http.server`: Safari won't play
`<video>` unless the server supports HTTP Range requests, and the built-in
server doesn't.

## Files

```
index.html      the page
css/style.css   styles
dev-server.py   local development server (not deployed)
images/         background.jpg
posters/        thumbnails (*-thumb.png) and poster frames (*-frame.jpg)
video/          the videos
```
