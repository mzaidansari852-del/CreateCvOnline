#!/usr/bin/env node
/*
 * One source, two outputs.
 *
 * The checklist exists as a versioned markdown file in the repo *and* as an interactive page
 * to tick through. Writing both by hand guarantees they drift, and a QA document that
 * disagrees with itself is worse than one that is merely out of date — so both are generated
 * from `checklist.json` and neither is edited directly.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('./checklist.json', import.meta.url), 'utf8'));
const total = data.sections.reduce((n, s) => n + s.items.length, 0);

/* ------------------------------------------------------------------ markdown */

const md = [];
md.push(`# ${data.title}`, '');
md.push(data.subtitle, '');
md.push(`**${total} checks across ${data.sections.length} areas.**`, '');
md.push('> Generated from `docs/qa/checklist.json`. Edit that file, not this one.', '');
md.push('## How to test', '');
for (const p of data.principles) md.push(`- ${p}`);
md.push('', '## Contents', '');
for (const s of data.sections) {
  md.push(`- [${s.name}](#${s.id}) — ${s.items.length}`);
}
md.push('');
for (const s of data.sections) {
  md.push(`<a id="${s.id}"></a>`, '');
  md.push(`## ${s.name}`, '');
  if (s.note) md.push(`_${s.note}_`, '');
  for (const it of s.items) {
    md.push(`- [ ] **${it.t}**`);
    md.push(`      ${it.d}`);
  }
  md.push('');
}
writeFileSync(new URL('./QA_CHECKLIST.md', import.meta.url), md.join('\n'));

/* ---------------------------------------------------------------------- html */

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** `**bold**` and `` `code` `` only — the descriptions use nothing else. */
const rich = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>');

const sectionsHtml = data.sections
  .map(
    (s) => `
      <section class="sec" id="${s.id}" data-sec="${s.id}">
        <header class="sec-head">
          <h2>${esc(s.name)}</h2>
          <p class="sec-count"><span class="sc-done">0</span>/<span class="sc-total">${s.items.length}</span></p>
        </header>
        ${s.note ? `<p class="sec-note">${rich(s.note)}</p>` : ''}
        <ul class="items">
          ${s.items
            .map(
              (it, i) => `
            <li class="item" data-state="todo" data-id="${s.id}-${i}">
              <button class="mark" type="button" aria-label="Mark: ${esc(it.t)}">
                <span class="glyph" aria-hidden="true"></span>
              </button>
              <div class="body">
                <p class="t">${rich(it.t)}</p>
                <p class="d">${rich(it.d)}</p>
              </div>
              <span class="state-label">not tested</span>
            </li>`,
            )
            .join('')}
        </ul>
      </section>`,
  )
  .join('');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(data.title)}</title>
<style>
  /*
   * Colour does three jobs here and only three.
   *
   * Progress is a MAGNITUDE, so it is one hue, light to dark — brand blue, the site's own.
   * Item state is a STATUS, so it uses the reserved good/critical pair and, per the rule
   * that matters, never carries meaning by colour alone: every state also has a distinct
   * glyph and a written label. Red and green are 5.0 ΔE apart under deuteranopia, which is
   * to say indistinguishable — the glyph and the word are what a colourblind tester reads.
   * Everything else is ink: text wears text tokens, never the status colour.
   */
  :root {
    --brand-50:#eff4ff; --brand-100:#dbe5ff; --brand-200:#bfd0ff; --brand-400:#6086ff;
    --brand-600:#1f3af5; --brand-700:#1a2de1; --brand-900:#1c288f;
    --ink-50:#f7f8fa; --ink-100:#eef0f4; --ink-200:#dde1e9; --ink-300:#c2c9d6;
    --ink-400:#939eb3; --ink-500:#6b7791; --ink-600:#515c74; --ink-800:#2a3141;
    --ink-900:#171c28; --ink-950:#0a0e18;
    --good-bg:#dcfce7; --good-fg:#15803d; --good-br:#86efac;
    --bad-bg:#fee2e2;  --bad-fg:#b91c1c;  --bad-br:#fca5a5;
    --surface:#ffffff;
  }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin:0; background:var(--ink-50); color:var(--ink-800);
    font:15px/1.6 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  }
  code {
    font:0.86em/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
    background:var(--ink-100); padding:.1em .35em; border-radius:4px; color:var(--ink-900);
    overflow-wrap:break-word;
  }
  .wrap { max-width:1000px; margin:0 auto; padding:0 20px 80px; }

  /* ---------------------------------------------------------------- masthead */
  .masthead { padding:44px 0 26px; }
  .masthead h1 { margin:0 0 10px; font-size:clamp(25px,4.4vw,36px); line-height:1.15; letter-spacing:-.02em; color:var(--ink-950); }
  .masthead .sub { margin:0; max-width:70ch; color:var(--ink-600); }

  /* ------------------------------------------------------------- the meter
     A hero number, not a chart: one quantity, read at a glance. The bar is the
     same quantity again in a form you can judge without reading — one hue, no
     ticks, no gridlines, nothing to decode. */
  .meter { background:var(--surface); border:1px solid var(--ink-200); border-radius:14px; padding:20px 22px; margin:8px 0 30px; }
  .meter-top { display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; }
  .hero { font-size:38px; font-weight:800; letter-spacing:-.03em; color:var(--ink-950); line-height:1; font-variant-numeric:tabular-nums; }
  .hero-of { font-size:17px; font-weight:600; color:var(--ink-400); }
  .hero-lbl { font-size:13px; color:var(--ink-500); margin-left:auto; }
  .hero-lbl b { color:var(--bad-fg); font-variant-numeric:tabular-nums; }
  .track { height:8px; background:var(--ink-100); border-radius:99px; margin-top:16px; overflow:hidden; }
  .fill { height:100%; width:0%; border-radius:99px; background:linear-gradient(90deg,var(--brand-400),var(--brand-700)); transition:width .18s ease; }

  /* ----------------------------------------------------------------- toolbar */
  .bar { position:sticky; top:0; z-index:5; display:flex; gap:8px; flex-wrap:wrap; align-items:center;
         padding:11px 0; margin-bottom:8px; background:color-mix(in srgb,var(--ink-50) 88%,transparent);
         backdrop-filter:blur(8px); border-bottom:1px solid var(--ink-200); }
  .btn { font:inherit; font-size:13px; font-weight:600; cursor:pointer; padding:7px 13px; border-radius:8px;
         border:1px solid var(--ink-300); background:var(--surface); color:var(--ink-800); }
  .btn:hover { border-color:var(--brand-400); color:var(--brand-700); }
  .btn[aria-pressed="true"] { background:var(--brand-700); border-color:var(--brand-700); color:#fff; }
  .btn.ghost { border-color:transparent; background:transparent; color:var(--ink-500); }
  .btn.ghost:hover { color:var(--brand-700); }
  .spacer { flex:1 1 auto; }

  /* -------------------------------------------------------------- principles */
  .how { background:var(--brand-50); border:1px solid var(--brand-100); border-radius:14px; padding:20px 24px; margin:0 0 32px; }
  .how h2 { margin:0 0 12px; font-size:13px; font-weight:700; letter-spacing:.09em; text-transform:uppercase; color:var(--brand-900); }
  .how ol { margin:0; padding-left:20px; color:var(--ink-800); }
  .how li { margin:0 0 9px; }
  .how li:last-child { margin-bottom:0; }

  /* ------------------------------------------------------------------ index */
  .toc { display:flex; flex-wrap:wrap; gap:7px; margin:0 0 34px; }
  .toc a { font-size:13px; font-weight:600; text-decoration:none; padding:6px 11px; border-radius:99px;
           background:var(--surface); border:1px solid var(--ink-200); color:var(--ink-600); }
  .toc a:hover { border-color:var(--brand-400); color:var(--brand-700); }
  .toc a i { font-style:normal; color:var(--ink-400); font-variant-numeric:tabular-nums; }

  /* --------------------------------------------------------------- sections */
  .sec { margin:0 0 34px; scroll-margin-top:70px; }
  .sec-head { display:flex; align-items:center; gap:14px; padding-bottom:9px; border-bottom:2px solid var(--ink-200); }
  .sec-head h2 { margin:0; font-size:19px; letter-spacing:-.01em; color:var(--ink-950); }
  .sec-count { margin:0 0 0 auto; font-size:13px; font-weight:700; color:var(--ink-400); font-variant-numeric:tabular-nums; }
  .sec.done .sec-count { color:var(--good-fg); }
  .sec-note { margin:13px 0 0; font-size:14px; color:var(--ink-600); max-width:78ch; }

  .items { list-style:none; margin:15px 0 0; padding:0; }
  .item { display:flex; gap:13px; align-items:flex-start; padding:13px 15px; margin-bottom:7px;
          background:var(--surface); border:1px solid var(--ink-200); border-radius:11px; }
  .item .body { flex:1 1 auto; min-width:0; }
  .item .t { margin:0; font-weight:650; color:var(--ink-900); overflow-wrap:break-word; }
  .item .d { margin:5px 0 0; font-size:13.5px; color:var(--ink-600); overflow-wrap:break-word; }

  /* The three-state control. Glyph + label + colour, in that order of importance. */
  .mark { flex:0 0 auto; width:26px; height:26px; margin-top:1px; cursor:pointer; padding:0;
          display:grid; place-items:center; border-radius:7px;
          border:1.5px solid var(--ink-300); background:var(--surface); }
  .mark:hover { border-color:var(--brand-400); }
  .mark .glyph { font-size:15px; font-weight:800; line-height:1; }
  .state-label { flex:0 0 auto; align-self:center; font-size:11px; font-weight:700; letter-spacing:.05em;
                 text-transform:uppercase; color:var(--ink-400); white-space:nowrap; }

  .item[data-state="pass"] { background:var(--good-bg); border-color:var(--good-br); }
  .item[data-state="pass"] .mark { background:var(--good-fg); border-color:var(--good-fg); }
  .item[data-state="pass"] .glyph { color:#fff; }
  .item[data-state="pass"] .glyph::before { content:"\\2713"; }
  .item[data-state="pass"] .state-label { color:var(--good-fg); }
  .item[data-state="pass"] .t { color:var(--ink-800); }

  .item[data-state="fail"] { background:var(--bad-bg); border-color:var(--bad-br); }
  .item[data-state="fail"] .mark { background:var(--bad-fg); border-color:var(--bad-fg); }
  .item[data-state="fail"] .glyph { color:#fff; }
  .item[data-state="fail"] .glyph::before { content:"\\2715"; }
  .item[data-state="fail"] .state-label { color:var(--bad-fg); }

  .item.hidden { display:none; }

  .foot { margin-top:44px; padding-top:20px; border-top:1px solid var(--ink-200); font-size:13px; color:var(--ink-500); }

  @media (max-width:560px) {
    .state-label { display:none; }
    .hero-lbl { margin-left:0; width:100%; }
  }
  @media print {
    body { background:#fff; }
    .bar, .toc { display:none; }
    .item, .meter, .how { break-inside:avoid; }
  }
</style>
</head>
<body data-total="${total}">
<div class="wrap">

  <div class="masthead">
    <h1>${esc(data.title)}</h1>
    <p class="sub">${rich(data.subtitle)}</p>
  </div>

  <div class="meter">
    <div class="meter-top">
      <span class="hero" id="done">0</span>
      <span class="hero-of">/ ${total} checks</span>
      <span class="hero-lbl" id="failnote"></span>
    </div>
    <div class="track"><div class="fill" id="fill"></div></div>
  </div>

  <div class="bar">
    <button class="btn" type="button" id="f-all" aria-pressed="true">All</button>
    <button class="btn" type="button" id="f-todo" aria-pressed="false">Not tested</button>
    <button class="btn" type="button" id="f-fail" aria-pressed="false">Failed</button>
    <span class="spacer"></span>
    <button class="btn" type="button" id="copy">Copy report</button>
    <button class="btn ghost" type="button" id="print">Print</button>
    <button class="btn ghost" type="button" id="reset">Reset</button>
  </div>

  <div class="how">
    <h2>How to test</h2>
    <ol>${data.principles.map((p) => `<li>${rich(p)}</li>`).join('')}</ol>
  </div>

  <nav class="toc">
    ${data.sections.map((s) => `<a href="#${s.id}">${esc(s.name)} <i>${s.items.length}</i></a>`).join('')}
  </nav>

  ${sectionsHtml}

  <p class="foot">
    Progress lives in this page only &mdash; a reload clears it, so use <strong>Copy report</strong>
    before you close the tab. The markdown twin of this list is versioned at
    <code>docs/qa/QA_CHECKLIST.md</code>; both are generated from
    <code>docs/qa/checklist.json</code>.
  </p>
</div>

<script>
(function () {
  var NEXT = { todo: 'pass', pass: 'fail', fail: 'todo' };
  var WORD = { todo: 'not tested', pass: 'pass', fail: 'FAIL' };
  var items = Array.prototype.slice.call(document.querySelectorAll('.item'));
  var total = Number(document.body.dataset.total);
  var filter = 'all';

  function refresh() {
    var done = 0, failed = 0;
    document.querySelectorAll('.sec').forEach(function (sec) {
      var kids = sec.querySelectorAll('.item');
      var n = 0;
      kids.forEach(function (li) { if (li.dataset.state !== 'todo') n += 1; });
      sec.querySelector('.sc-done').textContent = String(n);
      sec.classList.toggle('done', n === kids.length);
    });
    items.forEach(function (li) {
      if (li.dataset.state !== 'todo') done += 1;
      if (li.dataset.state === 'fail') failed += 1;
      var show = filter === 'all'
        || (filter === 'todo' && li.dataset.state === 'todo')
        || (filter === 'fail' && li.dataset.state === 'fail');
      li.classList.toggle('hidden', !show);
    });
    document.getElementById('done').textContent = String(done);
    document.getElementById('fill').style.width = (total ? (done / total) * 100 : 0) + '%';
    // The failure count is the number that decides whether you can ship, so it is stated
    // as a word and a number rather than left to the colour of a bar.
    document.getElementById('failnote').innerHTML =
      failed ? (failed === 1 ? '<b>1</b> failing check' : '<b>' + failed + '</b> failing checks')
             : (done === total && total ? 'all checks recorded, none failing' : '');
  }

  items.forEach(function (li) {
    var btn = li.querySelector('.mark');
    function cycle() {
      li.dataset.state = NEXT[li.dataset.state];
      li.querySelector('.state-label').textContent = WORD[li.dataset.state];
      btn.setAttribute('aria-label', WORD[li.dataset.state] + ': ' + li.querySelector('.t').textContent);
      refresh();
    }
    btn.addEventListener('click', cycle);
  });

  function setFilter(name) {
    filter = name;
    ['all', 'todo', 'fail'].forEach(function (k) {
      document.getElementById('f-' + k).setAttribute('aria-pressed', String(k === name));
    });
    refresh();
  }
  document.getElementById('f-all').addEventListener('click', function () { setFilter('all'); });
  document.getElementById('f-todo').addEventListener('click', function () { setFilter('todo'); });
  document.getElementById('f-fail').addEventListener('click', function () { setFilter('fail'); });
  document.getElementById('print').addEventListener('click', function () { window.print(); });
  document.getElementById('reset').addEventListener('click', function () {
    items.forEach(function (li) {
      li.dataset.state = 'todo';
      li.querySelector('.state-label').textContent = WORD.todo;
    });
    refresh();
  });

  /*
   * The report is markdown, and it leads with the failures. Anyone reading a QA result
   * wants the broken list first; "142 passed" is context, not news.
   */
  document.getElementById('copy').addEventListener('click', function () {
    var fails = [], todos = [], passed = 0;
    document.querySelectorAll('.sec').forEach(function (sec) {
      var name = sec.querySelector('h2').textContent;
      sec.querySelectorAll('.item').forEach(function (li) {
        var t = li.querySelector('.t').textContent;
        if (li.dataset.state === 'fail') fails.push('- **' + name + '** — ' + t);
        else if (li.dataset.state === 'todo') todos.push('- ' + name + ' — ' + t);
        else passed += 1;
      });
    });
    var out = ['# QA run — ' + document.title, ''];
    out.push('Passed ' + passed + ' · Failed ' + fails.length + ' · Not tested ' + todos.length +
             ' · of ' + total, '');
    if (fails.length) out.push('## Failing', '', fails.join('\\n'), '');
    if (todos.length) out.push('## Not tested', '', todos.join('\\n'), '');
    if (!fails.length && !todos.length) out.push('All ' + total + ' checks passed.', '');
    var text = out.join('\\n');
    var btn = document.getElementById('copy');
    function ok() { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy report'; }, 1400); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) { btn.textContent = 'Press Ctrl+C'; }
      document.body.removeChild(ta);
    }
  });

  refresh();
})();
</script>
</body>
</html>`;

writeFileSync(new URL('./qa-checklist.html', import.meta.url), html);
console.log(`${total} checks across ${data.sections.length} sections`);
data.sections.forEach((s) => console.log(`  ${String(s.items.length).padStart(3)}  ${s.name}`));
