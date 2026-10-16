// I request side ads only when the wide-screen layout can show them.
(() => {
    if (window.location.hostname !== 'bjoyita.github.io') return;
    const wideScreen = window.matchMedia('(min-width: 1200px)');

    function requestSideAds() {
        if (!wideScreen.matches) return;
        for (const unit of document.querySelectorAll('.home-side-ad ins.adsbygoogle')) {
            if (unit.dataset.sideRequested || unit.getBoundingClientRect().width < 160) continue;
            unit.dataset.sideRequested = 'true';
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
    }

    requestSideAds();
    wideScreen.addEventListener('change', requestSideAds);
})();
