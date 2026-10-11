import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const code = fs.readFileSync('assets/explorer/analytics.js', 'utf8');
function environment(hostname) {
    const scripts = [];
    const window = {location: {hostname, href: 'https://' + hostname + '/posts/pca-materials.html'}};
    const document = {title: 'PCA for materials data', head: {appendChild: s => scripts.push(s)}, createElement: () => ({})};
    return {context: vm.createContext({window, document}), window, scripts};
}
test('One loader and one configuration, even when evaluated twice', () => {
    const e = environment('bjoyita.github.io');
    vm.runInContext(code, e.context);
    vm.runInContext(code, e.context);
    assert.equal(e.scripts.length, 1);
    assert.equal(e.window.dataLayer.length, 2);
    const config = e.window.dataLayer[1];
    assert.equal(config[0], 'config');
    assert.equal(config[1], 'G-SPPQKTW0JB');
    assert.equal(config[2].page_title, 'PCA for materials data');
    assert.equal(config[2].page_location, e.window.location.href);
});
test('Local previews do not send analytics', () => {
    const e = environment('127.0.0.1');
    vm.runInContext(code, e.context);
    assert.equal(e.scripts.length, 0);
    assert.equal(e.window.dataLayer, undefined);
});
test('Every published content page has one shared deferred tag and a title', () => {
    const pages = execFileSync('git', ['ls-files', '*.html'], {encoding:'utf8'}).trim().split('\n');
    let count = 0;
    for (const path of pages) {
        const html = fs.readFileSync(path, 'utf8');
        if (!/<head\b/i.test(html)) continue; // I leave Google's verification file unchanged.
        assert.equal((html.match(/src="\/assets\/explorer\/analytics\.js\?v=20261011"/g) || []).length, 1, path);
        assert.match(html, /<script defer src="\/assets\/explorer\/analytics\.js/, path);
        assert.match(html, /<title>[^<]+<\/title>/i, path);
        assert.doesNotMatch(html, /googletagmanager\.com|gtag\s*\(/, path);
        count++;
    }
    assert.equal(count, 40);
});
