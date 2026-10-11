/* I use one Google Analytics tag across my public pages. */
(function () {
    'use strict';

    // I do not count local previews or initialize the tag twice.
    if (window.location.hostname !== 'bjoyita.github.io') return;
    if (window.materialsDataAnalyticsStarted) return;
    window.materialsDataAnalyticsStarted = true;

    const measurementId = 'G-SPPQKTW0JB';
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
        window.dataLayer.push(arguments);
    };

    // I run after the HTML is parsed so the page title is available.
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
        page_title: document.title,
        page_location: window.location.href
    });

    // I load Google's library once. The config sends the normal page view.
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(script);
}());
