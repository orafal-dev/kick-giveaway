# kickaway.win

Free Kick.com chat giveaway tool for streamers. Connect a channel, collect entrants from live chat, and draw winners with wheel or slot animations.

## Stack

- [Next.js](https://nextjs.org/) (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui (Base UI)

## Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_DEV_MODE` | When `true`, seeds mock chat entrants during the collecting phase |
| `NEXT_PUBLIC_DEV_MOCK_ENTRANT_COUNT` | Number of synthetic entrants (default `300`) |

## Production

```bash
npm run build
npm run start
```

### Docker

```bash
docker build -t kick-giveaway .
docker run -p 3000:3000 kick-giveaway
```

The image uses Next.js `output: "standalone"` and serves on port 3000.
