"""I place manual ads at the reading breaks listed in manual-ad-placements.json.

Run from the repository root: python tools/place_manual_ads.py
Dependency: beautifulsoup4. I keep the surrounding HTML formatting unchanged.
"""
from pathlib import Path
import json
import re
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
PLAN = json.loads((ROOT / 'tools/manual-ad-placements.json').read_text())
LOADER = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8357043682630159" crossorigin="anonymous"></script>'


def placement(number):
    return f'''<aside class="article-ad" id="article-ad-{number}" aria-label="Advertisement">
  <p class="article-ad-label">Advertisement</p>
  <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-8357043682630159" data-ad-slot="4366045947" data-ad-format="auto" data-full-width-responsive="true"></ins>
  <script>(window.adsbygoogle = window.adsbygoogle || []).push({{}});</script>
</aside>\n'''


def update_page(path, breaks):
    html = path.read_text()
    html = re.sub(r'<aside\b(?=[^>]*class="[^"]*\barticle-ad\b)[^>]*>.*?</aside>[ \t]*\n?', '', html, flags=re.S)
    soup = BeautifulSoup(html, 'html.parser')
    lines = html.splitlines(keepends=True)
    edits = []
    for number, prefix in enumerate(breaks, 1):
        matches = [tag for tag in soup.find_all(['h2', 'h3', 'h4', 'h5', 'p'])
                   if tag.get_text(' ', strip=True).startswith(prefix)]
        if not matches:
            raise ValueError(f'{path.name}: reading break not found: {prefix}')
        target = matches[0]
        # I keep ads outside an interactive exercise, even when its heading is inside it.
        for parent in list(target.parents):
            classes = ' '.join(parent.get('class', [])).lower()
            if any(word in classes for word in ['playground', 'interactive', 'widget', 'controls', 'panel']):
                target = parent
        # I keep ads outside a paragraph that happens to wrap an older heading.
        if target.name != 'p' and target.parent.name == 'p':
            parent_offset = sum(len(line) for line in lines[:target.parent.sourceline - 1]) + target.parent.sourcepos
            target_offset = sum(len(line) for line in lines[:target.sourceline - 1]) + target.sourcepos
            parent_open_end = html.index('>', parent_offset) + 1
            if not html[parent_open_end:target_offset].strip():
                target = target.parent
        if any(parent.name in ['pre', 'code', 'table', 'figure', 'nav', 'details', 'aside']
               for parent in target.parents):
            raise ValueError(f'{path.name}: placement is inside an exercise or other content block')
        offset = sum(len(line) for line in lines[:target.sourceline - 1]) + target.sourcepos
        line_start = html.rfind('\n', 0, offset) + 1
        if not html[line_start:offset].strip():
            offset = line_start
        edits.append((offset, placement(number)))
    if len({offset for offset, _ in edits}) != len(breaks):
        raise ValueError(f'{path.name}: duplicate reading break')
    for offset, block in sorted(edits, reverse=True):
        html = html[:offset] + block + html[offset:]
    if 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js' not in html:
        html = html.replace('</head>', LOADER + '\n</head>', 1)
    if 'assets/explorer/ads.css' not in html:
        html = html.replace('</head>', '<link rel="stylesheet" href="/assets/explorer/ads.css?v=20261016-manual">\n</head>', 1)
    else:
        html = re.sub(r'ads\.css(?:\?[^"\s>]*)?', 'ads.css?v=20261016-manual', html)
    return html


if __name__ == '__main__':
    # I prepare every edit before writing, so a missing heading stops the update.
    updates = {ROOT / name: update_page(ROOT / name, breaks) for name, breaks in PLAN.items()}
    for path, html in updates.items():
        path.write_text(html)
    print(f'Updated {len(updates)} articles and tutorials: '
          f'{sum(len(breaks) == 4 for breaks in PLAN.values())} with four ads, '
          f'{sum(len(breaks) == 2 for breaks in PLAN.values())} with two.')
