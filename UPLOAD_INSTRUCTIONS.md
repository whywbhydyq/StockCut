# Upload Instructions

This package is a clean StockCut implementation. Use it as the repository root.

Recommended workflow:

```bash
# in your local StockCut repository
git checkout main
git pull origin main

# remove old implementation files, but keep .git
# then copy all files from this package into the repo root
npm install
npm run lint
npm test
npm run build
git add .
git commit -m "Implement StockCut MVP"
git push origin main
```

Do not upload:

- node_modules
- .next
- .vercel
- coverage

The project includes `vercel.json` with:

```json
{
  "ignoreCommand": "node scripts/skip-old-vercel-builds.mjs",
  "framework": "nextjs"
}
```

After pushing to GitHub, check Vercel separately:

1. Confirm the StockCut repository is imported as a Vercel project.
2. Confirm the new GitHub commit triggered a deployment.
3. Confirm Production points to the latest commit.
