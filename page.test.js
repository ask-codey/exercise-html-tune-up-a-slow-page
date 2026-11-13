// Checks the HTML that decides how fast the Movie Night Club page loads, and that you recorded your numbers.
// Run it with: npm test (run npm install once first). You don't need to change this file.
const nodeTest = require('node:test');

// Runs one check. When it fails, the output starts "Not yet:" and says what to fix, with no stack trace to scroll past.
function test(name, run) {
  return nodeTest(name, async (context) => {
    try {
      await run(context);
    } catch (error) {
      const problem = new Error(error.message);
      problem.stack = `Not yet: ${error.message}`;
      throw problem;
    }
  });
}
const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const { JSDOM } = require('jsdom');
const { HtmlValidate } = require('html-validate');

const html = readFileSync('index.html', 'utf8');
const page = new JSDOM(html).window.document;
const all = (selector) => [...page.querySelectorAll(selector)];
const isBefore = (a, b) => Boolean(a.compareDocumentPosition(b) & 4);

// Reads a JPEG file's real width and height in pixels.
function jpegSize(file) {
  const bytes = readFileSync(file);
  let at = 2;
  while (at < bytes.length) {
    const marker = bytes[at + 1];
    const length = bytes.readUInt16BE(at + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { width: bytes.readUInt16BE(at + 7), height: bytes.readUInt16BE(at + 5) };
    }
    at += 2 + length;
  }
  throw new Error(`${file} isn't a JPEG this test can read.`);
}

const posters = all('img').filter((img) => (img.getAttribute('src') || '').startsWith('posters/'));

test('1) the countdown script no longer holds up the page', () => {
  const script = page.querySelector('script[src="countdown.js"]');
  assert.ok(script, 'Keep the <script src="countdown.js"> tag: the page needs its countdown.');
  assert.ok(!script.hasAttribute('async'),
    'async runs the script the moment it arrives, which can be before the countdown paragraph exists. This script needs the whole page: use defer.');
  const deferred = script.hasAttribute('defer') || script.getAttribute('type') === 'module';
  const last = [...page.body.children].filter((element) => element.tagName !== 'SCRIPT').pop();
  const atTheEnd = script.parentElement === page.body && isBefore(last, script);
  assert.ok(deferred || atTheEnd,
    'In the head, a plain <script src="countdown.js"> stops the page being built until it downloads and runs. Load it with defer.');
});

test('2) the page has a favicon, as an SVG with a PNG for other browsers', () => {
  const icons = all('head link[rel~="icon"]');
  assert.ok(icons.length > 0, 'Add a <link rel="icon"> to the head for each icon file.');
  for (const icon of icons) {
    const href = icon.getAttribute('href') || '';
    assert.ok(existsSync(href), `The icon link points at ${href || 'nothing'}, and there's no such file in this folder.`);
  }
  const svg = icons.find((icon) => icon.getAttribute('href') === 'favicon.svg');
  const png = icons.find((icon) => icon.getAttribute('href') === 'favicon.png');
  assert.ok(svg, 'Link the SVG icon: <link rel="icon" href="favicon.svg" ...>.');
  assert.equal(svg.getAttribute('type'), 'image/svg+xml',
    'Give the SVG icon type="image/svg+xml", so a browser that can\'t show SVG icons skips it.');
  assert.ok(png, 'Link the PNG icon too, for browsers that skip the SVG: <link rel="icon" href="favicon.png" ...>.');
});

test('3) the browser connects early to the site that serves the font', () => {
  const fontCss = page.querySelector('link[href^="https://fonts.googleapis.com/"]');
  assert.ok(fontCss, 'Keep the Google Fonts stylesheet link: the headings use its font.');
  const early = all('link[rel~="preconnect"]')
    .find((link) => /^https:\/\/fonts\.gstatic\.com\/?$/.test(link.getAttribute('href') || ''));
  assert.ok(early,
    'Add a preconnect link for https://fonts.gstatic.com: the font files themselves come from that site.');
  assert.ok(early.hasAttribute('crossorigin'),
    'Font files are always fetched in a special "cross-origin" mode, so the preconnect needs crossorigin too.');
  assert.ok(isBefore(early, fontCss),
    'Put the preconnect above the font\'s stylesheet link, so the connection starts first.');
});

test('4) every poster says its width and height', () => {
  assert.equal(posters.length, 6, 'Keep all six posters on the page.');
  for (const img of posters) {
    const src = img.getAttribute('src');
    const width = Number(img.getAttribute('width'));
    const height = Number(img.getAttribute('height'));
    assert.ok(width > 0 && height > 0, `${src} needs width and height attributes, so the page saves its space.`);
    const real = jpegSize(src);
    const off = Math.abs(width / height - real.width / real.height) / (real.width / real.height);
    assert.ok(off < 0.02, `${src} is ${real.width} x ${real.height} pixels, so width="${width}" height="${height}" would squash it.`);
  }
});

test('5) posters below the first one load lazily, and the first one loads right away', () => {
  assert.ok(posters.length > 1, 'Keep all six posters on the page.');
  const [first, ...rest] = posters;
  assert.notEqual(first.getAttribute('loading'), 'lazy',
    `${first.getAttribute('src')} is near the top, where a visitor sees it first. Leave lazy loading off it.`);
  for (const img of rest) {
    assert.equal(img.getAttribute('loading'), 'lazy',
      `${img.getAttribute('src')} is further down the page. Add loading="lazy", so it waits until the visitor scrolls near it.`);
  }
});

test('6) the page passes the HTML validator', () => {
  const report = new HtmlValidate({ extends: ['html-validate:standard'] }).validateStringSync(html);
  const problems = report.results.flatMap((result) => result.messages)
    .map((message) => `line ${message.line}: ${message.message}`);
  assert.deepEqual(problems, [], 'Fix what the validator found:\n' + problems.join('\n'));
});

test('7) you recorded your numbers before and after', () => {
  const lines = readFileSync('measurements.txt', 'utf8').split(/\r?\n/);
  for (const [number, name, kind] of [[1, 'scoreBefore', 'score'], [2, 'weightBefore', 'weight'], [3, 'scoreAfter', 'score'], [4, 'weightAfter', 'weight']]) {
    const line = lines.find((text) => text.startsWith(`${number})`));
    assert.ok(line, `measurements.txt is missing its line ${number}) ${name}:`);
    const value = line.slice(line.lastIndexOf(':') + 1).trim();
    console.log(`${number}) ${name}: ${value}`);
    if (kind === 'score') {
      assert.match(value, /^\d{1,3}$/, `Write the Lighthouse score after "${number}) ${name}:", as a number such as 72.`);
      assert.ok(Number(value) <= 100, `A Lighthouse score goes from 0 to 100, and ${name} is ${value}.`);
    } else {
      assert.match(value, /^\d+(\.\d+)?\s*(B|kB|KB|MB)$/i, `Write the page weight after "${number}) ${name}:", with its unit, such as 1.2 MB.`);
    }
  }
});
