import fs from 'fs';

console.log('=== VALIDATING INDEX.HTML JSON-LD SCHEMA ===');
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

if (!match) {
  console.error('[FAIL] No JSON-LD script found in index.html');
  process.exit(1);
}

try {
  const parsed = JSON.parse(match[1]);
  console.log('[PASS] JSON-LD is syntactically valid JSON.');
  console.log('Context:', parsed['@context']);
  
  const graph = parsed['@graph'];
  if (!Array.isArray(graph)) {
    throw new Error('@graph must be an array');
  }

  const website = graph.find(e => e['@type'] === 'WebSite');
  const org = graph.find(e => e['@type'] === 'Organization');

  if (!website) throw new Error('Missing WebSite schema');
  console.log('[PASS] WebSite schema detected:');
  console.log('  Name:', website.name);
  console.log('  URL:', website.url);
  console.log('  Alternate Names:', website.alternateName);

  if (!org) throw new Error('Missing Organization schema');
  console.log('[PASS] Organization schema detected:');
  console.log('  Name:', org.name);
  console.log('  URL:', org.url);
  console.log('  Logo URL:', org.logo?.url);
  console.log('  Image URL:', org.image);
  console.log('  Founder:', org.founder?.name);
  console.log('  Support Contact:', org.contactPoint?.email);

  console.log('\n=== SCHEMA TEST PASSED WITH ZERO ERRORS ===');
} catch (err) {
  console.error('[FAIL] Error parsing JSON-LD:', err.message);
  process.exit(1);
}
