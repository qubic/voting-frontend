import path from 'path'
import { defineConfig, loadEnv, type UserConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

import { qubicRpcProxy } from './dev-proxy.config'

const defaultConfig: UserConfig = {
	plugins: [react(), tailwindcss(), svgr()],
	define: {
		__APP_VERSION__: JSON.stringify(process.env.npm_package_version)
	},
	base: './',
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	}
}

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, process.cwd())

	if (command === 'serve' && (mode === 'development' || env.VITE_ENABLE_PROXY === 'true')) {
		return {
			...defaultConfig,
			server: {
				proxy: {
					'/dev-proxy-qubic-rpc': qubicRpcProxy
				}
			}
		}
	}

	return defaultConfig
})
