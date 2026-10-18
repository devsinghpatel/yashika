# 🎂 [HER_NAME]’s Birthday Celebration

A mobile-first interactive birthday celebration with a complete photo wall, video gallery, audio-only voice-note player, and live CMS admin mode.

---

## 🌟 Highlights & 13 Interactive Screens

1. **Screen 01: Ambient Gate ("Psst, is anyone looking?")** - Pulsating violet fingerprint orb, whisper prelude, starts Web Audio context & background soundtrack.
2. **Screen 02: Dodging Gift Button** - Anti-clicker button that playfully evades touch/pointer with teasing captions from JSON before melting into a VIP portal pop.
3. **Screen 03: Liquid Name Reveal** - Merging chromatic goo blobs pool [HER_NAME]'s name into the glass lens with affectionate subtitles and sticky note.
4. **Screen 04: Friendship Quiz ("How Well Do You Know Us?")** - Inside-joke intel check with neon heart confetti on correct answers, wobbly phone shake on wrong answers, and dynamic score bands.
5. **Screen 05: Memory Bubbles** - 10 floating iridescent memory spheres that pop with tactile sound & burst cards, logging progress to unfreeze the gallery.
6. **Screen 06: Photo Scrapbook** - Responsive grid showing all 15 local photos, with a full-size photo viewer.
7. **Screen 07: Video Memories** - A dedicated gallery for all 14 local videos, each with playback, volume, and seek controls.
8. **Screen 08: Catch Falling Treats** - Arcade minigame with a draggable liquid paddle collecting matcha, ramen, and meme stickers to unlock heartfelt birthday wish lines.
9. **Screen 09: Scratch-Off Golden Tickets** - Canvas/foil scratcher cards with 60% auto-reveal threshold uncovering personal reasons & redeemable birthday coupons.
10. **Screen 10: Audio Voice Notes** - Choose and play any of the five MP4 recordings through an audio-only player.
11. **Screen 11: The Unapologetic Love Letter** - Postmarked wax seal, parchment card, ink-spread typewriter effect (with `prefers-reduced-motion` instant display support), and handwritten signature.
12. **Screen 12: Cake & Candles** - Multi-tiered strawberry cake with glowing candle flames; blows out via microphone volume detection or tap-to-blow fallback with smoke particles.
13. **Screen 13: Grand Fireworks Finale** - Aurora fireworks, confetti blasts, 3 interactive "Open When..." emergency capsule modals, direct WhatsApp reply button, and experience replay.

---

## 🚀 Running Locally

The birthday experience uses plain HTML, CSS, and modern vanilla ES modules:

```bash
# Option 1: Any static server (e.g. npx serve)
npx serve .

# Option 2: Vite development server
npm run dev
```

Visit `http://localhost:3000` (or the port indicated by the server).

---

## ☁️ Deploying to Vercel from GitHub

1. Push this repository to your GitHub account (e.g. `https://github.com/your-username/bday-celebration`).
2. Go to [Vercel](https://vercel.com) and click **"Add New..." > "Project"**.
3. Import your GitHub repository.
4. Keep the Framework Preset as **Other** (or Vite if building).
5. In **Environment Variables**, add the 3 variables detailed below.
6. Click **Deploy**.

---

## 🔑 Environment Variables & GitHub Fine-Grained Token

To allow the Admin CMS (`?admin`) to commit updates directly back to GitHub and auto-trigger Vercel redeploys:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `GITHUB_TOKEN` | Fine-grained GitHub Personal Access Token | `github_pat_11A...` |
| `GITHUB_REPO` | Owner and repository name | `your-username/bday-celebration` |
| `GITHUB_BRANCH` | Target branch (defaults to `main`) | `main` |

### How to Create the Fine-Grained GitHub Token:
1. On GitHub, click your profile picture (top right) > **Settings**.
2. On the left sidebar, click **Developer settings** > **Personal access tokens** > **Fine-grained tokens**.
3. Click **Generate new token**.
4. Set:
   - **Token name**: `Bday-Admin-CMS`
   - **Expiration**: 90 days or custom
   - **Repository access**: Select **"Only select repositories"** > choose this repo.
   - **Permissions** > **Repository permissions**:
     - Set **Contents** to **Read and write** (all other permissions can remain "No access").
5. Click **Generate token** and copy the token value (`github_pat_...`).
6. Paste into your Vercel project's Environment Variables as `GITHUB_TOKEN`.

---

## ⚙️ How to Use Admin Mode (`?admin`)

1. Navigate to your deployed page URL with `?admin` at the end:
   ```
   https://your-domain.vercel.app/?admin
   ```
2. Enter the Master PIN:
   ```
   123456
   ```
3. Once unlocked:
   - **In-Situ Text Editing**: Click directly on any text with a dashed outline to edit it in place. Changes sync to the active data model on blur.
   - **Celebration Studio**: Click **"Studio Panels"** in the top bar to open:
     - **Content**: Search and edit every setting, text, label, link, nested value, and media entry in `content.json`; arrays can be added to, removed, and reordered.
     - **Media**: Edit photo, video, and audio paths, titles, captions, and dates.
     - **Theme**: Preview custom palette colors with color pickers; other theme settings are available in Content.
     - **Flow**: Enable, disable, and reorder screens in the birthday journey.
     - **JSON**: Copy the current content manifest.
   - **Save & Publish**: Click the gradient **"Save & Publish"** button. This calls `/api/save.js`, committing the new `content.json` to GitHub. Vercel automatically detects the commit and redeploys live in ~1 minute!

### How to Change the Admin Password
- In `/api/save.js`: Update the constant `const ADMIN_PASSWORD = "123456";` to your desired PIN/password.
- In `/js/admin.js`: Update `const ADMIN_PASSWORD = "123456";` to match.

---

## 📸 Birthday Media

The galleries read the local files listed under `gallery.items` and `videos.items` in `content.json`. Audio tracks are listed under `voice.tracks`; their MP4 containers are played through an audio element, so no video is shown. Add the relative file paths to those lists when adding media. Photos can also be managed from the Admin Media panel.

---

## ✅ Bestie Customization Checklist

Before sending the link to the birthday star, customize these in `content.json` or via `?admin`:

- [ ] **Names**: Replace `"recipientName": "Maya"` and `"friendName": "Chloe"` with your real names.
- [ ] **Quiz Questions**: Personalize the 6 questions in `quiz.questions` with your favorite shared memories.
- [ ] **Memory Bubbles**: Update the 10 bubble labels and memories in `bubbles.items`.
- [ ] **Photo and Video Galleries**: Update the local file paths and captions in `gallery.items` and `videos.items`.
- [ ] **Audio Voice Notes**: Add MP4 audio file paths to `voice.tracks`.
- [ ] **The Love Letter**: Customize the heartfelt letter paragraphs in `letter.paragraphs`.
- [ ] **Open When Envelopes**: Customize the 3 capsule notes in `finale.envelopes`.
- [ ] **WhatsApp Reply Link**: In `finale.replyLink`, replace the phone number or prefilled text with your own WhatsApp / iMessage link!
