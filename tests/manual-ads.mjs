import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const plan=JSON.parse(fs.readFileSync('tools/manual-ad-placements.json','utf8'));
test('Articles have exactly their planned manual placements and a single loader',()=>{
  for(const [path,breaks] of Object.entries(plan)) {
    const html=fs.readFileSync(path,'utf8');
    assert.ok(breaks.length===2||breaks.length===4,path);
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
test('Homepage has three placements between sections; policy pages stay ad-free',()=>{
  assert.equal((fs.readFileSync('index.html','utf8').match(/data-ad-slot=/g)||[]).length,3);
  assert.doesNotMatch(fs.readFileSync('index.html','utf8'),/home-side-ad|home-ads\.js/);
  for(const path of ['PrivacyPolicy.html','CookiePolicy.html','Copyright.html','Disclaimer.html','TermsofUse.html','blog_list.html','tutorial_list.html','EvMetrics.html','Tut_dataset.html']) {
    assert.doesNotMatch(fs.readFileSync(path,'utf8'),/data-ad-slot=/,path);
  }
});
