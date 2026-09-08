# Setup

Node.js 20.9+ and npm are required. This build used Node 24.13.1.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. The initial screen is a synthetic SOL fixture. Click **Review fixture run**, approve the simulation, then **Recompute & verify**. Use the wallet selector and rescore to exercise the wrong-pocket route. No account or secret is needed for fixtures.

```sh
npm test
npm run lint
npm run build
npx playwright install chromium --only-shell
npm run test:e2e
npm run cli -- score "Buy 200 USDT of SOL, hold 24h"
npm run cli -- execute "Buy 200 USDT of SOL"
npm run cli -- verify RECEIPT_ID
npm run cli -- campaign
npm run probe
```

The CLI `execute` command only writes a FIXTURE receipt; `--live` is rejected. The last command performs an unauthenticated MCP initialization probe and replaces `data/tools.json` with actual probe evidence. It never transfers or trades.

Use `npm run build` and `npm start` for a production server. Receipt persistence requires a writable durable `data/` directory. An ephemeral serverless filesystem is not a supported persistence backend. Public multiuser deployment requires authentication, rate limits, storage migration and a publication boundary before any private integration is added.

Live integration next steps: establish official MCP OAuth, snapshot the discovered tool catalog, map read-only schemas, validate live provenance, then implement and test signed execution/recovery. Do not put API keys in this repository. The connection panel links to Binance's official onboarding instructions; it is not an implemented OAuth flow.
