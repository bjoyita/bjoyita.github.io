const slider = document.getElementById('stress-angle');
const picture = document.getElementById('stress-picture');

// We resolve the traction on one side of a plane under horizontal tension.
export function stresses(angle) {
  const radians = angle * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return { cosine, sine, normal: 100 * cosine * cosine, shear: 100 * sine * cosine };
}

function drawPlane() {
  const angle = Number(slider.value);
  const { cosine: c, sine: s, normal, shear } = stresses(angle);
  document.getElementById('stress-angle-value').value = `${angle}°`;
  const cx = 350, cy = 225, scale = 1.2;
  let drawing = '<defs><marker id="stress-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="context-stroke"/></marker></defs>';
  drawing += '<rect x="140" y="115" width="420" height="225" rx="8" fill="#f1f7f5" stroke="#a1b9b1"/><text x="350" y="35" text-anchor="middle">Horizontal tension: 100 MPa</text>';
  drawing += '<path d="M135,85 H65" fill="none" stroke="#334a57" stroke-width="3" marker-end="url(#stress-arrow)"/><path d="M565,85 H635" fill="none" stroke="#334a57" stroke-width="3" marker-end="url(#stress-arrow)"/>';
  drawing += `<line x1="${cx-90*s}" y1="${cy-90*c}" x2="${cx+90*s}" y2="${cy+90*c}" stroke="#334a57" stroke-width="5"/>`;
  drawing += '<text x="165" y="365">Dark line: internal plane (seen edge-on)</text>';
  // We draw the normal direction separately from the stress arrows.
  drawing += `<line x1="${cx}" y1="${cy}" x2="${cx+95*c}" y2="${cy-95*s}" stroke="#3976aa" stroke-width="2" stroke-dasharray="5 5" marker-end="url(#stress-arrow)"/>`;
  drawing += `<text x="${cx+110*c}" y="${cy-110*s-9}" fill="#3976aa">normal</text>`;
  const normalEnd = [cx+scale*normal*c, cy-scale*normal*s];
  const totalEnd = [cx+scale*100*c, cy];
  if (normal > 0.001) drawing += `<line x1="${cx}" y1="${cy}" x2="${normalEnd[0]}" y2="${normalEnd[1]}" stroke="#177c58" stroke-width="5" marker-end="url(#stress-arrow)"/>`;
  if (shear > 0.001) drawing += `<line x1="${normalEnd[0]}" y1="${normalEnd[1]}" x2="${totalEnd[0]}" y2="${totalEnd[1]}" stroke="#cf6424" stroke-width="4" marker-end="url(#stress-arrow)"/>`;
  if (c > 0.0001) drawing += `<line x1="${cx}" y1="${cy}" x2="${totalEnd[0]}" y2="${totalEnd[1]}" stroke="#76529b" stroke-width="2" marker-end="url(#stress-arrow)"/>`;
  drawing += '<circle cx="350" cy="225" r="4" fill="#334a57"/><text x="65" y="397" fill="#177c58">Green: normal stress</text><text x="285" y="397" fill="#cf6424">Orange: shear stress</text><text x="505" y="397" fill="#76529b">Purple: traction</text>';
  picture.innerHTML = drawing;
  const message = angle === 0 || angle === 90 ? 'This is a principal plane: shear traction is zero.' : 'The traction has both a normal and a shear component.';
  document.getElementById('stress-results').textContent = `Normal angle ${angle}°. Normal stress ${normal.toFixed(1)} MPa. Shear-stress magnitude ${shear.toFixed(1)} MPa. ${message}`;
}
slider.addEventListener('input', drawPlane);
for (const [id, angle] of [['stress-principal',0],['stress-diagonal',45],['stress-transverse',90]]) {
  document.getElementById(id).addEventListener('click', () => {
    slider.value = angle;
    drawPlane();
  });
}
drawPlane();
