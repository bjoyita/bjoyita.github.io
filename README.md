# bjoyita.github.io
Materials Data Explorer

This website is on materials informatics. Materials informatics or materials genomics is a rapidly emerging area for accelerated design of materials and processes. I provide blogs and guided tutorials on different aspects of materials informatics such as materials data mining, machine learning for materials discovery, and analysis of materials data. The content of this website is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License. All codes are open source, so please feel free to do anything you want with them under the terms mentioned at https://creativecommons.org/licenses/by-sa/4.0/legalcode. Remember to acknowledge "bjoyita.github.io" for using these resources.

## Visitor statistics

I use the existing Google Analytics property, `G-SPPQKTW0JB`. Each public HTML page loads `/assets/explorer/analytics.js` once, with `defer`, after its title is available. The shared script does not count local previews. I include the same script on new pages and give each page a descriptive `<title>`.

I check coverage and duplicate initialization with `node --test tests/analytics.mjs`. The Google site-verification file is not a content page and stays unchanged. Analytics changes apply to future visits; they do not recover previously unrecorded visits.

The sitemap lists public resources. `llms.txt` provides a short reading guide for tools that choose to use it; it does not generate visits or guarantee inclusion in AI answers.

## Search descriptions and structured data

I give each public page its own title, description and canonical URL. My home page identifies me with Person structured data. Articles and tutorials use BlogPosting data and refer to the same author URL. I use publication dates already shown in the article, rather than guessing dates for older articles.

When I update an article, I update its description, social preview description and structured data together. I update the sitemap lastmod date for changes to the content, structured data or links. I do not change dates just to make an unchanged page appear new. Google Search Console can inspect an individual URL and accept an indexing request, but submission does not guarantee indexing or ranking.

## Manual ad placement

I use four responsive display ads in longer articles and tutorials and two in shorter articles. The homepage has three responsive placements between complete reading sections. Ads scroll with the page and do not cover content. Policy pages, navigation lists and the short dataset index have no placements. I keep ads between reading sections, outside code blocks and interactive exercises. Each placement is labeled Advertisement, with space above and below it. Empty units collapse when Google marks them unfilled.

I keep the reading breaks in `tools/manual-ad-placements.json`. To change a placement, I update its heading or paragraph prefix there and run `python tools/place_manual_ads.py` from the repository root. This needs `beautifulsoup4`. The script retains the surrounding HTML formatting. I check the placement counts with `node --test tests/*.mjs` and inspect the changed pages in a browser.

Auto ads are off in AdSense, and the offerwall is unpublished. I keep full-screen and overlay ads off. These account settings are separate from the HTML, so I check them in AdSense when changing advertising settings. Manual placements do not guarantee that Google will fill each request or that earnings will increase.
