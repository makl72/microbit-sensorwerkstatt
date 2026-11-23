import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const out = new URL('../dist/grafiken/', import.meta.url);
mkdirSync(out, { recursive: true });
const assetData = filename => `data:image/svg+xml;base64,${Buffer.from(readFileSync(new URL(`../dist/assets/${filename}`, import.meta.url))).toString('base64')}`;
const microbitArtwork = assetData('microbit-drawing-2.svg');
const breadboardArtwork = assetData('fritzing-half-breadboard.svg');

const sensors = {
  ldr: { title: 'LDR', rows: [['3V', 10], ['P0', 15], ['GND', 20]], parts: 'divider', upper: 'LDR', lower: '10 kΩ' },
  poti: { title: 'Potentiometer', rows: [['3V', 10], ['P0', 11], ['GND', 12]], parts: 'poti' },
  ntc: { title: 'NTC', rows: [['3V', 10], ['P0', 15], ['GND', 20]], parts: 'divider', upper: 'NTC 10 kΩ', lower: '10 kΩ' },
  ptc: { title: 'PTC', rows: [['3V', 10], ['P0', 15], ['GND', 20]], parts: 'divider', upper: 'KTY81/110', lower: '1 kΩ' },
  ir: { title: 'IR-Modul ST188', rows: [['3V', 10, 'VCC'], ['GND', 11, 'GND'], ['P0', 12, 'DOUT']], parts: 'ir' },
  ultra: { title: 'Ultraschall HC-SR04-33', rows: [['3V', 10, 'VCC'], ['GND', 11, 'GND'], ['P1', 12, 'TRIG'], ['P2', 13, 'ECHO']], parts: 'ultra' }
};

const wire = { '3V': '#e33b32', GND: '#1d252b', P0: '#f0b400', P1: '#30a568', P2: '#2688d8' };
const esc = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;');
const text = (x, y, value, size = 15, anchor = 'middle', fill = '#17323d', weight = 600) =>
  `<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" text-anchor="${anchor}" fill="${fill}" font-weight="${weight}">${esc(value)}</text>`;
const circle = (x, y, r, fill, stroke = 'none', sw = 1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const rect = (x, y, w, h, rx, fill, stroke = 'none', sw = 1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

function microbit(x = 40, y = 85) {
  const width = 330;
  const height = 266;
  const scale = width / 208.91206;
  const pinSourceX = { P0: 20.1, P1: 58.1, P2: 100.2, '3V': 142.6, GND: 180.1 };
  const pins = Object.fromEntries(Object.entries(pinSourceX).map(([name, px]) => [name, [x + px * scale, y + 148.0 * scale]]));
  const svg = `<g aria-label="Offizielle micro:bit-V2-Grafik"><image href="${microbitArtwork}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/></g>`;
  return { svg, pins };
}

function breadboard() {
  const x = 385, y = 112, width = 690;
  const scale = width / 245.037;
  const height = 151.2 * scale;
  let s = `<g aria-label="Originales Fritzing-Half-Breadboard"><image href="${breadboardArtwork}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/>`;
  const holes = {};
  const sourceY = { a: 36, b: 43.2, c: 50.4, d: 57.6, e: 64.8, f: 86.4, g: 93.6, h: 100.8, i: 108, j: 115.2 };
  for (let row = 1; row <= 30; row += 1) {
    const hx = x + (18.119 + (row - 1) * 7.2) * scale;
    for (const [letter, sy] of Object.entries(sourceY)) {
      holes[`${letter}${row}`] = [hx, y + sy * scale];
    }
  }
  return { svg: s + '</g>', holes };
}

function lead(x1, y1, x2, y2, color = '#596267', width = 3) {
  return `<path d="M${x1} ${y1} C${x1} ${(y1 + y2) / 2},${x2} ${(y1 + y2) / 2},${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
}

function wirePath(from, to, color, bend = 0) {
  return `<path d="M${from[0]} ${from[1]} C${from[0] + 70} ${from[1] + 65 + bend},${to[0] - 80} ${to[1] - 40 - bend},${to[0]} ${to[1]}" fill="none" stroke="#fff" stroke-width="9" opacity=".85"/><path d="M${from[0]} ${from[1]} C${from[0] + 70} ${from[1] + 65 + bend},${to[0] - 80} ${to[1] - 40 - bend},${to[0]} ${to[1]}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`;
}

function resistor(x, y1, y2, label) {
  const cy = (y1 + y2) / 2;
  return lead(x, y1, x, cy - 21) + rect(x - 9, cy - 21, 18, 42, 5, '#d8bd7f', '#715637', 2) +
    `<line x1="${x - 8}" y1="${cy - 10}" x2="${x + 8}" y2="${cy - 10}" stroke="#955b2d" stroke-width="4"/><line x1="${x - 8}" y1="${cy}" x2="${x + 8}" y2="${cy}" stroke="#222" stroke-width="4"/><line x1="${x - 8}" y1="${cy + 10}" x2="${x + 8}" y2="${cy + 10}" stroke="#d94738" stroke-width="4"/>` +
    lead(x, cy + 21, x, y2) + text(x + 17, cy + 5, label, 13, 'start');
}

function thermistor(x, y1, y2, label, kind) {
  const cy = (y1 + y2) / 2;
  if (kind === 'LDR') {
    let s = lead(x, y1, x, cy - 18) + circle(x, cy, 22, '#ead8a1', '#26343b', 3);
    s += `<path d="M${x - 12} ${cy - 8}l8-6l8 6l8-6M${x - 12} ${cy + 7}l8-6l8 6l8-6" fill="none" stroke="#6f4a22" stroke-width="3"/>`;
    s += `<path d="M${x + 27} ${cy - 25}l-12 12m18-5l-12 12" stroke="#e7a700" stroke-width="3"/>`;
    return s + lead(x, cy + 22, x, y2) + text(x + 30, cy + 5, label, 13, 'start');
  }
  return lead(x, y1, x, cy - 17) + rect(x - 9, cy - 17, 18, 34, 8, kind === 'NTC 10 kΩ' ? '#3c7188' : '#2d5571', '#183744', 2) +
    lead(x, cy + 17, x, y2) + text(x + 17, cy + 5, label, 13, 'start');
}

function resistorH(x1, y, x2, label) {
  const cx = (x1 + x2) / 2;
  return `<path d="M${x1} ${y}H${cx - 25}" stroke="#596267" stroke-width="3"/><rect x="${cx - 25}" y="${y - 9}" width="50" height="18" rx="5" fill="#d8bd7f" stroke="#715637" stroke-width="2"/><line x1="${cx - 13}" y1="${y - 8}" x2="${cx - 13}" y2="${y + 8}" stroke="#955b2d" stroke-width="4"/><line x1="${cx}" y1="${y - 8}" x2="${cx}" y2="${y + 8}" stroke="#222" stroke-width="4"/><line x1="${cx + 13}" y1="${y - 8}" x2="${cx + 13}" y2="${y + 8}" stroke="#d94738" stroke-width="4"/><path d="M${cx + 25} ${y}H${x2}" stroke="#596267" stroke-width="3"/>${text(cx, y - 17, label, 13)}`;
}

function thermistorH(x1, y, x2, label, kind) {
  const cx = (x1 + x2) / 2;
  if (kind === 'LDR') {
    return `<path d="M${x1} ${y}H${cx - 23}" stroke="#596267" stroke-width="3"/>${circle(cx, y, 22, '#ead8a1', '#26343b', 3)}<path d="M${cx - 12} ${y - 8}l8-6l8 6l8-6M${cx - 12} ${y + 7}l8-6l8 6l8-6" fill="none" stroke="#6f4a22" stroke-width="3"/><path d="M${cx + 27} ${y - 25}l-12 12m18-5l-12 12" stroke="#e7a700" stroke-width="3"/><path d="M${cx + 23} ${y}H${x2}" stroke="#596267" stroke-width="3"/>${text(cx, y - 31, label, 13)}`;
  }
  return `<path d="M${x1} ${y}H${cx - 22}" stroke="#596267" stroke-width="3"/><rect x="${cx - 22}" y="${y - 10}" width="44" height="20" rx="9" fill="${kind === 'NTC 10 kΩ' ? '#3c7188' : '#2d5571'}" stroke="#183744" stroke-width="2"/><path d="M${cx + 22} ${y}H${x2}" stroke="#596267" stroke-width="3"/>${text(cx, y - 17, label, 13)}`;
}

function moduleGraphic(kind, x, y) {
  if (kind === 'ultra') {
    let s = rect(x, y, 250, 125, 9, '#168c66', '#0b5c42', 3);
    for (const cx of [x + 68, x + 182]) s += circle(cx, y + 58, 44, '#b9c3c4', '#566469', 4) + circle(cx, y + 58, 31, '#6f7c80') + circle(cx, y + 58, 24, '#263236');
    ['VCC', 'TRIG', 'ECHO', 'GND'].forEach((v, i) => { s += circle(x + 36 + i * 58, y + 113, 6, '#d8ae37') + text(x + 36 + i * 58, y + 104, v, 10, 'middle', '#fff'); });
    return s;
  }
  let s = rect(x, y, 230, 115, 8, '#176c51', '#0c4d3a', 3);
  s += circle(x + 63, y + 51, 18, '#161f24') + circle(x + 114, y + 51, 18, '#6d8992') + circle(x + 180, y + 49, 14, '#3272a0') + `<path d="M${x + 180} ${y + 37}v24M${x + 168} ${y + 49}h24" stroke="#d5d8d4" stroke-width="2"/>`;
  ['VCC', 'GND', 'DOUT', 'AOUT'].forEach((v, i) => { s += circle(x + 30 + i * 55, y + 104, 6, '#d8ae37') + text(x + 30 + i * 55, y + 91, v, 10, 'middle', '#fff'); });
  return s;
}

function breadboardDiagram(key, spec) {
  const mb = microbit();
  const bb = breadboard();
  let s = mb.svg + bb.svg;
  spec.rows.forEach(([pin, row], index) => s += wirePath(mb.pins[pin], bb.holes[`a${row}`], wire[pin], index * 18 - 22));
  if (spec.parts === 'divider') {
    const upperA = bb.holes.c10, upperB = bb.holes.c15, lowerA = bb.holes.d15, lowerB = bb.holes.d20;
    s += thermistorH(upperA[0], upperA[1], upperB[0], spec.upper, spec.upper) + circle(upperA[0], upperA[1], 5, '#d7b13f') + circle(upperB[0], upperB[1], 5, '#d7b13f');
    s += resistorH(lowerA[0], lowerA[1], lowerB[0], spec.lower) + circle(lowerA[0], lowerA[1], 5, '#d7b13f') + circle(lowerB[0], lowerB[1], 5, '#d7b13f');
  } else if (spec.parts === 'poti') {
    const x = 640, y = 188;
    s += rect(x, y, 150, 105, 12, '#277099', '#153e58', 3) + circle(x + 75, y + 39, 27, '#35444b') + `<line x1="${x + 75}" y1="${y + 39}" x2="${x + 92}" y2="${y + 20}" stroke="#e6ecee" stroke-width="4"/>`;
    spec.rows.forEach(([, row], i) => s += lead(bb.holes[`c${row}`][0], bb.holes[`c${row}`][1], x + 42 + i * 33, y + 105, '#6d7678', 3));
    s += text(x + 75, y + 91, 'B10K', 14, 'middle', '#fff');
  } else {
    const x = spec.parts === 'ultra' ? 735 : 755, y = 6;
    s += moduleGraphic(spec.parts, x, y);
    spec.rows.forEach(([,, port], i) => {
      const ultraPortX = { VCC: 36, TRIG: 94, ECHO: 152, GND: 210 };
      const targetX = spec.parts === 'ultra' ? x + ultraPortX[port] : x + 30 + i * 55;
      const hole = bb.holes[`c${spec.rows[i][1]}`];
      s += lead(hole[0], hole[1], targetX, y + (spec.parts === 'ultra' ? 113 : 104), wire[spec.rows[i][0]], 4);
    });
  }
  return svgWrap(`${spec.title} auf dem Breadboard`, s, 'Breadboard-Aufbau: farbige Leitungen führen von den beschrifteten micro:bit-Pins zu genau markierten Steckreihen.');
}

function clip(x, y, color, flip = false) {
  const dir = flip ? -1 : 1;
  return `<g transform="translate(${x} ${y}) scale(${dir} 1)"><path d="M0-8h30l24-14v44l-24-14H0z" fill="${color}" stroke="#172229" stroke-width="2"/><circle cx="17" cy="0" r="4" fill="#d7dde0"/><path d="M54-22l24 9v26l-24 9z" fill="#b9c0c3" stroke="#555f63" stroke-width="2"/></g>`;
}

function directDiagram(key, spec) {
  const mb = microbit(60, 105);
  let s = mb.svg;
  if (spec.parts === 'divider') {
    const x = 700, yTop = 160, yMid = 310, yBottom = 465;
    s += thermistor(x, yTop, yMid, spec.upper, spec.upper) + resistor(x, yMid, yBottom, spec.lower);
    s += text(700, 80, 'Spannungsteiler', 22);
    const points = { '3V': [x, yTop], P0: [x, yMid], GND: [x, yBottom] };
    spec.rows.forEach(([pin], i) => { s += wirePath(mb.pins[pin], points[pin], wire[pin], i * 15) + clip(points[pin][0] - 80, points[pin][1], wire[pin]); });
  } else if (spec.parts === 'poti') {
    const x = 700, y = 190;
    s += rect(x, y, 210, 190, 18, '#277099', '#153e58', 4) + circle(x + 105, y + 70, 54, '#384a52') + `<line x1="${x + 105}" y1="${y + 70}" x2="${x + 138}" y2="${y + 32}" stroke="#ecf1f2" stroke-width="7"/>` + text(x + 105, y + 157, 'B10K', 20, 'middle', '#fff');
    const targets = [[x + 45, y + 190], [x + 105, y + 190], [x + 165, y + 190]];
    spec.rows.forEach(([pin], i) => { s += wirePath(mb.pins[pin], targets[i], wire[pin], i * 18) + clip(targets[i][0] - 70, targets[i][1], wire[pin]); });
  } else {
    const x = 695, y = spec.parts === 'ultra' ? 190 : 220;
    s += moduleGraphic(spec.parts, x, y) + text(x + (spec.parts === 'ultra' ? 125 : 115), y - 28, spec.title, 21);
    spec.rows.forEach(([pin,, port], i) => {
      const ultraPortX = { VCC: 36, TRIG: 94, ECHO: 152, GND: 210 };
      const target = [spec.parts === 'ultra' ? x + ultraPortX[port] : x + 30 + i * 55, y + (spec.parts === 'ultra' ? 113 : 104)];
      s += wirePath(mb.pins[pin], target, wire[pin], i * 16) + clip(target[0] - 72, target[1], wire[pin]);
      s += text(target[0], target[1] + 31, port, 12);
    });
  }
  return svgWrap(`${spec.title} direkt am micro:bit`, s, 'Direktaufbau mit Krokodilklemmen an den großen goldenen Pins des micro:bit.');
}

function svgWrap(title, body, description) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 650" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(description)}</desc><rect width="1100" height="650" rx="18" fill="#eef4f5"/><g>${body}</g></svg>`;
}

for (const [key, spec] of Object.entries(sensors)) {
  writeFileSync(new URL(`${key}-breadboard.svg`, out), breadboardDiagram(key, spec));
  writeFileSync(new URL(`${key}-direkt.svg`, out), directDiagram(key, spec));
}
