# 🎫 TuneTicket

Your musical journey, printed on a premium flight boarding pass. 

**TuneTicket** is a client-side web application that integrates with the Spotify Web API to convert your top listening history (4 weeks, 6 months, or all-time) into a beautifully rendered, shareable flight boarding pass. It features custom themes, dynamic flight information, and full native support for multi-language scripts (like Thai, Japanese, and Korean).

---

## ✨ Features

- **Dynamic Destination Easter Egg:** The flight destination airport code and city automatically adjust to match your country code (detected via Spotify profile or browser locale—e.g., `SPO` ➔ `TH` for Thailand).
- **Interactive Ticket Configuration:**
  - Customize passenger name overlays.
  - Select seat codes.
  - Modify flight durations (listening periods).
- **Four Premium Visual Themes:**
  - ✈️ **Classic:** Clean off-white ticket paper with airline navy and safety orange branding.
  - 🌌 **Midnight:** Matte charcoal card face with amber guidance styling.
  - 📰 **Stark:** High-contrast retro editorial black-and-white print.
  - 🌲 **Forest:** Charter flight cream-beige paper with forest-green text and warm details.
- **Vibrant Cyber-Terminal UI:** Frosted glassmorphism control board inspired by modern airport control centers.
- **High-DPI Capture Export:** Generates high-definition, transparent-notched PNGs optimal for sharing on Instagram, Twitter, and TikTok.
- **Security First:** Utilizes Spotify OAuth PKCE flow entirely client-side. No user secrets are stored or sent to external servers.

---

## 🛠️ Tech Stack

- **Core:** HTML5, Vanilla JavaScript (ES Modules)
- **Styling:** CSS3 (Custom Variables, Flexbox, Grid, Frosted Glass effects)
- **Bundler:** Vite
- **Export Engine:** html2canvas

---

## 🚀 Getting Started

### 1. Deploy the Application
Since the Spotify Developer Dashboard requires a secure, live production URL (`https://`) and does not support local redirects (`localhost`) for application authentication:
1. Push this project to your GitHub repository.
2. Import the repository into **[Vercel](https://vercel.com/)** (or your preferred hosting provider).
3. Copy your live deployment URL (e.g. `https://tuneticket.vercel.app/`).

### 2. Register a Spotify Developer App
To authorize Spotify connections, you need a Client ID:
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Click **Create App** (name it *TuneTicket*).
3. Under App Settings, check the **Web API** option.
4. Paste your live deployment URL (e.g. `https://tuneticket.vercel.app/`) into the **Redirect URIs** field, click **Add**, and click **Save** at the bottom of the page.
5. Copy your **Client ID** from the Spotify App details page.

### 3. Add Client ID to Vercel
1. Go to your project settings in Vercel.
2. Select **Environment Variables** in the left sidebar.
3. Add a new variable:
   - **Key:** `VITE_SPOTIFY_CLIENT_ID`
   - **Value:** *(Paste your Spotify Client ID here)*
4. Click **Save** and trigger a rebuild of the application. Your users can now log in securely!

---

## 🔒 Disclaimer

This application is a fan project and is not affiliated with, sponsored by, or endorsed by Spotify AB. Spotify is a registered trademark of Spotify AB.

---

## 🏷️ Credits

Created with ❤️ by **CJX1001** (2026).
