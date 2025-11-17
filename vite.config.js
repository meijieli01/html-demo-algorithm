import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import html from 'vite-plugin-html'
import svgLoader from 'vite-svg-loader';
import {resolve} from 'path';
import Components from 'unplugin-vue-components/vite';
import { BootstrapVueNextResolver } from 'bootstrap-vue-next';
import {getBaseRoot} from './config';
import sass from 'sass';

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const buildPath = `./dist`
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      vue(),
      svgLoader(),
      html({
        inject: {
          injectData: {
            title: 'Viewer',
            iconPath: `${env.VITE_APP_ICON}`,
          }
        },
        minify: false,
      }),
        Components({
            resolvers: [BootstrapVueNextResolver()],
        }),
    ],
    entry: './index.html',
    resolve: {
      alias: [
        {find: '@', replacement: resolve(__dirname, 'src')}
      ],
    },
    css: {
        preprocessorOptions: {
            scss: {
                implementation: sass,
                sassOptions: {
                    quietDeps: true,
                },
                api: 'modern-compiler',
                additionaldData: `@import @/styles/variables.scss";`,
                charset: true,
                syntax: 'scss',
            },
        },
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
                  target: env.VITE_APP_BASE_API,
                  changeOrigin: true,
                  rewrite: (path) => path.replace(/^\/api/, '')
                },
                '/api2': {
                    target: env.VITE_APP_API_DENTAL,
                    changeOrigin: true,                
                    rewrite: (path) => path.replace(/^\/api2/, '')
                },
                '/api3': {
                    target: 'https://studio-china-dev--treatment-generation-modal-generate.modal.run',
                    changeOrigin: true,                
                    rewrite: (path) => path.replace(/^\/api3/, '')
                },
            }
        },
    }
})
