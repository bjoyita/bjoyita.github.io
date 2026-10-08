// I keep the pattern generation and PCA calculation separate from the controls.
export const palette = [
  {name: 'Violet', color: '#8b5cf6'},
  {name: 'Indigo', color: '#4f46e5'},
  {name: 'Blue', color: '#3b82f6'},
  {name: 'Green', color: '#22c55e'},
  {name: 'Yellow', color: '#facc15'},
  {name: 'Orange', color: '#fb923c'},
  {name: 'Red', color: '#ef4444'},
  {name: 'White', color: '#ffffff'}
];

export function activePalette(colors) {
  return [...palette.slice(0, colors - 1), palette[7]];
}

export function randomNumbers(seed) {
  let state = seed >>> 0;
  return function nextNumber() {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function makePattern(size, colors, kind, width, seed) {
  const random = randomNumbers(seed);
  const labels = Array.from({length: size}, () => Array(size).fill(0));
  const offset = Math.floor(random() * colors);
  const centers = [];
  if (kind === 'clustered') {
    const count = Math.max(colors, Math.round(size * size / (width * width)));
    for (let i = 0; i < count; i++) {
      centers.push({row: random() * size, column: random() * size, label: i % colors});
    }
  }
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      let label = offset;
      if (kind === 'random') label = Math.floor(random() * colors);
      if (kind === 'horizontal') label = (Math.floor(row / width) + offset) % colors;
      if (kind === 'vertical') label = (Math.floor(column / width) + offset) % colors;
      if (kind === 'diagonal') label = (Math.floor((row + column) / width) + offset) % colors;
      if (kind === 'checkerboard') {
        const alternate = (Math.floor(row / width) + Math.floor(column / width)) % 2;
        label = alternate === 0 ? 0 : colors - 1;
      }
      if (kind === 'clustered') {
        let nearest = Infinity;
        for (const center of centers) {
          const distance = (row - center.row) ** 2 + (column - center.column) ** 2;
          if (distance < nearest) {
            nearest = distance;
            label = center.label;
          }
        }
      }
      labels[row][column] = label;
    }
  }
  return labels;
}

export function rotatePattern(labels) {
  const size = labels.length;
  return Array.from({length: size}, (_, row) =>
    Array.from({length: size}, (_, column) => labels[size - 1 - column][row]));
}

// I use one feature for each color at each column, rather than assigning an order to colors.
export function encodeRows(labels, colors) {
  const size = labels.length;
  const rows = Array.from({length: size}, () => Array(size * colors).fill(0));
  for (let row = 0; row < size; row++) {
    for (let column = 0; column < size; column++) {
      rows[row][column * colors + labels[row][column]] = 1;
    }
  }
  return rows;
}

// I diagonalize the small symmetric row Gram matrix with Jacobi rotations.
export function symmetricEigen(matrix) {
  const size = matrix.length;
  const values = matrix.map(row => row.slice());
  const vectors = Array.from({length: size}, (_, row) =>
    Array.from({length: size}, (_, column) => Number(row === column)));
  let converged = false;
  for (let iteration = 0; iteration < 50 * size * size; iteration++) {
    let first = 0, second = 1, largest = 0;
    for (let row = 0; row < size; row++) {
      for (let column = row + 1; column < size; column++) {
        if (Math.abs(values[row][column]) > largest) {
          largest = Math.abs(values[row][column]);
          first = row;
          second = column;
        }
      }
    }
    const scale = Math.max(1, ...values.map((row, i) => Math.abs(row[i])));
    if (largest < 1e-13 * scale) {
      converged = true;
      break;
    }
    const angle = 0.5 * Math.atan2(2 * values[first][second],
      values[second][second] - values[first][first]);
    const cosine = Math.cos(angle), sine = Math.sin(angle);
    const a = values[first][first], b = values[second][second];
    const coupling = values[first][second];
    for (let row = 0; row < size; row++) {
      if (row !== first && row !== second) {
        const x = values[row][first], y = values[row][second];
        values[row][first] = values[first][row] = cosine * x - sine * y;
        values[row][second] = values[second][row] = sine * x + cosine * y;
      }
      const x = vectors[row][first], y = vectors[row][second];
      vectors[row][first] = cosine * x - sine * y;
      vectors[row][second] = sine * x + cosine * y;
    }
    values[first][first] = cosine * cosine * a - 2 * sine * cosine * coupling + sine * sine * b;
    values[second][second] = sine * sine * a + 2 * sine * cosine * coupling + cosine * cosine * b;
    values[first][second] = values[second][first] = 0;
  }
  if (!converged) throw new Error('The PCA calculation did not converge.');
  const order = Array.from({length: size}, (_, i) => i)
    .sort((a, b) => values[b][b] - values[a][a]);
  return {
    eigenvalues: order.map(i => Math.max(0, values[i][i])),
    vectors: order.map(i => vectors.map(row => row[i]))
  };
}

export function analyzePattern(labels, colors) {
  const rows = encodeRows(labels, colors);
  const size = rows.length, features = rows[0].length;
  const mean = Array(features).fill(0);
  for (const row of rows) {
    for (let feature = 0; feature < features; feature++) mean[feature] += row[feature] / size;
  }
  const centered = rows.map(row => row.map((value, feature) => value - mean[feature]));
  const gram = Array.from({length: size}, () => Array(size).fill(0));
  for (let row = 0; row < size; row++) {
    for (let column = row; column < size; column++) {
      let dot = 0;
      for (let feature = 0; feature < features; feature++) {
        dot += centered[row][feature] * centered[column][feature];
      }
      gram[row][column] = gram[column][row] = dot;
    }
  }
  const {eigenvalues, vectors} = symmetricEigen(gram);
  const total = eigenvalues.reduce((sum, value) => sum + value, 0);
  const rebuilt = rows.map(() => mean.slice());
  const states = [];
  function recordState(count) {
    let error = 0, correct = 0;
    const recovered = Array.from({length: size}, () => Array(size).fill(0));
    for (let row = 0; row < size; row++) {
      for (let feature = 0; feature < features; feature++) {
        error += (rows[row][feature] - rebuilt[row][feature]) ** 2;
      }
      for (let column = 0; column < size; column++) {
        let best = 0;
        for (let color = 1; color < colors; color++) {
          if (rebuilt[row][column * colors + color] > rebuilt[row][column * colors + best]) best = color;
        }
        recovered[row][column] = best;
        if (best === labels[row][column]) correct++;
      }
    }
    const retained = eigenvalues.slice(0, count).reduce((sum, value) => sum + value, 0);
    states.push({count, rows: rebuilt.map(row => row.slice()), labels: recovered,
      rmse: Math.sqrt(error / (size * features)), correct,
      fraction: total < 1e-12 ? null : Math.min(1, retained / total)});
  }
  recordState(0);
  for (let component = 0; component < size - 1; component++) {
    const vector = vectors[component];
    const pattern = Array(features).fill(0);
    for (let feature = 0; feature < features; feature++) {
      for (let row = 0; row < size; row++) pattern[feature] += vector[row] * centered[row][feature];
    }
    for (let row = 0; row < size; row++) {
      for (let feature = 0; feature < features; feature++) rebuilt[row][feature] += vector[row] * pattern[feature];
    }
    recordState(component + 1);
  }
  return {size, colors, labels, mean, eigenvalues, states,
    exact: states.find(state => state.rmse < 1e-8).count,
    phase: states.find(state => state.correct === size * size).count};
}
