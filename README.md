# StatusFix ✦

**WhatsApp Status media optimizer** — drop a photo or clip, get back a file that's
sized under WhatsApp's status limits so its compressor never degrades it.

- 🖼 **Images** → optimized JPEG (max 1600px wide, guaranteed ≤ 5MB)
- 🎬 **Videos** → H.264/AAC MP4 (720p, up to 3 min, two-pass encode sized to exactly ≤ 16MB)

The UI is a shadcn/ui-style component system (Tailwind CSS + class-variance-authority)
with framer-motion animations, lucide icons, a live upload-progress bar, and a
dark WhatsApp-green design.

## Architecture

Two packages, one repo:

```
statusfix/
├── client/     React 18 + Vite + Tailwind (shadcn/ui-style components, framer-motion)
├── server/     Express API — runs FFmpeg server-side, returns the optimized file
└── render.yaml One-click Render blueprint (single service hosts client + API)
```

All processing happens on the server. Uploads and outputs live in the OS temp
dir and are **deleted immediately** after the response is sent — nothing is stored.

## Requirements

- Node.js 18+ and npm
- FFmpeg/FFprobe are bundled via `ffmpeg-static` / `ffprobe-static` — no system install needed

## Quick start

```bash
npm run install:all     # installs server + client dependencies
```

**Development** — two terminals:

```bash
npm run dev             # API server on http://localhost:5000 (nodemon)
npm run client:dev      # Vite dev server on http://localhost:5173
```

In dev, Vite proxies `/process` and `/health` to the API, and the server allows
`localhost:5173` for CORS automatically.

**Production (single service):**

```bash
npm run client:build    # builds client → client/dist
npm start               # Express serves both the API and client/dist
```

## Environment variables

### Server (`server/.env.example`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Server port |
| `CLIENT_ORIGIN` | `*` | Comma-separated allowed CORS origins. Same-origin deployments need nothing. For split deploys, set your frontend URL(s). |
| `NODE_ENV` | — | `production` disables the automatic localhost dev origins |

### Client (`client/.env.example`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | *(same origin)* | API base URL. Leave empty when the server hosts the client or when using the Vite dev proxy. Set to your Render URL for a Vercel-hosted frontend. |

## Deployment

### Option A — single Render service (recommended)

`render.yaml` is ready to go: it installs both packages, builds the client, and
starts the server, which serves `client/dist` and the API from one process.

1. New → **Blueprint** on Render, point at this repo.
2. Done. Optionally set `CLIENT_ORIGIN` to lock CORS to your domain.

### Option B — split (Vercel frontend + Render API)

- **API on Render:** new Web Service → build `npm install --prefix server` →
  start `npm --prefix server start` → set `CLIENT_ORIGIN=https://your-app.vercel.app`.
- **Frontend on Vercel:** import `client/` (framework: Vite) → set
  `VITE_API_URL=https://your-api.onrender.com`.

## API

| Endpoint | Description |
|---|---|
| `POST /process` | multipart form field `media` (JPG/PNG/MP4/MOV/AVI/MKV/WEBM, ≤ 50MB) → binary file response. Includes `X-Output-Size` header. |
| `GET /health` | `{ "status": "ok" }` |

Error responses are JSON `{ "error": "..." }` with a matching status:
`400` no/unsupported file · `413` over 50MB · `422` can't be fitted under the
WhatsApp limit (e.g. video over 3 minutes, or extreme high-motion content) ·
`500` processing failure.

## Project notes

- **Two-pass video encode:** duration is probed, the video bitrate that exactly
  fills 16MB is computed, and H.264 is run in two passes at that bitrate — short
  clips look near-transparent, long clips always fit.
- **Upload progress is real** (XHR `upload.onprogress`); the encode phase shows
  an indeterminate bar since server-side FFmpeg doesn't stream progress.
- Raw input cap is 50MB; outputs over the WhatsApp limit return a `422`
  explanation instead of a file.

## License

MIT — see `LICENSE` (add one if you open-source this).
