#!/usr/bin/env node
import assert from 'node:assert/strict';

const baseUrl = (process.argv[2] || 'https://stockcut.ymirtool.com').replace(/\/$/, '');

const json = async (path) => {
  const response = await fetch(`${baseUrl}${path}`, { redirect: 'manual' });
  assert.equal(response.status, 200, `${path} should return HTTP 200`);
  const contentType = response.headers.get('content-type') || '';
  assert.ok(contentType.includes('application/json'), `${path} should return JSON, got ${contentType}`);
  return response.json();
};

const headOrGet = async (url, init = {}) => {
  const response = await fetch(url, { redirect: 'manual', ...init });
  return response;
};

const release = await json('/release-checklist.json');
const status = await json('/seo-status.json');
const canonicalMap = await json('/canonical-map.json');
const drift = await json('/content-drift.json');

assert.ok(release.productionEndpointChecks.length > 0, 'release checklist should expose endpoint checks');
assert.ok(release.canonicalHtmlChecks.length > 0, 'release checklist should expose canonical HTML checks');
assert.ok(release.redirectCheckSamples.length > 0, 'release checklist should expose redirect samples');
assert.equal(drift.fingerprints.length, canonicalMap.canonicalCount, 'content drift fingerprints should cover canonical pages');

for (const endpoint of release.productionEndpointChecks) {
  const response = await headOrGet(`${baseUrl}${endpoint.path}`);
  assert.equal(response.status, endpoint.expectedStatus, `${endpoint.path} should return ${endpoint.expectedStatus}`);
  const contentType = response.headers.get('content-type') || '';
  const expectedPrefix = endpoint.expectedContentType.split(';')[0];
  assert.ok(contentType.includes(expectedPrefix) || (endpoint.expectedContentType === 'application/manifest+json' && contentType.includes('application/manifest')), `${endpoint.path} content-type should include ${endpoint.expectedContentType}, got ${contentType}`);
}

for (const page of release.canonicalHtmlChecks) {
  const response = await headOrGet(`${baseUrl}${page.slug === '/' ? '' : page.slug}`);
  assert.equal(response.status, 200, `${page.slug} should return HTTP 200`);
  const html = await response.text();
  assert.ok(html.includes(page.title), `${page.slug} should include expected title text`);
  assert.ok(html.includes('application/ld+json'), `${page.slug} should include JSON-LD`);
  assert.ok(!html.includes('noindex'), `${page.slug} should not include noindex`);
}

for (const sample of release.redirectCheckSamples) {
  const response = await headOrGet(`${baseUrl}${sample.sourcePath}`);
  assert.ok([301, 308].includes(response.status), `${sample.sourcePath} should be a permanent redirect, got ${response.status}`);
  const location = response.headers.get('location') || '';
  assert.ok(location.endsWith(sample.destinationPath), `${sample.sourcePath} should redirect to ${sample.destinationPath}, got ${location}`);
}

for (const header of status.verification.expectedSecurityHeaders) {
  const response = await headOrGet(baseUrl);
  assert.ok(response.headers.has(header.key.toLowerCase()) || response.headers.has(header.key), `homepage should include ${header.key}`);
}

console.log(`Production SEO checks passed for ${baseUrl}`);
