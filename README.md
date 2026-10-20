# 8Ball

Live football scores and fixtures, built with React + Vite and deployed on Vercel. Data comes from ESPN's public soccer API, with [football-data.org](https://www.football-data.org/) as a fallback when ESPN is unavailable.

## Setup

```sh
pnpm install
pnpm dev
```

API keys:

- Local dev: `FOOTBALL_DATA_API_KEY` in `.env`. `pnpm dev` runs the functions in `api/` itself.
- Vercel: `FOOTBALL_DATA_API_KEY` (only used by the fallback). ESPN needs no key.
