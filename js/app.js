/* AYN CASA - every bit of site behaviour lives in this file.
 * No framework, no build step, no API, no server: pure browser JavaScript.
 * Content lives in js/data.js; this file only renders and wires it up.
 */
(function () {
  'use strict';

  var D = window.AYN.data;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ------------------------------ helpers ------------------------------ */
  function money(n) {
    try {
      return new Intl.NumberFormat(D.brand.locale, { style: 'currency', currency: D.brand.currency, maximumFractionDigits: 0 }).format(n);
    } catch (e) { return D.brand.currency + ' ' + n; }
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function hash(str) {
    var h = 2166136261, i;
    str = String(str);
    for (i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Math.abs(h);
  }

  function fill(tpl, values) {
    return String(tpl).replace(/\{(\w+)\}/g, function (m, key) {
      return values[key] === undefined || values[key] === null ? '' : values[key];
    });
  }

  function debounce(fn, wait) {
    var timer = null;
    return function () {
      var args = arguments, self = this;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { fn.apply(self, args); }, wait || 180);
    };
  }

  /* --------------------- placeholder artwork (offline) ------------------
   * No image files are required: every visual is generated as an SVG data URI
   * so the site also works from file:// with no internet. Drop real photos in
   * later by setting data-image="assets/hero.jpg" on the hero, or "images"
   * arrays on any product / project in js/data.js.
   */
  var PALETTE = [
    ['#241f1b', '#6d5941'], ['#2c2a26', '#8c8477'], ['#1f2429', '#55636f'],
    ['#2b2320', '#7d5f4c'], ['#22261f', '#5f6b56'], ['#2a2330', '#6a5c78']
  ];

  function art(label, seed, w, h) {
    w = w || 800; h = h || 1000;
    var p = PALETTE[hash(seed) % PALETTE.length];
    var tilt = (hash(seed + 'tilt') % 40) - 20;
    var words = String(label || 'AYN CASA').toUpperCase().split(/\s+/).slice(0, 3);
    var text = words.map(function (w0, i) {
      return '<text x="56" y="' + (h - 96 - (words.length - 1 - i) * 44) + '" fill="#f4efe6" font-family="Georgia, serif" font-size="32" letter-spacing="6">' + esc(w0) + '</text>';
    }).join('');
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + p[0] + '"/><stop offset="1" stop-color="' + p[1] + '"/></linearGradient></defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#g)"/>' +
      '<g transform="rotate(' + tilt + ' ' + (w / 2) + ' ' + (h / 2) + ')" opacity="0.15">' +
      '<rect x="-300" y="' + Math.round(h / 3) + '" width="' + (w + 600) + '" height="120" fill="#ffffff"/>' +
      '<rect x="-300" y="' + Math.round(h / 3) + 168 + '" width="' + (w + 600) + '" height="42" fill="#ffffff"/>' +
      '</g>' + text + '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function productImages(p) {
    if (p.images && p.images.length) { return p.images; }
    return [art(p.name, p.slug + '-a'), art(p.name + ' detail', p.slug + '-b'), art(p.name + ' in use', p.slug + '-c', 1000, 800)];
  }

  function projectImages(pr) {
    if (pr.images && pr.images.length) { return pr.images; }
    return [
      art(pr.title, pr.slug + '-1', 1400, 900),
      art('Living room', pr.slug + '-2', 1400, 900),
      art('Kitchen', pr.slug + '-3', 1400, 900),
      art('Bedroom', pr.slug + '-4', 1400, 900),
      art(pr.city, pr.slug + '-5', 1400, 900)
    ];
  }

  function fillArt(el) {
    if (!el) { return; }
    var kind = el.getAttribute('data-art') || 'art';
    var image = el.getAttribute('data-image');
    var video = el.getAttribute('data-video');
    if (video) {
      var v = document.createElement('video');
      v.muted = true; v.loop = true; v.autoplay = true;
      v.setAttribute('playsinline', '');
      v.setAttribute('poster', image || art(kind, kind + '-poster', 1600, 900));
      var src = document.createElement('source');
      src.setAttribute('src', video); src.setAttribute('type', 'video/mp4');
      v.appendChild(src);
      el.appendChild(v);
      return;
    }
    var img = document.createElement('img');
    img.setAttribute('src', image || art(kind, kind + '-img', 1600, 900));
    img.setAttribute('alt', '');
    img.setAttribute('loading', 'lazy');
    el.appendChild(img);
  }
  /* --------------------------- inquiry state ---------------------------
   * The "cart" of this site is an inquiry list. It lives in localStorage, so
   * it survives a refresh and needs no login and no server.
   */
  var KEYS = {
    inquiry: 'ayn.inquiry.v1',
    consent: 'ayn.consent.v1',
    lastRequest: 'ayn.lastRequest.v1'
  };

  function readJSON(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) { return fallback; }
  }

  function writeJSON(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
  }

  var inquiry = readJSON(KEYS.inquiry, []);
  if (!Array.isArray(inquiry)) { inquiry = []; }

  function saveInquiry() { writeJSON(KEYS.inquiry, inquiry); }

  function findProduct(slug) {
    for (var i = 0; i < D.products.length; i++) {
      if (D.products[i].slug === slug) { return D.products[i]; }
    }
    return null;
  }

  function lineIndex(slug, colour) {
    for (var i = 0; i < inquiry.length; i++) {
      if (inquiry[i].slug === slug && inquiry[i].colour === colour) { return i; }
    }
    return -1;
  }

  function inquiryTotals() {
    var lines = 0, pieces = 0, value = 0, allPriced = true;
    inquiry.forEach(function (line) {
      var p = findProduct(line.slug);
      if (!p) { return; }
      lines += 1;
      pieces += line.qty;
      if (typeof p.price === 'number') { value += p.price * line.qty; } else { allPriced = false; }
    });
    return { lines: lines, pieces: pieces, value: value, allPriced: allPriced && lines > 0 };
  }

  function addToInquiry(slug, colour, qty) {
    var p = findProduct(slug);
    if (!p) { return; }
    qty = Math.max(1, parseInt(qty, 10) || 1);
    colour = colour || (p.colours && p.colours[0]) || '';
    var i = lineIndex(slug, colour);
    if (i > -1) { inquiry[i].qty += qty; }
    else { inquiry.push({ slug: slug, colour: colour, qty: qty }); }
    saveInquiry();
    renderInquiry();
    syncBadges();
    showFloatBar();
    toast(p.name + ' added to your inquiry');
  }

  function setLineQty(slug, colour, qty) {
    var i = lineIndex(slug, colour);
    if (i < 0) { return; }
    qty = parseInt(qty, 10);
    if (!qty || qty < 1) { inquiry.splice(i, 1); }
    else { inquiry[i].qty = Math.min(99, qty); }
    saveInquiry();
    renderInquiry();
    syncBadges();
    showFloatBar();
  }

  function removeLine(slug, colour) {
    var i = lineIndex(slug, colour);
    if (i < 0) { return; }
    var p = findProduct(slug);
    inquiry.splice(i, 1);
    saveInquiry();
    renderInquiry();
    syncBadges();
    showFloatBar();
    toast((p ? p.name : 'Item') + ' removed');
  }

  function clearInquiry() {
    inquiry = [];
    saveInquiry();
    renderInquiry();
    syncBadges();
    showFloatBar();
    toast('Inquiry list cleared');
  }

  /* ------------------------------ feedback ------------------------------ */
  function toast(message) {
    var host = $('[data-toasts]');
    if (!host) { return; }
    var el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.textContent = message;
    host.appendChild(el);
    window.setTimeout(function () { el.remove(); }, 3600);
  }

  function syncBadges() {
    var totals = inquiryTotals();
    $$('[data-count="inquiry"]').forEach(function (el) {
      el.textContent = String(totals.pieces);
      el.setAttribute('data-empty', totals.pieces === 0 ? 'true' : 'false');
    });
    $$('[data-inquiry-clear]').forEach(function (el) { el.hidden = totals.lines === 0; });
  }

  function showFloatBar() {
    var bar = $('[data-float-bar]');
    if (!bar) { return; }
    var totals = inquiryTotals();
    bar.setAttribute('data-show', totals.pieces > 0 ? 'true' : 'false');
    var label = $('[data-float-label]', bar);
    if (label) {
      label.textContent = totals.pieces + (totals.pieces === 1 ? ' piece' : ' pieces') + ' in your inquiry';
    }
  }
  /* ------------------------------ lightbox ------------------------------ */
  var lb = { el: null, img: null, list: [], index: 0 };

  function lightboxOpen(list, index) {
    if (!lb.el || !list || !list.length) { return; }
    lb.list = list;
    lb.index = index || 0;
    lb.img.setAttribute('src', lb.list[lb.index]);
    lb.el.setAttribute('data-open', 'true');
    document.body.style.overflow = 'hidden';
    var close = $('[data-lightbox-close]', lb.el);
    if (close) { close.focus(); }
  }

  function lightboxClose() {
    if (!lb.el) { return; }
    lb.el.setAttribute('data-open', 'false');
    document.body.style.overflow = '';
  }

  function lightboxGo(step) {
    if (!lb.list.length) { return; }
    lb.index = (lb.index + step + lb.list.length) % lb.list.length;
    lb.img.setAttribute('src', lb.list[lb.index]);
  }

  function lightboxInit() {
    lb.el = $('[data-lightbox]');
    if (!lb.el) { return; }
    lb.img = $('[data-lightbox-img]', lb.el);
    $('[data-lightbox-close]', lb.el).addEventListener('click', lightboxClose);
    $('[data-lightbox-prev]', lb.el).addEventListener('click', function () { lightboxGo(-1); });
    $('[data-lightbox-next]', lb.el).addEventListener('click', function () { lightboxGo(1); });
    lb.el.addEventListener('click', function (event) { if (event.target === lb.el) { lightboxClose(); } });
    document.addEventListener('keydown', function (event) {
      if (lb.el.getAttribute('data-open') !== 'true') { return; }
      if (event.key === 'Escape') { lightboxClose(); }
      if (event.key === 'ArrowLeft') { lightboxGo(-1); }
      if (event.key === 'ArrowRight') { lightboxGo(1); }
    });
  }

  /* --------------------------- shared widgets --------------------------- */
  function revealInit() {
    var items = $$('.reveal');
    if (!items.length) { return; }
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  function consentInit() {
    var banner = $('[data-cookie]');
    if (!banner) { return; }
    if (readJSON(KEYS.consent, null) !== 'ok') { banner.hidden = false; }
    $$('[data-cookie-accept]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        writeJSON(KEYS.consent, 'ok');
        banner.hidden = true;
      });
    });
  }

  function headerInit() {
    var burger = $('[data-burger]');
    var nav = $('#nav');
    if (burger && nav) {
      burger.addEventListener('click', function () {
        var open = nav.getAttribute('data-open') === 'true';
        nav.setAttribute('data-open', open ? 'false' : 'true');
        burger.setAttribute('aria-expanded', open ? 'false' : 'true');
      });
    }
    /* highlight the section you are reading */
    var links = $$('.nav a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) { return; }
    var map = {};
    links.forEach(function (link) { map[link.getAttribute('href').slice(1)] = link; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = map[entry.target.id];
        if (!link || !entry.isIntersecting) { return; }
        links.forEach(function (other) { other.removeAttribute('aria-current'); });
        link.setAttribute('aria-current', 'page');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) { io.observe(section); }
    });
  }
  function brandTransitionInit() {
    var heroBrand = $('.hero-brand');
    var headerBrand = $('.header-brand');
    if (!heroBrand || !headerBrand) { return; }
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function update() {
      var active = window.scrollY > 72;
      document.body.classList.toggle('brand-scrolled', active);
    }
    if (reducedMotion) {
      document.body.classList.add('brand-scrolled');
      return;
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }
  function instagramInit() {
    var track = $('[data-instagram-track]');
    if (!track) { return; }
    var step = function () {
      var tile = $('.instagram-tile', track);
      return tile ? tile.getBoundingClientRect().width + 12 : track.clientWidth;
    };
    var move = function (direction) {
      track.scrollBy({ left: direction * step(), behavior: 'smooth' });
    };
    var previous = $('[data-instagram-prev]');
    var next = $('[data-instagram-next]');
    if (previous) { previous.addEventListener('click', function () { move(-1); }); }
    if (next) { next.addEventListener('click', function () { move(1); }); }
  }
  function reviewsInit() {
    var track = $('[data-testimonials]');
    if (!track) { return; }
    var move = function (direction) {
      var card = $('.testimonial', track);
      if (card) { track.scrollBy({ left: direction * (card.getBoundingClientRect().width + 12), behavior: 'smooth' }); }
    };
    var previous = $('[data-review-prev]');
    var next = $('[data-review-next]');
    if (previous) { previous.addEventListener('click', function () { move(-1); }); }
    if (next) { next.addEventListener('click', function () { move(1); }); }
  }
  function heroInit() {
    var host = $('[data-hero-slides]');
    if (!host) { return; }
    var slides = $$('.hero-slide', host);
    var dots = $('[data-hero-dots]');
    var index = 0;
    var timer = null;
    var paused = false;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) { slide.classList.toggle('is-active', slideIndex === index); });
      if (dots) {
        $$('button', dots).forEach(function (dot, dotIndex) { dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false'); });
      }
    }
    function schedule() {
      window.clearInterval(timer);
      var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!paused && !reducedMotion) {
        timer = window.setInterval(function () { show(index + 1); }, 6000);
      }
    }
    if (dots) {
      slides.forEach(function (_, slideIndex) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', 'Show hero image ' + (slideIndex + 1));
        dot.addEventListener('click', function () { show(slideIndex); schedule(); });
        dots.appendChild(dot);
      });
    }
    $('[data-hero-prev]').addEventListener('click', function () { show(index - 1); schedule(); });
    $('[data-hero-next]').addEventListener('click', function () { show(index + 1); schedule(); });
    host.parentElement.addEventListener('mouseenter', function () { paused = true; schedule(); });
    host.parentElement.addEventListener('mouseleave', function () { paused = false; schedule(); });
    host.parentElement.addEventListener('focusin', function () { paused = true; schedule(); });
    host.parentElement.addEventListener('focusout', function (event) { if (!host.parentElement.contains(event.relatedTarget)) { paused = false; schedule(); } });
    show(0);
    schedule();
  }
  /* ------------------------- static content render ----------------------- */
  function applyBrand() {
    var b = D.brand;
    $$('[data-brand-blurb]').forEach(function (el) { el.textContent = b.blurb; });
    $$('[data-hours]').forEach(function (el) { el.textContent = b.hours; });
    $$('[data-service-area]').forEach(function (el) { el.textContent = b.serviceArea; });
    $$('[data-phone-text]').forEach(function (el) { el.textContent = b.phoneDisplay; });
    $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
    $$('[data-phone-link]').forEach(function (el) { el.setAttribute('href', 'tel:+91' + b.phone); });
    $$('[data-wa-link]').forEach(function (el) {
      var base = 'https://wa.me/' + b.whatsapp;
      if (el.hasAttribute('data-wa-text') && el.getAttribute('data-wa-text')) {
        base += '?text=' + encodeURIComponent(el.getAttribute('data-wa-text'));
      }
      el.setAttribute('href', base);
    });
    document.title = b.name + ' | ' + b.tagline;
  }

  function renderMarquee() {
    var track = $('[data-marquee]');
    if (!track) { return; }
    var items = D.highlights.map(function (h) { return '<span>' + esc(h) + '</span>'; }).join('');
    track.innerHTML = items + items; /* duplicated so the CSS loop is seamless */
  }

  function renderStats() {
    var host = $('[data-stats]');
    if (!host) { return; }
    host.innerHTML = D.stats.map(function (s) {
      return '<div class="stat reveal"><b>' + esc(s.value) + '</b><span>' + esc(s.label) + '</span></div>';
    }).join('');
  }

  function renderServices() {
    var host = $('[data-services]');
    if (!host) { return; }
    host.innerHTML = D.services.map(function (s, i) {
      return '<article class="service reveal">' +
        (s.image ? '<span class="service__bg" style="background-image:url(\'' + esc(s.image) + '\')" aria-hidden="true"></span>' : '') +
        '<span class="service__no">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</span>' +
        '<h3>' + esc(s.title) + '</h3>' +
        '<p class="hint" style="margin:0">' + esc(s.copy) + '</p>' +
        '<ul>' + s.points.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
        '<a class="btn--link" style="margin-top:auto" href="#inquiry">Ask about this</a>' +
        '</article>';
    }).join('');
  }

  var lbData = {};

  /* gallery images kept as a keyed list so the lightbox can walk through them.
   * `studio-gallery` is the key wired to the studio tiles below the marquee. */
  lbData['studio-gallery'] = [
    'assets/studio-living.jpg',
    'assets/studio-kitchen.jpg',
    'assets/studio-bedroom.jpg',
    'assets/studio-dining.jpg'
  ];

  function renderArtGallery(selector, items, opts) {
    var host = $(selector);
    if (!host) { return; }
    opts = opts || {};
    var key = opts.key || ('gallery-' + esc(selector.replace(/[^a-z0-9]/g, '')));
    var meta = opts.meta || '';
    host.innerHTML = items.map(function (item, i) {
      var src = item.src || art(item.label, 'studio-' + i, 900, 1100);
      var title = esc(item.label || '');
      var metaHtml = meta ? '<div class="gallery__meta">' + esc(meta) + '</div>' : '';
      return '<div class="reveal gallery__tile" data-lb="' + key + '" data-lb-index="' + i + '">' +
        '<img src="' + src + '" alt="' + esc(item.label || '') + '" loading="lazy">' +
        metaHtml +
        (title ? '<div class="gallery__title">' + title + '</div>' : '') +
        '</div>';
    }).join('');
    if (!lbData[key]) { lbData[key] = items.map(function (it) { return it.src || art(it.label || '', 'g', 900, 1100); }); }
  }

  /* ------------------------------ projects ------------------------------ */
  var projectFilter = 'all';

  function projectCard(pr) {
    var images = projectImages(pr);
    lbData['project:' + pr.slug] = images;
    var thumbs = images.map(function (src, i) {
      return '<button type="button" data-lb="project:' + esc(pr.slug) + '" data-lb-index="' + i + '" aria-label="Open image ' + (i + 1) + '"><img src="' + src + '" alt=""></button>';
    }).join('');
    return '<article class="reveal">' +
      '<div class="card" style="height:100%">' +
        '<button type="button" class="card__media" style="border:0;padding:0;background:none;cursor:zoom-in" data-lb="project:' + esc(pr.slug) + '" data-lb-index="0" aria-label="Open ' + esc(pr.title) + ' gallery">' +
          '<img src="' + images[0] + '" alt="' + esc(pr.title) + '" loading="lazy">' +
        '</button>' +
        '<div class="card__body">' +
          '<span class="card__line">' + esc(pr.city) + ' - ' + esc(pr.year) + '</span>' +
          '<h3 class="card__name">' + esc(pr.title) + '</h3>' +
          '<p class="hint" style="margin:0">' + esc(pr.scope) + '</p>' +
          '<p style="margin:0">' + esc(pr.description) + '</p>' +
          '<div class="thumbs" style="margin-top:auto;padding-top:12px">' + thumbs + '</div>' +
        '</div>' +
      '</div></article>';
  }

  function renderProjects() {
    var host = $('[data-projects]');
    if (!host) { return; }
    var list = D.projects.filter(function (pr) { return projectFilter === 'all' || pr.city === projectFilter; });
    host.innerHTML = list.map(projectCard).join('');
    var count = $('[data-project-count]');
    if (count) {
      count.textContent = list.length + (list.length === 1 ? ' project' : ' projects') +
        (projectFilter === 'all' ? '' : ' in ' + projectFilter);
    }
    revealInit();
  }

  function renderProjectFilter() {
    var host = $('[data-project-filter]');
    if (!host) { return; }
    var cities = ['all'];
    D.projects.forEach(function (pr) { if (cities.indexOf(pr.city) === -1) { cities.push(pr.city); } });
    host.innerHTML = cities.map(function (city) {
      return '<button class="chip" type="button" data-city="' + esc(city) + '" aria-pressed="' + (city === projectFilter) + '">' +
        (city === 'all' ? 'All projects' : esc(city)) + '</button>';
    }).join('');
  }
  /* ----------------------------- collection ----------------------------- */
  var col = { cat: 'all', q: '', sort: 'featured', shown: 8 };
  var PAGE_SIZE = 8;

  function productLink(slug) {
    var url = new URL(window.location.href);
    url.searchParams.set('product', slug);
    url.hash = 'collection';
    return url.href;
  }

  function openShareMenu(product, shareUrl) {
    var menu = $('[data-share-menu]');
    var links = $('[data-share-links]', menu);
    if (!menu || !links) { copyText(shareUrl); return; }
    var text = 'Take a look at ' + product.name + ' from ' + D.brand.name + '. ' + shareUrl;
    links.innerHTML =
      '<a class="share-choice" href="https://wa.me/?text=' + encodeURIComponent(text) + '" target="_blank" rel="noopener"><svg class="share-menu__icon share-menu__icon--wa" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.1 4.9A9.9 9.9 0 0 0 3.5 16.8L2 22l5.3-1.5A9.9 9.9 0 1 0 19.1 4.9Zm-7.2 15.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.9.9-3-.2-.3a8.2 8.2 0 1 1 6.9 3.8Zm4.5-6.1c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1s-.6.7-.7.9c-.1.1-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.5 7.5 0 0 1-1.4-1.7c-.1-.2 0-.3.1-.4l.4-.5.2-.4c.1-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.5.5.2.9.4 1.2.5.5.2 1 .2 1.3.1.4-.1 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1Z"/></svg><span>WhatsApp</span></a>' +
      '<a class="share-choice" href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl) + '" target="_blank" rel="noopener"><svg class="share-menu__icon share-menu__icon--fb" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 21v-8h2.7l.4-3H14V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1V10H8.2v3H11v8h3Z"/></svg><span>Facebook</span></a>' +
      '<a class="share-choice" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '" target="_blank" rel="noopener"><svg class="share-menu__icon share-menu__icon--x" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h3.7l3.7 5.1L16.7 4H19l-5.6 6.3L19.5 20h-3.7l-4-5.5L7.2 20H5l5.7-6.5L5 4Zm3.1 1.8H7.1l8.8 12.4h1l-8.8-12.4Z"/></svg><span>X</span></a>' +
      '<a class="share-choice" href="https://t.me/share/url?url=' + encodeURIComponent(shareUrl) + '&text=' + encodeURIComponent(text) + '" target="_blank" rel="noopener"><svg class="share-menu__icon share-menu__icon--telegram" viewBox="0 0 24 24" aria-hidden="true"><path d="m21.5 3.7-3.1 16.1c-.2 1.1-.8 1.4-1.7.9l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.2 13.9l-4.7-1.5c-1-.3-1-1 .2-1.5L20 3.1c.8-.3 1.7.2 1.5.6Z"/></svg><span>Telegram</span></a>' +
      '<a class="share-choice" href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(shareUrl) + '" target="_blank" rel="noopener"><svg class="share-menu__icon share-menu__icon--linkedin" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 8.2H2.1V21h3.1V8.2ZM3.6 3A1.8 1.8 0 1 0 3.6 6.6 1.8 1.8 0 0 0 3.6 3ZM21 13.7c0-3.8-2-5.8-4.8-5.8-2.2 0-3.2 1.2-3.8 2v-1.7H9.3V21h3.1v-6.3c0-1.7.3-3.3 2.4-3.3 2 0 2 1.9 2 3.4V21H20v-7.3Z"/></svg><span>LinkedIn</span></a>' +
      '<a class="share-choice share-choice--instagram" href="https://www.instagram.com/ayn_casa/" data-share-instagram target="_blank" rel="noopener"><svg class="share-menu__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 2.5h9.6A4.7 4.7 0 0 1 21.5 7.2v9.6a4.7 4.7 0 0 1-4.7 4.7H7.2a4.7 4.7 0 0 1-4.7-4.7V7.2a4.7 4.7 0 0 1 4.7-4.7Zm0 1.8a2.9 2.9 0 0 0-2.9 2.9v9.6a2.9 2.9 0 0 0 2.9 2.9h9.6a2.9 2.9 0 0 0 2.9-2.9V7.2a2.9 2.9 0 0 0-2.9-2.9H7.2Zm4.8 3.1A4.6 4.6 0 1 1 12 16.6a4.6 4.6 0 0 1 0-9.2Zm0 1.8a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Zm4.8-2.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"/></svg><span>Instagram</span></a>' +
      '<a class="share-choice" href="mailto:?subject=' + encodeURIComponent(product.name + ' - ' + D.brand.name) + '&body=' + encodeURIComponent(text) + '"><svg class="share-menu__icon share-menu__icon--email" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3V5Zm1.5 1.5v.3l7.5 5.1 7.5-5.1v-.3h-15Zm15 2.1-7.5 5.1-7.5-5.1v8.9h15V8.6Z"/></svg><span>Email</span></a>' +
      '<button class="share-choice" type="button" data-share-copy><svg class="share-menu__icon share-menu__icon--copy" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8h11v12H8V8Zm-3 8H4V4h12v1.5H5V16Z"/></svg><span>Copy link</span></button>';
    menu.hidden = false;
    var close = $('[data-share-close]', menu);
    if (close) {
      close.onclick = function () { menu.hidden = true; };
      close.focus();
    }
    menu.onclick = function (event) { if (event.target === menu) { menu.hidden = true; } };
    $('[data-share-copy]', menu).addEventListener('click', function () { copyText(shareUrl); menu.hidden = true; });
    var instagram = $('[data-share-instagram]', menu);
    if (instagram) { instagram.addEventListener('click', function () { copyText(shareUrl); }); }
  }

  function productCard(p) {
    var images = productImages(p);
    lbData['product:' + p.slug] = images;
    var price = typeof p.price === 'number' ? money(p.price) : 'Price on request';
    var colours = (p.colours && p.colours.length)
      ? '<select class="mini" data-colour-for="' + esc(p.slug) + '" aria-label="Finish for ' + esc(p.name) + '">' +
          p.colours.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') +
        '</select>'
      : '';
    return '<article class="card reveal">' +
      '<div class="card__media">' +
        '<img src="' + images[0] + '" alt="' + esc(p.name) + '" loading="lazy">' +
        (p.badge ? '<span class="badge card__flag">' + esc(p.badge) + '</span>' : '') +
      '</div>' +
      '<div class="card__body">' +
        '<span class="card__line">' + esc(p.line) + '</span>' +
        '<h3 class="card__name">' + esc(p.name) + '</h3>' +
        '<span class="card__price">' + price + '<small>' + esc(p.lead || '') + '</small></span>' +
        '<p class="hint" style="margin:0">' + esc(p.description) + '</p>' +
        '<div class="card__foot">' + colours +
          '<button class="btn btn--sm" type="button" data-add="' + esc(p.slug) + '">Add to inquiry</button>' +
          '<button class="share-product" type="button" data-share-product="' + esc(p.slug) + '" aria-label="Share ' + esc(p.name) + '" title="Share product">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 16.1c-.8 0-1.5.3-2.1.8L8.9 12.8c.1-.3.1-.5.1-.8s0-.5-.1-.8l6.9-4.1c.6.5 1.3.8 2.1.8a3 3 0 1 0-2.9-3.7L8.1 8.3A3 3 0 1 0 8.1 15l6.9 4.1A3 3 0 1 0 18 16.1Z"/></svg>' +
          '</button>' +
          '<button class="btn btn--link" type="button" data-view-product="' + esc(p.slug) + '">Photos and details</button>' +
        '</div>' +
      '</div></article>';
  }

  function filteredProducts() {
    var q = col.q.trim().toLowerCase();
    var list = D.products.filter(function (p) {
      if (col.cat !== 'all' && p.category !== col.cat) { return false; }
      if (!q) { return true; }
      var hay = [p.name, p.line, p.category, p.material, p.description, (p.colours || []).join(' ')].join(' ').toLowerCase();
      return hay.indexOf(q) > -1;
    });
    list.sort(function (a, b) {
      if (col.sort === 'name-asc') { return a.name.localeCompare(b.name); }
      if (col.sort === 'price-asc' || col.sort === 'price-desc') {
        var pa = typeof a.price === 'number' ? a.price : Infinity;
        var pb = typeof b.price === 'number' ? b.price : Infinity;
        if (pa === pb) { return a.name.localeCompare(b.name); }
        return col.sort === 'price-asc' ? pa - pb : pb - pa;
      }
      return 0; /* featured keeps the order in js/data.js */
    });
    return list;
  }

  function renderCollection() {
    var host = $('[data-products]');
    if (!host) { return; }
    var list = filteredProducts();
    var slice = list.slice(0, col.shown);
    host.innerHTML = slice.length
      ? slice.map(productCard).join('')
      : '<div class="empty" style="grid-column:1/-1"><p>Nothing matches that search.</p><button class="btn btn--ghost btn--sm" type="button" data-c-reset>Clear filters</button></div>';

    var count = $('[data-c-count]');
    if (count) {
      count.textContent = 'Showing ' + slice.length + ' of ' + list.length + ' pieces';
    }
    var more = $('[data-c-more]');
    if (more) { more.hidden = list.length <= col.shown; }
    revealInit();
  }

  function renderCollectionChips() {
    var host = $('[data-c-chips]');
    if (!host) { return; }
    var cats = [{ id: 'all', name: 'Everything' }].concat(D.categories);
    host.innerHTML = cats.map(function (c) {
      return '<button class="chip" type="button" data-cat="' + esc(c.id) + '" aria-pressed="' + (c.id === col.cat) + '">' + esc(c.name) + '</button>';
    }).join('');
  }

  function renderTestimonials() {
    var host = $('[data-testimonials]');
    if (!host) { return; }
    host.innerHTML = D.testimonials.map(function (t) {
      return '<blockquote class="testimonial reveal" style="margin:0">' +
        '<p>&ldquo;' + esc(t.quote) + '&rdquo;</p>' +
        '<cite>' + esc(t.name) + ' - ' + esc(t.place) + '</cite>' +
        '</blockquote>';
    }).join('');
  }

  function renderFaqs() {
    var host = $('[data-faqs]');
    if (!host) { return; }
    host.innerHTML = D.faqs.map(function (f, i) {
      return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(f.q) + '</summary>' +
        '<div class="acc-body">' + esc(f.a) + '</div></details>';
    }).join('');
  }

  function renderCitySelects() {
    $$('[data-city-select]').forEach(function (select) {
      var current = select.value;
      select.innerHTML = '<option value="">Select your city</option>' + D.cities.map(function (city) {
        return '<option' + (city === current ? ' selected' : '') + '>' + esc(city) + '</option>';
      }).join('');
    });
  }
  /* ------------------------------ inquiry ------------------------------- */
  function renderInquiry() {
    var host = $('[data-inquiry-list]');
    var totals = inquiryTotals();
    var label = $('[data-inquiry-total]');
    if (label) {
      label.textContent = totals.lines
        ? '- ' + totals.lines + (totals.lines === 1 ? ' item' : ' items') + ', ' + totals.pieces + ' pieces'
        : '';
    }
    if (!host) { return; }
    if (!inquiry.length) {
      host.innerHTML = '<div class="inquiry-empty">' +
        '<p style="margin:0">Your list is empty.</p>' +
        '<p class="hint" style="margin:6px 0 0">Add pieces from the collection, or simply fill the form and tell us what you need.</p>' +
        '</div>';
      return;
    }
    host.innerHTML = inquiry.map(function (line) {
      var p = findProduct(line.slug);
      if (!p) { return ''; }
      var price = typeof p.price === 'number' ? money(p.price) : 'Price on request';
      var link = productLink(p.slug);
      var wa = 'https://wa.me/' + D.brand.whatsapp + '?text=' + encodeURIComponent(
        'Hi ' + D.brand.name + ', please share the price for ' + p.name + (line.colour ? ' in ' + line.colour : '') + '.\nProduct link: ' + link
      );
      return '<div class="inquiry-item">' +
        '<img src="' + productImages(p)[0] + '" alt="">' +
        '<div>' +
          '<h4>' + esc(p.name) + '</h4>' +
          '<div class="meta">' + esc(p.line) + ' - ' + esc(line.colour || '-') + ' - ' + price + '</div>' +
          '<div class="row">' +
            '<span class="qty sm">' +
              '<button type="button" data-line-dec="' + esc(line.slug) + '" data-line-colour="' + esc(line.colour) + '" aria-label="Decrease quantity of ' + esc(p.name) + '">&minus;</button>' +
              '<input type="text" inputmode="numeric" value="' + line.qty + '" data-line-qty="' + esc(line.slug) + '" data-line-colour="' + esc(line.colour) + '" aria-label="Quantity of ' + esc(p.name) + '">' +
              '<button type="button" data-line-inc="' + esc(line.slug) + '" data-line-colour="' + esc(line.colour) + '" aria-label="Increase quantity of ' + esc(p.name) + '">+</button>' +
            '</span>' +
            '<button class="btn--link" type="button" data-line-remove="' + esc(line.slug) + '" data-line-colour="' + esc(line.colour) + '">Remove</button>' +
          '</div>' +
        '</div>' +
        '<div class="item-actions"><a class="ask-price-link" href="' + wa + '" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.1 4.9A9.9 9.9 0 0 0 3.5 16.8L2 22l5.3-1.5A9.9 9.9 0 1 0 19.1 4.9Zm-7.2 15.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3.1.9.9-3-.2-.3a8.2 8.2 0 1 1 6.9 3.8Zm4.5-6.1c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.5.1s-.6.7-.7.9c-.1.1-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.5 7.5 0 0 1-1.4-1.7c-.1-.2 0-.3.1-.4l.4-.5.2-.4c.1-.1 0-.3 0-.4l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.5.5.2.9.4 1.2.5.5.2 1 .2 1.3.1.4-.1 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1Z"/></svg><span>Ask price</span></a></div>' +
        '</div>';
    }).join('');
  }

  /* --------------------------- form handling ---------------------------- */
  var lastMessage = readJSON(KEYS.lastRequest, '');

  function setFieldError(form, key, message) {
    var box = $('[data-error-for="' + key + '"]', form);
    var input = form.elements[key];
    if (box) { box.textContent = message || ''; }
    if (input) { input.setAttribute('aria-invalid', message ? 'true' : 'false'); }
    return !message;
  }

  function validateInquiry(form) {
    var ok = true;
    ok = setFieldError(form, 'name', form.elements.name.value.trim().length < 2 ? 'Please tell us your name.' : '') && ok;
    var digits = form.elements.phone.value.replace(/\D+/g, '');
    ok = setFieldError(form, 'phone', digits.length < 10 ? 'Enter a phone number with at least 10 digits.' : '') && ok;
    ok = setFieldError(form, 'city', form.elements.city.value ? '' : 'Choose your city.') && ok;
    var email = form.elements.email.value.trim();
    ok = setFieldError(form, 'email', email && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email) ? 'That email address does not look right.' : '') && ok;
    return ok;
  }

  function inquiryMessage() {
    var form = $('[data-inquiry-form]');
    var totals = inquiryTotals();
    var out = [];
    out.push('New inquiry from the ' + D.brand.name + ' website');
    out.push('');
    if (form) {
      out.push('Name: ' + form.elements.name.value.trim());
      out.push('Phone: ' + form.elements.phone.value.trim());
      if (form.elements.email.value.trim()) { out.push('Email: ' + form.elements.email.value.trim()); }
      out.push('City: ' + form.elements.city.value);
      out.push('Needs: ' + form.elements.service.value);
      out.push('Property: ' + form.elements.property.value);
      out.push('Budget: ' + form.elements.budget.value);
      out.push('Start: ' + form.elements.timeline.value);
      if (form.elements.notes.value.trim()) {
        out.push('');
        out.push('Notes: ' + form.elements.notes.value.trim());
      }
    }
    out.push('');
    if (inquiry.length) {
      out.push('Selected pieces (' + totals.pieces + ' in total):');
      inquiry.forEach(function (line, i) {
        var p = findProduct(line.slug);
        if (!p) { return; }
        out.push((i + 1) + '. ' + p.name + ' - ' + (line.colour || '-') + ' x' + line.qty +
          (typeof p.price === 'number' ? ' (' + money(p.price) + ' each)' : ' (price on request)'));
      });
    } else {
      out.push('No catalogue pieces selected - please quote the scope described above.');
    }
    out.push('');
    out.push('Sent from ' + window.location.href);
    return out.join('\n');
  }
  function showMessage(message, sendMethod) {
    lastMessage = message;
    writeJSON(KEYS.lastRequest, message);

    var host = $('[data-inquiry-result]');
    var wa = 'https://wa.me/' + D.brand.whatsapp + '?text=' + encodeURIComponent(message);
    var mail = D.brand.email
      ? '<a class="btn btn--ghost btn--sm" href="mailto:' + D.brand.email +
        '?subject=' + encodeURIComponent('Inquiry from the website') +
        '&body=' + encodeURIComponent(message) + '">Send by email</a>'
      : '';
    var sendButtons = sendMethod === 'email' && mail
      ? mail + '<a class="btn btn--ghost btn--sm" href="' + wa + '" target="_blank" rel="noopener">Send on WhatsApp instead</a>'
      : '<a class="btn btn--sm" href="' + wa + '" target="_blank" rel="noopener">Send on WhatsApp</a>' + mail;

    if (host) {
      host.hidden = false;
      host.innerHTML = '<h3 style="margin-top:0">Your inquiry is ready</h3>' +
        '<p class="hint" style="margin:0">Choose a sending option below. Your name, requirements and every selected piece, finish and quantity are included.</p>' +
        '<div class="link-row">' +
          sendButtons +
          '<button class="btn btn--ghost btn--sm" type="button" data-copy>Copy text</button>' +
          '<button class="btn btn--ghost btn--sm" type="button" data-download>Download as file</button>' +
        '</div>' +
        '<code>' + esc(message) + '</code>';
      host.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    $$('[data-inquiry-copy]').forEach(function (el) { el.hidden = false; });
    $$('[data-inquiry-download]').forEach(function (el) { el.hidden = false; });
    toast(sendMethod === 'email' && mail ? 'Inquiry ready - send it by email' : 'Inquiry ready - send it on WhatsApp');
  }

  function copyText(text) {
    if (!text) { toast('Write something first'); return; }
    function fallback() {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', 'readonly');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); toast('Copied to clipboard'); }
      catch (e) { toast('Copy not allowed here - please select the text'); }
      area.remove();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Copied to clipboard'); }, fallback);
    } else { fallback(); }
  }

  function downloadText(text) {
    if (!text) { toast('Nothing to download yet'); return; }
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'ayn-casa-inquiry.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    toast('Saved as ayn-casa-inquiry.txt');
  }

  function formInit() {
    var form = $('[data-inquiry-form]');
    if (form) {
      var emailOption = $('[data-email-option]', form);
      var emailInput = form.elements.sendMethod && form.elements.sendMethod[1];
      if (emailOption && emailInput && !D.brand.email) {
        emailInput.disabled = true;
        emailOption.setAttribute('data-disabled', 'true');
      }
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (!validateInquiry(form)) {
          var firstBad = $('[aria-invalid="true"]', form);
          if (firstBad) { firstBad.focus(); }
          toast('Please check the highlighted fields');
          return;
        }
        showMessage(inquiryMessage(), form.elements.sendMethod.value);
      });
    }
    $$('[data-inquiry-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () { copyText(lastMessage || inquiryMessage()); });
    });
    $$('[data-inquiry-download]').forEach(function (btn) {
      btn.addEventListener('click', function () { downloadText(lastMessage || inquiryMessage()); });
    });
  }
  /* --------------------------- event wiring ----------------------------- */
  function delegateEvents() {
    var selector = '[data-add],[data-view-product],[data-lb],[data-cat],[data-city],' +
      '[data-c-reset],[data-c-more],[data-line-inc],[data-line-dec],[data-line-remove],[data-share-product],' +
      '[data-inquiry-clear],[data-copy],[data-download]';

    document.addEventListener('click', function (event) {
      var el = event.target && event.target.closest ? event.target.closest(selector) : null;
      if (!el) { return; }

      /* collection: add a piece to the inquiry */
      if (el.hasAttribute('data-add')) {
        var slug = el.getAttribute('data-add');
        var picker = $('[data-colour-for="' + slug + '"]');
        addToInquiry(slug, picker ? picker.value : '', 1);
        return;
      }
      if (el.hasAttribute('data-share-product')) {
        var shareProduct = findProduct(el.getAttribute('data-share-product'));
        if (!shareProduct) { return; }
        var shareUrl = productLink(shareProduct.slug);
        var shareData = { title: shareProduct.name + ' - ' + D.brand.name, text: 'Take a look at ' + shareProduct.name + ' from ' + D.brand.name + '.', url: shareUrl };
        if (navigator.share) {
          navigator.share(shareData).then(function () { toast('Product link shared'); }).catch(function () {});
        } else {
          openShareMenu(shareProduct, shareUrl);
        }
        return;
      }

      /* collection / projects: open an image viewer */
      if (el.hasAttribute('data-view-product')) {
        var pslug = el.getAttribute('data-view-product');
        lightboxOpen(lbData['product:' + pslug] || [], 0);
        return;
      }
      if (el.hasAttribute('data-lb')) {
        var key = el.getAttribute('data-lb');
        lightboxOpen(lbData[key] || [], parseInt(el.getAttribute('data-lb-index'), 10) || 0);
        return;
      }

      /* filters */
      if (el.hasAttribute('data-cat')) {
        col.cat = el.getAttribute('data-cat');
        col.shown = PAGE_SIZE;
        renderCollectionChips();
        renderCollection();
        return;
      }
      if (el.hasAttribute('data-city')) {
        projectFilter = el.getAttribute('data-city');
        renderProjectFilter();
        renderProjects();
        return;
      }
      if (el.hasAttribute('data-c-reset')) {
        col = { cat: 'all', q: '', sort: 'featured', shown: PAGE_SIZE };
        var search = $('[data-c-search]');
        var sort = $('[data-c-sort]');
        if (search) { search.value = ''; }
        if (sort) { sort.value = 'featured'; }
        renderCollectionChips();
        renderCollection();
        return;
      }
      if (el.hasAttribute('data-c-more')) {
        col.shown += PAGE_SIZE;
        renderCollection();
        return;
      }

      /* inquiry lines */
      if (el.hasAttribute('data-line-inc') || el.hasAttribute('data-line-dec')) {
        var lineSlug = el.getAttribute('data-line-inc') || el.getAttribute('data-line-dec');
        var lineColour = el.getAttribute('data-line-colour') || '';
        var index = lineIndex(lineSlug, lineColour);
        if (index > -1) {
          var step = el.hasAttribute('data-line-inc') ? 1 : -1;
          setLineQty(lineSlug, lineColour, inquiry[index].qty + step);
        }
        return;
      }
      if (el.hasAttribute('data-line-remove')) {
        removeLine(el.getAttribute('data-line-remove'), el.getAttribute('data-line-colour') || '');
        return;
      }
      if (el.hasAttribute('data-inquiry-clear')) {
        clearInquiry();
        return;
      }

      /* ready-made inquiry: copy or download the prepared message */
      if (el.hasAttribute('data-copy')) { copyText(lastMessage); return; }
      if (el.hasAttribute('data-download')) { downloadText(lastMessage); return; }
    });

    var search = $('[data-c-search]');
    if (search) {
      search.addEventListener('input', debounce(function () {
        col.q = search.value;
        col.shown = PAGE_SIZE;
        renderCollection();
      }, 160));
    }

    var sort = $('[data-c-sort]');
    if (sort) {
      sort.addEventListener('change', function () {
        col.sort = sort.value;
        renderCollection();
      });
    }

    document.addEventListener('change', function (event) {
      var el = event.target;
      if (el && el.hasAttribute && el.hasAttribute('data-line-qty')) {
        setLineQty(el.getAttribute('data-line-qty'), el.getAttribute('data-line-colour') || '', el.value);
      }
    });
  }

  /* ------------------------------- start -------------------------------- */
  function boot() {
    applyBrand();
    fillArt($('[data-art="hero"]'));
    lightboxInit();
    headerInit();
    brandTransitionInit();
    heroInit();
    instagramInit();
    reviewsInit();
    consentInit();

    renderMarquee();
    renderStats();
    renderServices();
    renderArtGallery('[data-studio-gallery]', [
      { src: 'assets/project-golf-links-1.jpg', label: 'Living room' },
      { src: 'assets/studio-kitchen.jpg', label: 'Kitchen' },
      { src: 'assets/studio-bedroom.jpg', label: 'Bedroom' },
      { src: 'assets/studio-dining.jpg', label: 'Dining' }
    ], { meta: 'AYN Casa' });

    renderArtGallery('[data-contact-art]', [
      { src: 'assets/contact-consult.jpg', label: 'Consultation' },
      { src: 'assets/contact-3d.jpg', label: '3D view' }
    ], { meta: 'AYN Casa' });

    renderProjectFilter();
    renderProjects();
    renderCollectionChips();
    var sharedProduct = new URLSearchParams(window.location.search).get('product');
    var sharedProductData = sharedProduct ? findProduct(sharedProduct) : null;
    if (sharedProductData) {
      col.q = sharedProductData.name;
      var collectionSearch = $('[data-c-search]');
      if (collectionSearch) { collectionSearch.value = sharedProductData.name; }
    }
    renderCollection();
    renderTestimonials();
    renderFaqs();
    renderCitySelects();

    renderInquiry();
    syncBadges();
    showFloatBar();

    formInit();
    delegateEvents();
    revealInit();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();