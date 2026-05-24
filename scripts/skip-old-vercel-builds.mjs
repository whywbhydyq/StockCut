import https from 'node:https';

const currentSha = process.env.VERCEL_GIT_COMMIT_SHA;
const ref = process.env.VERCEL_GIT_COMMIT_REF;
const owner = process.env.VERCEL_GIT_REPO_OWNER;
const repo = process.env.VERCEL_GIT_REPO_SLUG;

function continueBuild(message) {
  console.log(`[StockCut build guard] ${message}`);
  process.exit(1);
}
function skipBuild(message) {
  console.log(`[StockCut build guard] ${message}`);
  process.exit(0);
}

if (!currentSha || !ref || !owner || !repo) {
  continueBuild('Missing Vercel Git env; continuing build to avoid skipping production.');
}

const request = https.request(
  {
    hostname: 'api.github.com',
    path: `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(ref)}`,
    method: 'GET',
    headers: {
      'User-Agent': 'stockcut-vercel-build-guard',
      Accept: 'application/vnd.github+json',
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {})
    }
  },
  (response) => {
    let body = '';
    response.setEncoding('utf8');
    response.on('data', (chunk) => (body += chunk));
    response.on('end', () => {
      if (!response.statusCode || response.statusCode < 200 || response.statusCode >= 300) {
        continueBuild(`GitHub check HTTP ${response.statusCode}; continuing build.`);
      }
      try {
        const latestSha = JSON.parse(body)?.sha;
        if (!latestSha) continueBuild('No latest SHA in GitHub response; continuing build.');
        if (latestSha !== currentSha) {
          skipBuild(`Commit ${currentSha} is older than ${ref}@${latestSha}; skipping old build.`);
        }
        continueBuild(`Commit ${currentSha} is latest on ${ref}; continuing build.`);
      } catch (error) {
        continueBuild(`GitHub check parse failed: ${error instanceof Error ? error.message : 'unknown'}; continuing build.`);
      }
    });
  }
);
request.on('error', (error) => continueBuild(`GitHub check failed: ${error.message}; continuing build.`));
request.end();
