const required = ['VITE_GOOGLE_API_KEY', 'VITE_GOOGLE_CLIENT_ID'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}
