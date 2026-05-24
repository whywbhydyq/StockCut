import https from 'node:https';
const currentSha=process.env.VERCEL_GIT_COMMIT_SHA;
const ref=process.env.VERCEL_GIT_COMMIT_REF;
const owner=process.env.VERCEL_GIT_REPO_OWNER;
const repo=process.env.VERCEL_GIT_REPO_SLUG;
function cont(m){console.log(`[StockCut build guard] ${m}`);process.exit(1)}
function skip(m){console.log(`[StockCut build guard] ${m}`);process.exit(0)}
if(!currentSha||!ref||!owner||!repo)cont('Missing Vercel Git env; continuing build to avoid skipping production.');
const opts={hostname:'api.github.com',path:`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(ref)}`,method:'GET',headers:{'User-Agent':'stockcut-vercel-build-guard','Accept':'application/vnd.github+json'}};
if(process.env.GITHUB_TOKEN)opts.headers.Authorization=`Bearer ${process.env.GITHUB_TOKEN}`;
const req=https.request(opts,res=>{let body='';res.setEncoding('utf8');res.on('data',c=>body+=c);res.on('end',()=>{if(res.statusCode<200||res.statusCode>=300)cont(`GitHub check HTTP ${res.statusCode}; continuing build.`);try{const latest=JSON.parse(body)?.sha;if(!latest)cont('No latest SHA in GitHub response; continuing build.');if(latest!==currentSha)skip(`Commit ${currentSha} is older than ${ref}@${latest}; skipping old build.`);cont(`Commit ${currentSha} is latest on ${ref}; continuing build.`)}catch(e){cont(`GitHub check parse failed: ${e.message}; continuing build.`)}})});
req.on('error',e=>cont(`GitHub check failed: ${e.message}; continuing build.`));req.end();
