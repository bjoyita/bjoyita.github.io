const byId = id => document.getElementById(id);
const dot = (a, b) => a.reduce((sum, value, i) => sum + value * b[i], 0);
const multiply = (v, scale) => v.map(value => value * scale);
const clouds = await fetch('../assets/explorer/pca-preview/clouds.json').then(response => {
  if (!response.ok) throw new Error('The point data could not be loaded.');
  return response.json();
});
const chart = byId('cloud-chart');
const camera = {eye:{x:0.9, y:0.7, z:2.0}, projection:{type:'orthographic'}};
let model = clouds.grid;
let revealed = false;
let currentCamera = camera;
const colors = ['#c35e25', '#16826c', '#7757a5'];

// We keep the observations fixed and turn only the direction used for projection.
const plane = clouds.plane;
let showPC1 = false;
function drawProjection() {
  const degrees = Number(byId('line-angle').value);
  const radians = degrees * Math.PI / 180;
  const chosen = [Math.cos(radians), Math.sin(radians)];
  const scores = plane.points.map(point => dot(point, chosen));
  const variance = scores.reduce((sum,score)=>sum+score*score,0)/(scores.length-1);
  byId('line-angle-value').value = degrees;
  const X=x=>350+62*x, Y=y=>220-62*y;
  const line=(v,color,width=3)=>`<line x1="${X(-3.6*v[0])}" y1="${Y(-3.6*v[1])}" x2="${X(3.6*v[0])}" y2="${Y(3.6*v[1])}" stroke="${color}" stroke-width="${width}"/>`;
  let drawing = '<line x1="100" y1="220" x2="600" y2="220" stroke="#d3dedc"/><line x1="350" y1="20" x2="350" y2="420" stroke="#d3dedc"/>';
  // We show a few connectors to keep the picture readable, but project every point.
  for(let i=0;i<plane.points.length;i+=23) {
    const p=plane.points[i], q=multiply(chosen,scores[i]);
    drawing+=`<line x1="${X(p[0])}" y1="${Y(p[1])}" x2="${X(q[0])}" y2="${Y(q[1])}" stroke="#d4c797" stroke-width="1"/>`;
  }
  for(const p of plane.points) drawing+=`<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="2.3" fill="#36798d"/>`;
  drawing+=line(chosen,'#aa851c');
  if(showPC1) drawing+=line(plane.directions[0],'#c35e25',4);
  for(const score of scores) {
    const q=multiply(chosen,score);
    drawing+=`<circle cx="${X(q[0])}" cy="${Y(q[1])}" r="1.8" fill="#aa851c"/>`;
  }
  drawing+='<circle cx="350" cy="220" r="4" fill="#243c42"/><text x="350" y="457" text-anchor="middle">Coordinate 1 (dimensionless)</text><text transform="translate(25,220) rotate(-90)" text-anchor="middle">Coordinate 2 (dimensionless)</text>';
  byId('fixed-points').innerHTML=drawing;
  byId('line-strip').innerHTML='<line x1="30" y1="55" x2="670" y2="55" stroke="#a2aca9"/>'+
    scores.map((score,i)=>`<circle cx="${350+score*85}" cy="${35+(i%5)*8}" r="1.5" fill="#aa851c" opacity="0.7"/>`).join('')+
    '<text x="95" y="95" text-anchor="middle">−3</text><text x="350" y="95" text-anchor="middle">0</text><text x="605" y="95" text-anchor="middle">3</text>';
  byId('line-status').textContent=`Spread along your line (variance): ${variance.toFixed(3)}. Try another angle and compare.`;
  byId('pc1-status').textContent=showPC1 ?
    `PC1 is at ${((Math.atan2(plane.directions[0][1],plane.directions[0][0])*180/Math.PI+180)%180).toFixed(0)}°. Its variance is ${plane.variances[0].toFixed(3)}. Your line gives ${(100*variance/plane.variances[0]).toFixed(1)}% of that maximum. The blue observations have not moved.` : 'Make your prediction first.';
}
byId('line-angle').addEventListener('input',drawProjection);
byId('find-pc1').addEventListener('click',()=>{showPC1=true;drawProjection();});
byId('reset-line').addEventListener('click',()=>{showPC1=false;byId('line-angle').value=0;drawProjection();});
drawProjection();

function direction() {
  const azimuth = Number(byId('azimuth').value) * Math.PI / 180;
  const elevation = Number(byId('elevation').value) * Math.PI / 180;
  return [Math.cos(elevation)*Math.cos(azimuth),
    Math.cos(elevation)*Math.sin(azimuth), Math.sin(elevation)];
}

function pointsTrace(points, name, color, size=3, opacity=0.8) {
  return {type:'scatter3d', mode:'markers', name,
    x:points.map(p=>p[0]), y:points.map(p=>p[1]), z:points.map(p=>p[2]),
    marker:{size, color, opacity}, hovertemplate:
      'Coordinate 1: %{x:.2f}<br>Coordinate 2: %{y:.2f}<br>Coordinate 3: %{z:.2f}<extra>'+name+'</extra>'};
}

function lineTrace(vector, name, color, length=3.6) {
  const ends = [multiply(vector,-length), multiply(vector,length)];
  return {type:'scatter3d', mode:'lines', name,
    x:ends.map(p=>p[0]), y:ends.map(p=>p[1]), z:ends.map(p=>p[2]),
    line:{color,width:6}, hoverinfo:'name'};
}

function reconstruction(count) {
  return model.points.map(point => {
    const result=[0,0,0];
    for(let i=0;i<count;i++) {
      const score=dot(point,model.directions[i]);
      for(let j=0;j<3;j++) result[j]+=score*model.directions[i][j];
    }
    return result;
  });
}

function projectionStrip() {
  byId('azimuth-value').value=byId('azimuth').value;
  byId('elevation-value').value=byId('elevation').value;
  const strip=byId('projection-strip');
  if(!byId('show-line').checked) {
    strip.innerHTML='<text x="350" y="70" text-anchor="middle">Turn on the projection line to compare directions.</text>';
    byId('projection-status').textContent='First rotate the cloud and make your prediction.';
    return;
  }
  const scores=model.points.map(point=>dot(point,direction()));
  const variance=scores.reduce((sum,x)=>sum+x*x,0)/(scores.length-1);
  // We use a fixed horizontal scale so changing direction does not rescale the spread.
  strip.innerHTML='<line x1="30" y1="75" x2="670" y2="75" stroke="#899a9b"/>'+
    scores.map((score,i)=>`<circle cx="${350+score*85}" cy="${40+(i%8)*8}" r="1.6" fill="#8f7428" opacity="0.55"/>`).join('')+
    '<text x="350" y="128" text-anchor="middle">Position on the chosen line (dimensionless)</text>';
  byId('projection-status').textContent=`Projected variance: ${variance.toFixed(4)}. `+
    (revealed ? `This is ${(100*variance/model.variances[0]).toFixed(1)}% of the maximum along PC1.` : 'Try another direction. Can you find a larger value?');
}

async function draw() {
  const count=revealed ? Number(byId('components').value) : 3;
  const traces=[pointsTrace(model.points,'Original observations','#36798d',2.7,count<3?0.25:0.85)];
  if(revealed) for(let i=0;i<3;i++) traces.push(lineTrace(model.directions[i],`PC${i+1}`,colors[i]));
  if(byId('show-line').checked) traces.push(lineTrace(direction(),'My projection line','#9d7c16'));
  if(count<3) {
    const projected=reconstruction(count);
    traces.push(pointsTrace(projected,`Reconstruction with ${count} component${count>1?'s':''}`,'#c35e25',2.7,0.8));
    const x=[],y=[],z=[];
    const step=Math.ceil(model.points.length/48);
    for(let i=0;i<model.points.length;i+=step) {
      for(const p of [model.points[i],projected[i]]) {x.push(p[0]);y.push(p[1]);z.push(p[2]);}
      x.push(null);y.push(null);z.push(null);
    }
    traces.push({type:'scatter3d',mode:'lines',x,y,z,line:{color:'#aab3b7',width:2},name:'Reconstruction distances',showlegend:false,hoverinfo:'skip'});
  }
  const axis=i=>({title:{text:`Coordinate ${i} (dimensionless)`},range:[-3.8,3.8],gridcolor:'#dce5e3',zerolinecolor:'#abbdb9'});
  await Plotly.react(chart,traces,{margin:{l:0,r:0,t:15,b:0},height:510,
    paper_bgcolor:'#ffffff',font:{family:'Arial, sans-serif',color:'#203443'},
    legend:{orientation:'h',x:0,y:1.02},uirevision:byId('arrangement').value,
    scene:{xaxis:axis(1),yaxis:axis(2),zaxis:axis(3),aspectmode:'cube',dragmode:'orbit',camera:currentCamera}},
    {responsive:true,displaylogo:false,scrollZoom:true,modeBarButtonsToRemove:['toImage']});
  byId('reconstruction-controls').hidden=!revealed;
  byId('reveal').textContent=revealed?'Hide principal components':'Reveal principal components';
  byId('cloud-status').textContent=revealed ?
    `PC1: ${(100*model.fractions[0]).toFixed(1)}%, PC2: ${(100*model.fractions[1]).toFixed(1)}%, PC3: ${(100*model.fractions[2]).toFixed(1)}% of the variance. ${count===3?'Original points remain unchanged.':`Reconstruction retains ${(100*model.fractions.slice(0,count).reduce((a,b)=>a+b,0)).toFixed(1)}% of the variance.`}` :
    `${model.points.length.toLocaleString()} discrete observations fill the volume. Drag to rotate. Look from several directions before revealing PCA.`;
  projectionStrip();
}

await draw();
byId('optional-3d').addEventListener('toggle',()=>{
  if(byId('optional-3d').open) Plotly.Plots.resize(chart);
});
chart.on('plotly_relayout',event=>{if(event['scene.camera']) currentCamera=event['scene.camera'];});
byId('reveal').addEventListener('click',()=>{revealed=!revealed; draw();});
byId('reset-view').addEventListener('click',()=>{currentCamera=camera; Plotly.relayout(chart,{'scene.camera':camera});});
byId('arrangement').addEventListener('change',()=>{
  model=clouds[byId('arrangement').value];revealed=false;currentCamera=camera;
  byId('components').value=3;byId('show-line').checked=false;draw();
});
for(const id of ['show-line','azimuth','elevation','components']) byId(id).addEventListener('input',draw);
