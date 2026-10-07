import {pcaCloud,fitExample,trend,compositionCount} from './models.mjs';
const byId=id=>document.getElementById(id);
const line=(x1,y1,x2,y2,color,width=2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}"/>`;
const text=(x,y,value,anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}">${value}</text>`;
const path=(points,color)=>`<path d="${points.map((p,i)=>(i?'L':'M')+p.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="3"/>`;
const circle=(x,y,color)=>`<circle cx="${x}" cy="${y}" r="4" fill="${color}"/>`;
const number=id=>Number(byId(id).value);
function updatePCA(){
  const angle=number('angle'),width=number('width'),m=pcaCloud(angle,width);
  byId('angle-value').value=angle;byId('width-value').value=width.toFixed(2);
  const X=x=>320+x*170,Y=y=>220-y*170;
  let svg=line(85,220,555,220,'#c7d5d3')+line(320,25,320,415,'#c7d5d3');
  for(const p of m.points)svg+=circle(X(p[0]),Y(p[1]),'#7898ab');
  if(!m.degenerate){
    for(const [theta,scale,color] of [[m.direction,1,'#d86836'],[m.direction+Math.PI/2,width,'#08776f']]){
      svg+=line(X(-scale*Math.cos(theta)),Y(-scale*Math.sin(theta)),X(scale*Math.cos(theta)),Y(scale*Math.sin(theta)),color,4);
    }
  }
  svg+=text(320,450,'Descriptor 1 (dimensionless)')+`<text transform="translate(20,220) rotate(-90)" text-anchor="middle">Descriptor 2 (dimensionless)</text>`;
  byId('chart').innerHTML=svg;
  byId('readout').textContent=m.degenerate?'Both directions explain 50% of the variance. There is no unique first principal direction.':`First direction: ${(100*m.fraction).toFixed(1)}% of the variance. Second direction: ${(100*(1-m.fraction)).toFixed(1)}%.`;
}
function updateFit(){
  const degree=number('degree'),noise=number('noise'),m=fitExample(degree,noise);
  byId('degree-value').value=degree;byId('noise-value').value=noise;
  const values=[...m.y,...m.grid.map(m.predict),...m.grid.map(trend)];
  const low=Math.floor((Math.min(...values)-10)/20)*20,high=Math.ceil((Math.max(...values)+10)/20)*20;
  const X=x=>70+520*x,Y=y=>390-340*(y-low)/(high-low);
  let svg=line(70,50,70,390,'#90aaa7')+line(70,390,590,390,'#90aaa7');
  for(let i=0;i<=4;i++){const v=low+(high-low)*i/4;svg+=line(70,Y(v),590,Y(v),'#edf2f1',1)+text(60,Y(v)+4,v.toFixed(0),'end');}
  for(let i=0;i<=5;i++)svg+=text(X(i/5),415,(i/5).toFixed(1));
  svg+=path(m.grid.map(v=>[X(v),Y(trend(v))]),'#08776f')+path(m.grid.map(v=>[X(v),Y(m.predict(v))]),'#7954a3');
  for(let i=0;i<m.x.length;i++)svg+=circle(X(m.x[i]),Y(m.y[i]),'#d86836');
  svg+=text(330,450,'Composition fraction x (dimensionless)')+`<text transform="translate(20,220) rotate(-90)" text-anchor="middle">Vickers hardness H (HV)</text>`;
  byId('chart').innerHTML=svg;
  byId('readout').textContent=`Training RMSE: ${m.trainRMSE.toFixed(2)} HV. Trend RMSE: ${m.trendRMSE.toFixed(2)} HV. The vertical scale adjusts to include the fitted curve.`;
}
function updateCount(){
  const n=number('elements'),step=number('step'),count=compositionCount(n,step),total=count*number('temperatures')*number('durations');
  byId('readout').textContent=`${n} possible elements at ${step} at.% steps: ${count.toLocaleString()} composition candidates. Including the selected processing combinations: ${total.toLocaleString()} candidates.`;
}
// I reset the controls to the same example rather than generate new random data.
const post=document.body.dataset.post;
let update,defaults;
if(post==='pca-materials'){update=updatePCA;defaults={angle:30,width:.3};}
if(post==='fit-and-predict'){update=updateFit;defaults={degree:1,noise:8};}
if(post==='materials-design-space'){update=updateCount;defaults={elements:5,step:5,temperatures:4,durations:5};}
if(update){for(const id of Object.keys(defaults))byId(id).addEventListener('input',update);byId('reset').addEventListener('click',()=>{for(const [id,v]of Object.entries(defaults))byId(id).value=v;update();});update();}
