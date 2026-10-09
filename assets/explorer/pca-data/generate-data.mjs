import fs from 'node:fs';
let state = 110;
function random() {
  state = (Math.imul(1664525, state) + 1013904223) >>> 0;
  return state / 4294967296;
}
function noise(scale) { return scale * (2 * random() - 1); }
function rounded(value) { return Math.round(value * 10) / 10; }
const headers = ['Specimen', 'Mean grain size (μm)', 'Yield strength (MPa)',
  'Ultimate tensile strength (MPa)', 'Elongation at fracture (%)',
  'Electrical conductivity (MS/m)'];
const rows = [];
for (let i = 0; i < 300; i++) {
  const first = random();
  const second = random();
  const grain = 12 + 58 * first + noise(3);
  const yieldStrength = 310 - 110 * first - 20 * second + noise(12);
  const tensileStrength = yieldStrength + 145 + 20 * second + noise(10);
  const elongation = 18 + 13 * first - 3 * second + noise(1.5);
  const conductivity = 24 + 3 * first + 4 * second + noise(0.8);
  rows.push([`S${String(i + 1).padStart(3, '0')}`, ...[grain, yieldStrength,
    tensileStrength, elongation, conductivity].map(rounded)]);
}

fs.writeFileSync('materials-pca-synthetic.csv', [headers, ...rows].map(row => row.join(',')).join('\n') + '\n');
