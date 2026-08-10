import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { transformSync } from 'esbuild';
import { build as viteBuild, createServer } from 'vite';

// These values are public in the generated browser bundle. Keep the API key
// restricted to the deployed site's HTTP referrer and the Google Drive API.
const GOOGLE_API_KEY = 'AIzaSyD9IhFBHBHEs729edMO7LsoKZFlTfsnv5U';
const GOOGLE_CLIENT_ID = '967365398072-sj6mjo1r3pdg18frmdl5aoafnvbbsfob.apps.googleusercontent.com';

const missing = [
  ['GOOGLE_API_KEY', GOOGLE_API_KEY],
  ['GOOGLE_CLIENT_ID', GOOGLE_CLIENT_ID],
].filter(([, value]) => !value).map(([name]) => name);
if (missing.length) {
  console.error(
    `Missing Google build credentials: ${missing.join(', ')}. ` +
    'Fill the hardcoded constants at the top of scripts/build.js.'
  );
  process.exit(1);
}

const viteOptions = {
  define: {
    __GOOGLE_API_KEY__: JSON.stringify(GOOGLE_API_KEY),
    __GOOGLE_CLIENT_ID__: JSON.stringify(GOOGLE_CLIENT_ID),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
};

if (process.argv.includes('--dev')) {
  const server = await createServer(viteOptions);
  await server.listen();
  server.printUrls();
} else {
  // Run vite build to output to docs
  await viteBuild(viteOptions);

  const assetsDir = join('docs', 'assets');
  const files = readdirSync(assetsDir).filter((f) => f.endsWith('.js'));

  // Minify vendor chunk while keeping app code readable
  const vendorFile = files.find((f) => f.startsWith('vendor'));
  if (vendorFile) {
    const vendorPath = join(assetsDir, vendorFile);
    const minified = transformSync(readFileSync(vendorPath, 'utf8'), { minify: true });
    writeFileSync(vendorPath, minified.code);
  }
}
