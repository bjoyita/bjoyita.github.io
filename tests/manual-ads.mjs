import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const plan=JSON.parse(fs.readFileSync('tools/manual-ad-placements.json','utf8'));
test('Articles have exactly their planned manual placements and a single loader',()=>{
  for(const [path,breaks] of Object.entries(plan)) {
    const html=fs.readFileSync(path,'utf8');
    assert.ok(breaks.length===1||breaks.length===2,path);
    assert.equal((html.match(/data-ad-slot="4366045947"/g)||[]).length,breaks.length,path);
    assert.equal((html.match(/pagead\/js\/adsbygoogle\.js/g)||[]).length,1,path);
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
test('Homepage has one central placement and two wide-screen side units; policy pages stay ad-free',()=>{
  assert.equal((fs.readFileSync('index.html','utf8').match(/data-ad-slot=/g)||[]).length,3);
  for(const path of ['PrivacyPolicy.html','CookiePolicy.html','Copyright.html','Disclaimer.html','TermsofUse.html','blog_list.html','tutorial_list.html','EvMetrics.html','Tut_dataset.html']) {
    assert.doesNotMatch(fs.readFileSync(path,'utf8'),/data-ad-slot=/,path);
  }
});

import vm from 'node:vm';
const homeCode=fs.readFileSync('assets/explorer/home-ads.js','utf8');
function homeEnvironment(hostname,wide) {
  const units=Array.from({length:2},()=>({dataset:{},getBoundingClientRect:()=>({width:160})}));
  let resize;
  const media={matches:wide,addEventListener:(event,callback)=>{resize=callback;}};
  const window={location:{hostname},matchMedia:()=>media,adsbygoogle:[]};
  const context=vm.createContext({window,document:{querySelectorAll:()=>units}});
  vm.runInContext(homeCode,context);
  return {window,units,media,resize};
}
test('Homepage side ads are requested once on wide screens',()=>{
  const e=homeEnvironment('bjoyita.github.io',true);
  assert.equal(e.window.adsbygoogle.length,2);
  e.resize();assert.equal(e.window.adsbygoogle.length,2);
});
test('Small screens and local previews do not request side ads',()=>{
  assert.equal(homeEnvironment('bjoyita.github.io',false).window.adsbygoogle.length,0);
  assert.equal(homeEnvironment('127.0.0.1',true).window.adsbygoogle.length,0);
  const e=homeEnvironment('bjoyita.github.io',false);
  e.media.matches=true;e.resize();assert.equal(e.window.adsbygoogle.length,2);
});
