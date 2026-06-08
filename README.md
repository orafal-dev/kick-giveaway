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
npm run dev:stack
```

### Commit messages

This repo uses [Conventional Commits](https://www.conventionalcommits.org/). Messages are validated on every commit via [commitlint](https://commitlint.js.org/) and [Husky](https://typicode.github.io/husky/).

```
<type>(<optional scope>): <subject>
```

| Type | Use for |
| --- | --- |
| `feat` | New user-facing behavior |
| `fix` | Bug fixes |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code change that is neither feat nor fix |
| `perf` | Performance improvements |
| `test` | Tests only |
| `build` | Build system, Docker, dependencies |
| `ci` | CI/CD configuration |
| `chore` | Other maintenance |

Examples:

```
feat(giveaway): add confirmation countdown after draw
fix(overlay): sync confetti timing with wheel completion
docs: document Coolify deploy steps
```

Breaking changes: `feat(api)!: remove legacy session endpoint` or a `BREAKING CHANGE:` footer.

Check a message locally:

```bash
echo "feat: add wheel animation" | bunx commitlint
```

`dev:stack` starts Redis in Docker and runs the embedded chat collector inside Next.js.

Open [http://localhost:3000](http://localhost:3000).

### Server-side chat collection

Giveaway entrants are collected on the server so the control tab can be closed after starting a giveaway.

| Component | Role |
| --- | --- |
| Redis | Stores giveaway session state and pub/sub events |
| Collector | Maintains Kick WebSocket connections per active session |
| Next.js API | Session CRUD, actions, and SSE updates to the browser |

Local options:

```bash
# Redis (docker-compose.dev.yml) + embedded collector in Next.js
npm run dev:stack

# Or run Redis, Next.js, and a separate collector process
docker compose -f docker-compose.dev.yml up -d redis
REDIS_URL=redis://127.0.0.1:6379 npm run dev
REDIS_URL=redis://127.0.0.1:6379 npm run collector
```

### Coolify (production)

Deploy **two applications from this repo** plus **Coolify's managed Redis and Postgres** — no docker-compose:

| Source | Service |
| --- | --- |
| Coolify Redis | Giveaway session state and pub/sub |
| Coolify Postgres | Better Auth (anonymous users) |
| `Dockerfile.collector` | Kick chat collector worker |
| `Dockerfile` | Next.js web app |

See [DEPLOY.md](./DEPLOY.md) for step-by-step Coolify setup.

### Environment variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection URL for Better Auth |
| `BETTER_AUTH_SECRET` | Better Auth encryption secret (min 32 chars) |
| `BETTER_AUTH_URL` | Public app URL (e.g. `https://kickaway.win`) |
| `REDIS_URL` | Redis connection URL for server-side giveaway sessions |
| `COLLECTOR_MODE` | Local dev only — `embedded` runs the collector inside Next.js. Omit on Coolify when using `Dockerfile.collector`. |
| `NEXT_PUBLIC_DEV_MODE` | When `true`, seeds mock chat entrants during the collecting phase |
| `NEXT_PUBLIC_DEV_MOCK_ENTRANT_COUNT` | Number of synthetic entrants (default `300`) |

## Production

```bash
npm run build
npm run start
```

### Docker images

```bash
# Web app
docker build -f Dockerfile -t kickaway-app .

# Chat collector worker
docker build -f Dockerfile.collector -t kickaway-collector .
```

Redis: use Coolify's managed Redis service in production, or `docker compose -f docker-compose.dev.yml up -d redis` locally.

The web image uses Next.js `output: "standalone"` and serves on port 3000.
