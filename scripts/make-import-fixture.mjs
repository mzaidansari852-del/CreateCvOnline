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

const browser2 = await puppeteer.launch({ executablePath: CHROME, headless: true });
/*
 * A second template, deliberately unlike the first.
 *
 * Sidebar down the left, section headings set *smaller* than the body text and in capitals,
 * entry titles set larger, dates right-aligned. This is the shape of this site's own PDF
 * export, and it broke every assumption the first fixture had validated — which is the
 * argument for keeping both.
 */
const sidebar = `<!doctype html><meta charset="utf-8"><style>
  @page { size: A4; margin: 12mm; }
  body { font-family: Arial, sans-serif; font-size: 7.9pt; line-height: 1.5; color: #111; margin: 0; }
  .wrap { display: flex; gap: 18mm; }
  .side { width: 46mm; flex: none; }
  .main { flex: 1; }
  h1 { font-size: 20.5pt; margin: 0 0 2mm; font-weight: 700; }
  h2 { font-size: 7.2pt; margin: 6mm 0 2mm; font-weight: 700; letter-spacing: 0.3px; text-transform: uppercase; }
  h3 { font-size: 8.3pt; margin: 4mm 0 0; font-weight: 700; }
  .meta { text-align: right; font-size: 7.2pt; color: #555; }
  p { margin: 1mm 0; }
</style>
<div class="wrap">
  <div class="side">
    <h2>Skills</h2>
    <p>Gestion de projet</p><p>Reporting KPI</p><p>Power BI</p><p>Excel</p>
    <h2>Languages</h2>
    <p>Arabe</p><p>Français</p>
  </div>
  <div class="main">
    <h1>Nadia Belhaj</h1>
    <p>nadia.belhaj@example.com 0612345678</p>
    <h2>Professional Summary</h2>
    <p>Coordinatrice de projet, huit ans dans la maintenance télécom et la conduite du changement.</p>
    <h2>Work Experience</h2>
    <h3>Cheffe de projet transverse</h3>
    <p class="meta">Nov 2024 – Present</p>
    <p>ORBINET MAROC</p>
    <p>Rabat</p>
    <p>•Assurer la maintenance curative du parc réseau mobile régional.</p>
    <h3>Coordinatrice Du Projet Corrective</h3>
    <p class="meta">Jul 2022 – Oct 2024</p>
    <p>TALVENT MAROC</p>
    <p>•Gestion et animation des techniciens de maintenance.</p>
    <h2>Education</h2>
    <h3>Master Management de Projet</h3>
    <p class="meta">2021 – 2022</p>
    <p>Institut Veranne</p>
  </div>
</div>`;

const page2 = await browser2.newPage();
await page2.setContent(sidebar, { waitUntil: 'load' });
writeFileSync('tests/fixtures/sidebar-en.pdf', await page2.pdf({ format: 'A4', printBackground: true }));
await browser2.close();
console.log('sidebar fixture written');

