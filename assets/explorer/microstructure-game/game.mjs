import {activePalette, makePattern, rotatePattern, analyzePattern} from './model.mjs';

// I hold the current challenge locally. No guesses are sent to a server.
const byId = id => document.getElementById(id);
let analysis;
let timer = null;
let revealed = false;
let exploring = false;
let settings;

function stopAnimation() {
  if (timer !== null) clearInterval(timer);
  timer = null;
  byId('animate').textContent = 'Play components';
}

function patternPanel(title, labels, mode = 'phase', state = null) {
  const size = labels.length;
  const colors = activePalette(analysis.colors);
  let cells = '';
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      let fill = colors[labels[row][column]].color;
      let description = colors[labels[row][column]].name;
      if (mode === 'mismatch') {
        const wrong = labels[row][column] !== analysis.labels[row][column];
        fill = wrong ? '#fb923c' : '#f1f5f4';
        description = wrong ? 'Incorrect pixel color' : 'Correct pixel color';
      }
      if (mode === 'blend') {
        const rgb = [0, 0, 0];
        for (let color = 0; color < analysis.colors; color++) {
          const weight = state.rows[row][column * analysis.colors + color];
          const hex = colors[color].color;
          for (let channel = 0; channel < 3; channel++) {
            rgb[channel] += weight * parseInt(hex.slice(1 + 2 * channel, 3 + 2 * channel), 16);
          }
        }
        fill = `rgb(${rgb.map(value => Math.round(Math.max(0, Math.min(255, value)))).join(',')})`;
        description = 'Blended reconstruction weights';
      }
      const cell = 240 / size;
      cells += `<rect x="${column * cell}" y="${row * cell}" width="${cell}" height="${cell}" fill="${fill}" stroke="#253f4533" stroke-width="0.25"><title>Row ${row}, column ${column}: ${description}</title></rect>`;
    }
  }
  return `<figure><figcaption>${title}</figcaption><svg viewBox="0 0 240 240" role="img" aria-label="${title}, ${size} by ${size} pixels">${cells}</svg></figure>`;
}

function showReconstruction() {
  const count = Number(byId('retained').value);
  const state = analysis.states[count];
  if (!exploring) {
    byId('panels').innerHTML = '';
    byId('readout').textContent = 'Make a guess, or choose to explore, to see the reconstruction.';
    byId('progress').value = 0;
    return;
  }
  byId('retained-value').value = count;
  byId('panels').innerHTML = patternPanel('Original pattern', analysis.labels) +
    patternPanel(`${count}-component reconstruction`, state.labels, byId('display').value, state) +
    patternPanel('Incorrect pixel colors', state.labels, 'mismatch');
  const fraction = state.fraction === null ? 'No variation after centering' : `${(100 * state.fraction).toFixed(2)}% of variation retained`;
  const error = state.rmse < 1e-12 ? 'less than 10⁻¹²' : state.rmse.toFixed(5);
  byId('readout').textContent = `${state.correct} of ${analysis.size ** 2} pixel colors recovered. One-hot RMSE: ${error} (dimensionless). ${fraction}.`;
  byId('progress').value = state.correct;
  byId('progress').max = analysis.size ** 2;
  byId('progress').setAttribute('aria-label', `${state.correct} of ${analysis.size ** 2} pixel colors recovered`);
}

function prepareChallenge(labels) {
  stopAnimation();
  analysis = analyzePattern(labels, settings.colors);
  revealed = false;
  exploring = false;
  byId('retained').max = analysis.size - 1;
  byId('retained').value = 0;
  byId('retained-value').value = 0;
  byId('retained').disabled = true;
  byId('animate').disabled = true;
  byId('guess').innerHTML = '<option value="">Choose a number</option>' +
    analysis.states.map(state => `<option value="${state.count}">${state.count}</option>`).join('');
  byId('verdict').textContent = 'Make a prediction before exploring, or skip the guess.';
  byId('answer').hidden = true;
  const used = new Set(labels.flat());
  byId('legend').innerHTML = activePalette(settings.colors).map((color, i) =>
    `<span class="game-swatch${used.has(i) ? '' : ' unused'}"><i style="background:${color.color}"></i>${color.name}${used.has(i) ? '' : ' (unused)'}</span>`).join('');
  byId('settings-readout').textContent = `${analysis.size} × ${analysis.size} pixels; ${used.size} colors used; seed ${settings.seed}. The data table has ${analysis.size} rows and ${analysis.size * analysis.colors} one-hot feature columns.`;
  byId('original-preview').innerHTML = patternPanel('Your generated pattern', analysis.labels);
  showReconstruction();
}

function generate() {
  const seed = Number(byId('seed').value);
  if (!Number.isInteger(seed) || seed < 0 || seed > 999999) {
    byId('settings-readout').textContent = 'Choose an integer seed from 0 to 999999.';
    return;
  }
  settings = {size: Number(byId('size').value), colors: Number(byId('colors').value),
    kind: byId('kind').value, width: Number(byId('width').value), seed};
  prepareChallenge(makePattern(settings.size, settings.colors, settings.kind, settings.width, settings.seed));
}

function unlock() {
  exploring = true;
  byId('retained').disabled = false;
  byId('animate').disabled = false;
  showReconstruction();
}

function showAnswer() {
  revealed = true;
  unlock();
  byId('answer').hidden = false;
  byId('answer').textContent = `Minimum for exact numerical reconstruction: ${analysis.exact} components (one-hot RMSE below 10⁻⁸). Minimum for all pixel colors: ${analysis.phase} components. These two answers need not agree. The mean row is always kept separately.`;
}

byId('generator').addEventListener('submit', event => {event.preventDefault(); generate();});
byId('new-seed').addEventListener('click', () => {
  byId('seed').value = (Number(byId('seed').value) + 1) % 1000000;
  generate();
});
byId('rotate').addEventListener('click', () => {
  prepareChallenge(rotatePattern(analysis.labels));
  byId('settings-readout').textContent += ' Rotated 90 degrees clockwise.';
});
byId('check').addEventListener('click', () => {
  if (byId('guess').value === '') {
    byId('verdict').textContent = 'Choose a component count first.';
    return;
  }
  const guess = Number(byId('guess').value);
  const minimum = byId('goal').value === 'exact' ? analysis.exact : analysis.phase;
  byId('verdict').textContent = guess === minimum ?
    `Your guess is right: ${minimum} components is the minimum for this target.` :
    `You chose ${guess}. The minimum for this target is ${minimum}. Try your count with the slider and compare.`;
  showAnswer();
  byId('retained').value = guess;
  showReconstruction();
});
byId('reveal').addEventListener('click', showAnswer);
byId('explore').addEventListener('click', () => {
  unlock();
  byId('verdict').textContent = 'Explore freely. The answer stays hidden until you check a guess or reveal it.';
});
byId('goal').addEventListener('change', () => {
  byId('verdict').textContent = 'The target changed. Choose a guess for this target.';
  byId('guess').value = '';
  if (!revealed) byId('answer').hidden = true;
});
byId('retained').addEventListener('input', () => {stopAnimation(); showReconstruction();});
byId('display').addEventListener('change', showReconstruction);
byId('animate').addEventListener('click', () => {
  if (timer !== null) {stopAnimation(); return;}
  byId('retained').value = 0;
  showReconstruction();
  byId('animate').textContent = 'Pause';
  timer = setInterval(() => {
    const next = Number(byId('retained').value) + 1;
    byId('retained').value = next;
    showReconstruction();
    if (next >= analysis.size - 1) stopAnimation();
  }, 600);
});
byId('reset-reconstruction').addEventListener('click', () => {
  stopAnimation();
  byId('retained').value = 0;
  showReconstruction();
});
try {generate();} catch (error) {
  byId('settings-readout').textContent = 'The calculation could not finish. Reload the page or use the notebook below.';
}
