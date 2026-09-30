/* ==========================================================================
   ARIES GROUP — shared scripts
   Lenis smooth scroll (synced with GSAP ScrollTrigger), layout scale,
   mobile menu, anchor links, form validation, file upload.
   Exposes window.ARIES for page scripts (home.js).
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const hasGsap = typeof window.gsap !== 'undefined';
  const hasST = hasGsap && typeof window.ScrollTrigger !== 'undefined';
  const reduceMotionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const DESKTOP_MIN = 1024;
  const FRAME_WIDTH = 1440;

  if (!hasGsap) root.classList.remove('js-anim');
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------------------------------
     Layout scale: --u (1px at 1440) and --k (unitless) for the desktop
     frame. Uses clientWidth so the scrollbar is excluded.
     ------------------------------------------------------------------ */
  const setScale = () => {
    const w = root.clientWidth;
    if (w >= DESKTOP_MIN) {
      const k = Math.min(w, FRAME_WIDTH) / FRAME_WIDTH;
      body.style.setProperty('--u', `${k}px`);
      body.style.setProperty('--k', k.toFixed(4));
    } else {
      body.style.removeProperty('--u');
      body.style.removeProperty('--k');
    }
  };
  setScale();

  let resizeRaf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(setScale);
  });

  /* ------------------------------------------------------------------
     Lenis + ScrollTrigger
     ------------------------------------------------------------------ */
  let lenis = null;

  if (typeof window.Lenis !== 'undefined' && !reduceMotionMQ.matches) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    if (hasGsap) {
      if (hasST) lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }
  }

  const scrollToTarget = (target, opts = {}) => {
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.2, ...opts });
      return;
    }
    const y = typeof target === 'number'
      ? target
      : target.getBoundingClientRect().top + window.scrollY + (opts.offset || 0);
    window.scrollTo({ top: y, behavior: reduceMotionMQ.matches ? 'auto' : 'smooth' });
  };

  const lockScroll = (lock) => {
    body.classList.toggle('is-locked', lock);
    if (lenis) (lock ? lenis.stop() : lenis.start());
  };

  /* ------------------------------------------------------------------
     Anchor links — "#id" and "page.html#id" pointing to the current page
     scroll smoothly (Lenis); other pages load normally.
     ------------------------------------------------------------------ */
  const samePageHash = (link) => {
    const url = new URL(link.href, location.href);
    if (!url.hash) return null;
    const here = location.pathname.replace(/index\.html$/, '');
    const there = url.pathname.replace(/index\.html$/, '');
    return here === there && url.search === location.search ? url.hash : null;
  };

  const resolveTarget = (hash) => {
    if (hash === '#top') return 0;
    try {
      return document.querySelector(hash);
    } catch (err) {
      return null;
    }
  };

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (link.getAttribute('href') === '#') {
      e.preventDefault();
      return;
    }
    const hash = samePageHash(link);
    if (!hash) return;
    const target = resolveTarget(hash);
    if (target === null) return;
    e.preventDefault();

    // let page scripts react (e.g. switch the contact form mode)
    link.dispatchEvent(new CustomEvent('aries:anchor', { bubbles: true, detail: { hash, target } }));

    const go = () => scrollToTarget(target);
    // wait for the menu to close (scroll is locked while it is open)
    if (body.classList.contains('menu-open')) {
      closeMenu();
      setTimeout(go, 350);
    } else {
      go();
    }
    if (hash !== '#top') history.replaceState(null, '', hash);
  });

  // Arrived with a hash (e.g. contact.html?type=creator#contact-form):
  // jump after pins/spacers exist, then refresh once images are loaded.
  window.addEventListener('load', () => {
    if (hasST) ScrollTrigger.refresh();
    const target = location.hash ? resolveTarget(location.hash) : null;
    if (target) {
      setTimeout(() => scrollToTarget(target, { immediate: true }), 60);
    }
  });

  /* ------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */
  const menu = document.querySelector('[data-menu]');
  const burger = document.querySelector('[data-burger]');
  let menuTl = null;
  let lastFocus = null;

  function openMenu() {
    if (!menu || body.classList.contains('menu-open')) return;
    lastFocus = document.activeElement;
    body.classList.add('menu-open');
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    burger.classList.add('is-active');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    lockScroll(true);

    const links = menu.querySelectorAll('.mobile-menu__link');
    const cta = menu.querySelector('.mobile-menu__cta');

    if (hasGsap && !reduceMotionMQ.matches) {
      menuTl?.kill();
      menuTl = gsap.timeline()
        .fromTo(menu, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' })
        .fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07 }, 0.12)
        .fromTo(cta, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' }, 0.3);
    } else {
      menu.style.opacity = '1';
    }

    setTimeout(() => links[0]?.focus({ preventScroll: true }), 50);
  }

  function closeMenu() {
    if (!menu || !body.classList.contains('menu-open')) return;
    burger.classList.remove('is-active');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    menu.setAttribute('aria-hidden', 'true');

    const done = () => {
      menu.classList.remove('is-open');
      body.classList.remove('menu-open');
      lockScroll(false);
    };

    if (hasGsap && !reduceMotionMQ.matches) {
      menuTl?.kill();
      menuTl = gsap.to(menu, { autoAlpha: 0, duration: 0.3, ease: 'power2.in', onComplete: done });
    } else {
      menu.style.opacity = '0';
      done();
    }
    lastFocus?.focus?.({ preventScroll: true });
  }

  burger?.addEventListener('click', () => {
    body.classList.contains('menu-open') ? closeMenu() : openMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (!body.classList.contains('menu-open')) return;
    if (e.key === 'Escape') {
      closeMenu();
      return;
    }
    // simple focus trap: menu links + burger
    if (e.key === 'Tab') {
      const focusables = [burger, ...menu.querySelectorAll('a')];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`).addEventListener('change', (e) => {
    if (e.matches) closeMenu();
  });

  /* ------------------------------------------------------------------
     File upload (Add A Resume)
     ------------------------------------------------------------------ */
  // Vercel caps a function request at 4.5 MB (see api/contact.js)
  const MAX_FILE_MB = 4;

  const initUpload = (upload) => {
    const input = upload.querySelector('[data-upload-input]');
    const title = upload.querySelector('[data-upload-title]');
    const nameEl = upload.querySelector('[data-upload-name]');
    const removeBtn = upload.querySelector('[data-upload-remove]');
    const drop = upload.querySelector('.upload__drop');
    const defaultTitle = title.textContent;

    const formatSize = (bytes) => (bytes < 1024 * 1024
      ? `${Math.max(1, Math.round(bytes / 1024))} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`);

    const render = () => {
      const file = input.files && input.files[0];
      const tooBig = file && file.size > MAX_FILE_MB * 1024 * 1024;
      upload.classList.toggle('is-invalid', Boolean(tooBig));

      if (file && !tooBig) {
        upload.classList.add('has-file');
        title.textContent = 'File Added';
        nameEl.textContent = `${file.name} · ${formatSize(file.size)}`;
      } else {
        if (tooBig) input.value = '';
        upload.classList.remove('has-file');
        title.textContent = defaultTitle;
        nameEl.textContent = '';
      }
    };

    input.addEventListener('change', render);

    removeBtn.addEventListener('click', () => {
      input.value = '';
      upload.classList.remove('is-invalid');
      render();
      input.focus();
    });

    ['dragenter', 'dragover'].forEach((type) => drop.addEventListener(type, (e) => {
      e.preventDefault();
      upload.classList.add('is-dragover');
    }));
    ['dragleave', 'dragend', 'drop'].forEach((type) => drop.addEventListener(type, () => {
      upload.classList.remove('is-dragover');
    }));
    drop.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!e.dataTransfer?.files?.length) return;
      const dt = new DataTransfer();
      dt.items.add(e.dataTransfer.files[0]);
      input.files = dt.files;
      render();
    });

    upload.reset = () => {
      input.value = '';
      upload.classList.remove('is-invalid');
      render();
    };
  };

  document.querySelectorAll('[data-upload]').forEach(initUpload);

  /* ------------------------------------------------------------------
     Form: front-end validation, then POST to /api/contact (Vercel
     function → Resend → team inbox). Success / error states in the form.
     ------------------------------------------------------------------ */
  const FORM_ENDPOINT = '/api/contact';
  const FORM_ERRORS = {
    file_too_large: 'The file is too large — please attach one under 4 MB.',
    file_type: 'This file type is not supported — please attach a PDF, document or image.',
    invalid: 'Please check the highlighted fields and try again.',
  };
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const validateField = (control) => {
    const field = control.closest('.field');
    if (!field) return true;
    const value = control.value.trim();
    let valid = true;

    if (control.required && !value) valid = false;
    else if (control.type === 'email' && value && !EMAIL_RE.test(value)) valid = false;
    else if (control.pattern && value && !new RegExp(control.pattern).test(value)) valid = false;

    field.classList.toggle('is-invalid', !valid);
    const error = field.querySelector('.field__error');
    if (error) {
      control.setAttribute('aria-invalid', String(!valid));
      if (!valid) control.setAttribute('aria-describedby', error.id);
      else control.removeAttribute('aria-describedby');
    }
    return valid;
  };

  /* Form mode (Creator / Company) — only for data-form-mode="switch".
     Hidden blocks are disabled + inert, so they are neither validated nor sent. */
  const FORM_MODES = ['creator', 'company'];

  const initFormModes = (form) => {
    const radios = [...form.querySelectorAll('[data-form-switch] input[type="radio"]')];
    const blocks = [...form.querySelectorAll('[data-form-show]')];
    if (!radios.length) return null;

    const fieldsWrap = form.querySelector('.form__fields');
    const gap = () => parseFloat(getComputedStyle(fieldsWrap).rowGap) || 0;
    let current = null;

    const setDisabled = (block, off) => {
      block.inert = off;
      block.querySelectorAll('input, textarea, select, button').forEach((el) => { el.disabled = off; });
    };

    const setMode = (mode, instant = false) => {
      if (!FORM_MODES.includes(mode)) return;
      radios.forEach((r) => { r.checked = r.value === mode; });
      if (mode === current) return;
      const first = current === null;
      current = mode;
      form.dataset.formType = mode;

      const animate = hasGsap && !reduceMotionMQ.matches && !instant && !first;
      blocks.forEach((block) => {
        const show = block.dataset.formShow === mode;
        setDisabled(block, !show);
        if (!animate) {
          block.hidden = !show;
          window.gsap?.set(block, { clearProps: 'height,marginTop,opacity,visibility' });
          return;
        }
        gsap.killTweensOf(block);
        if (show) {
          block.hidden = false;
          const h = block.scrollHeight;
          gsap.fromTo(block,
            { height: 0, marginTop: -gap(), autoAlpha: 0 },
            { height: h, marginTop: 0, autoAlpha: 1, duration: 0.55, ease: 'power3.inOut', clearProps: 'height,marginTop', onComplete: refresh });
        } else if (!block.hidden) {
          gsap.to(block, {
            height: 0, marginTop: -gap(), autoAlpha: 0, duration: 0.45, ease: 'power3.inOut',
            onComplete: () => {
              block.hidden = true;
              gsap.set(block, { clearProps: 'height,marginTop,opacity,visibility' });
              refresh();
            },
          });
        }
      });
      if (!animate) refresh();
    };

    const refresh = () => { if (hasST) ScrollTrigger.refresh(); };

    radios.forEach((r) => r.addEventListener('change', () => r.checked && setMode(r.value)));

    // initial: ?type= in the URL > data-form-default
    const fromUrl = new URLSearchParams(location.search).get('type');
    setMode(FORM_MODES.includes(fromUrl) ? fromUrl : form.dataset.formDefault || 'company', true);

    // links like <a href="#contact-form" data-form-type="creator">
    document.addEventListener('aries:anchor', (e) => {
      const link = e.target.closest?.('[data-form-type]');
      const section = form.closest('section');
      if (link && section && e.detail.target === section) setMode(link.dataset.formType);
    });

    return { setMode, get mode() { return current; } };
  };

  const initForm = (form) => {
    const controls = [...form.querySelectorAll('.field__control')];
    const success = form.querySelector('[data-form-success]');
    const fail = form.querySelector('[data-form-fail]');
    const failText = form.querySelector('[data-form-fail-text]');
    const submit = form.querySelector('[type="submit"]');
    const uploads = [...form.querySelectorAll('[data-upload]')];
    const modes = initFormModes(form);
    let successTimer = 0;
    let sending = false;

    const showNote = (note) => {
      note.hidden = false;
      if (hasGsap && !reduceMotionMQ.matches) {
        gsap.fromTo(note, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' });
      }
      if (hasST) ScrollTrigger.refresh();
    };

    const showError = (code) => {
      const email = window.ARIES_CONFIG?.contacts?.email;
      failText.textContent = FORM_ERRORS[code]
        || `Please try again in a moment${email ? ` or email us at ${email}` : ''}.`;
      showNote(fail);
    };

    controls.forEach((control) => {
      control.addEventListener('blur', () => {
        if (control.value.trim()) validateField(control);
      });
      control.addEventListener('input', () => {
        if (control.closest('.field').classList.contains('is-invalid')) validateField(control);
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (sending) return;
      const active = controls.filter((c) => !c.disabled);
      const results = active.map(validateField);
      const firstInvalid = active[results.indexOf(false)];
      if (firstInvalid) {
        firstInvalid.focus({ preventScroll: true });
        return;
      }

      // disabled (hidden-mode) fields are left out of FormData automatically
      const data = new FormData(form);
      data.append('page', location.pathname);

      sending = true;
      fail.hidden = true;
      success.hidden = true;
      submit.classList.add('is-loading');
      submit.setAttribute('aria-busy', 'true');

      let result = { ok: false, error: 'network' };
      try {
        const res = await fetch(FORM_ENDPOINT, { method: 'POST', body: data });
        result = await res.json().catch(() => ({ ok: false, error: res.status === 413 ? 'file_too_large' : 'server' }));
      } catch {
        // offline / blocked — keep the generic message
      }

      sending = false;
      submit.classList.remove('is-loading');
      submit.removeAttribute('aria-busy');

      if (!result.ok) {
        showError(result.error);
        return;
      }

      const mode = modes?.mode;
      form.reset();
      uploads.forEach((u) => u.reset());
      if (modes && mode) modes.setMode(mode, true); // keep the chosen mode
      controls.forEach((c) => c.removeAttribute('aria-invalid'));

      showNote(success);
      clearTimeout(successTimer);
      successTimer = setTimeout(() => { success.hidden = true; if (hasST) ScrollTrigger.refresh(); }, 7000);
    });
  };

  document.querySelectorAll('[data-form]').forEach(initForm);

  /* ------------------------------------------------------------------
     Contact links from js/config.js  →  [data-contact="email|telegram|linkedin"]
     ------------------------------------------------------------------ */
  const CONTACT_HREF = {
    email: (v) => `mailto:${v}`,
    telegram: (v) => `https://t.me/${String(v).replace(/^@/, '')}`,
    linkedin: (v) => v,
  };
  const contacts = window.ARIES_CONFIG?.contacts || {};
  document.querySelectorAll('[data-contact]').forEach((el) => {
    const type = el.dataset.contact;
    const value = contacts[type];
    if (!value || !CONTACT_HREF[type]) return;
    el.href = CONTACT_HREF[type](value);
    if (type !== 'email') {
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    }
    const label = el.dataset.contactLabel || type;
    el.setAttribute('aria-label', `${label}: ${type === 'telegram' ? '@' + String(value).replace(/^@/, '') : value}`);
  });

  /* ------------------------------------------------------------------
     Glass edge guard
     macOS Chrome blurs whatever lies above the page (the light toolbar) into
     backdrop-filter glass that touches the top of the viewport — it glows
     white. Glass inside the top band simply drops its blur there; over the
     dark page the difference is invisible, and it returns further down.
     ------------------------------------------------------------------ */
  const GLASS = '.glass, .btn, .badge__core, .nav__list, .nav__link.is-active, .burger, .segmented__label, .chip__label, .contact-card, .global__disc, .global__pin';
  if ('IntersectionObserver' in window) {
    const edgeIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle('is-edge', e.isIntersecting));
    }, { rootMargin: '200px 0px -84% 0px' });
    document.querySelectorAll(GLASS).forEach((el) => edgeIO.observe(el));

    // Floating cards blur real content, so there it's gradual: approaching the
    // top edge a dark tint fades in over TINT_RAMP px (--tint 0 → 1), then the
    // glass fades out under it over EDGE_RAMP px (--edge 1 → 0 at EDGE_START).
    // Runs only while a stage is on screen.
    const EDGE_START = 8;
    const EDGE_RAMP = 300;
    const TINT_RAMP = 80;
    const edgeEls = [...document.querySelectorAll('.float-card, .float-card__body')];
    const stages = document.querySelectorAll('[data-floating]');
    if (edgeEls.length && stages.length) {
      const last = new Map();
      let visible = 0;
      let raf = 0;
      const clamp01 = (v) => Math.min(1, Math.max(0, v));
      const tick = () => {
        edgeEls.forEach((el) => {
          const d = el.getBoundingClientRect().top - EDGE_START;
          const edge = Math.round(clamp01(d / EDGE_RAMP) * 100) / 100;
          const tint = Math.round(clamp01((EDGE_RAMP + TINT_RAMP - d) / TINT_RAMP) * 100) / 100;
          const key = edge + '/' + tint;
          if (last.get(el) !== key) {
            last.set(el, key);
            el.style.setProperty('--edge', edge);
            el.style.setProperty('--tint', tint);
          }
        });
        if (!hasGsap) raf = visible ? requestAnimationFrame(tick) : 0;
      };
      // with GSAP: run right after ScrollTrigger has moved the cards, same frame
      let onTicker = false;
      const stageIO = new IntersectionObserver((entries) => {
        entries.forEach((e) => { visible += e.isIntersecting ? 1 : -1; });
        visible = Math.max(0, visible);
        if (hasGsap) {
          if (visible && !onTicker) gsap.ticker.add(tick);
          else if (!visible && onTicker) gsap.ticker.remove(tick);
          onTicker = !!visible;
        } else if (visible && !raf) raf = requestAnimationFrame(tick);
      });
      stages.forEach((el) => stageIO.observe(el));
    }
  }

  /* ------------------------------------------------------------------
     Public API for page scripts
     ------------------------------------------------------------------ */
  window.ARIES = {
    lenis,
    hasGsap,
    hasST,
    reduceMotion: reduceMotionMQ.matches,
    scrollTo: scrollToTarget,
    DESKTOP_MIN,
  };
})();
