# bjoyita.github.io
Materials Data Explorer

This website is on materials informatics. Materials informatics or materials genomics is a rapidly emerging area for accelerated design of materials and processes. I provide blogs and guided tutorials on different aspects of materials informatics such as materials data mining, machine learning for materials discovery, and analysis of materials data. The content of this website is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License. All codes are open source, so please feel free to do anything you want with them under the terms mentioned at https://creativecommons.org/licenses/by-sa/4.0/legalcode. Remember to acknowledge "bjoyita.github.io" for using these resources.

## Visitor statistics

I use my original Google Analytics tag for `G-SPPQKTW0JB` on every published HTML page. I include Google's asynchronous library once and call `gtag('config', 'G-SPPQKTW0JB')` once. I do not also load the shared analytics script. I give each page a descriptive `<title>`. These original tags also run in local copies, so I block Google Analytics and advertising requests when testing locally. The unused shared analytics file remains available for older unpublished previews.

I check coverage and duplicate initialization with `node --test tests/analytics.mjs`. The Google site-verification file is not a content page and stays unchanged. Analytics changes apply to future visits; they do not recover previously unrecorded visits.

The sitemap lists public resources. `llms.txt` provides a short reading guide for tools that choose to use it; it does not generate visits or guarantee inclusion in AI answers.

## Search descriptions and structured data

I give each public page its own title, description and canonical URL. My home page identifies me with Person structured data. Articles and tutorials use BlogPosting data and refer to the same author URL. I use publication dates already shown in the article, rather than guessing dates for older articles.

When I update an article, I update its description, social preview description and structured data together. I update the sitemap lastmod date for changes to the content, structured data or links. I do not change dates just to make an unchanged page appear new. Google Search Console can inspect an individual URL and accept an indexing request, but submission does not guarantee indexing or ranking.

## Manual ad placement

I use four responsive display ads in longer articles and tutorials and two in shorter articles. The homepage has three responsive placements between complete reading sections. Ads scroll with the page and do not cover content. Policy pages, navigation lists and the short dataset index have no placements. I keep ads between reading sections, outside code blocks and interactive exercises. Each placement is labeled Advertisement, with space above and below it. Empty units collapse when Google marks them unfilled.

I keep the reading breaks in `tools/manual-ad-placements.json`. To change a placement, I update its heading or paragraph prefix there and run `python tools/place_manual_ads.py` from the repository root. This needs `beautifulsoup4`. The script retains the surrounding HTML formatting. I check the placement counts with `node --test tests/*.mjs` and inspect the changed pages in a browser.

Auto ads are off in AdSense, and the offerwall is unpublished. I keep full-screen and overlay ads off. These account settings are separate from the HTML, so I check them in AdSense when changing advertising settings. Manual placements do not guarantee that Google will fill each request or that earnings will increase.

I include Google's original asynchronous AdSense tag once in the head of every published page. I do not use a second ad loader. Pages without manual placements still include the tag, but I have not added display units to them. The tag also runs in local copies, so I block Google ad requests when testing locally and avoid repeated live ad loads. I never click my own ads. This setup does not guarantee that Google fills every placement.

## Voluntary support

I link to my Buy Me a Coffee page at https://buymeacoffee.com/bjoyitax from the homepage and article footers. Support is voluntary. I keep the tutorials freely available and use a normal link, without a payment widget, popup or additional tracking script.
