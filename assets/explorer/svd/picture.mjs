// I add the saved numerical SVD layers without changing their values.
const byId = id => document.getElementById(id);
let timer = null;

function stop() {
  if (timer !== null) clearInterval(timer);
  timer = null;
  byId('play').textContent = 'Play layers';
}

function panel(title, values, signed = false) {
  let pixels = '';
  for (let row = 0; row < 8; row++) {
    for (let column = 0; column < 8; column++) {
      const value = values[row][column];
      let color;
      if (signed) {
        const pale = Math.round(255 * (1 - Math.min(1, Math.abs(value))));
        color = value < 0 ? `rgb(${pale},${pale},255)` : `rgb(255,${pale},${pale})`;
      } else {
        const gray = Math.round(255 * Math.max(0, Math.min(1, value)));
        color = `rgb(${gray},${gray},${gray})`;
      }
      pixels += `<rect x="${column * 25 + 10}" y="${row * 25 + 10}" width="25" height="25" fill="${color}" stroke="#899aab" stroke-width="0.4"><title>Row ${row}, column ${column}: ${value.toFixed(4)}</title></rect>`;
    }
  }
  return `<figure><figcaption>${title}</figcaption><svg viewBox="0 0 220 220" role="img" aria-label="${title}: eight by eight pixels">${pixels}</svg></figure>`;
}

function update(data) {
  const count = Number(byId('layer-count').value);
  const rebuilt = data.reconstructions[count];
  const added = count === 0 ? data.original.map(row => row.map(() => 0)) : data.layers[count - 1];
  let error = 0;
  for (let row = 0; row < 8; row++) {
    for (let column = 0; column < 8; column++) {
      error += (rebuilt[row][column] - data.original[row][column])**2;
    }
  }
  const rmse = Math.sqrt(error / 64);
  byId('layer-value').value = count;
  byId('panels').innerHTML = panel('Original picture', data.original) + panel(`Rebuilt with ${count} layer${count === 1 ? '' : 's'}`, rebuilt) + panel(count ? `Layer ${count} just added` : 'No layer added yet', added, true);
  byId('readout').textContent = `${count} layer${count === 1 ? '' : 's'} retained. Brightness RMSE: ${rmse < 1e-12 ? 'less than 10⁻¹²' : rmse.toFixed(5)} (dimensionless).`;
}

try {
  const response = await fetch(new URL('./data.json', import.meta.url));
  if (!response.ok) throw new Error('Picture data could not load.');
  const data = await response.json();
  byId('layer-count').addEventListener('input', () => { stop(); update(data); });
  byId('reset').addEventListener('click', () => { stop(); byId('layer-count').value = 1; update(data); });
  byId('play').addEventListener('click', () => {
    if (timer !== null) { stop(); return; }
    byId('layer-count').value = 0;
    update(data);
    byId('play').textContent = 'Pause';
    timer = setInterval(() => {
      byId('layer-count').value = Number(byId('layer-count').value) + 1;
      update(data);
      if (Number(byId('layer-count').value) === 4) stop();
    }, 1100);
  });
  update(data);
} catch (error) {
  byId('readout').textContent = 'The picture could not load. Reload the page, or try the downloadable Python example below.';
  byId('play').disabled = true;
}
