import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint for Render service monitoring
app.get('/healthz', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve compiled static assets from dist
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback: Send index.html for any unhandled routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT} (http://0.0.0.0:${PORT})`);
});
