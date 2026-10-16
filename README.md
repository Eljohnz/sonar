# SONAR — Music Sharing App (Phase 1: Visualizer Studio)

This is the **complete React + TypeScript + Tailwind CSS project**, with Spotify song submission, music discovery, four customizable visualizer designs, a site-wide Theme Studio, a user account UI, and an admin layout. The project can run in local demo mode without Supabase, or connect to Supabase for authentication and shared song data.

## Requirements and setup

- Node.js **20.19+** or **22.12+**; npm
- Optional: Supabase project for live authentication and shared songs

```bash
npm install
npm run dev
```

Open Vite's local URL (usually `http://localhost:5173`). For production build checks, run `npm run build`.

## Phase 1: drafts and your submissions

In demo mode, **My submissions** (`/account`) now lists tracks you published in the current browser, with a preview and Edit/Delete controls. Fictional showcase tracks cannot be changed. Deleting asks for confirmation and also removes that track's saved like. Editing keeps the song's ID, creation date, and likes while updating its details, chosen visual, and independent palettes. **Cancel editing** leaves the published song unchanged.

On `/submit`, **Save draft** keeps one unfinished submission in this browser, including incomplete details and all four color palettes. Saving is explicit: after more edits, the page says there are unsaved changes. The saved draft restores when you return and is also accessible through **Continue draft** in My submissions. **Clear draft** asks before clearing the saved draft and current form. Publishing clears the completed draft; editing a published track leaves any separate draft alone. Failed saves/clears display a recovery message. These features currently apply to local demo submissions; connected account editing and deletion remain Phase 2 work.

**Verified October 17, 2026:** 22 regression tests, TypeScript checking, and the production build passed. Browser checks used isolated test data to verify draft restoration and palette retention, editing without losing likes, canceling edits, deletion and library cleanup, publishing and clearing drafts, protected showcase tracks, and layouts at desktop and 390px mobile widths.

To try it: enter a title and colors on Submit, save the draft, open My submissions and continue it, fill a Spotify track link and artist, and publish. Open My submissions to edit the result or test the delete confirmation. Refresh using the same browser address to check persistence. Real Spotify playback and live Supabase behavior still need separate testing.

## Phase 1 stability fixes

- Changing a Spotify link cancels its pending metadata request. Late responses and errors are ignored, including responses already decoding when cancelled. Navigating away also cancels the request. A title edited while fetching is preserved.
- Saved demo songs and likes are validated before use. Valid entries and legacy/custom visualizer palettes are retained; malformed entries and duplicate IDs are skipped. Startup does not overwrite saved data.
- Browser storage failures keep songs and likes usable for the current session and show a save-failure notice. A later successful save clears the relevant failure notice. Changes that could not be saved may be lost after a refresh.
- Run `npm test` for the storage and Spotify-request regression tests. The runner uses the installed TypeScript compiler and Node's built-in test runner; no new packages are required.

**Stability verification on October 15, 2026:** all 14 regression tests and the production build passed. Isolated browser checks also verified recovery from mixed invalid/valid saved data, no initial song/like writes, out-of-order Spotify responses, publishing and liking with failed storage writes, and clearing the notice when saves succeed. These checks use test responses and session-only test storage; real Spotify playback and live Supabase still need separate testing.

## What's new: song details and transitions

Open any Discover card or Spotlight's **Explore** button to see the updated song page:

- A larger visual with **View full size**, using the published design and saved colors.
- Track title, artist, optional album and caption, visual style, and the date it was shared.
- Like feedback directly on the page, a saved-library state, and copy-link sharing.
- A dedicated Spotify player section and a clear no-audio state for fictional demo tracks.
- Up to three other published community tracks to keep exploring.
- Page fades when opening songs and returning to Discover, keyboard focus on the new page, and browser Back/Forward scroll restoration. Reduced-motion preferences disable the new animations; browsers without View Transitions use the normal route entrance.

Demo sharing copies the **Spotify link** for real locally saved submissions; fictional demo songs explain that there is no public link. Shared SONAR song links require a configured Supabase project and a hosted app. Public creator profiles, comments, and admin-selected Spotlight tracks remain future work.

## What's new: independent visualizer colors

On **Share music** (`/submit`), select a visual style. Its own color editor appears automatically:

| Visualizer | Editable colors | Six presets |
|---|---|---|
| **Cover art / Album** | Backdrop (used behind artwork and for overlay), text, accent | Ultraviolet, Sunset, Forest, Daylight, Cobalt, Raspberry |
| **Equalizer** | Background, animated bars, grid, text | Frequency, Acid, Icewave, Fire, Pink Noise, Monochrome |
| **Vinyl** | Background, vinyl record, accent/tonearm, text | Classic, Cherry, Mint, Gold, Indigo, Cream |
| **Minimal** | Background, text, accent | Paper, Midnight, Rose, Ocean, Cobalt, Forest |

Each editor supports a **native color picker**, six-digit **hex entry**, a one-click **preset selector**, **Reset colors**, and a **live preview**. There is a text contrast warning for low contrast. Changing from Album → Equalizer → Vinyl → Minimal and back **preserves each style's unsaved edits independently** while you compose the song. When you submit, all four visualizer palettes are saved with the song. The published card, Discover grid and song detail page read the selected visualizer's palette from the saved song data.

**Album covers stay intact:** album artwork is displayed when present, with an adjustable background-color overlay to help keep song details visible. **Equalizer animation is visual-only**, not synchronized to Spotify audio.

**Minimal backward compatibility:** songs saved by earlier SONAR versions with `minimal_colors` but no `visual_colors` continue to use their saved Minimal palette. Old songs using other visualizers fall back to their original/default color definitions without errors. Music visualizer palettes stay **independent of the site-wide Theme Studio**.

## Site Theme Studio (unchanged)

Open `/theme` from the navigation to choose six presets or customize eight site-wide colors: primary, secondary, background, sidebar, surface, input, primary text and secondary text. Your site theme automatically saves in `localStorage` under `sonar.site-theme.v1`, and remains separate from every song's saved visualizer colors.

## Demo mode (without Supabase)

Without `.env.local`, the app uses local prototype mode:

- Discover loads fictional demo songs. Some showcase the new customized visualizer palettes.
- You can paste a real Spotify **track** link, fetch available metadata, enter title/artist, change each visualizer, preview, and publish.
- Published songs and likes are stored **only on the current browser/device** (`localStorage`). Refresh the page to verify that song palettes persist.
- Auth pages are UI-only in demo mode; admin is a read-only preview.
- Demo songs are fictional placeholders without Spotify playback. Real submitted tracks use official Spotify embeds.

### Spotify notes

Standard Spotify embeds and the oEmbed metadata endpoint don't require the visitor to link their Spotify account. The title and artwork might be fetched; artist/album may need manual entry. The form accepts valid `https://open.spotify.com/track/` URLs (22-character IDs). No audio file hosting, real audio analysis, or lyric retrieval is included.

## Using Supabase

**New Supabase project:** in its SQL Editor, run **`supabase/schema.sql`** once. This includes `visual_colors` and all tables and policies.

**Already installed SONAR with the Minimal color update:** run only **`supabase/migrations/20261010_visual_colors.sql`** in your existing project's SQL Editor. This adds the new JSONB column and insert/update privileges without deleting existing data. Do **not** reinitialize your tables or erase existing songs. If your project predates the Minimal update as well, run `20261010_minimal_colors.sql` first.

Configure `.env.local` using `.env.example`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_KEY
```

Restart the development server and register at `/register`. If auth confirmation is enabled, confirm your email before signing in. To enable the admin UI for your own account, use the trusted Supabase SQL Editor:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_EMAIL@example.com');
```

Only public/publishable credentials belong in `VITE_` variables. Never expose a service-role/secret key in the browser. RLS and column grants are defined in `supabase/schema.sql`.

## Pages

| Path | Function |
|---|---|
| `/` | Discover and filter tracks |
| `/submit` | Add song; all four separate customizable visualizers and live preview |
| `/song/:id` | Song details and Spotify embed |
| `/login`, `/register` | Authentication |
| `/library` | Liked songs |
| `/account` | Demo drafts and submission management; profile and own songs when connected |
| `/admin` | Admin overview and moderation |
| `/theme` | Site-wide Theme Studio |

## Source layout

```text
src/
  components/
    MusicVisual.tsx         Four visualizers; reads saved palettes
    VisualColorEditor.tsx   Reusable style-specific color editor
    SongCard.tsx            Discover cards
    Shell.tsx               Site navigation/layout
  context/
    AuthContext.tsx
    MusicContext.tsx        Demo storage or Supabase persistence
    ThemeContext.tsx        Site-wide theme
  data/demo.ts              Fictional example tracks
  lib/
    visualColors.ts         Four palettes, presets and safe fallbacks
    minimalColors.ts        Contrast calculations and legacy palette helpers
    siteTheme.ts            Global site colors
    spotify.ts              Spotify link parsing/oEmbed
    supabase.ts
  pages/                    Discover, Submit, ThemeStudio, Auth, Library, Account, Admin, SongDetail
  types/music.ts            Song and visual palette types
  styles.css                Tailwind + component styles
supabase/
  schema.sql                Full schema
  migrations/
    20261010_minimal_colors.sql
    20261010_visual_colors.sql
```

## Phase 1 boundaries / testing

This is still a prototype. Frontend form data needs server-side validation, abuse prevention, moderation and a full QA/accessibility pass before public deployment. Spotify embeds, artwork and API integration must respect Spotify's terms. Local demo submissions won't automatically transfer into Supabase.

**Verified on October 15, 2026:** the full `npm run build` (TypeScript and Vite) passed. Browser checks covered desktop and 390px mobile song layouts, Discover navigation, restored scroll position, missing-song handling, likes persisting after refresh, inline demo-sharing feedback, full-size visual dismissal and focus restoration, and the submission preview's style switching and independent palette preservation. Live Supabase accounts, shared database operations, and Spotify audio playback were not exercised in this demo session.

