const picture = document.getElementById('direction-picture');
const slider = document.getElementById('direction-progress');
const play = document.getElementById('direction-play');
const theta = Math.PI / 6;
const first = [Math.cos(theta), Math.sin(theta)];
const second = [-Math.sin(theta), Math.cos(theta)];
let revealed = false;
let frame = null;
let started = null;
let startingProgress = 0;

// We double the part along the first direction and retain the perpendicular part.
function transform(point, progress) {
  const alongFirst = point[0] * first[0] + point[1] * first[1];
  return point.map((value, i) => value + progress * alongFirst * first[i]);
}
function draw() {
  const progress = Number(slider.value) / 100;
  const X = x => 350 + 60 * x;
  const Y = y => 250 - 60 * y;
  let drawing = '<defs><marker id="direction-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="context-stroke"/></marker></defs>';
  drawing += '<path d="M30,250 H670 M350,20 V480" stroke="#c8d5d2"/>';
  for (let i = -8; i <= 8; i++) {
    for (let j = -8; j <= 8; j++) {
      const original = [i / 4, j / 4];
      const moved = transform(original, progress);
      drawing += `<circle cx="${X(original[0])}" cy="${Y(original[1])}" r="2" fill="#c9d2d0"/>`;
      drawing += `<circle cx="${X(moved[0])}" cy="${Y(moved[1])}" r="2.5" fill="#246d80"/>`;
    }
  }
  if (revealed) {
    for (const [direction, color] of [[first, '#c75827'], [second, '#197957']]) {
      drawing += `<line x1="${X(-3*direction[0])}" y1="${Y(-3*direction[1])}" x2="${X(3*direction[0])}" y2="${Y(3*direction[1])}" stroke="${color}" stroke-width="2"/>`;
      const tip = transform(direction, progress);
      drawing += `<line x1="350" y1="250" x2="${X(tip[0])}" y2="${Y(tip[1])}" stroke="${color}" stroke-width="4" marker-end="url(#direction-arrow)"/>`;
    }
  }
  // We also show an arrow that does turn, for comparison.
  const blueTip = transform([1, 0], progress);
  drawing += `<line x1="350" y1="250" x2="${X(blueTip[0])}" y2="${Y(blueTip[1])}" stroke="#605ba4" stroke-width="3" marker-end="url(#direction-arrow)"/>`;
  drawing += '<circle cx="350" cy="250" r="3" fill="#203443"/><text x="675" y="272" text-anchor="end">horizontal coordinate</text><text x="365" y="24">vertical coordinate</text>';
  picture.innerHTML = drawing;
  document.getElementById('direction-progress-value').value = `${Math.round(progress*100)}%`;
  document.getElementById('direction-status').textContent = revealed
    ? `Orange arrow: length ${(1+progress).toFixed(2)} units; direction stays at 30°. Green arrow: length 1.00 unit; direction stays at 120°. Purple arrow turns from 0° to ${(Math.atan2(blueTip[1],blueTip[0])*180/Math.PI).toFixed(1)}°. At the final position, the orange and green eigenvalues are 2 and 1.`
    : 'Watch the purple arrow turn. Can we find other directions where arrows remain along their original lines? Pause the animation or use the slider, then reveal the directions.';
}
function pause() {
  if (frame !== null) cancelAnimationFrame(frame);
  frame = null;
  started = null;
  play.textContent = 'Play';
}
function animate(time) {
  if (started === null) started = time;
  const progress = Math.min(100, startingProgress + (time-started)/40);
  slider.value = progress;
  draw();
  if (progress < 100) frame = requestAnimationFrame(animate);
  else pause();
}
play.addEventListener('click', () => {
  if (frame !== null) { pause(); return; }
  if (Number(slider.value) >= 100) slider.value = 0;
  startingProgress = Number(slider.value);
  started = null;
  play.textContent = 'Pause';
  frame = requestAnimationFrame(animate);
});
slider.addEventListener('input', () => { pause(); draw(); });
document.getElementById('direction-reset').addEventListener('click', () => {
  pause(); slider.value = 0; revealed = false;
  document.getElementById('direction-reveal').textContent = 'Reveal the directions';
  draw();
});
document.getElementById('direction-reveal').addEventListener('click', () => {
  revealed = !revealed;
  document.getElementById('direction-reveal').textContent = revealed ? 'Hide the directions' : 'Reveal the directions';
  draw();
});
draw();
