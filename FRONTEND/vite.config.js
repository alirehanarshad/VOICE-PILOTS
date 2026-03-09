import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                {
                    src: 'node_modules/onnxruntime-web/dist/*.wasm',
                    dest: ''
                },
                {
                    src: 'node_modules/onnxruntime-web/dist/*.mjs',
                    dest: ''
                }
            ]
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    optimizeDeps: {
        exclude: ['onnxruntime-web']
    },
})
