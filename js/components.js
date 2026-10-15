/* ==========================================================================
   ARIES GROUP — shared markup components (no build step)

   Usage in a page:
     <div data-component="header" data-active="services"></div>
     <script>AriesUI.mount()</script>

   mount() replaces every not-yet-mounted placeholder above the call
   synchronously, so the markup exists before first paint and before
   main.js / page scripts run.

   Components: preloader, header (+ mobile menu), footer, what-we-do, cta-phone-art, logo-art, contact-form.
   ========================================================================== */
(function () {
  'use strict';

  var PAGES = [
    { id: 'home', label: 'Home', href: 'index.html' },
    { id: 'services', label: 'Services', href: 'services.html' },
    { id: 'careers', label: 'Careers', href: 'careers.html' },
    { id: 'contact', label: 'Contact', href: 'contact.html' },
  ];

  var CONTACT_HREF = 'contact.html#contact-form';

  var esc = function (str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var arrowIcon = '<span class="btn__icon"><img src="assets/icons/arrow.svg" width="10" height="10" alt=""></span>';

  var button = function (opts) {
    return '<a class="btn ' + opts.mod + (opts.cls ? ' ' + opts.cls : '') + '" href="' + esc(opts.href) + '"' + (opts.attrs || '') + '>' +
      '<span class="btn__text">' + esc(opts.text) + '</span>' + arrowIcon + '</a>';
  };

  var logo = function (label, lazy) {
    var l = lazy ? ' loading="lazy"' : '';
    return '<a class="logo" href="index.html" aria-label="' + esc(label) + '">' +
      '<img class="logo__mark" src="assets/icons/logo-mark.svg" width="30" height="30" alt=""' + l + '>' +
      '<img class="logo__text" src="assets/icons/logo-text.svg" width="173" height="19" alt="ARIES GROUP"' + l + '>' +
      '</a>';
  };

  /* ---------------- Header + mobile menu ---------------- */
  var header = function (el) {
    var active = el.getAttribute('data-active') || 'home';

    var navItems = PAGES.map(function (p) {
      var on = p.id === active;
      return '<li><a class="nav__link' + (on ? ' is-active' : '') + '" href="' + p.href + '"' + (on ? ' aria-current="page"' : '') + '>' + p.label + '</a></li>';
    }).join('');

    var menuItems = PAGES.map(function (p) {
      var on = p.id === active;
      return '<li class="mobile-menu__item"><a class="mobile-menu__link' + (on ? ' is-active' : '') + '" href="' + p.href + '"' + (on ? ' aria-current="page"' : '') + ' data-menu-link>' + p.label + '</a></li>';
    }).join('');

    return '' +
      '<header class="header" id="header">' +
        '<div class="header__inner container">' +
          logo('ARIES GROUP — home') +
          '<nav class="nav" aria-label="Main"><ul class="nav__list">' + navItems + '</ul></nav>' +
          button({ mod: 'btn--dark', cls: 'header__cta', href: CONTACT_HREF, text: 'Contact us' }) +
          '<button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu" data-burger>' +
            '<span class="burger__line"></span><span class="burger__line"></span><span class="burger__line"></span>' +
          '</button>' +
        '</div>' +
      '</header>' +
      '<div class="mobile-menu" id="mobile-menu" aria-hidden="true" data-menu>' +
        '<nav aria-label="Mobile"><ul class="mobile-menu__list">' + menuItems + '</ul></nav>' +
        button({ mod: 'btn--dark', cls: 'mobile-menu__cta', href: CONTACT_HREF, text: 'Contact us', attrs: ' data-menu-link' }) +
      '</div>';
  };

  /* ---------------- Footer ---------------- */
  var footer = function () {
    var links = PAGES.slice(1).map(function (p) {
      return '<a class="footer__link" href="' + p.href + '">' + p.label + '</a>';
    }).join('');

    return '' +
      '<footer class="footer">' +
        '<img class="footer__glow" src="assets/icons/footer-glow.svg" width="1597" height="1062" alt="" aria-hidden="true" loading="lazy">' +
        '<div class="footer__inner container">' +
          '<div class="footer__top">' +
            logo('ARIES GROUP — home', true) +
            '<nav class="footer__nav" aria-label="Footer">' + links + '</nav>' +
          '</div>' +
          '<div class="footer__bottom">' +
            '<div class="footer__line"></div>' +
            '<div class="footer__meta">' +
              '<p>© 2026</p>' +
              '<div class="footer__legal"><a href="terms.html">Terms of use</a><a href="privacy.html">Privacy Policy</a></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</footer>';
  };

  /* ---------------- What We Do ---------------- */
  var WWD_STEPS = [
    {
      from: 'Talent Discovery',
      tab: 'Talent Discovery',
      title: 'Influencer &amp; Talent Sourcing',
      text: 'We identify and select influencers, streamers and digital creators based on the brand, target market, audience, platform and campaign objectives.',
    },
    {
      from: 'Talent Development',
      tab: 'Talent Development',
      title: 'Talent Management &amp; Development',
      text: 'We support selected talent with positioning, audience development, monetisation, commercial strategy and long-term growth.',
    },
    {
      from: 'Campaign Management',
      tab: 'Campaign Management',
      title: 'Campaign Management',
      text: 'We coordinate advertising campaigns from negotiations and agreements to content production, publishing, quality control and reporting.',
    },
    {
      from: 'Brand Ambassadorship',
      tab: 'Brand Ambassadorship',
      title: 'Brand Ambassadorship',
      text: 'We develop long-term ambassador programmes that establish consistent brand visibility through carefully selected personalities.',
    },
    {
      from: 'Deal Management',
      tab: 'Deal Management',
      title: 'Partnership &amp; Deal Management',
      text: 'We facilitate communication between both sides, manage commercial negotiations and coordinate agreed deliverables throughout the partnership.',
    },
  ];

  var whatWeDo = function (el) {
    var id = el.getAttribute('data-id') || 'what-we-do';
    var btnText = el.getAttribute('data-btn-text') || 'Explore All Services';
    var btnHref = el.getAttribute('data-btn-href') || 'services.html';
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };

    var arts = WWD_STEPS.map(function (s, i) {
      return '<img class="wwd__art-img' + (i === 0 ? ' is-active' : '') + '" src="assets/img/wwd-' + (i + 1) + '.webp" width="1440" height="683" alt="" loading="lazy" data-wwd-art>';
    }).join('');

    var froms = WWD_STEPS.map(function (s, i) {
      return '<span class="wwd__from-item' + (i === 0 ? ' is-active' : '') + '" data-wwd-from' + (i ? ' aria-hidden="true"' : '') + '>' +
        'From ' + s.from + '<span class="wwd__to-inline"> to Long-Term Partnerships</span></span>';
    }).join('');

    var cards = WWD_STEPS.map(function (s, i) {
      return '<article class="wwd__card glass' + (i === 0 ? ' is-active' : '') + '" data-wwd-card' + (i ? ' aria-hidden="true"' : '') + '>' +
        '<p class="label wwd__card-label"><span>[</span><span class="label__text">' + pad(i + 1) + '</span><span>]</span></p>' +
        '<div class="wwd__card-body">' +
          '<h3 class="title title--h3 wwd__card-title">' + s.title + '</h3>' +
          '<p class="text text--muted">' + s.text + '</p>' +
        '</div>' +
      '</article>';
    }).join('');

    var bars = WWD_STEPS.map(function (s, i) {
      return '<button class="wwd__bar' + (i === 0 ? ' is-active' : '') + '" type="button" role="tab" aria-selected="' + (i === 0) + '" aria-label="Step ' + (i + 1) + ': ' + s.tab + '" data-wwd-bar><span class="wwd__bar-fill"></span></button>';
    }).join('');

    return '' +
      '<section class="wwd section" id="' + esc(id) + '" aria-labelledby="' + esc(id) + '-title" data-wwd>' +
        '<div class="wwd__pin">' +
          '<div class="wwd__art" aria-hidden="true"><div class="wwd__glow"></div>' + arts + '<div class="wwd__fade"></div></div>' +
          '<div class="wwd__stage container">' +
            '<div class="wwd__head">' +
              '<p class="label wwd__label" data-reveal><span>[</span><span class="label__text">What We Do</span><span>]</span></p>' +
              '<h2 class="wwd__title" id="' + esc(id) + '-title"><span class="wwd__from">' + froms + '</span>' +
              '<span class="wwd__to">to Long-Term Partnerships</span></h2>' +
            '</div>' +
            button({ mod: 'btn--light btn--alt', cls: 'wwd__btn', href: btnHref, text: btnText }) +
            '<div class="wwd__cards">' + cards + '</div>' +
            '<div class="wwd__progress" role="tablist" aria-label="What we do steps">' + bars + '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
  };

  /* ---------------- CTA with phone: decorative art only ----------------
     Text (label, title h1/h2, subtitle, button) stays in the page HTML. */
  var ctaPhoneArt = function () {
    return '' +
      '<div class="cta-phone__art" aria-hidden="true">' +
        '<img class="cta-phone__glow cta-phone__glow--1" src="assets/icons/talk-glow-1.svg" width="1070" height="323" alt="" loading="lazy">' +
        '<img class="cta-phone__frames" src="assets/icons/talk-frames.svg" width="1100" height="307" alt="" loading="lazy">' +
        // each 3D object sits on a dark blurred silhouette (as in Figma) so the
        // lines behind don't show through the glass
        '<div class="cta-phone__obj cta-phone__phone" data-parallax="-5">' +
          '<span class="silhouette silhouette--phone"></span>' +
          '<img src="assets/img/talk-phone.webp" width="1031" height="509" alt="" loading="lazy">' +
        '</div>' +
        '<img class="cta-phone__glow cta-phone__glow--2" src="assets/icons/talk-glow-2.svg" width="1095" height="331" alt="" loading="lazy">' +
        '<div class="cta-phone__obj cta-phone__chat" data-parallax="-18">' +
          '<span class="silhouette silhouette--chat"></span>' +
          '<img src="assets/img/talk-chat.webp" width="279" height="263" alt="" loading="lazy">' +
        '</div>' +
        '<div class="cta-phone__obj cta-phone__envelope" data-parallax="-12">' +
          '<span class="silhouette silhouette--envelope"></span>' +
          '<img src="assets/img/talk-envelope.webp" width="268" height="192" alt="" loading="lazy">' +
        '</div>' +
        '<img class="cta-phone__art-m" src="assets/img/talk-art-m.webp" width="390" height="235" alt="" loading="lazy">' +
      '</div>';
  };

  /* ---------------- 3D logo art (About / For Brands) ---------------- */
  var logoArt = function () {
    return '' +
      '<div class="logo-art" aria-hidden="true">' +
        '<img class="logo-art__lines" src="assets/icons/about-lines.svg" width="1949" height="1248" alt="" loading="lazy">' +
        '<div class="logo-art__glow"></div>' +
        '<div class="logo-art__logo" data-parallax="10">' +
          '<span class="silhouette silhouette--logo"></span>' +
          '<img src="assets/img/about-logo.webp" width="1162" height="760" alt="" loading="lazy">' +
        '</div>' +
        '<div class="badge logo-art__badge logo-art__badge--1">' +
          '<span class="badge__core"><img src="assets/icons/badge-ai.svg" width="22" height="17" alt=""></span>' +
        '</div>' +
        '<div class="badge logo-art__badge logo-art__badge--2">' +
          '<span class="badge__core"><img src="assets/icons/badge-reco.svg" width="17" height="20" alt=""></span>' +
        '</div>' +
        '<img class="logo-art__m" src="assets/img/about-art-m.webp" width="390" height="601" alt="" loading="lazy">' +
      '</div>';
  };

  /* ---------------- Contact form ----------------
     data-id        section id (default "contact")
     data-title     form title
     data-desc      optional description under the title
     data-mode      "simple" (resume, no switch) | "switch" (Creator / Company)
     data-default   default mode for "switch": "company" | "creator"
       creator → shows "Add A Resume", company → shows "I'm Interested In" chips.
       Mode can also be set via ?type=creator|company or a link with
       data-form-type="creator|company" (handled in main.js). */
  var INTERESTS = ['Brand Partnership', 'Talent Management', 'Campaign', 'Other'];

  var field = function (o) {
    return '<div class="field' + (o.wide ? ' field--wide-m' : '') + '">' +
      '<label class="field__label" for="' + o.id + '">' + o.label + '</label>' +
      o.control +
      '<p class="field__error" id="' + o.id + '-error">' + o.error + '</p>' +
    '</div>';
  };

  var input = function (o) {
    return '<input class="field__control" id="' + o.id + '" name="' + o.name + '" type="' + (o.type || 'text') + '"' +
      (o.auto ? ' autocomplete="' + o.auto + '"' : '') + (o.extra || '') +
      ' placeholder="' + o.placeholder + '"' + (o.required ? ' required' : '') + '>';
  };

  var upload = function (p) {
    return '' +
      '<div class="upload" data-upload>' +
        '<input class="visually-hidden" type="file" id="' + p + '-resume" name="resume" accept=".pdf,.doc,.docx,.ppt,.pptx,.key,.txt,.rtf,.png,.jpg,.jpeg,.zip" data-upload-input>' +
        '<label class="upload__drop" for="' + p + '-resume">' +
          '<span class="upload__icon" aria-hidden="true">' +
            '<span class="upload__icon-state upload__icon-state--empty">' +
              '<span class="upload__doc-base"></span>' +
              '<img class="upload__doc" src="assets/icons/resume-doc.svg" width="40" height="40" alt="">' +
              '<span class="upload__doc-line"></span><span class="upload__doc-line"></span>' +
              '<span class="upload__doc-line"></span><span class="upload__doc-line"></span>' +
            '</span>' +
            '<img class="upload__icon-state upload__icon-state--done" src="assets/icons/resume-done.svg" width="44" height="44" alt="">' +
          '</span>' +
          '<span class="upload__body">' +
            '<span class="upload__title" data-upload-title>Add A Resume</span>' +
            '<span class="upload__hint">Attach a brief, campaign details, media kit, or any other relevant materials.</span>' +
            '<span class="upload__file" data-upload-name></span>' +
          '</span>' +
        '</label>' +
        '<button class="upload__remove" type="button" aria-label="Remove file" data-upload-remove>' +
          '<img src="assets/icons/close.svg" width="10" height="10" alt="">' +
        '</button>' +
        '<p class="field__error upload__error" data-upload-error>File is too large (max 4 MB)</p>' +
      '</div>';
  };

  var contactForm = function (el) {
    var id = el.getAttribute('data-id') || 'contact';
    var title = el.getAttribute('data-title') || 'Let’s Work Together';
    var desc = el.getAttribute('data-desc');
    var mode = el.getAttribute('data-mode') || 'simple';
    var def = el.getAttribute('data-default') === 'creator' ? 'creator' : 'company';
    var p = 'f-' + id;
    var isSwitch = mode === 'switch';

    var names = '' +
      '<div class="form__row">' +
        field({ id: p + '-first', label: 'First Name', error: 'Please enter your first name',
          control: input({ id: p + '-first', name: 'firstName', auto: 'given-name', placeholder: 'Enter your first name', required: true }) }) +
        field({ id: p + '-last', label: 'Last Name', error: 'Please enter your last name',
          control: input({ id: p + '-last', name: 'lastName', auto: 'family-name', placeholder: 'Enter your last name', required: true }) }) +
      '</div>';

    var contacts = '' +
      '<div class="form__row">' +
        field({ id: p + '-email', wide: true, label: 'Email Address', error: 'Please enter a valid email address',
          control: input({ id: p + '-email', name: 'email', type: 'email', auto: 'email', extra: ' inputmode="email"', placeholder: 'Enter your email address', required: true }) }) +
        field({ id: p + '-telegram', wide: true, label: 'Telegram Username', error: 'Use 5–32 letters, digits or underscores',
          control: input({ id: p + '-telegram', name: 'telegram', auto: 'off', extra: ' pattern="^@?[A-Za-z0-9_]{5,32}$"', placeholder: '@username' }) }) +
      '</div>';

    var request = field({ id: p + '-request', label: 'Your Request', error: 'Please tell us a bit about your request',
      control: '<textarea class="field__control field__control--area" id="' + p + '-request" name="request" placeholder="Tell us how we can help you" required></textarea>' });

    var segmented = '' +
      '<fieldset class="segmented" data-form-switch>' +
        '<legend class="visually-hidden">I am a</legend>' +
        ['creator', 'company'].map(function (m) {
          return '<label class="segmented__option">' +
            '<input class="visually-hidden" type="radio" name="type" value="' + m + '"' + (m === def ? ' checked' : '') + '>' +
            '<span class="segmented__label">' + (m === 'creator' ? 'Creator' : 'Company') + '</span>' +
          '</label>';
        }).join('') +
      '</fieldset>';

    var chips = '' +
      '<div class="form__cond" data-form-show="company"' + (def === 'company' ? '' : ' hidden') + '>' +
        '<fieldset class="chips">' +
          '<legend class="field__label chips__legend">I’m Interested In:</legend>' +
          '<div class="chips__list">' +
            INTERESTS.map(function (label) {
              return '<label class="chip"><input class="visually-hidden" type="checkbox" name="interests" value="' + esc(label) + '">' +
                '<span class="chip__label">' + label + '</span></label>';
            }).join('') +
          '</div>' +
        '</fieldset>' +
      '</div>';

    var fields = isSwitch
      ? names + segmented + contacts + chips + request +
        '<div class="form__cond" data-form-show="creator"' + (def === 'creator' ? '' : ' hidden') + '>' + upload(p) + '</div>'
      : names + contacts + request + upload(p);

    return '' +
      '<section class="contact-form section" id="' + esc(id) + '" aria-labelledby="' + p + '-title">' +
        '<div class="container">' +
          '<div class="contact-form__card glass" data-reveal>' +
            '<form class="form" novalidate data-form data-form-mode="' + mode + '"' + (isSwitch ? ' data-form-default="' + def + '"' : '') + '>' +
              '<div class="form__head">' +
                '<h2 class="title title--h3 form__title gradient-text" id="' + p + '-title" style="--grad: var(--grad-card-title)">' + esc(title) + '</h2>' +
                (desc ? '<p class="text text--muted form__desc">' + esc(desc) + '</p>' : '') +
              '</div>' +
              '<div class="form__fields">' + fields + '</div>' +
              // honeypot for bots — hidden from people and assistive tech
              '<div class="visually-hidden" aria-hidden="true">' +
                '<label for="' + p + '-hp">Leave this field empty</label>' +
                '<input id="' + p + '-hp" type="text" name="hp_check" tabindex="-1" autocomplete="off">' +
              '</div>' +
              '<button class="btn btn--light form__submit" type="submit">' +
                '<span class="btn__text">Send</span>' + arrowIcon +
              '</button>' +
              '<div class="form__success" role="status" aria-live="polite" data-form-success hidden>' +
                '<span class="form__success-icon" aria-hidden="true"></span>' +
                '<p><strong>Thank you!</strong> Your request has been sent. Our team will get back to you shortly.</p>' +
              '</div>' +
              '<div class="form__success form__success--error" role="alert" data-form-fail hidden>' +
                '<span class="form__success-icon" aria-hidden="true"></span>' +
                '<p><strong>Something went wrong.</strong> <span data-form-fail-text>Please try again in a moment.</span></p>' +
              '</div>' +
            '</form>' +
            '<div class="contact-form__media" aria-hidden="true">' +
              '<img src="assets/img/form-art.webp" width="651" height="577" alt="" loading="lazy">' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
  };

  /* ---------------- Preloader ----------------
     ARIES word lit by three moving blue lights (Figma "1"–"4"), then the dark
     curtain slides up (Figma "5"). Shown once per browser session; skipped
     for reduced motion. Light motion is pure CSS, so it doesn't wait for GSAP;
     the exit waits for window "load" (min. one light cycle) and dispatches
     "aries:intro" — sections.js starts the hero animations on it. */
  var PRELOADER_KEY = 'aries-preloaded';
  var PRELOADER_MIN = 2400; // ms — one pass of the lights
  var PRELOADER_MAX = 7000; // ms — never block the page longer than this

  var preloaderSeen = function () {
    try { return window.sessionStorage.getItem(PRELOADER_KEY) === '1'; } catch (e) { return false; }
  };

  var preloader = function () {
    if (preloaderSeen() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return '';
    document.documentElement.classList.add('is-preloading');
    return '' +
      '<div class="preloader" aria-hidden="true" data-preloader>' +
        '<svg class="preloader__word" viewBox="0 0 288.994 73" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<mask id="pl-mask" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="289" height="73"><g><path d="M0 72.1855L24.7261 0.916318H45.9926L70.3116 72.1855H56.0661L51.0802 57.3208H19.3332L14.2455 72.1855H0ZM23.4033 44.8996H47.0101L35.4102 9.67225L23.4033 44.8996Z" fill="#D9D9D9"/><path d="M78.9845 72.1855V0.916318H110.223C117.074 0.916318 122.874 3.29196 127.623 8.04323C132.439 12.7945 134.847 18.4621 134.847 25.046C134.847 29.7973 133.457 34.1413 130.675 38.0781C127.962 41.947 124.4 44.662 119.991 46.2231L135.763 72.1855H121.11L106.356 47.954H92.823V72.1855H78.9845ZM92.823 36.0418H109.918C113.174 36.0418 115.921 34.9558 118.16 32.7838C120.466 30.5439 121.619 27.795 121.619 24.537C121.619 21.3468 120.534 18.6657 118.363 16.4937C116.192 14.3217 113.479 13.2357 110.223 13.2357H92.823V36.0418Z" fill="#D9D9D9"/><path d="M145.891 72.1855V0.916318H159.627V72.1855H145.891Z" fill="#D9D9D9"/><path d="M172.339 72.1855V0.916318H223.521V13.5411H186.076V30.3403H219.451V42.7615H186.076V59.4589H223.521V72.1855H172.339Z" fill="#D9D9D9"/><path d="M262.335 73C257.518 73 252.939 72.3552 248.598 71.0655C244.256 69.708 239.406 67.6718 234.047 64.9568V50.8047C244.019 56.9814 253.516 60.0697 262.538 60.0697C266.54 60.0697 269.661 59.391 271.899 58.0335C274.138 56.6081 275.257 54.6397 275.257 52.1283C275.257 49.8884 274.172 48.1237 272.001 46.834C269.898 45.4765 266.608 44.1869 262.131 42.9651C253.72 40.6574 248.123 38.8587 245.342 37.569C237.269 33.768 233.233 27.9986 233.233 20.2608C233.233 14.152 235.879 9.26499 241.17 5.59972C246.461 1.86657 253.007 0 260.808 0C269.966 0 278.31 2.6132 285.84 7.83961V21.9916C277.157 15.9507 268.779 12.9303 260.707 12.9303C256.569 12.9303 253.245 13.643 250.735 15.0683C248.225 16.4258 246.97 18.3942 246.97 20.9735C246.97 23.1455 248.191 24.8424 250.633 26.0642C253.075 27.218 256.908 28.4398 262.131 29.7294C265.319 30.5439 267.931 31.2906 269.966 31.9693C272.001 32.5802 274.342 33.4965 276.987 34.7183C279.701 35.94 281.803 37.2975 283.296 38.7908C284.856 40.2162 286.179 42.0828 287.264 44.3905C288.417 46.6983 288.994 49.3115 288.994 52.2301C288.994 58.7462 286.484 63.8368 281.464 67.5021C276.444 71.1674 270.068 73 262.335 73Z" fill="#D9D9D9"/></g></mask><g mask="url(#pl-mask)"><g class="preloader__light preloader__light--1"><g filter="url(#filter0_f-pl)"><circle cx="-15.7573" cy="-38.7791" r="39.6516" fill="black"/></g><g filter="url(#filter1_f-pl)"><circle cx="-19.6604" cy="-58.6495" r="39.6516" fill="black"/></g><g filter="url(#filter2_f-pl)"><circle cx="-6.17723" cy="-11.2803" r="39.6516" fill="black"/></g><g filter="url(#filter3_f-pl)"><circle cx="19.9024" cy="-58.6495" r="39.6516" fill="#124DF1"/></g><g filter="url(#filter4_f-pl)"><circle cx="19.8552" cy="-52.9018" r="39.6516" fill="#124DF1"/></g></g><g class="preloader__light preloader__light--2"><g filter="url(#filter5_f-pl)"><circle cx="182.436" cy="143.42" r="35.8047" transform="rotate(-116.32 182.436 143.42)" fill="black"/></g><g filter="url(#filter6_f-pl)"><circle cx="167.916" cy="154.534" r="35.8047" transform="rotate(-116.32 167.916 154.534)" fill="black"/></g><g filter="url(#filter7_f-pl)"><circle cx="200.856" cy="124.656" r="35.8047" transform="rotate(-116.32 200.856 124.656)" fill="black"/></g><g filter="url(#filter8_f-pl)"><circle cx="152.076" cy="122.513" r="35.8047" transform="rotate(-116.32 152.076 122.513)" fill="#124DF1"/></g><g filter="url(#filter9_f-pl)"><circle cx="160.968" cy="121.878" r="35.8047" transform="rotate(-116.32 160.968 121.878)" fill="#124DF1"/></g></g><g class="preloader__light preloader__light--3"><g filter="url(#filter10_f-pl)"><circle cx="322.661" cy="-21.7113" r="29.497" transform="rotate(-138.629 322.661 -21.7113)" fill="black"/></g><g filter="url(#filter11_f-pl)"><circle cx="315.07" cy="-8.69959" r="29.497" transform="rotate(-138.629 315.07 -8.69959)" fill="black"/></g><g filter="url(#filter12_f-pl)"><circle cx="330.833" cy="-41.7732" r="29.497" transform="rotate(-138.629 330.833 -41.7732)" fill="black"/></g><g filter="url(#filter13_f-pl)"><circle cx="292.984" cy="-28.1516" r="29.497" transform="rotate(-138.629 292.984 -28.1516)" fill="#124DF1"/></g><g filter="url(#filter14_f-pl)"><circle cx="299.563" cy="-31.4158" r="29.497" transform="rotate(-138.629 299.563 -31.4158)" fill="#124DF1"/></g></g></g></g><defs><filter id="filter0_f-pl" x="-115.056" y="-138.077" width="198.597" height="198.597" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="29.8233" result="effect1_foregroundBlur-pl"/></filter><filter id="filter1_f-pl" x="-118.959" y="-157.948" width="198.597" height="198.597" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="29.8233" result="effect1_foregroundBlur-pl"/></filter><filter id="filter2_f-pl" x="-105.476" y="-110.579" width="198.597" height="198.597" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="29.8233" result="effect1_foregroundBlur-pl"/></filter><filter id="filter3_f-pl" x="-79.3959" y="-157.948" width="198.597" height="198.597" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="29.8233" result="effect1_foregroundBlur-pl"/></filter><filter id="filter4_f-pl" x="-79.4431" y="-152.2" width="198.597" height="198.597" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="29.8233" result="effect1_foregroundBlur-pl"/></filter><filter id="filter5_f-pl" x="89.8391" y="50.8233" width="185.193" height="185.193" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="28.3919" result="effect1_foregroundBlur-pl"/></filter><filter id="filter6_f-pl" x="75.3197" y="61.9378" width="185.193" height="185.193" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="28.3919" result="effect1_foregroundBlur-pl"/></filter><filter id="filter7_f-pl" x="108.26" y="32.0595" width="185.193" height="185.193" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="28.3919" result="effect1_foregroundBlur-pl"/></filter><filter id="filter8_f-pl" x="59.4797" y="29.9165" width="185.193" height="185.193" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="28.3919" result="effect1_foregroundBlur-pl"/></filter><filter id="filter9_f-pl" x="68.3714" y="29.2821" width="185.193" height="185.193" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="28.3919" result="effect1_foregroundBlur-pl"/></filter><filter id="filter10_f-pl" x="231.784" y="-112.588" width="181.754" height="181.754" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="30.6898" result="effect1_foregroundBlur-pl"/></filter><filter id="filter11_f-pl" x="224.193" y="-99.5765" width="181.754" height="181.754" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="30.6898" result="effect1_foregroundBlur-pl"/></filter><filter id="filter12_f-pl" x="239.956" y="-132.65" width="181.754" height="181.754" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="30.6898" result="effect1_foregroundBlur-pl"/></filter><filter id="filter13_f-pl" x="202.107" y="-119.029" width="181.754" height="181.754" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="30.6898" result="effect1_foregroundBlur-pl"/></filter><filter id="filter14_f-pl" x="208.686" y="-122.293" width="181.754" height="181.754" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="30.6898" result="effect1_foregroundBlur-pl"/></filter></defs>' +
        '</svg>' +
      '</div>';
  };

  var runPreloader = function () {
    var el = document.querySelector('[data-preloader]');
    if (!el || el.hasAttribute('data-running')) return;
    el.setAttribute('data-running', '');
    var root = document.documentElement;
    var start = Date.now();
    var done = false;

    var finish = function () {
      if (done) return;
      done = true;
      try { window.sessionStorage.setItem(PRELOADER_KEY, '1'); } catch (e) { /* private mode */ }
      el.classList.add('is-leaving');
      root.classList.remove('is-preloading');
      document.dispatchEvent(new CustomEvent('aries:intro'));
      var remove = function () { if (el.parentNode) el.parentNode.removeChild(el); };
      el.addEventListener('transitionend', remove, { once: true });
      setTimeout(remove, 1600);
    };

    var onLoad = function () {
      setTimeout(finish, Math.max(0, PRELOADER_MIN - (Date.now() - start)));
    };
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });
    setTimeout(finish, PRELOADER_MAX);
  };

  var REGISTRY = {
    preloader: preloader,
    'contact-form': contactForm,
    'logo-art': logoArt,
    'cta-phone-art': ctaPhoneArt,
    header: header,
    footer: footer,
    'what-we-do': whatWeDo,
  };

  var mount = function () {
    var nodes = document.querySelectorAll('[data-component]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var render = REGISTRY[el.getAttribute('data-component')];
      if (!render) continue;
      var tpl = document.createElement('template');
      tpl.innerHTML = render(el);
      el.replaceWith(tpl.content);
    }
    runPreloader();
  };

  window.AriesUI = { mount: mount, pages: PAGES, contactHref: CONTACT_HREF };
})();
