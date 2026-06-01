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

### 1. Register a Spotify Developer App
To use this application, you need a Spotify Client ID:
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Click **Create App** (e.g. name it *TuneTicket*).
3. Under App settings, select the **Web API** checkbox.
4. Add **`http://localhost:5173/`** (and your production Vercel URL) to the **Redirect URIs** list and save.

### 2. Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/KitCJX/TuneTicket.git
   cd TuneTicket
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup environment variables:
   Create a `.env` file in the root directory:
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open **`http://localhost:5173/`** in your browser!

---

## 🔒 Disclaimer

This application is a fan project and is not affiliated with, sponsored by, or endorsed by Spotify AB. Spotify is a registered trademark of Spotify AB.

---

## 🏷️ Credits

Created with ❤️ by **CJX1001** (2026).
