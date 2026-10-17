import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

// I check every published page, leaving the Google verification file unchanged.
test('Every published page has one original Analytics library and one configuration', () => {
    const pages = execFileSync('git', ['ls-files', '*.html'], {encoding:'utf8'}).trim().split('\n');
    let count = 0;
    for (const path of pages) {
        const html = fs.readFileSync(path, 'utf8');
        if (!/<head\b/i.test(html)) continue;
        const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
        assert.ok(head, path);
        const library = '<script async src="https://www.googletagmanager.com/gtag/js?id=G-SPPQKTW0JB"></script>';
        assert.ok(head.includes(library), path);
        assert.equal((html.match(/googletagmanager\.com\/gtag\/js/g) || []).length, 1, path);
        assert.equal((html.match(/gtag\('config', 'G-SPPQKTW0JB'\)/g) || []).length, 1, path);
        assert.doesNotMatch(html, /assets\/explorer\/analytics\.js|gtm\.js|materialsDataAnalyticsStarted/, path);
        assert.match(head, /<title>[^<]+<\/title>/i, path);

        // I execute only the inline configuration in isolation, without making requests.
        const inline = [...head.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
            .map(match => match[1]).filter(code => code.includes("gtag('config'"));
        assert.equal(inline.length, 1, path);
        const context = vm.createContext({});
        vm.runInContext('window = this;', context);
        vm.runInContext(inline[0], context);
        assert.equal(context.dataLayer.length, 2, path);
        assert.equal(context.dataLayer[0][0], 'js', path);
        assert.equal(context.dataLayer[1][0], 'config', path);
        assert.equal(context.dataLayer[1][1], 'G-SPPQKTW0JB', path);
        count++;
    }
    assert.equal(count, 40);
});
