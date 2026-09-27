import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [vue(), tailwindcss()],
    server: {
        host: true,  // доступ из локальной сети, как было с 0.0.0.0
        port: 3000,  // привычный порт
    },
    preview: {
        host: true,
        port: 3000,
    },
})