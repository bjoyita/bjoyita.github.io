// I keep the calculations separate from the page controls.
export function pcaCloud(angle, width) {
  const a=angle*Math.PI/180;
  const points=Array.from({length:80},(_,i)=>{
    const t=2*Math.PI*i/80,x=Math.cos(t),y=width*Math.sin(t);
    return [x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)];
  });
  const mean=[0,1].map(j=>points.reduce((s,p)=>s+p[j],0)/points.length);
  let xx=0,xy=0,yy=0;
  for (const p of points) {const x=p[0]-mean[0],y=p[1]-mean[1];xx+=x*x;xy+=x*y;yy+=y*y;}
  xx/=79;xy/=79;yy/=79;
  const gap=Math.hypot(xx-yy,2*xy),large=(xx+yy+gap)/2,small=(xx+yy-gap)/2;
  return {points,mean,large,small,direction:.5*Math.atan2(2*xy,xx-yy),fraction:large/(large+small),degenerate:gap<1e-12};
}
export const trend=x=>120+70*x+25*Math.sin(2*Math.PI*x);
const deviations=[.5,-1,.8,-.4,1.1,-.8,.4,-1.2,.6,-.3,.9,-.6];
export function fitExample(degree,noise) {
  const x=Array.from({length:12},(_,i)=>i/11),y=x.map((v,i)=>trend(v)+noise*deviations[i]);
  // I fit powers of a centered coordinate with a QR factorization.
  const columns=Array.from({length:degree+1},(_,j)=>x.map(v=>(2*v-1)**j));
  const q=[],r=Array.from({length:degree+1},()=>Array(degree+1).fill(0));
  for(let j=0;j<=degree;j++){
    let v=columns[j].slice();
    for(let k=0;k<j;k++){r[k][j]=q[k].reduce((s,z,i)=>s+z*v[i],0);v=v.map((z,i)=>z-r[k][j]*q[k][i]);}
    r[j][j]=Math.hypot(...v);q.push(v.map(z=>z/r[j][j]));
  }
  const b=q.map(col=>col.reduce((s,z,i)=>s+z*y[i],0)),coeff=Array(degree+1).fill(0);
  for(let j=degree;j>=0;j--){let value=b[j];for(let k=j+1;k<=degree;k++)value-=r[j][k]*coeff[k];coeff[j]=value/r[j][j];}
  const predict=v=>coeff.reduce((s,c,j)=>s+c*(2*v-1)**j,0);
  const grid=Array.from({length:201},(_,i)=>i/200);
  const trainRMSE=Math.sqrt(x.reduce((s,v,i)=>s+(predict(v)-y[i])**2,0)/x.length);
  const trendRMSE=Math.sqrt(grid.reduce((s,v)=>s+(predict(v)-trend(v))**2,0)/grid.length);
  return {x,y,grid,predict,trainRMSE,trendRMSE,coeff};
}
export function compositionCount(elements,step){
  const q=100/step,k=elements-1;let answer=1;
  for(let i=1;i<=k;i++)answer=answer*(q+i)/i;
  return Math.round(answer);
}
