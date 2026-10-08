import fs from 'node:fs';
// I compare the browser calculation with the saved NumPy reference.
import {makePattern, rotatePattern, analyzePattern} from './model.mjs';
const cases=JSON.parse(fs.readFileSync(new URL('./pattern-reference.json', import.meta.url),'utf8'));
let largestError=0,labelCountDifferences=0;
for(const reference of cases){
 let labels=makePattern(reference.size,reference.colors,reference.kind,reference.width,reference.seed);
 if(reference.rotated)labels=rotatePattern(labels);
 if(JSON.stringify(labels)!==JSON.stringify(reference.labels))throw Error('Generator mismatch');
 const data=analyzePattern(labels,reference.colors);
 if(data.exact!==reference.exact)throw Error('Numerical rank mismatch');
 if(data.phase!==reference.phase)labelCountDifferences++;
 for(let k=0;k<data.states.length;k++){
  const difference=Math.abs(data.states[k].rmse-reference.errors[k]);
  largestError=Math.max(largestError,difference);
  if(difference>1e-8)throw Error('Reconstruction error mismatch');
  if(k&&data.states[k].rmse>data.states[k-1].rmse+1e-10)throw Error('Error increased');
 }
}
const report={cases:cases.length,largestRMSEDifference:largestError,generatorsMatch:true,numericalRanksMatch:true,labelCountDifferences,explanation:'Label recovery can depend on the valid PCA basis within tied variance groups and on floating-point ties. The game reports its own basis.'};
fs.writeFileSync(new URL('./validation.json', import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(report);
