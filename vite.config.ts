import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {readFileSync} from 'node:fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function contentManifestPlugin(): Plugin {
  return {
    name: 'content-manifest',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'content.json',
        source: readFileSync(path.resolve(__dirname, 'content.json'), 'utf8')
      });
    }
  };
}

function apiSavePlugin(): Plugin {
  return {
    name: 'api-save-middleware',
    configureServer(server) {
      server.middlewares.use('/api/save', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed. Use POST.' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const saveHandler = (await import('./api/save.js')).default;
            const mockRes = {
              status(code: number) {
                res.statusCode = code;
                return this;
              },
              setHeader(name: string, value: string | string[]) {
                res.setHeader(name, value);
                return this;
              },
              json(data: any) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return this;
              }
            };
            await saveHandler({ method: 'POST', body } as any, mockRes as any);
          } catch (e: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: e.message || 'Server error' }));
          }
        });
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), contentManifestPlugin(), apiSavePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
