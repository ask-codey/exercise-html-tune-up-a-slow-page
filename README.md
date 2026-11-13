# Exercise: Tune Up a Slow Page

Exercise code for the lesson **Exercise: Tune Up a Slow Page** in the HTML in Depth course on [ask-codey.com](https://www.ask-codey.com).

The Movie Night Club's page works, but it's slow on a phone, its countdown to showtime is stuck on "Counting down to Friday...", and its browser tab has no icon. You'll fix its HTML, and only its HTML, measure the page before and after, and let the tests check each fix.

## Before you start

You need VS Code with the **Live Server** extension, Chrome or Edge (their developer tools have the Lighthouse panel), and Node.js for the tests. The setup lesson of the course installs all three.

## What's here

- `index.html`: the club's page. For you to fix.
- `countdown.js`: a ready-made script that shows how long it is until the next film. You don't need to read it or change it.
- `style.css`: a ready-made stylesheet. You don't need to change it.
- `favicon.svg` and `favicon.png`: the club's icon, a yellow play button, ready to use. The page doesn't link to them yet.
- `posters/`: six film posters, each 600 pixels wide and 900 pixels tall.
- `measurements.txt`: your before and after numbers. For you to fill in.
- `page.test.js` and `package.json`: the tests. You don't need to change these.

## Run it

Open this folder in VS Code, right-click `index.html` and choose **Open with Live Server**. The page opens in your browser and reloads every time you save.

## Measure it first

Measure before you change anything, so you have something to compare with.

1. Copy the page's address from the browser's address bar (it looks like `http://127.0.0.1:5500/index.html`) and open it in a private window: **Ctrl+Shift+N** in Chrome (**Cmd+Shift+N** on a Mac), **Ctrl+Shift+N** in Edge. A private window has no extensions to slow the page down.
2. Open the developer tools with **F12** (**Cmd+Option+I** on a Mac) and choose the **Network** panel. Tick **Disable cache**, set the throttling menu (it says **No throttling**) to **Slow 4G**, and turn on the device toolbar with **Ctrl+Shift+M** (**Cmd+Shift+M** on a Mac) so the page is phone-sized.
3. Reload the page. At the bottom of the Network panel, find the size **transferred**, and write it after `2) weightBefore:` in `measurements.txt`.
4. Choose the **Lighthouse** panel (it may be behind the **>>** button). Pick **Navigation**, **Mobile** and only the **Performance** category, then click **Analyze page load**. Write the score after `1) scoreBefore:`.

## What to fix

Four problems, all in the HTML:

1. **The script.** `countdown.js` is loaded in the head in a way that stops the page being built until it downloads and runs. It also runs before the countdown's paragraph exists, which is why the countdown is stuck. Load it so it runs after the page is built.
2. **The icon.** Link both icon files from the head, the SVG with its type, so every browser finds one.
3. **The font.** The headings use a font from Google Fonts. The stylesheet comes from `fonts.googleapis.com`, but the font file itself comes from `https://fonts.gstatic.com`, and the browser only finds that out after the stylesheet arrives. Tell it to connect to that site early.
4. **The posters.** Give each poster its width and height, so the page keeps their space while they load, and let every poster after the first wait until the visitor scrolls near it.

Change only `index.html` (and `measurements.txt`). The script and the stylesheet stay as they are.

## Check your work

Open VS Code's terminal (**Terminal > New Terminal**) and run:

```bash
npm install
npm test
```

You only need `npm install` once. At first, six of the seven tests fail: that is expected. The validator test passes from the start, and it is there to catch a typing mistake while you work. Each fix turns a test green, and a failing test's message says what it found.

## Measure it again

When every other test passes, measure the page again in a new private window, the same way, and write your numbers after `3) scoreAfter:` and `4) weightAfter:`. Then run `npm test` once more.

Your numbers won't match anyone else's: they depend on your computer, and Lighthouse's score moves a few points from one run to the next. What matters is the change: the page should transfer less, score higher, show its icon in the tab, and count down to Friday.

## Tips

- Look at the Network panel's list before you fix anything. Which files does the page ask for, and which one ends in `404`?
- A script that needs the whole page is the job one of the script tag's attributes was made for.
- The posters' sizes are in **What's here**. The first poster is the one a visitor sees without scrolling.
- After each fix, save, reload, and look at the Network panel again. Watching a request disappear, or move earlier, is the best way to see what your HTML changed.

## Hand it in

When it works, put your solution in a public repo of your own on GitHub, then paste that repo's address into **Submit your exercise** on the lesson page at [ask-codey.com](https://www.ask-codey.com). That's what completes the lesson. You don't need Git: create the repo on GitHub, choose **Add file**, then **Upload files**, and upload everything in this folder except `node_modules` (it's the files `npm install` downloaded, far too many for GitHub's upload, and `npm install` makes it again). The lesson page shows each step, and the lesson *Put Your Work on GitHub* walks through every screen.
