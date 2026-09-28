/* ============================================================
   Sebastin Jojo — portfolio behaviour
   No dependencies. Everything degrades: with this file removed
   the page is still readable and every work link still opens.
   ============================================================ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------- scroll lock */
  var lockedAt = 0;

  function lockScroll() {
    lockedAt = window.pageYOffset;
    document.body.style.top = -lockedAt + 'px';
    document.body.classList.add('is-locked');
  }

  function unlockScroll() {
    document.body.classList.remove('is-locked');
    document.body.style.top = '';
    window.scrollTo(0, lockedAt);
  }

  /* ---------------------------------------------- sticky header */
  var header = $('#header');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      header.classList.toggle('is-stuck', window.pageYOffset > 80);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------- mobile menu */
  var toggle = $('#nav-toggle');
  var overlay = $('#nav-overlay');

  function focusables(root) {
    return $$('a[href], button:not([disabled])', root);
  }

  function openMenu() {
    overlay.hidden = false;
    /* next frame so the opacity transition actually runs */
    requestAnimationFrame(function () { overlay.classList.add('is-open'); });
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    lockScroll();
    var f = focusables(overlay);
    if (f.length) f[0].focus();
  }

  function closeMenu(returnFocus) {
    overlay.classList.remove('is-open');
    overlay.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    unlockScroll();
    if (returnFocus !== false) toggle.focus();
  }

  toggle.addEventListener('click', function () {
    if (toggle.getAttribute('aria-expanded') === 'true') closeMenu();
    else openMenu();
  });

  overlay.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu(false);
  });

  overlay.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMenu(); return; }
    if (e.key !== 'Tab') return;
    var f = focusables(overlay);
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* close the menu if the viewport grows past the breakpoint */
  var wide = window.matchMedia('(min-width: 768px)');
  (wide.addEventListener ? wide.addEventListener.bind(wide, 'change') : wide.addListener.bind(wide))(function (e) {
    if (e.matches && toggle.getAttribute('aria-expanded') === 'true') closeMenu(false);
  });

  /* ---------------------------------------------- reveal on scroll */
  if ('IntersectionObserver' in window) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    $$('.reveal').forEach(function (el) { revealer.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------------------------------------------- active nav link */
  var navLinks = $$('.nav__link');
  var linkFor = {};
  navLinks.forEach(function (a) { linkFor[a.getAttribute('href').slice(1)] = a; });

  if ('IntersectionObserver' in window && navLinks.length) {
    var visible = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible[entry.target.id] = entry.isIntersecting; });
      /* the last section currently in the band wins */
      var current = null;
      $$('main section[id]').forEach(function (s) { if (visible[s.id]) current = s.id; });
      navLinks.forEach(function (a) {
        a.classList.toggle('is-active', current !== null && a === linkFor[current]);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    $$('main section[id]').forEach(function (s) { spy.observe(s); });
  }

  /* ---------------------------------------------- work filters */
  var filters = $$('.filter');
  var groups = $$('[data-client]');
  var status = $('#filter-status');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.dataset.filter;
      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var shown = 0;
      groups.forEach(function (g) {
        var match = key === 'all' || g.dataset.client === key;
        g.hidden = !match;
        if (match) shown += $$('.work-card', g).length + (g.dataset.client === 'direction' ? 1 : 0);
      });
      status.textContent = key === 'all'
        ? ''
        : 'Showing ' + shown + (shown === 1 ? ' film' : ' films') + ' — ' + btn.textContent.trim();
    });
  });

  /* ---------------------------------------------- gallery "show more" */
  $$('[data-more]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var grid = $('[data-gallery="' + btn.dataset.more + '"]');
      if (!grid) return;
      grid.classList.add('is-expanded');
      collectGroups();
      btn.remove();
    });
  });

  /* ---------------------------------------------- copy to clipboard */
  $$('[data-copy]').forEach(function (btn) {
    var out = $('.copy__text', btn);
    btn.addEventListener('click', function () {
      var done = function () {
        out.textContent = 'Copied';
        btn.classList.add('is-done');
        setTimeout(function () { out.textContent = 'Copy'; btn.classList.remove('is-done'); }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(btn.dataset.copy).then(done, function () { out.textContent = 'Press Ctrl+C'; });
      } else {
        var t = document.createElement('textarea');
        t.value = btn.dataset.copy;
        t.setAttribute('readonly', '');
        t.style.position = 'fixed';
        t.style.opacity = '0';
        document.body.appendChild(t);
        t.select();
        try { document.execCommand('copy'); done(); } catch (e) { out.textContent = 'Press Ctrl+C'; }
        document.body.removeChild(t);
      }
    });
  });

  /* ---------------------------------------------- lightbox (§7.3) */
  var box = $('#lightbox');
  var stage = $('#lightbox-stage');
  var caption = $('#lightbox-caption');
  var counter = $('#lightbox-count');
  var prevBtn = $('.lightbox__nav--prev');
  var nextBtn = $('.lightbox__nav--next');
  var closeBtn = $('.lightbox__close');

  var trigger = null;   /* element that opened the box — focus goes back here */
  var set = [];         /* current image group */
  var index = 0;
  var groupsByName = {};

  function collectGroups() {
    groupsByName = {};
    $$('[data-lightbox="image"]').forEach(function (el) {
      var g = el.dataset.group || 'default';
      (groupsByName[g] = groupsByName[g] || []).push(el);
    });
  }
  collectGroups();

  function clearStage() {
    /* LB-6: removing the iframe is what actually stops the audio */
    while (stage.firstChild) stage.removeChild(stage.firstChild);
  }

  function showImage(i) {
    var el = set[i];
    if (!el) return;
    index = i;
    clearStage();
    var img = document.createElement('img');
    img.src = el.dataset.full || $('img', el).currentSrc || $('img', el).src;
    img.alt = $('img', el) ? $('img', el).alt : '';
    stage.appendChild(img);
    caption.textContent = el.dataset.caption || '';
    counter.textContent = set.length > 1 ? (i + 1) + ' / ' + set.length : '';
    prevBtn.hidden = nextBtn.hidden = set.length < 2;
  }

  function step(delta) {
    if (set.length < 2) return;
    showImage((index + delta + set.length) % set.length);
  }

  function openImage(el) {
    /* only tiles that are actually on screen belong to the set — this keeps
       the "4 / 12" counter honest before "Show more" is pressed, and keeps
       filtered-out work out of the arrow-key run */
    var all = groupsByName[el.dataset.group || 'default'] || [el];
    set = all.filter(function (n) { return n === el || n.offsetParent !== null; });
    showImage(set.indexOf(el));
    open(el);
  }

  function openVideo(el) {
    set = [];
    clearStage();
    prevBtn.hidden = nextBtn.hidden = true;

    var platform = el.dataset.platform;
    var frame = document.createElement('div');
    frame.className = 'lightbox__frame' + (platform === 'youtube' ? ' lightbox__frame--wide' : '');

    var iframe = document.createElement('iframe');
    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('loading', 'eager');
    iframe.title = el.dataset.title || 'Video';

    if (platform === 'youtube') {
      /* privacy-enhanced host, no cookies until the viewer plays (S5-R11) */
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(el.dataset.id) +
                   '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
    } else {
      var url = el.getAttribute('href');
      if (url.slice(-1) !== '/') url += '/';
      iframe.src = url + 'embed/';
    }

    frame.appendChild(iframe);
    stage.appendChild(frame);

    caption.textContent = el.dataset.title || '';
    /* S5-R11 fallback: Instagram embeds can be blocked by a login wall,
       so the original post is always one click away. */
    counter.textContent = '';
    var link = document.createElement('a');
    link.href = el.getAttribute('href');
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = platform === 'youtube' ? 'Watch on YouTube ↗' : 'Open on Instagram ↗';
    counter.appendChild(link);

    open(el);
  }

  function open(el) {
    trigger = el;
    lockScroll();
    if (typeof box.showModal === 'function') box.showModal();
    else box.setAttribute('open', '');       /* very old browsers: still usable */
    closeBtn.focus({ preventScroll: true });
  }

  function closeBox() {
    clearStage();
    caption.textContent = '';
    counter.textContent = '';
    if (typeof box.close === 'function' && box.open) box.close();
    else box.removeAttribute('open');
    unlockScroll();
    /* preventScroll matters: without it, returning focus to a tile further
       down the page yanks the scroll position (LB-4 must not break LB-5) */
    if (trigger) { trigger.focus({ preventScroll: true }); trigger = null; }
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-lightbox]') : null;
    if (!el) return;
    /* Ctrl/cmd/middle click on a work card should still open the real post */
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (el.dataset.lightbox === 'video') openVideo(el);
    else openImage(el);
  });

  closeBtn.addEventListener('click', closeBox);
  prevBtn.addEventListener('click', function () { step(-1); });
  nextBtn.addEventListener('click', function () { step(1); });

  /* backdrop click (LB-2): the dialog fills the viewport, so a click that
     lands on the dialog itself rather than its contents is a backdrop click */
  box.addEventListener('click', function (e) { if (e.target === box) closeBox(); });
  box.addEventListener('cancel', function (e) { e.preventDefault(); closeBox(); });

  document.addEventListener('keydown', function (e) {
    if (!box.open) return;
    /* Escape is handled explicitly rather than left to the dialog's own
       cancel event — some embedded webviews never fire it. */
    if (e.key === 'Escape') { e.preventDefault(); closeBox(); }
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });

  /* swipe (LB-3) */
  var startX = 0, startY = 0, swiping = false;
  stage.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    swiping = true;
  }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (!swiping) return;
    swiping = false;
    var t = e.changedTouches[0];
    var dx = t.clientX - startX;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(t.clientY - startY)) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* ---------------------------------------------- footer year */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
