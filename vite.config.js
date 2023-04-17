import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import html from 'vite-plugin-html'
import svgLoader from 'vite-svg-loader';
import {resolve} from 'path';
import {getBaseRoot} from './config';

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const buildPath = `./dist_${mode}`
  const configure = require('dotenv').config({path: `.env.${mode}`})
  console.log('-build info-', mode, buildPath, configure)
  return {
    plugins: [
      vue(),
      svgLoader(),
      html({
        inject: {
          injectData: {
            title: 'Viewer',
            iconPath: `${configure.parsed.VITE_APP_ICON}`,
          }
        },
        minify: false,
      }),
    ],
    entry: './index.html',
    resolve: {
      alias: [
        {find: '@', replacement: resolve(__dirname, 'src')}
      ],
    },
    base: getBaseRoot(),
    publicDir: './public/',
    build: {
      outDir: buildPath,
      cssCodeSplit: false,
      sourcemap: false,
      minify: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          compact: true,
          sourcemap: false,
        },
      },
    },
    server: {
      port: 8600,
      strictPort: true,
      proxy: {
        '/api': {
          target: configure.parsed.VITE_APP_BASE_API,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
  }
})
