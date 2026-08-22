import puppeteer from 'puppeteer-core';
import { existsSync, writeFileSync } from 'node:fs';

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((candidate) => existsSync(candidate));

// Reproduces the *layout* that broke the parser — headings 1pt above body, dates and cities
// right-aligned, bullet glyphs with no space — with entirely invented content.
const html = `<!doctype html><meta charset="utf-8"><style>
  @page { size: A4; margin: 18mm 14mm; }
  body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.35; color: #111; }
  h1 { font-size: 19pt; margin: 0; font-weight: 700; }
  .title { font-size: 15pt; margin: 4px 0 10px; color: #234; }
  h2 { font-size: 12pt; margin: 18px 0 6px; font-weight: 700; letter-spacing: .3px; }
  .row { display: flex; justify-content: space-between; }
  .right { text-align: right; }
  p { margin: 2px 0; }
</style>
<h1>Nadia Belhaj</h1>
<div class="title">Coordinatrice De Projet</div>
<p>nadia.belhaj@example.com 0612345678 Rabat Maroc</p>

<h2>Profile</h2>
<p>Coordinatrice de projet, huit ans dans la maintenance télécom et la conduite du changement.
Pilotage de prestataires, reporting KPI et suivi budgétaire sur des parcs multi-sites.</p>

<h2>EXPERIENCE PROFESIONNELLE</h2>
<div class="row"><span>Cheffe de projet transverse (ORBINET MAROC)</span><span>11/2024 – present</span></div>
<p>•Assurer la maintenance curative du parc réseau mobile régional (2100 sites).</p>
<div class="row"><span>•Suivi de la maintenance préventive et respect du planning établi.</span><span class="right">RABAT</span></div>
<p>•Gestion et élaboration des tableaux de bord et rapports des KPI.</p>

<div class="row"><span>Coordinatrice Du Projet Corrective &amp; Préventive, TALVENT MAROC</span><span>07/2022 – 10/2024</span></div>
<p>•Assurer la maintenance curative du parc réseau mobile national (800 sites).</p>
<div class="row"><span>•Gestion et animation des techniciens de maintenance selon les régions.</span><span class="right">Rabat, Maroc</span></div>

<h2>FORMATION</h2>
<div class="row"><span>Master Management de Projet, Institut Veranne</span><span>09/2021 – 07/2022</span></div>
<div class="right">Rabat</div>
<div class="row"><span>Licence Génie Logiciel Web et Mobiles,</span><span>2018 – 2020</span></div>
<p>École nationale des sciences appliquées Meknès.</p>
<div class="right">Meknès, Maroc</div>

<h2>COMPÉTENCES TECHNIQUES</h2>
<p>Gestion de projet, Reporting KPI, Power BI, Excel avancé</p>

<h2>COMPÉTENCES LINGUISTIQUES</h2>
<p>Arabe</p><p>Langue Maternelle.</p><p>Français</p><p>Langue Professionnel</p><p>Anglais</p><p>Langue Professionnel</p>

<h2>Centre d'Intérêt</h2>
<p>Randonnée Photographie Échecs</p>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
const pdf = await page.pdf({ format: 'A4', printBackground: true });
writeFileSync('tests/fixtures/two-column-fr.pdf', pdf);
await browser.close();
console.log('fixture written');
