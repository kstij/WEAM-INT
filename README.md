# WEAM-INT (AI App Integrator) 🚀

Integrate any vibecoded app with Weam.ai using a single, menu-driven CLI. No web UI, no fluff — just scan, integrate, and ship.

## ✨ What it does

- **Smart scanning**: Detects framework, auth, DB, API routes
- **Weam integration codegen**: session middleware, auth guards, proxies, branding
- **AI-powered edits**: Uses OpenAI to directly modify files (with backups)
- **Consistent data model**: Company/user fields and collection prefixes

## 🔧 Install & Run (CLI only)

Option A: Run via npx
```bash
npx weamint
```

Option B: Local clone
```bash
git clone <repo-url>
cd AI-App-Integrator
npm install
npm start
```

You’ll see a menu with options like Scan App, Integrate with AI, Traditional Integration, and Setup.

## ⚙️ Minimal .env

Create a `.env` (or copy `env.example`) with:
```bash
OPENAI_API_KEY=your-openai-api-key

# Used in generated auth middleware and Next.js proxies
WEAM_COOKIE_NAME=weam
WEAM_COOKIE_PASSWORD=change-me
WEAM_BASE_URL=https://app.weam.ai

# Used by generated Mongo/Mongoose utilities (optional for CLI itself)
MONGODB_URI=mongodb://localhost:27017/weam-integrations
COLLECTION_PREFIX=solution_sample

# If your generated server needs CORS origin
CLIENT_ORIGIN=https://app.weam.ai
```

## ▶️ Typical workflow

1) Scan your app
```bash
npx weamint
# choose "Scan app" and point to your app folder
```

2) Integrate (AI mode)
```bash
npx weamint
# choose "Integrate with AI" and follow prompts
```

3) Review changes
- Backups are created next to modified files: `<filename>.bak`
- Diff your repo and commit what you like

## 📦 What gets added to your app

- `weamSession` middleware (iron-session) and `requireWeamAuth`
- CORS with credentials where needed
- Next.js proxy route for supersolution pages (if applicable)
- Weam branding hooks (logo, Back to App)
- Mongo models updated to include `user` and `companyId`
- Optional collection naming via `COLLECTION_PREFIX`

## 🧩 Supported targets

- Next.js (app or pages router)
- Express.js + React

## 🛠 Scripts (repo dev only)

- `npm start` — launch CLI menu
- `npm run build` — build production CLI

## 🔒 Security notes

- Uses `iron-session` with your `WEAM_COOKIE_PASSWORD`
- Keeps auth state via `weam` cookie
- Adds `withCredentials: true` where needed for API calls

## 🗺 Roadmap (short)

- Dry-run, rollback, and unified diff preview
- More framework recipes

---

Built for integrating vibecoded apps into Weam — fast.

## 🧷 Dry-run, rollback, and diff preview

Until a native `--dry-run` flag lands, here’s the safe workflow:

- Preview/diff: Run the integrator in a git-tracked repo, then inspect changes
```bash
git add -A && git commit -m "chore: baseline before integration"
npx weamint  # choose Integrate with AI
git --no-pager diff
```

- Rollback: Restore from the automatic backups created as `<filename>.bak`, or reset via git
```bash
# Restore a single file from backup
mv path/file.ext.bak path/file.ext

# Or revert everything via git
git reset --hard HEAD
```

- Manual dry-run: Clone your app to a temp folder and run the integrator there to review changes before applying to the real repo.
