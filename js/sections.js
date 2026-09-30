/* ==========================================================================
   ARIES GROUP — shared section behaviour (all pages, auto-initialised)
   - line-by-line title reveals (gradient preserved per line)   [data-split]
   - block reveals                                              [data-reveal]
   - parallax                                                   [data-parallax]
   - number counters                                            [data-count]
   - Floating cards: pinned, single scrubbed timeline           [data-floating]
   - What We Do: pinned, 5 themed steps                         [data-wwd]
   ========================================================================== */
(() => {
  'use strict';

  const { hasGsap, hasST, reduceMotion, scrollTo, DESKTOP_MIN } = window.ARIES || {};
  const root = document.documentElement;

  /* ------------------------------------------------------------------
     Split titles into lines. Each line gets the parent's gradient with a
     background box equal to the whole title, so colours stay identical.
     ------------------------------------------------------------------ */
  const splitRoots = [...document.querySelectorAll('[data-split]')];

  const getSplitTargets = (el) => {
    const parts = el.querySelectorAll(':scope > .about__title-line, :scope > .why__title-line');
    // block-level parts are split separately (desktop indents); inline parts flow as one text
    if (parts.length && getComputedStyle(parts[0]).display !== 'inline') return [...parts];
    return [el];
  };

  const splitLines = (el) => {
    if (!el.dataset.splitSource) el.dataset.splitSource = el.innerHTML;
    el.innerHTML = el.dataset.splitSource;
    el.classList.remove('is-split');

    // inline titles (mobile hero) keep natural flow — revealed as a block
    if (getComputedStyle(el).display === 'inline') return false;

    getSplitTargets(el).forEach((target) => {
      // flatten to words, keeping forced line breaks that are visible
      // (<br class="br-d"> is desktop-only and hidden on mobile)
      target.querySelectorAll('br').forEach((br) => {
        if (getComputedStyle(br).display === 'none') br.remove();
      });
      const html = target.innerHTML.replace(/<br[^>]*>/gi, ' \n ');
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const words = tmp.textContent.split(/[ \t]+/).filter(Boolean);

      target.innerHTML = words
        .map((w) => (w === '\n' ? '<br>' : `<span class="split-word">${w}</span>`))
        .join(' ');

      const lines = [];
      let lastTop = null;
      target.querySelectorAll('.split-word').forEach((word) => {
        const top = word.offsetTop;
        if (lastTop === null || Math.abs(top - lastTop) > 4) {
          lines.push([]);
          lastTop = top;
        }
        lines[lines.length - 1].push(word.textContent);
      });

      target.innerHTML = lines
        .map((ws) => `<span class="line"><span class="line__inner">${ws.join(' ')}</span></span>`)
        .join('');
    });

    el.classList.add('is-split');
    fitGradient(el);
    return true;
  };

  const fitGradient = (el) => {
    const box = el.getBoundingClientRect();
    el.querySelectorAll('.line__inner').forEach((inner) => {
      const r = inner.getBoundingClientRect();
      inner.style.setProperty('--bw', `${box.width}px`);
      inner.style.setProperty('--bh', `${box.height}px`);
      inner.style.setProperty('--bx', `${box.left - r.left}px`);
      inner.style.setProperty('--by', `${box.top - r.top}px`);
    });
  };

  const splitAll = () => splitRoots.forEach(splitLines);

  // No GSAP (CDN failure) or reduced motion → only split for layout parity
  if (!hasGsap || !hasST) {
    root.classList.remove('js-anim');
    return;
  }

  /* ------------------------------------------------------------------
     Setup after fonts are ready (line breaks depend on metrics)
     ------------------------------------------------------------------ */
  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();

  ready.then(() => {
    splitAll();
    initReveals();
    initCounters();
    initMatchMedia();
    root.classList.remove('js-anim');
    ScrollTrigger.refresh();
  });

  // Re-split on width change only (mobile URL bar changes height)
  let lastWidth = window.innerWidth;
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      splitAll();
      // lines are already revealed after a resize
      gsap.set('.line__inner', { yPercent: 0 });
      ScrollTrigger.refresh();
    }, 200);
  });

  /* ------------------------------------------------------------------
     Reveals
     ------------------------------------------------------------------ */
  // first screen of each page: animates on load, not on scroll
  const HERO = '.hero, .cta-phone--hero';

  function initReveals() {
    if (reduceMotion) return;

    // titles, line by line
    splitRoots.forEach((el) => {
      const lines = el.querySelectorAll('.line__inner');
      const inHero = Boolean(el.closest(HERO));
      const vars = {
        yPercent: 105,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.09,
      };

      if (!lines.length) {
        gsap.from(el, {
          y: 30,
          autoAlpha: 0,
          duration: 1,
          ease: 'power3.out',
          delay: inHero ? 0.2 : 0,
          scrollTrigger: inHero ? undefined : { trigger: el, start: 'top 88%', once: true },
        });
        return;
      }

      if (inHero) {
        gsap.from(lines, { ...vars, delay: el.classList.contains('hero__title-b') ? 0.35 : 0.15 });
      } else {
        gsap.from(lines, { ...vars, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      }
    });

    // blocks
    const blocks = gsap.utils.toArray('[data-reveal]');
    const heroBlocks = blocks.filter((b) => b.closest(HERO));
    const otherBlocks = blocks.filter((b) => !b.closest(HERO));

    if (heroBlocks.length) gsap.from(heroBlocks, {
      y: 30,
      autoAlpha: 0,
      duration: 1,
      ease: 'power3.out',
      stagger: 0.1,
      delay: 0.45,
    });
    gsap.from('.header__inner > *', {
      y: -16,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.08,
      delay: 0.1,
      clearProps: 'transform,opacity,visibility',
    });
    const heroArt = document.querySelector('.hero__art');
    if (heroArt) gsap.from(heroArt, { autoAlpha: 0, duration: 1.6, ease: 'power2.out' });

    gsap.set(otherBlocks, { y: 40, autoAlpha: 0 });
    ScrollTrigger.batch(otherBlocks, {
      start: 'top 90%',
      once: true,
      onEnter: (batch) => gsap.to(batch, {
        y: 0,
        autoAlpha: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.08,
        overwrite: true,
      }),
    });
  }

  /* ------------------------------------------------------------------
     Counters
     ------------------------------------------------------------------ */
  function initCounters() {
    document.querySelectorAll('[data-count]').forEach((el) => {
      const format = (n) => ('countPlain' in el.dataset ? String(Math.round(n)) : Math.round(n).toLocaleString('en-US'));
      const to = Number(el.dataset.count);
      const from = Number(el.dataset.countFrom || 0);
      const suffix = el.dataset.countSuffix || '';
      if (reduceMotion) return;

      // Lock the final width (in em, so it follows the font size): while
      // "0+" grows to "5,000+" the wrapped stats row must not reflow, and the
      // font's digits aren't equal width, so intermediate values are centred
      // inside that box instead of resizing it.
      el.textContent = format(to) + suffix;
      const fontSize = parseFloat(getComputedStyle(el).fontSize);
      el.style.width = `${(el.getBoundingClientRect().width / fontSize).toFixed(3)}em`;
      el.style.textAlign = 'center';

      const state = { v: from };
      el.textContent = format(from) + suffix;
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => gsap.to(state, {
          v: to,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = format(state.v) + suffix; },
        }),
      });
    });
  }

  /* ------------------------------------------------------------------
     Responsive / motion-aware scroll scenes
     ------------------------------------------------------------------ */
  function initMatchMedia() {
    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: `(min-width: ${DESKTOP_MIN}px)`,
        mobile: `(max-width: ${DESKTOP_MIN - 1}px)`,
        // very short screens / phones in landscape: What We Do as a static list
        short: `(max-width: ${DESKTOP_MIN - 1}px) and (max-height: 599px)`,
        reduce: '(prefers-reduced-motion: reduce)',
      },
      (ctx) => {
        const { desktop, short, reduce } = ctx.conditions;
        const cleanups = [];

        if (!reduce) {
          initParallax();
          cleanups.push(initFloating(desktop));
        }
        cleanups.push(initWhatWeDo(reduce, desktop, short));

        return () => cleanups.forEach((fn) => fn && fn());
      },
    );
  }

  /* ------------------------------------------------------------------
     Parallax (3D characters)
     ------------------------------------------------------------------ */
  function initParallax() {
    gsap.utils.toArray('[data-parallax]').forEach((el) => {
      const amount = Number(el.dataset.parallax) || 8;
      const trigger = el.closest('section') || el;
      gsap.fromTo(el, { yPercent: -amount / 2 }, {
        yPercent: amount / 2,
        ease: 'none',
        scrollTrigger: {
          trigger,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  /* ------------------------------------------------------------------
     FLOATING CARDS (Our Network, Why ARIES …)
     Cards live in one track that travels from below the viewport to
     above it; overlap in time comes from the card offsets.
     Desktop offsets: inline --offset (Figma px). Mobile: stacked with a gap,
     written to --offset-m so the authored values are never lost.
     ------------------------------------------------------------------ */
  function initFloating(isDesktop) {
    const cleanups = [...document.querySelectorAll('[data-floating]')].map((section) => {
      const pin = section.querySelector('.floating__pin');
      const track = section.querySelector('[data-floating-track]');
      const cards = [...track.querySelectorAll('.float-card')];
      const imgs = cards.map((c) => c.querySelector('[data-card-parallax]')).filter(Boolean);
      const GAP_M = 40;

      const layout = () => {
        if (isDesktop) {
          cards.forEach((c) => c.style.removeProperty('--offset-m'));
          return;
        }
        let y = 0;
        cards.forEach((c) => {
          c.style.setProperty('--offset-m', y);
          y += c.offsetHeight + GAP_M;
        });
      };

      const trackHeight = () => {
        const k = parseFloat(getComputedStyle(document.body).getPropertyValue('--k')) || 1;
        const last = cards[cards.length - 1];
        const cs = getComputedStyle(last);
        const offset = parseFloat(cs.getPropertyValue(isDesktop ? '--offset' : '--offset-m')) || 0;
        return (offset + last.offsetHeight) * (isDesktop ? k : 1);
      };

      layout();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${trackHeight() + window.innerHeight * 0.9}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onRefreshInit: layout,
        },
      });

      tl.fromTo(track, { y: () => window.innerHeight }, { y: () => -trackHeight() - 20, ease: 'none' }, 0);
      imgs.forEach((img) => tl.fromTo(img, { y: 26 }, { y: -26, ease: 'none' }, 0));

      return () => {
        cards.forEach((c) => c.style.removeProperty('--offset-m'));
        gsap.set([track, ...imgs], { clearProps: 'transform' });
      };
    });
    return () => cleanups.forEach((fn) => fn());
  }

  /* ------------------------------------------------------------------
     WHAT WE DO
     ------------------------------------------------------------------ */
  const THEMES = [
    { accent: '#124df1', label: '#2a8dff', light: '#8dc2ff' },
    { accent: '#b12aff', label: '#b12aff', light: '#e6baff' },
    { accent: '#f11216', label: '#ff2a2e', light: '#ffbabb' },
    { accent: '#28bd39', label: '#28bd39', light: '#91f89d' },
    { accent: '#ff7f00', label: '#ff7f00', light: '#ffb66d' },
  ];

  /* Mobile: fit the 3D art into the free space between the button and the
     card (sets --wwd-art-top / -h / -w, used by the mobile CSS). */
  const WWD_ART_RATIO = 1440 / 683;
  const WWD_ART_MAX_H = 440;
  const WWD_ART_MASK = 0.16; // top part of the art is masked out, may sit behind the button
  const WWD_ART_TUCK = 28; // the character's lower body may slip under the card

  function initWhatWeDoArt(section) {
    const btn = section.querySelector('.wwd__btn');
    const cardsEl = section.querySelector('.wwd__cards');
    const layout = () => {
      // offsets (not rects) — immune to reveal / step transforms
      const top = btn.offsetTop + btn.offsetHeight;
      const bottom = cardsEl.offsetTop + WWD_ART_TUCK;
      const h = Math.max(0, Math.min((bottom - top) / (1 - WWD_ART_MASK), WWD_ART_MAX_H));
      section.style.setProperty('--wwd-art-top', `${bottom - h}px`);
      section.style.setProperty('--wwd-art-h', `${h}px`);
      section.style.setProperty('--wwd-art-w', `${Math.round(h * WWD_ART_RATIO)}px`);
    };
    const ro = new ResizeObserver(layout);
    [section.querySelector('.wwd__stage'), section.querySelector('.wwd__head'), cardsEl].forEach((el) => ro.observe(el));
    layout();
    return () => {
      ro.disconnect();
      ['--wwd-art-top', '--wwd-art-h', '--wwd-art-w'].forEach((p) => section.style.removeProperty(p));
    };
  }

  function initWhatWeDo(reduce, desktop, short) {
    const section = document.querySelector('[data-wwd]');
    if (!section) return null;

    const pin = section.querySelector('.wwd__pin');
    const arts = [...section.querySelectorAll('[data-wwd-art]')];
    const froms = [...section.querySelectorAll('[data-wwd-from]')];
    const cards = [...section.querySelectorAll('[data-wwd-card]')];
    const bars = [...section.querySelectorAll('[data-wwd-bar]')];
    const fills = bars.map((b) => b.querySelector('.wwd__bar-fill'));
    const steps = THEMES.length;
    let current = 0;
    let st = null;

    const cleanArt = desktop ? null : initWhatWeDoArt(section);
    gsap.set(arts, { xPercent: -50, x: 0 });

    // Short screens: static list — first art + title, every card in its own colour
    if (short) {
      arts.forEach((a, i) => gsap.set(a, { autoAlpha: i === 0 ? 1 : 0 }));
      cards.forEach((card, i) => {
        const t = THEMES[i];
        gsap.set(card, { autoAlpha: 1, '--theme-accent': t.accent, '--theme-label': t.label, '--theme-light': t.light });
        card.removeAttribute('aria-hidden');
      });
      return () => {
        cleanArt?.();
        cards.forEach((card, i) => { if (i) card.setAttribute('aria-hidden', 'true'); });
      };
    }

    section.classList.add('is-enhanced');

    const swap = (list, next, prev, vars) => {
      const outEl = list[prev];
      const inEl = list[next];
      gsap.killTweensOf([outEl, inEl]);
      list.forEach((el, i) => {
        el.classList.toggle('is-active', i === next);
        if (el.hasAttribute('data-wwd-from') || el.hasAttribute('data-wwd-card')) {
          el.setAttribute('aria-hidden', String(i !== next));
        }
      });
      if (reduce) {
        list.forEach((el, i) => gsap.set(el, { autoAlpha: i === next ? 1 : 0, clearProps: 'transform' }));
        return;
      }
      if (outEl && outEl !== inEl) {
        gsap.to(outEl, { autoAlpha: 0, duration: 0.5, ease: 'power2.in', ...vars.out });
      }
      gsap.fromTo(inEl, { autoAlpha: 0, ...vars.from }, { autoAlpha: 1, duration: 0.9, ease: 'power3.out', delay: 0.15, ...vars.to });
    };

    const setStep = (next, instant = false) => {
      if (next === current && !instant) return;
      const prev = current;
      current = next;
      const t = THEMES[next];

      gsap.to(section, {
        '--theme-accent': t.accent,
        '--theme-label': t.label,
        '--theme-light': t.light,
        duration: instant || reduce ? 0 : 0.9,
        ease: 'power2.inOut',
      });

      swap(arts, next, prev, {
        out: { scale: 1.04 },
        from: { scale: 1.07 },
        to: { scale: 1, duration: 1.2 },
      });
      swap(froms, next, prev, { out: { y: -24 }, from: { y: 36 }, to: { y: 0 } });
      swap(cards, next, prev, { out: { y: -16 }, from: { y: 28 }, to: { y: 0 } });

      bars.forEach((bar, i) => {
        bar.classList.toggle('is-active', i === next);
        bar.setAttribute('aria-selected', String(i === next));
      });
    };

    const updateBars = (progress) => {
      const p = progress * steps;
      fills.forEach((fill, i) => {
        const local = i === current ? Math.min(1, Math.max(0.04, p - i)) : 0;
        gsap.set(fill, { scaleX: local });
      });
    };

    // initial state
    arts.forEach((a, i) => gsap.set(a, { autoAlpha: i === 0 ? 1 : 0 }));
    froms.forEach((a, i) => gsap.set(a, { autoAlpha: i === 0 ? 1 : 0 }));
    cards.forEach((a, i) => gsap.set(a, { autoAlpha: i === 0 ? 1 : 0 }));

    if (!reduce) {
      st = ScrollTrigger.create({
        trigger: pin,
        start: 'top top',
        end: () => `+=${window.innerHeight * (steps - 1) * 0.85 + window.innerHeight * 0.4}`,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(steps - 1, Math.floor(self.progress * steps * 0.9999));
          setStep(idx);
          updateBars(self.progress);
        },
      });
      updateBars(0);
    } else {
      fills.forEach((fill, i) => gsap.set(fill, { scaleX: i === 0 ? 1 : 0 }));
    }

    const onBarClick = (e) => {
      const i = bars.indexOf(e.currentTarget);
      if (i < 0) return;
      if (st) {
        const target = st.start + ((i + 0.02) / steps) * (st.end - st.start) + 2;
        scrollTo(target);
      } else {
        setStep(i);
        fills.forEach((fill, j) => gsap.set(fill, { scaleX: j === i ? 1 : 0 }));
      }
    };

    const onBarKey = (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const i = bars.indexOf(e.currentTarget) + (e.key === 'ArrowRight' ? 1 : -1);
      if (i < 0 || i >= steps) return;
      bars[i].focus();
      bars[i].click();
    };

    bars.forEach((b) => {
      b.addEventListener('click', onBarClick);
      b.addEventListener('keydown', onBarKey);
    });

    return () => {
      cleanArt?.();
      bars.forEach((b) => {
        b.removeEventListener('click', onBarClick);
        b.removeEventListener('keydown', onBarKey);
      });
      section.classList.remove('is-enhanced');
    };
  }
})();
