// I use the same saved PCA results as the tested NumPy notebook.
const byId = id => document.getElementById(id);

function color(value, signed = false, limit = 1) {
  if (!signed) {
    const level = Math.round(255 * Math.max(0, Math.min(1, value)));
    return `rgb(${level},${level},${level})`;
  }
  const fraction = Math.min(1, Math.abs(value) / limit);
  const pale = Math.round(255 * (1 - fraction));
  return value < 0 ? `rgb(${pale},${pale},255)` : `rgb(255,${pale},${pale})`;
}

function panel(title, values, signed = false, limit = 1) {
  let cells = '';
  for (let row = 0; row < 6; row++) {
    for (let column = 0; column < 6; column++) {
      const value = values[row][column];
      cells += `<rect x="${35 + 30 * column}" y="${10 + 30 * row}" width="30" height="30" fill="${color(value, signed, limit)}" stroke="#899aab" stroke-width="0.4"><title>Row ${row}, column ${column}: ${value.toFixed(4)}</title></rect>`;
    }
  }
  for (let index = 0; index < 6; index++) {
    cells += `<text x="${50 + 30 * index}" y="207" text-anchor="middle">${index}</text>`;
    cells += `<text x="23" y="${30 + 30 * index}" text-anchor="end">${index}</text>`;
  }
  return `<figure><figcaption>${title}</figcaption><svg viewBox="0 0 235 235" role="img" aria-label="${title}: six rows and six columns">${cells}<text x="125" y="230" text-anchor="middle">Column index</text></svg></figure>`;
}

function update(data) {
  const sample = Number(byId('sample').value);
  const rank = Number(byId('rank').value);
  const original = data.images[sample];
  const reconstructed = data.reconstructions[String(rank)][sample];
  const residual = original.map((row, i) => row.map((value, j) => value - reconstructed[i][j]));
  let squaredError = 0;
  for (const row of residual) {
    for (const value of row) squaredError += value * value;
  }
  const rmse = Math.sqrt(squaredError / 36);
  byId('sample-value').value = sample;
  byId('rank-value').value = rank;
  byId('panels').innerHTML = panel('Original image', original) + panel(`${rank}-component reconstruction`, reconstructed) + panel('Residual', residual, true, 0.4);
  byId('readout').textContent = `Image ${sample}. Brightness RMSE: ${rmse < 1e-12 ? 'less than 10⁻¹²' : rmse.toFixed(5)} (dimensionless). Component scores: ${data.scores[sample].map(v => v.toFixed(3)).join(', ')} (dimensionless).`;
}

try {
  const response = await fetch(new URL('./data.json', import.meta.url));
  if (!response.ok) throw new Error('Pixel data could not be loaded.');
  const data = await response.json();
  byId('components').innerHTML = panel('Mean image', data.mean) + panel('First component weights', data.components[0], true, 1 / 6) + panel('Second component weights', data.components[1], true, 1 / 6);
  byId('sample').addEventListener('input', () => update(data));
  byId('rank').addEventListener('input', () => update(data));
  byId('reset').addEventListener('click', () => {
    byId('sample').value = 3;
    byId('rank').value = 1;
    update(data);
  });
  update(data);
} catch (error) {
  byId('readout').textContent = 'The interactive data could not load. Reload the page, or use the downloadable notebook below.';
}
