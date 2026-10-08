import importlib.util,json
from pathlib import Path
import numpy as np
# I compare several patterns, palettes and rotations with NumPy.
p=Path(__file__).with_name('microstructure-pca.py')
spec=importlib.util.spec_from_file_location('game',p);game=importlib.util.module_from_spec(spec);spec.loader.exec_module(game)
cases=[]
for size in [8,16,24]:
 for colors in [2,6,8]:
  for kind in ['uniform','vertical','horizontal','checkerboard','diagonal','clustered','random']:
   for seed,width in [(0,2),(42,3)]:
    labels=game.make_pattern(size,colors,kind,width,seed)
    for rotated in [False,True]:
     current=np.rot90(labels,-1) if rotated else labels
     data=game.analyze_pattern(current,colors)
     errors=np.array([s['rmse'] for s in data['states']])
     assert np.all(np.diff(errors)<=1e-12)
     assert errors[-1]<1e-8
     cases.append({'size':size,'colors':colors,'kind':kind,'width':width,'seed':seed,'rotated':rotated,'labels':current.tolist(),'errors':errors.tolist(),'exact':data['exact'],'phase':data['phase']})
Path(__file__).with_name('pattern-reference.json').write_text(json.dumps(cases))
print('NumPy reference:',len(cases),'cases, including rotations')
