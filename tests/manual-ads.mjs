import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const plan=JSON.parse(fs.readFileSync('tools/manual-ad-placements.json','utf8'));
test('Articles have exactly their planned manual placements and a single loader',()=>{
  for(const [path,breaks] of Object.entries(plan)) {
    const html=fs.readFileSync(path,'utf8');
    assert.ok(breaks.length===2||breaks.length===4,path);
    assert.equal((html.match(/data-ad-slot="4366045947"/g)||[]).length,breaks.length,path);
    assert.equal((html.match(/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/g)||[]).length,1,path);

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
test('Homepage has three placements between sections; policy pages have no display placements',()=>{
  assert.equal((fs.readFileSync('index.html','utf8').match(/data-ad-slot=/g)||[]).length,3);
  assert.doesNotMatch(fs.readFileSync('index.html','utf8'),/home-side-ad|home-ads\.js/);
  for(const path of ['PrivacyPolicy.html','CookiePolicy.html','Copyright.html','Disclaimer.html','TermsofUse.html','blog_list.html','tutorial_list.html','EvMetrics.html','Tut_dataset.html']) {
    assert.doesNotMatch(fs.readFileSync(path,'utf8'),/data-ad-slot=|ad-loader\.js/,path);
  }
});

import {execFileSync} from 'node:child_process';
test('Every published page has one original asynchronous Google tag in its head',()=>{
  const pages=execFileSync('git',['ls-files','*.html'],{encoding:'utf8'}).trim().split('\n');
  let count=0;
  for(const path of pages) {
    const html=fs.readFileSync(path,'utf8');
    if(!/<head\b/i.test(html)) continue;
    const head=html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
    assert.ok(head,path);
    const tag='<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8357043682630159" crossorigin="anonymous"></script>';
    assert.ok(head.includes(tag),path);
    assert.equal(html.split('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js').length-1,1,path);
    assert.doesNotMatch(html,/ad-loader\.js/,path);
    count++;
  }
  assert.equal(count,40);
  assert.equal(fs.existsSync('assets/explorer/ad-loader.js'),false);
});
