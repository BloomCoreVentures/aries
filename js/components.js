/* ==========================================================================
   ARIES GROUP — shared markup components (no build step)

   Usage in a page:
     <div data-component="header" data-active="services"></div>
     <script>AriesUI.mount()</script>

   mount() replaces every not-yet-mounted placeholder above the call
   synchronously, so the markup exists before first paint and before
   main.js / page scripts run.

   Components: header (+ mobile menu), footer, what-we-do, cta-phone-art, logo-art, contact-form.
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
              // TODO: bring back when the pages exist
              // '<div class="footer__legal"><a href="terms.html">Terms of use</a><a href="privacy.html">Privacy Policy</a></div>' +
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
        '<img class="cta-phone__phone" src="assets/img/talk-phone.webp" width="1031" height="509" alt="" loading="lazy" data-parallax="-5">' +
        '<img class="cta-phone__glow cta-phone__glow--2" src="assets/icons/talk-glow-2.svg" width="1095" height="331" alt="" loading="lazy">' +
        '<img class="cta-phone__chat" src="assets/img/talk-chat.webp" width="280" height="264" alt="" loading="lazy" data-parallax="-18">' +
        '<img class="cta-phone__envelope" src="assets/img/talk-envelope.webp" width="269" height="192" alt="" loading="lazy" data-parallax="-12">' +
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

  var REGISTRY = {
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
  };

  window.AriesUI = { mount: mount, pages: PAGES, contactHref: CONTACT_HREF };
})();
