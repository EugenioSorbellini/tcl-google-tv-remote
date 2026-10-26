// Runs the unit tests with coverage and writes coverage/badge.json, a shields.io endpoint badge
// with the card's line coverage.
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
await mkdir(new URL('coverage/', root), { recursive: true });
const { status } = spawnSync(process.execPath, [
  '--test', '--experimental-test-coverage',
  '--test-reporter=spec', '--test-reporter-destination=stdout',
  '--test-reporter=lcov', '--test-reporter-destination=coverage/lcov.info',
  'tests/test_tcl_google_tv_remote.mjs',
], { cwd: root, stdio: 'inherit' });
if (status !== 0) process.exit(status ?? 1);

const lcov = await readFile(new URL('coverage/lcov.info', root), 'utf8');
const record = lcov.split('end_of_record').find(part => /^SF:.*tcl-google-tv-remote\.js$/m.test(part));
if (!record) throw new Error('coverage/lcov.info has no record for tcl-google-tv-remote.js.');
const [found, hit] = ['LF', 'LH'].map(key => Number(record.match(new RegExp(`^${key}:(\\d+)$`, 'm'))[1]));
const percent = Math.floor(hit / found * 100);
const color = percent >= 90 ? 'brightgreen' : percent >= 75 ? 'yellow' : 'red';
await writeFile(new URL('coverage/badge.json', root),
  `${JSON.stringify({ schemaVersion: 1, label: 'coverage', message: `${percent}%`, color })}\n`);
console.log(`Line coverage of tcl-google-tv-remote.js: ${hit}/${found} (${percent}%).`);
