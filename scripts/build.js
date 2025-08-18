import { execSync } from 'child_process';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const required = ['VITE_GOOGLE_API_KEY', 'VITE_GOOGLE_CLIENT_ID'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

// Run vite build to output to docs
execSync('vite build', { stdio: 'inherit' });

// Replace placeholder env variable names in built JS files with real values
const assetsDir = join('docs', 'assets');
const files = readdirSync(assetsDir).filter((f) => f.endsWith('.js'));
for (const file of files) {
  const fullPath = join(assetsDir, file);
  let code = readFileSync(fullPath, 'utf8');
  code = code
    .replace(/VITE_GOOGLE_API_KEY/g, process.env.VITE_GOOGLE_API_KEY)
    .replace(/VITE_GOOGLE_CLIENT_ID/g, process.env.VITE_GOOGLE_CLIENT_ID);
  writeFileSync(fullPath, code);
}
