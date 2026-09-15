/* AYN CASA smoke test - drives index.html + data.js + app.js in jsdom.
 * Run:  npm install --no-save jsdom   then   node tests/smoke.js
 * The website itself has no dependencies; jsdom is only used by this test.
 */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://localhost/' });
const { window } = dom;
window.Element.prototype.scrollIntoView = function () {};
if (!window.URL.createObjectURL) { window.URL.createObjectURL = function () { return 'blob:test'; }; }
if (!window.URL.revokeObjectURL) { window.URL.revokeObjectURL = function () {}; }

window.eval(fs.readFileSync(path.join(root, 'js', 'data.js'), 'utf8'));
window.eval(fs.readFileSync(path.join(root, 'js', 'app.js'), 'utf8'));

const doc = window.document;
let pass = 0, fail = 0;
const check = (name, cond, extra) => {
  if (cond) { pass++; console.log('PASS  ' + name); }
  else { fail++; console.log('FAIL  ' + name + (extra ? '  -> ' + extra : '')); }
};
const click = (el) => el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
const cards = () => doc.querySelectorAll('[data-products] .card').length;
const badge = () => doc.querySelector('[data-count="inquiry"]').textContent;
const lines = () => doc.querySelectorAll('[data-inquiry-list] .inquiry-item').length;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  /* app.js boots on DOMContentLoaded (or immediately if already parsed) */
  await new Promise((resolve) => {
    if (doc.readyState === 'complete') { resolve(); return; }
    window.addEventListener('load', resolve);
    setTimeout(resolve, 1500);
  });
  await wait(60);

  check('collection renders first page of 8 cards', cards() === 8, 'got ' + cards());
  check('project cards rendered', doc.querySelectorAll('[data-projects] .card').length === 6, 'got ' + doc.querySelectorAll('[data-projects] .card').length);
  check('services rendered', doc.querySelectorAll('[data-services] .service').length === 6);
  check('testimonials rendered', doc.querySelectorAll('[data-testimonials] .testimonial').length === 4);
  check('faqs rendered', doc.querySelectorAll('[data-faqs] details').length === 5);
  check('city dropdown filled from data', doc.querySelector('[data-city-select]').options.length > 5);
  check('phone link uses the studio number', doc.querySelector('[data-phone-link]').getAttribute('href') === 'tel:+918879404352', doc.querySelector('[data-phone-link]').getAttribute('href'));
  check('whatsapp link uses the studio number', doc.querySelector('[data-wa-link]').getAttribute('href').indexOf('https://wa.me/918879404352') === 0);
  check('inquiry starts empty', lines() === 0 && badge() === '0');

  click(doc.querySelector('[data-add]'));
  check('adding a piece creates one inquiry line', lines() === 1, 'lines ' + lines());
  check('badge counts 1 piece', badge() === '1', 'badge ' + badge());
  check('floating bar shows', doc.querySelector('[data-float-bar]').getAttribute('data-show') === 'true');

  click(doc.querySelector('[data-line-inc]'));
  check('quantity increment works', badge() === '2' && doc.querySelector('[data-line-qty]').value === '2', 'badge ' + badge());
  check('chosen finish shown in the list', doc.querySelector('[data-inquiry-list] .meta').textContent.indexOf('Walnut') > -1);

  click(doc.querySelector('[data-line-remove]'));
  check('remove empties the list', lines() === 0 && badge() === '0');
  const lightingChip = Array.from(doc.querySelectorAll('[data-c-chips] .chip')).find((c) => c.getAttribute('data-cat') === 'lighting');
  click(lightingChip);
  check('category filter narrows the grid', cards() === 2, 'got ' + cards());
  click(doc.querySelector('[data-c-reset]'));
  check('reset restores the first page', cards() === 8, 'got ' + cards());

  const search = doc.querySelector('[data-c-search]');
  search.value = 'console';
  search.dispatchEvent(new window.Event('input', { bubbles: true }));
  await wait(300);
  check('search finds the console', cards() === 1, 'got ' + cards());
  search.value = 'zzzz';
  search.dispatchEvent(new window.Event('input', { bubbles: true }));
  await wait(300);
  check('empty state shown when nothing matches', doc.querySelector('[data-products] .empty') !== null);
  click(doc.querySelector('[data-c-reset]'));

  const cityChip = Array.from(doc.querySelectorAll('[data-project-filter] .chip')).find((c) => c.getAttribute('data-city') === 'Pune');
  click(cityChip);
  check('project city filter works', doc.querySelectorAll('[data-projects] .card').length === 1);
  click(Array.from(doc.querySelectorAll('[data-project-filter] .chip')).find((c) => c.getAttribute('data-city') === 'all'));

  const form = doc.querySelector('[data-inquiry-form]');
  form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  check('empty form is blocked', doc.querySelector('[data-inquiry-result]').hidden === true);
  check('name error shown', doc.querySelector('[data-error-for="name"]').textContent.length > 0);
  check('phone error shown', doc.querySelector('[data-error-for="phone"]').textContent.length > 0);
  check('city error shown', doc.querySelector('[data-error-for="city"]').textContent.length > 0);
  form.elements.phone.value = '123';
  form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));
  check('short phone still blocked', doc.querySelector('[data-error-for="phone"]').textContent.indexOf('10 digits') > -1);

  click(doc.querySelector('[data-add]'));
  form.elements.name.value = 'Riya Sharma';
  form.elements.phone.value = '8879404352';
  form.elements.city.value = 'Pune';
  form.elements.email.value = 'riya@example.com';
  form.elements.notes.value = '3BHK, need the living room done.';
  form.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }));

  const result = doc.querySelector('[data-inquiry-result]');
  check('result panel appears', result.hidden === false);
  const text = result.querySelector('code').textContent;
  check('message contains the visitor name', text.indexOf('Riya Sharma') > -1);
  check('message contains phone, city and notes', text.indexOf('8879404352') > -1 && text.indexOf('Pune') > -1 && text.indexOf('living room') > -1);
  check('message lists the selected piece', text.indexOf('Sereno Console') > -1 && text.indexOf('Walnut') > -1);
  check('message counts the pieces', text.indexOf('Selected pieces (1 in total)') > -1, text);
  const wa = result.querySelector('a[href^="https://wa.me/"]').getAttribute('href');
  check('whatsapp link carries the whole message', wa.indexOf(encodeURIComponent('Riya Sharma')) > -1 && wa.indexOf(encodeURIComponent('Sereno Console')) > -1);
  check('copy and download buttons revealed', !doc.querySelector('[data-inquiry-copy]').hidden && !doc.querySelector('[data-inquiry-download]').hidden);
  check('inquiry stored in localStorage', (window.localStorage.getItem('ayn.inquiry.v1') || '').indexOf('sereno-console') > -1);
  check('last message stored in localStorage', (window.localStorage.getItem('ayn.lastRequest.v1') || '').indexOf('Riya Sharma') > -1);

  click(doc.querySelector('[data-view-product]'));
  const lightbox = doc.querySelector('[data-lightbox]');
  check('lightbox opens with product photo', lightbox.getAttribute('data-open') === 'true' && /^assets\/.+\.jpg$/.test(doc.querySelector('[data-lightbox-img]').getAttribute('src')));
  doc.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  check('escape closes the lightbox', lightbox.getAttribute('data-open') === 'false');

  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('TEST CRASH', e); process.exit(2); });