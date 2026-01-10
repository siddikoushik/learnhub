import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            protocolImports: true,
        }),
    ],
    define: {
        global: 'window',
    },
    // The plugin handles process, buffer, etc. generally.
    // We can leave alias empty or minimal.
    resolve: {
        alias: {
            // Explicitly alias process to a browser shim if needed, 
            // but let's try relying on the plugin's defaults first to avoid "missing package" errors.
            // If simple-peer complains, we add it back.
        },
    },
})
