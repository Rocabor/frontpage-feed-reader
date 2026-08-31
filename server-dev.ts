import { createServer as createViteServer } from 'vite';
import { createApp, serveFrontend } from './server';

const PORT = Number(process.env.PORT) || 3000;

async function start() {
  const app = createApp();

  if (process.env.NODE_ENV === 'production') {
    serveFrontend(app);
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Frontpage Feed Reader running on http://0.0.0.0:${PORT}`);
  });
}

start();
