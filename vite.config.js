import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Runs the Vercel functions in api/ during `vite dev`, with a minimal req.query / res.status().json() shim.
function apiRoutes(env) {
  return {
    name: 'api-routes',
    configureServer(server) {
      const key = env.FOOTBALL_DATA_API_KEY || env.VITE_FOOTBALL_DATA_API_KEY;
      if (key) process.env.FOOTBALL_DATA_API_KEY ??= key;

      server.middlewares.use('/api', async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        const name = url.pathname.slice(1);
        // only public routes; _-prefixed modules are helpers
        if (!/^[a-z-]+$/.test(name)) return next();
        try {
          const { default: handler } = await server.ssrLoadModule(`/api/${name}.js`);
          req.query = Object.fromEntries(url.searchParams);
          res.status = (code) => {
            res.statusCode = code;
            return res;
          };
          res.json = (body) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(body));
            return res;
          };
          await handler(req, res);
        } catch (err) {
          next(err);
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    apiRoutes(loadEnv(mode, process.cwd(), '')),
  ],
}))
