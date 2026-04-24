# Onyx

Personal AI companion app. Built solo by Jaime. Live waitlist at `onyx-web-tawny.vercel.app`. Target domain: `getonyx.app`. Build started April 1, 2026 — 30-day commitment, $500 budget.

Also read `~/.claude/CLAUDE.md` first — general "how to work with Jaime" rules apply here too.

---

## What Onyx is

A **companion + coach** that watches your money, habits, and momentum — and texts you three times a day (morning, mid-day, night) with what he notices. Lives in your phone as a text-based messaging app. Takes action when you let him (move money, hide apps, lock budgets).

**He is:** companion, coach, someone who notices what others don't, someone who **shows you you've progressed** when you can't see it yourself.

**He is NOT:** a dashboard, a streak app, a therapist, a drill sergeant, a gamification loop, a thing you open. Never write him as any of these.

## Audience

**Primary:** solo founders, side-hustlers with a full-time job, night-shift minds, operators building alone. The person who checks their bank at 3 AM and feels behind.

**Secondary:** every-day people who work long days and want a companion that pays attention.

**NOT the target:** VC-backed startup founders. That archetype does not fit Jaime or his audience. No "the investor said no / runway's 4 months" scenarios in mockups — that's been explicitly rejected.

## Voice rules (how Onyx speaks)

- Lowercase. Short sentences. No emojis. No exclamation points.
- Specific numbers — "5h 40m" not "poor sleep." "$28 at doordash" not "some spending."
- Names patterns others miss: *"you opened the bank app 3 times in an hour."*
- **Shows progress. Most important rule.** Reflect growth back: *"month ago you did this 8 times a day. now 3. pattern's breaking."* *"week 1: 0. week 2: 4. this week: 11. that's compounding."*
- Coach, not therapist. Directive + specific, never "there there."
- Permissive on rest ("no gym unless it feels honest") — not indulgent.
- Never preaches. Never says "you should."
- Never grandiose on behalf of the user.

## Mockup rules (critical — learned the hard way)

- Mockup messages are for the **every-day person**. NOT Jaime's diary. No "the hero sentence you rewrote 14 times," no "day 19 of the build," no "shift at 3 PM."
- Universal signals only: sleep, Instagram, Starbucks, gym, meetings, bank app, budget, DoorDash, calendar.
- The **Momentum score** is the hero metric. Shows on every day-feed. Moves across the day (e.g., 742 morning → 736 dip → 754 night). Anchored to real choices, not arbitrary points.

## Tech stack

- Static HTML + CSS + JS. **Vanilla.** No React, no Next, no MDX, no build step, no bundler.
- `index.html`, `styles.css`, `script.js`, `onyx.js` (pixel character renderer), `privacy.html`, `terms.html`.
- Hosted on Vercel (auto-deploys from `master` branch push).
- Form intake: Formspree at `https://formspree.io/f/xqewpyov`. Both waitlist signups and feedback go here.
- Pixel Onyx renders on every `<canvas class="onyx-sprite">` via the shared loop in `onyx.js`.

## Pricing (current)

- **Free forever:** morning brief, Momentum score, basic check-in.
- **Pro:** $7.99/mo or $49/yr. Multi-account, unlimited history, mid-day pings, export.
- **Founder's Lifetime:** $99 one-time. First 100 only. Everything in Pro forever, private Discord, direct access to Jaime, name in credits.

**`SPOTS_LEFT` constant in `script.js` is the single source of truth.** Drives both the top banner count and the hero pill count. Decrement manually as real Lifetime sales come in (or wire a Stripe webhook to rewrite it). **Never** show a number the visitor can't verify.

## Integrity rules (non-negotiable here)

- **No fake counters, no fake testimonials, no fake activity.** The old theatrical "758 on the list / +2 this hour / You're #348" has been ripped out — don't bring it back.
- **Marquee quotes are aspirational**, labeled as such ("the standard we're building toward. none of these have been said yet"). Don't attribute to "early testers" we don't have.
- **Privacy pill is honest:** *"your data is yours. never sold. export anytime."* **Do not** write "nothing leaves your phone" — Onyx uses a cloud LLM, so that's false. This was fixed once. It stays fixed.
- FAQ "Is Onyx actually an AI?" is transparent about LLM usage. Don't soften.

## What's shipped + live

Landing page sections in order: hero · meet (companion intro + phone-chat sim) · product (Morning/Live/Night tabbed day-feeds with Momentum card + structured cards + app tab bar) · does (3 sample quote cards) · mid-CTA · how-it-works (3 steps, ambient framing) · notifications preview (glass lock-screen) · vs-others · founder · talk (feedback form) · buildlog · marquee · pricing · FAQ · final CTA · footer.

Plus: scroll progress bar, corner pixel Onyx (clickable → talk modal), sticky bottom CTA, referral modal on signup, JSON-LD Product schema, legal pages, dev console easter egg, day-of-30 live countdown in hero trust row.

## Open items (Jaime's calls)

- **Stripe Payment Link URL** — swap into the "Claim lifetime →" anchor in `index.html` (TODO comment is right there). 5-minute task → real $99 sales live.
- **Real founder photo** — currently the gold "J" avatar in `.founder__avatar`.
- **`getonyx.app` domain** — point at the Vercel deploy; update meta tags + OG URL.
- **Wizard-of-oz product** — Telegram bot, Jaime + Claude hand-crafting Onyx's messages for first 5–10 founding members. Proposed but not started.
- **Welcome email** — Formspree autoresponder.

## Don't do

- Don't touch the **founder story**, the **"three moves"** section, the **"every app sells a feature / we sell a relationship"** block, or the pixel character design. Those are working.
- Don't revive the dashboard mockup. Onyx is a conversation + structured cards, not a score board.
- Don't write Onyx as a therapist.
- Don't invent numbers the visitor sees.
- Don't add disclaimers or "coming soon" language for things we haven't decided on.
- Don't project VC-founder archetypes onto the mockup.
