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

      // Loop forever — terminal is never "done"
      while (true) {
        // Reset all lines
        lines.forEach(l => l.classList.remove('visible'));
        typedLines.forEach(l => { l.textContent = ''; });

        await new Promise(r => setTimeout(r, 500));

        for (let i = 0; i < systemLines.length; i++) {
          await new Promise(r => setTimeout(r, 320));
          systemLines[i].classList.add('visible');
        }

        await new Promise(r => setTimeout(r, 550));

        for (const line of typedLines) {
          const text = line.getAttribute('data-text') || '';
          await typeLine(line, text);
          await new Promise(r => setTimeout(r, 480));
        }

        if (inputLine) {
          await new Promise(r => setTimeout(r, 300));
          inputLine.classList.add('visible');
        }

        // Pause before looping (cursor blinks alive during this time)
        await new Promise(r => setTimeout(r, 10000));
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

  // ---- Live counter ----
  var COUNTER_KEY = 'onyx-counter';
  var COUNTER_START = 347;
  var counter = parseInt(localStorage.getItem(COUNTER_KEY)) || COUNTER_START;
  var recentBump = 0;

  function updateCounterDisplay() {
    var el = document.getElementById('signup-count');
    if (el) el.textContent = counter;
    var rc = document.getElementById('recent-count');
    if (rc) rc.textContent = Math.max(recentBump, 2 + Math.floor(Math.random() * 3));
  }
  updateCounterDisplay();

  function tickCounter() {
    var bump = 1 + Math.floor(Math.random() * 3);
    counter += bump;
    recentBump += bump;
    localStorage.setItem(COUNTER_KEY, counter);
    updateCounterDisplay();
    setTimeout(tickCounter, (30 + Math.random() * 60) * 1000);
  }
  setTimeout(tickCounter, (30 + Math.random() * 60) * 1000);

  // ---- Referral helpers ----
  function hashEmail(email) {
    var h = 0;
    for (var i = 0; i < email.length; i++) {
      h = ((h << 5) - h) + email.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h).toString(36).substring(0, 6);
  }

  function showReferral(email) {
    var modal = document.getElementById('ref-modal');
    if (!modal) return;

    var pos = counter;
    var code = hashEmail(email);
    var refUrl = window.location.origin + '/?ref=' + code;
    var shareText = 'I just signed up for Onyx — an AI companion that tracks your money, habits, and momentum. Get on the list: ' + refUrl;

    document.getElementById('ref-pos').textContent = pos;
    document.getElementById('ref-url').value = refUrl;
    document.getElementById('ref-twitter').href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText);
    document.getElementById('ref-whatsapp').href = 'https://wa.me/?text=' + encodeURIComponent(shareText);
    document.getElementById('ref-sms').href = 'sms:&body=' + encodeURIComponent(shareText);

    modal.classList.add('open');

    document.getElementById('ref-copy').onclick = function () {
      navigator.clipboard.writeText(refUrl).then(function () {
        document.getElementById('ref-copy').textContent = 'Copied!';
        setTimeout(function () { document.getElementById('ref-copy').textContent = 'Copy'; }, 2000);
      });
    };

    document.getElementById('ref-close').onclick = function () { modal.classList.remove('open'); };
    document.getElementById('ref-backdrop').onclick = function () { modal.classList.remove('open'); };
  }

  // ---- Form handling ----
  function handleWaitlist(formId, noteId) {
    var form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var email = (input && input.value || '').trim();
      if (!email) return;

      var btn = form.querySelector('button');
      if (btn) { btn.disabled = true; btn.textContent = 'Saving\u2026'; }

      if (WAITLIST_ENDPOINT) {
        try {
          await fetch(WAITLIST_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email: email, source: 'landing' })
          });
        } catch (_) {}
      }

      try {
        var list = JSON.parse(localStorage.getItem('onyx-waitlist') || '[]');
        var emails = list.map(function (e) { return e.email || e; });
        if (emails.indexOf(email) === -1) {
          list.push({ email: email, ts: new Date().toISOString() });
          localStorage.setItem('onyx-waitlist', JSON.stringify(list));
        }
      } catch (_) {}

      counter++;
      localStorage.setItem(COUNTER_KEY, counter);
      updateCounterDisplay();

      if (window.onyxCelebrate) window.onyxCelebrate();

      // Mark all forms as submitted
      ['waitlist', 'waitlist-mid', 'waitlist-2', 'waitlist-sticky'].forEach(function (id) {
        var f = document.getElementById(id);
        if (f) f.classList.add('submitted');
      });
      var stickyBar = document.getElementById('sticky-bar');
      if (stickyBar) stickyBar.classList.add('submitted');

      var note = document.getElementById(noteId);
      if (note) note.textContent = 'see you soon.';

      // Show referral modal
      showReferral(email);
    });
  }

  handleWaitlist('waitlist', 'cta-note');
  handleWaitlist('waitlist-mid', 'cta-note-mid');
  handleWaitlist('waitlist-2', 'cta-note-2');

  // Sticky bar form
  var stickyForm = document.getElementById('waitlist-sticky');
  if (stickyForm) {
    stickyForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = stickyForm.querySelector('input[type="email"]');
      var email = (input && input.value || '').trim();
      if (!email) return;
      // Reuse hero form submission logic
      var heroInput = document.getElementById('email-input');
      if (heroInput) heroInput.value = email;
      var heroForm = document.getElementById('waitlist');
      if (heroForm) heroForm.dispatchEvent(new Event('submit', { cancelable: true }));
    });
  }

  // ---- Sticky bar show/hide ----
  var stickyBar = document.getElementById('sticky-bar');
  var stickyDismissed = false;
  if (stickyBar) {
    var heroSection = document.querySelector('.hero');
    var finalSection = document.querySelector('.final');

    if (heroSection) {
      new IntersectionObserver(function (entries) {
        if (stickyDismissed) return;
        if (!entries[0].isIntersecting) {
          stickyBar.classList.add('visible');
        } else {
          stickyBar.classList.remove('visible');
        }
      }, { threshold: 0.1 }).observe(heroSection);
    }
    if (finalSection) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) stickyBar.classList.remove('visible');
      }, { threshold: 0.2 }).observe(finalSection);
    }

    var closeBtn = document.getElementById('sticky-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        stickyDismissed = true;
        stickyBar.classList.remove('visible');
      });
    }
  }

  // ----------------------------------------------------------------
  // 3. Reveal-on-scroll for section titles / cards (lightweight)
  // ----------------------------------------------------------------

  const revealTargets = document.querySelectorAll(
    '.section-title, .card, .step, .compare__col, .founder__quote, .final__title, .phone-chat, .hero__title, .faq__item, .product-phone, .buildlog__entry, .buildlog__title'
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
  // 4. Conversation chat engine (char-by-char typing)
  // ----------------------------------------------------------------

  var CONVOS = [
    [
      { from: 'onyx', text: "good morning. you slept 4.5 hrs." },
      { from: 'onyx', text: "don\u2019t think i didn\u2019t notice." },
    ],
    [
      { from: 'onyx', text: "saw you skipped the gym. what happened?" },
      { from: 'user', text: "long shift" },
      { from: 'onyx', text: "rest day earned. back at it tomorrow." },
    ],
    [
      { from: 'onyx', text: "coffee #4 today. you okay?" },
      { from: 'user', text: "deadline week" },
      { from: 'onyx', text: "say less. hydrate tho." },
    ],
    [
      { from: 'onyx', text: "your spending is up 23% this week." },
      { from: 'onyx', text: "want to look at it together?" },
    ],
    [
      { from: 'onyx', text: "you said you\u2019d call your mom sunday." },
      { from: 'onyx', text: "it\u2019s tuesday." },
    ],
    [
      { from: 'onyx', text: "hit your savings goal 3 days early." },
      { from: 'onyx', text: "quietly proud of you." },
    ],
    [
      { from: 'onyx', text: "3 workouts logged. score up 14." },
      { from: 'user', text: "let\u2019s go" },
      { from: 'onyx', text: "that\u2019s the energy. keep it moving." },
    ],
    [
      { from: 'onyx', text: "you\u2019ve been doom-scrolling for 40 min." },
      { from: 'onyx', text: "not judging. just noticing." },
    ],
  ];

  var chatBody = document.getElementById('chat-body');
  var phoneEl = document.getElementById('phone-chat');
  var chatPaused = false;

  if (phoneEl) {
    phoneEl.addEventListener('mouseenter', function () { chatPaused = true; });
    phoneEl.addEventListener('mouseleave', function () { chatPaused = false; });
  }

  function typeText(el, text, speed, done) {
    var i = 0;
    function step() {
      if (chatPaused) { setTimeout(step, 200); return; }
      if (i < text.length) {
        el.textContent = text.substring(0, i + 1);
        i++;
        if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
        var ch = text[i - 1];
        var d = speed;
        if (ch === '.' || ch === '?' || ch === '!') d = speed * 2.2;
        else if (ch === ',') d = speed * 1.5;
        else d = speed + Math.random() * (speed * 0.3);
        setTimeout(step, d);
      } else {
        if (done) done();
      }
    }
    step();
  }

  function playConvo(idx) {
    if (!chatBody) return;
    var convo = CONVOS[idx % CONVOS.length];
    chatBody.innerHTML = '';
    var mi = 0;

    function nextMsg() {
      if (chatPaused) { setTimeout(nextMsg, 300); return; }
      if (mi >= convo.length) {
        // Finished conversation — pause then cycle
        setTimeout(function () {
          // Fade out
          var bubbles = chatBody.querySelectorAll('.chat-bubble');
          for (var k = 0; k < bubbles.length; k++) bubbles[k].classList.remove('visible');
          setTimeout(function () { playConvo(idx + 1); }, 600);
        }, 3500);
        return;
      }

      var msg = convo[mi];
      mi++;

      if (msg.from === 'onyx') {
        // Typing dots
        var dots = document.createElement('div');
        dots.className = 'typing-dots visible';
        dots.innerHTML = '<span></span><span></span><span></span>';
        chatBody.appendChild(dots);
        chatBody.scrollTop = chatBody.scrollHeight;

        setTimeout(function () {
          chatBody.removeChild(dots);
          var bub = document.createElement('div');
          bub.className = 'chat-bubble chat-bubble--onyx visible';
          chatBody.appendChild(bub);
          // Perk corner onyx
          if (window.onyxPerk) window.onyxPerk();
          typeText(bub, msg.text, 200, function () {
            setTimeout(nextMsg, 1200);
          });
        }, 900);
      } else {
        // User reply — faster typing
        setTimeout(function () {
          var bub = document.createElement('div');
          bub.className = 'chat-bubble chat-bubble--user visible';
          chatBody.appendChild(bub);
          typeText(bub, msg.text, 90, function () {
            setTimeout(nextMsg, 1000);
          });
        }, 1200);
      }
    }

    nextMsg();
  }

  if (chatBody) setTimeout(function () { playConvo(0); }, 1200);

})();
