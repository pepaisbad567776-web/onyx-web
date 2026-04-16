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

## Real email capture — Formspree setup (5 minutes)

Right now the waitlist form posts to an empty endpoint, so emails only persist in the visitor's own `localStorage`. To actually receive signups, wire up Formspree:

### 1. Create a Formspree form

1. Go to [formspree.io](https://formspree.io) → sign up (free, email + password)
2. Click **New Form** → name it `Onyx Waitlist`
3. Set the submit email to wherever you want signups delivered
4. Copy the endpoint URL — looks like `https://formspree.io/f/xxxxxxx`

### 2. Paste it into the code

Open `script.js`, find this line (near the top):

```js
var WAITLIST_ENDPOINT = '';  // e.g. 'https://formspree.io/f/mqkvwaeg'
```

Paste your URL between the quotes:

```js
var WAITLIST_ENDPOINT = 'https://formspree.io/f/xxxxxxx';
```

### 3. Push

```bash
git add script.js
git commit -m "wire formspree endpoint"
git push
```

Vercel auto-deploys in ~30 seconds. From this point forward, every signup lands in your Formspree inbox with:

- `email` — what they submitted
- `source` — which form (hero / mid-page / final / sticky)
- `ref` — referral code (if they arrived via a friend's `?ref=` link)
- `position` — their position on the waitlist counter
- `timestamp` — when they signed up

### 4. Test it

Open the live site, use the hero form, check your Formspree dashboard. You'll see the submission with all the fields above. Confirm the email you set lands in your inbox.

### Limits

Formspree free tier: **50 submissions/month**. When you outgrow it, swap to:

- [**Basin**](https://usebasin.com) — 100/mo free
- [**Getform**](https://getform.io) — 50/mo free
- **Supabase** — unlimited with a real database (see below)

### Long-term: Supabase

When you're building the PWA, point the form at your Supabase instance. One table:

```sql
create table waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text,
  ref text,
  position int,
  created_at timestamptz default now()
);
```

Then swap the `fetch` URL in `script.js` to your Supabase REST endpoint. Same payload shape, so no code changes needed elsewhere.

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
