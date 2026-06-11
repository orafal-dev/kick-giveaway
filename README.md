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

`dev:stack` starts Redis and Postgres in Docker, then runs Next.js locally.

Open [http://localhost:3000](http://localhost:3000).

### Chat collection

Kick chat is collected in the **control panel browser tab** over WebSocket. Keep that tab open while a giveaway is running. Session state still syncs through Redis so overlays and other tabs can follow along via SSE/polling.

| Component | Role |
| --- | --- |
| Redis | Stores giveaway session state and pub/sub events |
| Browser WebSocket | Connects to Kick chat for the active control tab |
| Next.js API | Session CRUD, chat processing, and SSE updates |

Local options:

```bash
# Redis + Postgres (docker-compose.dev.yml) + Next.js
npm run dev:stack

# Or run dependencies and Next.js separately
docker compose -f docker-compose.dev.yml up -d redis postgres
REDIS_URL=redis://127.0.0.1:6379 npm run dev
```

### Coolify (production)

Deploy **one Next.js application** from this repo plus **Coolify's managed Redis and Postgres**:

| Source | Service |
| --- | --- |
| Coolify Redis | Giveaway session state and pub/sub |
| Coolify Postgres | Better Auth (anonymous users) |
| `Dockerfile` | Next.js web app |

See [DEPLOY.md](./DEPLOY.md) for step-by-step Coolify setup.

### Environment variables

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Postgres connection URL for Better Auth |
| `BETTER_AUTH_SECRET` | Better Auth encryption secret (min 32 chars) |
| `BETTER_AUTH_URL` | Public app URL (e.g. `https://kickaway.win`) |
| `REDIS_URL` | Redis connection URL for giveaway session storage |
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
```

Redis: use Coolify's managed Redis service in production, or `docker compose -f docker-compose.dev.yml up -d redis` locally.

The web image uses Next.js `output: "standalone"` and serves on port 3000.

## License

[MIT](./LICENSE) — use and modify freely; include the copyright notice and license text when you reuse this project.
