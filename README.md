# TuneTicket

TuneTicket turns a Spotify user's top tracks into a shareable airline boarding pass or vertical luggage tag. The application runs entirely in the browser using Spotify OAuth PKCE and the Spotify Web API.

## Features

- Top tracks from approximately 4 weeks, 6 months, or 1 year of listening history.
- Configurable top 5, 8, or 10 track manifests.
- Horizontal boarding pass and vertical luggage tag layouts.
- Classic, Midnight, Stark, and Forest themes.
- Album artwork and Unicode track, artist, and passenger names.
- Generated flight duration, altitude, baggage, class, route, and barcode details.
- Keyboard-accessible track controls with clear play, pause, and fallback states.
- 30-second previews when Spotify supplies a preview URL.
- Direct Spotify fallback when a preview is unavailable.
- High-resolution PNG download and clipboard image export.
- Shareable preset links containing layout, theme, time range, and track count.
- Persisted visual preferences and reduced-motion support.

Spotify's `preview_url` track field is deprecated, nullable, and absent for many tracks. TuneTicket therefore cannot guarantee an in-app preview for every result. Tracks without a clip open on Spotify instead.

## Security and privacy

- Authorization uses OAuth PKCE with a random authorization `state` value.
- Spotify access, refresh, and PKCE values use `sessionStorage` and are removed when the browser tab session ends.
- Legacy token values written by older versions are removed from `localStorage`.
- Spotify profile data, track metadata, errors, and user inputs are escaped before HTML rendering.
- No client secret is used or shipped to the browser.
- Preset links do not include passenger names, account data, or tokens.

This is still a client-side application. Do not add a Spotify client secret to `.env` or any frontend source file.

## Tech stack

- HTML5 and vanilla JavaScript modules
- CSS custom properties, Grid, and Flexbox
- Vite
- html2canvas
- Node test runner
- ESLint

## Local development

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Spotify permits HTTP redirect URIs for explicit loopback IP addresses such as `127.0.0.1`, but not `localhost`. Add the exact Vite URL shown in the terminal to the Spotify Developer Dashboard, for example:

```text
http://127.0.0.1:5173/
```

Create `.env` with the public client ID:

```text
VITE_SPOTIFY_CLIENT_ID=your_client_id
```

If this variable is omitted, TuneTicket displays a client ID field in the interface for local testing.

## Production setup

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Enable the Web API.
3. Add the exact HTTPS deployment URL under Redirect URIs.
4. Configure `VITE_SPOTIFY_CLIENT_ID` in the deployment environment.
5. Build and deploy the static `dist` output.

## Quality checks

```bash
npm run check
```

This runs ESLint, unit tests, and the production Vite build.

## Disclaimer

TuneTicket is a fan project and is not affiliated with, sponsored by, or endorsed by Spotify AB. Spotify is a trademark of Spotify AB.
