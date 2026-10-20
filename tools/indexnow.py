"""Notify Bing (and other IndexNow engines) about new or updated pages.

Usage, from the repository root:
    python tools/indexnow.py                      # submit every URL in sitemap.xml
    python tools/indexnow.py https://bjoyita.github.io/posts/new-article.html ...

IndexNow is used by Bing, Yandex, Seznam and Naver. Google does not use it.
The key file (4659b6636f3f34f94fffbf88e52a5959.txt) must stay at the site root.
"""
import json, re, sys, urllib.request

HOST = "bjoyita.github.io"
KEY = "4659b6636f3f34f94fffbf88e52a5959"

def sitemap_urls():
    with urllib.request.urlopen(f"https://{HOST}/sitemap.xml") as r:
        return re.findall(r"<loc>(.*?)</loc>", r.read().decode())

urls = sys.argv[1:] or sitemap_urls()
body = json.dumps({"host": HOST, "key": KEY, "keyLocation": f"https://{HOST}/{KEY}.txt", "urlList": urls}).encode()
req = urllib.request.Request("https://api.indexnow.org/indexnow", data=body, headers={"Content-Type": "application/json; charset=utf-8"})
try:
    with urllib.request.urlopen(req) as r:
        print(f"IndexNow accepted {len(urls)} URLs (HTTP {r.status})")
except urllib.error.HTTPError as e:
    print(f"IndexNow rejected the request: HTTP {e.code} {e.read().decode()[:200]}")
    sys.exit(1)
