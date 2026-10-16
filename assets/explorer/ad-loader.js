/* I load AdSense only on my public website, never in a local preview. */
(function () {
    'use strict';
    if (window.location.hostname !== 'bjoyita.github.io') {
        document.querySelectorAll('aside.article-ad').forEach(function (placement) {
            placement.style.display = 'none';
        });
        return;
    }
    if (!document.querySelector('ins.adsbygoogle[data-ad-slot]')) return;
    if (document.getElementById('mdx-adsense')) return;

    /* I keep Google's loader unchanged and load it once for the queued placements. */
    const script = document.createElement('script');
    script.id = 'mdx-adsense';
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8357043682630159';
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
}());
