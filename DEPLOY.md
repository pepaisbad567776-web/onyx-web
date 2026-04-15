# Deploy Onyx in 10 minutes

You have three options. Vercel is the recommended one.

---

## Option A — Vercel (recommended, 5 min)

### 1. Push to GitHub

```bash
cd onyx-web
git init
git add .
git commit -m "initial commit: onyx landing"
git branch -M main

# create a repo on github.com first (make it public or private, doesn't matter)
git remote add origin https://github.com/<YOUR_USERNAME>/onyx-web.git
git push -u origin main
```

### 2. Connect Vercel

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub
2. Click **"Add New → Project"**
3. Select the `onyx-web` repo → **Import**
4. Leave all defaults (framework preset: "Other", no build command, output = root)
5. Click **Deploy**

You'll have a live URL in ~30 seconds (`onyx-web-xxxx.vercel.app`).

### 3. Point a custom domain at it (optional, do this when you buy `getonyx.app` or whatever)

1. Vercel project → **Settings → Domains → Add**
2. Type your domain → follow the DNS instructions Vercel gives you
3. Wait 1–10 minutes for SSL

Any push to `main` will auto-deploy. You're done.

---

## Option B — Netlify (also 5 min)

1. [netlify.com](https://netlify.com) → sign in with GitHub
2. **"Add new site → Import an existing project"**
3. Connect your `onyx-web` repo
4. No build command, publish dir = `/` (root)
5. Deploy

Custom domain: **Site → Domain management → Add custom domain**.

---

## Option C — GitHub Pages (free, slightly slower to propagate)

After pushing to GitHub:

1. Repo → **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / root
4. Save

URL: `https://<YOUR_USERNAME>.github.io/onyx-web/` — live in ~1 min.

---

## Before you go live — a small checklist

- [ ] Replace `hello@getonyx.app` in the footer with a real address
- [ ] Replace `getonyx.app` in meta tags (`index.html` head) with your actual domain
- [ ] Drop a favicon in the root (even a 32x32 gold "O" on black works)
- [ ] Decide if you want real email capture before sharing the link publicly

## Real email capture (swap `localStorage` for a backend)

Right now the waitlist form stores emails in the browser's `localStorage`. That's a demo placeholder. To actually collect emails, pick one:

### Fastest: a form endpoint (no backend needed)

- [**Basin**](https://usebasin.com) — 100 submissions/mo free
- [**Getform**](https://getform.io) — 50 submissions/mo free
- [**Formspree**](https://formspree.io) — 50 submissions/mo free

Sign up, they give you a URL. Open `script.js` and change the form handler to:

```js
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = form.querySelector('input[type="email"]').value.trim();
  if (!email) return;

  await fetch('https://YOUR-BASIN-URL-HERE', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ email, source: 'landing' })
  });

  form.classList.add('submitted');
});
```

### Better long-term: Supabase

When you're building the PWA anyway, point the form at the same Supabase instance. One table:

```sql
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text,
  created_at timestamptz default now()
);
```

Expose via the Supabase JS client or REST endpoint. Dump the list whenever.

---

## Share it

When it's live, drop the URL in:

- Your TikTok bio
- Your Instagram bio
- One Reddit post (**r/sideproject** on a Tuesday — write it like a human)
- Telegram/WhatsApp to your first 50 friends

Don't announce until you have at least one real signup from somebody who isn't your mom.

---

Godspeed, Jaime.
