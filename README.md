# GanpatiLive — GitHub Pages

A static Ganpati website with:
- clean Ganesh Ji hero video
- fixed morning (5:00–9:00) and evening (6:30–8:00) Aarti sessions
- the Aarti sequence shown in the supplied reference image
- outside-session "Aarti Time Only" popup
- Visarjan registration with one private code per Instagram handle
- Google Apps Script → private Google Sheet storage
- separate Visarjan countdown page

## 1. Add your Aarti audio

Put your own/licensed MP3s into `assets/audio/` using exactly these names:

- `01-karpurgouram.mp3`
- `02-shiv-mantra.mp3`
- `03-ghalin-lotangan.mp3`
- `04-tvamev-mata.mp3`
- `05-achyutam-keshavam.mp3`
- `06-hare-ram-mahamantra.mp3`

The supplied image is used as the Aarti-series visual reference. The project does not bundle third-party song recordings.

## 2. Set up the private registration database

Create a Google Sheet.

In that Sheet:
`Extensions → Apps Script`

Paste the contents of `google-apps-script/Code.gs`.

Deploy:
`Deploy → New deployment → Web app`

Recommended:
- Execute as: **Me**
- Who has access: **Anyone**

Copy the deployed `/exec` URL.

In `script.js`, change:

```js
backendUrl: "",
```

to:

```js
backendUrl: "YOUR_APPS_SCRIPT_EXEC_URL",
```

The Google Sheet itself should remain private.

The backend returns only the registrant's own code. It does not expose the full list.

## 3. Test locally

A GitHub Pages site is static, but opening `index.html` directly as `file://` can interfere with some browser features.

You can test with any local static server, then deploy to GitHub.

## 4. Publish on GitHub Pages

Create a GitHub repository, for example:

`ganpatilive`

Upload the contents of this folder.

Then:
`Repository → Settings → Pages`

Choose:
- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/ (root)**

Save.

Your site will normally be:

`https://YOUR-GITHUB-USERNAME.github.io/ganpatilive/`

## 5. Important

GitHub Pages is public hosting. Never put:
- Google service-account credentials
- private API keys
- admin passwords
- database credentials

inside HTML, CSS or JavaScript.

For the registration list, the private Google Sheet is the admin record.

## Aarti timing behavior

The visitor never sees the schedule.

The browser checks its local clock:

- 05:00–08:59 → morning Aarti session
- 09:00–18:29 → outside session
- 18:30–19:59 → evening Aarti session
- 20:00–04:59 → outside session

At 09:00 and 20:00 the player becomes unavailable. At 05:00 and 18:30 it becomes available again.

Browser autoplay restrictions are respected: the user must tap the bell/play control before audio starts.

## Aarti audio / credits

The Aarti player uses the official/authorized YouTube-hosted versions listed below instead of copying MP3 recordings into this GitHub repository. YouTube supports embedding videos on websites, and the site links back to each source. Playback remains subject to the embedded player's rules and browser autoplay restrictions.

1. Karpur Gauram — Times Music Spiritual — https://www.youtube.com/watch?v=uwXW1uRntEo
2. Shiv Mantra (Om Namah Shivaya) — Times Music Spiritual — https://www.youtube.com/watch?v=A5vvJVvNTVA
3. Ghalin Lotangan — Sony Music India — https://www.youtube.com/watch?v=kmmmZn4cQmU
4. Tvamev Mata — Saregama Bhakti — https://www.youtube.com/watch?v=t2TGoZ2Tyz4
5. Achyutam Keshavam — Zee Music Company / Alka Yagnik — https://www.youtube.com/watch?v=cahzV2jYhjU
6. Hare Ram Mahamantra — ISKCON Desire Tree / Lokanath Swami — https://www.youtube.com/watch?v=YOaX0Jnne4I

Credit is displayed dynamically beside the currently selected track on the website.


## Current fixes
- Google Apps Script `/exec` URL is configured in `script.js`.
- Added a GET health check to Apps Script.
- Removed the Aarti screenshot and visible YouTube player.
- Bell starts the credited YouTube-hosted prayer sequence during the allowed Aarti windows.
- Original source links remain visible under Prayer Credits.
