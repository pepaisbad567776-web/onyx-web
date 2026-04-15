# Onyx — Landing Page

> The companion who pays attention.

Static landing page for [Onyx](https://getonyx.app) — an AI companion that tracks your money, your habits, and your momentum, and tells you the truth about all of it.

Built by [J-Works HQ](https://github.com/jworks-hq). One person. $500. Thirty days.

---

## What's in here

```
onyx-web/
├── index.html        → the page
├── styles.css        → the look
├── script.js         → the console animation + form handling
├── README.md         → this file
├── DEPLOY.md         → one-click deploy guide (Vercel / Netlify / GitHub Pages)
└── .gitignore
```

Pure HTML/CSS/JS. No build step. No framework. No dependencies. Just drop it on any static host and it's live.

---

## Run it locally

```bash
# easiest: just open index.html in a browser

# or serve it (better — localStorage/IntersectionObserver behave properly)
cd onyx-web
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## Deploy it

See [DEPLOY.md](./DEPLOY.md) — takes under ten minutes, costs $0.

**Shortest path:** push this repo to GitHub, connect Vercel, done.

---

## Design system

| Token | Value |
|---|---|
| Background | `#070707` |
| Surface | `#121212` |
| Gold (accent) | `#c9a84c` |
| Text | `#ededed` |
| Serif (display) | Instrument Serif |
| Sans (body) | Inter |
| Mono (labels / console) | JetBrains Mono |

Full brand guidelines in `/mnt/outputs/ONYX-Brand-Guidelines.md`.

---

## What this page has to do

1. **Make you feel something in the first 3 seconds.** The hero + console combination is the whole pitch.
2. **Not look like an AI built it.** Editorial typography, asymmetric layout, real voice, specific copy, restrained gold.
3. **Capture emails.** That's the only conversion goal right now.
4. **Load fast everywhere.** ~40 KB total, no JS frameworks, zero external JS.

---

## Next up

- [ ] Swap `localStorage` email capture for a real backend (Supabase or a form endpoint like Basin/Getform).
- [ ] Add a favicon + proper OG image.
- [ ] Update domain references from `getonyx.app` to whatever domain we actually land.
- [ ] Swap in real TikTok/demo content when we have it.
- [ ] Add `robots.txt` + `sitemap.xml` when we go live.

---

Built for the ones figuring it out alone.
