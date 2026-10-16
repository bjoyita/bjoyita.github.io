import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const plan=JSON.parse(fs.readFileSync('tools/manual-ad-placements.json','utf8'));
test('Articles have exactly their planned manual placements and a single loader',()=>{
  for(const [path,breaks] of Object.entries(plan)) {
    const html=fs.readFileSync(path,'utf8');
    assert.ok(breaks.length===2||breaks.length===4,path);
    assert.equal((html.match(/data-ad-slot="4366045947"/g)||[]).length,breaks.length,path);
    assert.equal((html.match(/src="\/assets\/explorer\/ad-loader\.js\?v=20261016-live-only"/g)||[]).length,1,path);
    assert.doesNotMatch(html,/src="https:\/\/pagead2\.googlesyndication\.com/,path);
    assert.match(html,/ads\.css\?v=20261016-manual/,path);
    for(let number=1;number<=breaks.length;number++) {
      assert.equal((html.match(new RegExp(`id="article-ad-${number}"`,'g'))||[]).length,1,path);
      const pos=html.indexOf(`id="article-ad-${number}"`);
      const before=html.slice(0,pos).toLowerCase();
      assert.ok(before.lastIndexOf('<pre')<=before.lastIndexOf('</pre>'),`${path}: ad inside code`);
    }
    assert.doesNotMatch(html,/enable_page_level_ads|google_vignette|google-auto-placed|fundingchoicesmessages/,path);
  }
});
test('Homepage has three placements between sections; policy pages stay ad-free',()=>{
  assert.equal((fs.readFileSync('index.html','utf8').match(/data-ad-slot=/g)||[]).length,3);
  assert.doesNotMatch(fs.readFileSync('index.html','utf8'),/home-side-ad|home-ads\.js/);
  for(const path of ['PrivacyPolicy.html','CookiePolicy.html','Copyright.html','Disclaimer.html','TermsofUse.html','blog_list.html','tutorial_list.html','EvMetrics.html','Tut_dataset.html']) {
    assert.doesNotMatch(fs.readFileSync(path,'utf8'),/data-ad-slot=|ad-loader\.js|pagead\/js\/adsbygoogle\.js/,path);
  }
});

import vm from 'node:vm';
const loaderCode=fs.readFileSync('assets/explorer/ad-loader.js','utf8');
function loaderEnvironment(hostname,hasPlacements=true) {
  const scripts=[];
  const placements=[{style:{}},{style:{}}];
  const queue=[{},{}];
  const window={location:{hostname},adsbygoogle:queue};
  const document={
    querySelectorAll:()=>placements,
    querySelector:()=>hasPlacements?placements[0]:null,
    getElementById:id=>scripts.find(s=>s.id===id),
    createElement:()=>({}),
    head:{appendChild:s=>scripts.push(s)}
  };
  return {context:vm.createContext({window,document}),scripts,placements,window,queue};
}
test('Only the live domain loads Google once and preserves the placement queue',()=>{
  const e=loaderEnvironment('bjoyita.github.io');
  vm.runInContext(loaderCode,e.context);
  vm.runInContext(loaderCode,e.context);
  assert.equal(e.scripts.length,1);
  assert.equal(e.scripts[0].src,'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8357043682630159');
  assert.equal(e.scripts[0].async,true);
  assert.equal(e.scripts[0].crossOrigin,'anonymous');
  assert.equal(e.window.adsbygoogle,e.queue);
  assert.equal(e.queue.length,2);
});
test('Local previews and other hosts never load AdSense',()=>{
  for(const host of ['127.0.0.1','localhost','::1','','preview.example','bjoyita.github.io.example']) {
    const e=loaderEnvironment(host);
    vm.runInContext(loaderCode,e.context);
    assert.equal(e.scripts.length,0,host);
    assert.ok(e.placements.every(p=>p.style.display==='none'),host);
  }
});
test('Pages without placements never load AdSense, even on the live domain',()=>{
  const e=loaderEnvironment('bjoyita.github.io',false);
  vm.runInContext(loaderCode,e.context);
  assert.equal(e.scripts.length,0);
});
