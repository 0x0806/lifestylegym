# New Lifestyle Way Gym

Source for https://www.lifestylegym.fit/, a single-page site for a 24/7 gym in Al Nahda, Sharjah.
Plain HTML, CSS and JavaScript. No build step, no dependencies. Hosted on GitHub Pages (branch `main`, root).

## Files

| Path | Purpose |
|---|---|
| `index.html` | The whole page, SEO tags and JSON-LD (`ExerciseGym`) |
| `style.css` | All styles; fonts are self-hosted from `assets/fonts` |
| `script.js` | Menu, videos, services picker, booking form |
| `chat.js` | Scripted business assistant, loaded only when someone opens the chat |
| `assets/` | Optimised images (WebP), videos (H.264), fonts, icons, share image |
| `sitemap.xml`, `robots.txt`, `llms.txt`, `humans.txt` | Crawler and discovery files |
| `.well-known/security.txt` | Security contact |
| `manifest.webmanifest`, `404.html`, `CNAME`, `.nojekyll` | Site plumbing for GitHub Pages |
| `tests/chat.test.js` | `node tests/chat.test.js` runs the chat guardrail tests |

## Editing

- **Facts** (hours, phones, address, plans) appear in `index.html`, in the JSON-LD block and in the `FACTS` object at the top of `chat.js`. Change all three together.
- **Prices** are deliberately not shown. When you add them, update the Plans section, the FAQ answer "How much is a gym membership?", the `price` and `plans` replies in `chat.js`, and the test that asserts the chat never quotes a price.
- **Video**: keep clips short and under 2 MB (`ffmpeg -an -c:v libx264 -crf 28 -movflags +faststart`). Never commit raw camera files.
- **Update `lastmod`** in `sitemap.xml` when content changes.

## Chat assistant

It is not an LLM. It answers only from `FACTS`, refuses medical, emergency, abusive and prompt-injection messages, never invents prices, and hands off to WhatsApp, a call or the free demo form. Leads are sent through the same FormSubmit mailbox as the booking form after an explicit confirmation.
