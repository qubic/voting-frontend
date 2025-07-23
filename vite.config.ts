import path from 'path'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss(), svgr()],
	define: {
		__APP_VERSION__: JSON.stringify(process.env.npm_package_version)
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	}
})
