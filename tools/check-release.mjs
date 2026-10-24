// Checks that package.json, the card's VERSION and an optional release tag agree.
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const { version } = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
const card = await readFile(new URL('tcl-google-tv-remote.js', root), 'utf8');
const cardVersion = card.match(/export const VERSION = '([^']+)'/)?.[1];
const tag = process.argv[process.argv.indexOf('--tag') + 1];
const errors = [];
if (cardVersion !== version) errors.push(`tcl-google-tv-remote.js VERSION ${cardVersion} differs from package.json ${version}.`);
if (process.argv.includes('--tag') && tag !== `v${version}`) errors.push(`Release tag ${tag} should be v${version}.`);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Version ${version} is consistent.`);
