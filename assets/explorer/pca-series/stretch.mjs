const slider = document.getElementById('stretch');
const picture = document.getElementById('stretch-picture');
function drawSheet() {
  const factor = Number(slider.value);
  document.getElementById('stretch-value').value = factor.toFixed(2);
  const scale = 15;
  let drawing = '<defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto-start-reverse"><path d="M0,0 L7,3.5 L0,7 Z" fill="context-stroke"/></marker></defs>';
  // We draw the original and transformed arrows with the same length scale.
  for (const [center, stretch, title] of [[170, 1, 'Before stretching'], [510, factor, 'After stretching']]) {
    drawing += `<text x="${center}" y="28" text-anchor="middle">${title}</text>`;
    drawing += `<rect x="${center-5*scale*stretch}" y="${175-5*scale}" width="${10*scale*stretch}" height="${10*scale}" fill="#edf6f4" stroke="#93b3ac"/>`;
    drawing += `<path d="M${center-5*scale*stretch},175 H${center+5*scale*stretch} M${center},${175-5*scale} V${175+5*scale}" stroke="#cad8d5"/>`;
    for (const [x, y, color] of [[2,0,'#216b9a'],[0,2,'#177c58'],[2,2,'#d36625']]) {
      drawing += `<line x1="${center}" y1="175" x2="${center+x*scale*stretch}" y2="${175-y*scale}" stroke="${color}" stroke-width="3" marker-end="url(#arrow)"/>`;
    }
    drawing += `<circle cx="${center}" cy="175" r="3" fill="#203443"/><text x="${center}" y="313" text-anchor="middle">Width ${(10*stretch).toFixed(1)} cm; height 10 cm</text>`;
  }
  picture.innerHTML = drawing;
  const diagonal = Math.hypot(2*factor,2);
  const angle = Math.atan2(2,2*factor)*180/Math.PI;
  document.getElementById('stretch-results').textContent = `After stretching: horizontal arrow ${(2*factor).toFixed(2)} cm; vertical arrow 2.00 cm. Diagonal parts (${(2*factor).toFixed(2)}, 2.00) cm; length ${diagonal.toFixed(2)} cm; angle ${angle.toFixed(1)}° above horizontal.`;
}
slider.addEventListener('input', drawSheet);
document.getElementById('stretch-reset').addEventListener('click', () => {
  slider.value = 2;
  drawSheet();
});
drawSheet();
