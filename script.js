/* ================================================================
   ONYX — Landing page interactions
   Keep it light. Only what earns its weight.
   ================================================================ */

(function () {
  'use strict';

  // ----------------------------------------------------------------
  // 1. Console typing animation
  // ----------------------------------------------------------------

  const screen = document.getElementById('screen');
  if (screen) {
    const lines = Array.from(screen.querySelectorAll('.line'));
    const systemLines = lines.filter(l => l.classList.contains('line--system'));
    const typedLines = lines.filter(l => l.classList.contains('typed'));
    const inputLine = lines.find(l => l.classList.contains('line--input'));

    let started = false;

    function typeLine(line, text, speed = 22) {
      return new Promise(resolve => {
        line.classList.add('visible');
        // Strip the "onyx " prefix — it's added via CSS ::before
        line.textContent = '';
        let i = 0;
        const tick = () => {
          if (i < text.length) {
            line.textContent = text.substring(0, i + 1);
            i++;
            setTimeout(tick, speed + Math.random() * 14);
          } else {
            resolve();
          }
        };
        tick();
      });
    }

    async function runConsole() {
      if (started) return;
      started = true;

      // Reveal system lines first (instant)
      for (let i = 0; i < systemLines.length; i++) {
        await new Promise(r => setTimeout(r, 350));
        systemLines[i].classList.add('visible');
      }

      await new Promise(r => setTimeout(r, 600));

      // Type Onyx lines sequentially
      for (const line of typedLines) {
        const text = line.getAttribute('data-text') || '';
        await typeLine(line, text);
        await new Promise(r => setTimeout(r, 550));
      }

      // Reveal input line
      if (inputLine) {
        await new Promise(r => setTimeout(r, 300));
        inputLine.classList.add('visible');
      }
    }

    // Trigger when console scrolls into view
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(runConsole, 400);
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(screen);
  }

  // ----------------------------------------------------------------
  // 2. Waitlist form handling
  // ----------------------------------------------------------------

  // TODO: Replace with your real form endpoint (Formspree, Basin, Supabase, etc.)
  var WAITLIST_ENDPOINT = '';  // e.g. 'https://formspree.io/f/xxxxx'

  function handleWaitlist(formId, noteId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const email = (input && input.value || '').trim();
      if (!email) return;

      const btn = form.querySelector('button');
      if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

      // Post to real endpoint if configured
      if (WAITLIST_ENDPOINT) {
        try {
          await fetch(WAITLIST_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email: email, source: 'landing' })
          });
        } catch (_) {}
      }

      // Always persist locally as backup
      try {
        var list = JSON.parse(localStorage.getItem('onyx-waitlist') || '[]');
        var emails = list.map(function(e) { return e.email || e; });
        if (emails.indexOf(email) === -1) {
          list.push({ email: email, ts: new Date().toISOString() });
          localStorage.setItem('onyx-waitlist', JSON.stringify(list));
        }
      } catch (_) {}

      // Update social proof count
      bumpCount();

      // Show success
      form.classList.add('submitted');
      var note = document.getElementById(noteId);
      if (note) note.textContent = 'see you soon.';

      // Sync all forms — if user signed up in one, mark the others too
      ['waitlist', 'waitlist-mid', 'waitlist-2'].forEach(function(id) {
        var f = document.getElementById(id);
        if (f && !f.classList.contains('submitted')) {
          f.classList.add('submitted');
        }
      });
    });
  }

  // Social proof counter
  function bumpCount() {
    var el = document.getElementById('signup-count');
    if (el) el.textContent = parseInt(el.textContent, 10) + 1;
  }

  handleWaitlist('waitlist', 'cta-note');
  handleWaitlist('waitlist-mid', 'cta-note-mid');
  handleWaitlist('waitlist-2', 'cta-note-2');

  // ----------------------------------------------------------------
  // 3. Reveal-on-scroll for section titles / cards (lightweight)
  // ----------------------------------------------------------------

  const revealTargets = document.querySelectorAll(
    '.section-title, .card, .step, .compare__col, .founder__quote, .final__title, .specs, .hero__title'
  );

  if ('IntersectionObserver' in window && revealTargets.length) {
    revealTargets.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)';
    });

    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealTargets.forEach(el => revealObs.observe(el));
  }

  // ----------------------------------------------------------------
  // 4. Mouse-follow glow on the robot (subtle, optional)
  // ----------------------------------------------------------------

  const robot = document.querySelector('.onyx-robot');
  if (robot && window.matchMedia('(min-width: 960px)').matches) {
    const stage = robot.closest('.onyx-stage');
    if (stage) {
      stage.addEventListener('mousemove', (e) => {
        const rect = stage.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        robot.style.transform = `translate(${x * 8}px, ${y * 6}px)`;
      });
      stage.addEventListener('mouseleave', () => {
        robot.style.transform = '';
      });
    }
  }

})();
