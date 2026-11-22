# V2.6 photographic editorial assets

Real photographic scenes used **only for thematic illustration** in the public research and event-report overview pages. These photos do not document the company's actual business, customers, projects or individual listed events.

| Usage | Photographer | Original photograph | Served as |
|---|---|---|---|
| Event-report introduction / concrete mixer | CHUTTERSNAP | https://unsplash.com/photos/green-and-white-mixer-truck-at-the-construction-site-PF1daJne7lA | Unsplash CDN resized to 1280px |
| Housing contract risk / building under construction | Daniel Romero | https://unsplash.com/photos/a-skyscraper-under-construction-with-a-crane-6xEpAeKHgTw | Unsplash CDN resized to 960px |
| Infrastructure opportunity / rail viaduct | Adem Percem | https://unsplash.com/photos/elevated-train-tracks-crossing-a-rural-landscape-NUp3tI3Ti1w | Unsplash CDN resized to 960px |
| Green building policy / green facade | WILLIAN REIS | https://unsplash.com/photos/modern-building-facade-covered-in-lush-green-plants-TeAKpJznZAY | Unsplash CDN resized to 960px |

All four source photo pages identified these photographs as free to use under the Unsplash License at time of selection (November 22, 2026): https://unsplash.com/license

**Performance:** Photos are served by Unsplash's resizing CDN with explicit width and quality parameters. The main report image is eager; thematic topic card images are lazy. Dimensions and aspect ratios reserve layout space. If the image CDN fails, a neutral background preserves the layout, but the photographic content will be absent. This deployment currently relies on an external image CDN; for an offline/strict-CSP corporate deployment, obtain approved images and import optimized copies as local static assets.

**Attribution:** The live product links to each photographer's Unsplash photo page. Images are not presented as evidence. There are no claims that the scenes are actual sites of 中建西部建设.

## V2.6 scope

- Reduce global header height and top page padding slightly.
- Replace the misleading, box-like illustration beside 专报 with a photographic editorial cover integrated with title, descriptive copy and status.
- Keep the single-column report reading list, filter controls, existing business logic and exact event IDs.
- Keep the 3-column curated topic layout and fixed answers, but use three different real photographs rather than synthetic SVGs.
- No changes to AI endpoints, keys, weekly/monthly contents or report publication rules.

## Rollback

- Before: `backup/pre-photo-editorial-v26-20261122` at `a1ca4491e8b71c4b21379b47d127284b50c1bb09`
- Feature: `feat/photo-editorial-v26-20261122`
- After merge: ordinary GitHub merge commit can be reverted without force pushing.
