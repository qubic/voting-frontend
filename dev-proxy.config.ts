import type { HttpProxy, ProxyOptions } from 'vite'

export const createProxyConfig = (
	target: string,
	rewritePath: string,
	label = 'PROXY'
): ProxyOptions => {
	return {
		target,
		changeOrigin: true,
		rewrite: (path: string) => path.replace(rewritePath, ''),
		configure: (proxy: HttpProxy.Server, options: ProxyOptions) => {
			proxy.on('proxyReq', (proxyReq, req, res) => {
				res.setHeader('Access-Control-Allow-Origin', '*')
				res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, PATCH, POST, DELETE')
				res.setHeader(
					'Access-Control-Allow-Headers',
					req.headers['access-control-request-headers'] || ''
				)

				// Remove referer and referrer headers to avoid being blocked
				proxyReq.removeHeader('referer')
				proxyReq.removeHeader('referrer')

				if (req.method === 'OPTIONS') {
					res.writeHead(200)
					res.end()
					return
				}

				console.log(
					`[${label}] - API CALL - [${req.method}] ${typeof options.target === 'string' ? options.target : JSON.stringify(options.target)}${req.url}`
				)
				proxyReq.setHeader('Authorization', req.headers.authorization || '')
			})

			proxy.on('error', (err, _req, res) => {
				console.error(`Proxy error: ${err.message}`)
				res.writeHead(500, { 'Content-Type': 'application/json' })
				res.end(JSON.stringify({ error: 'Proxy error', details: err.message }))
			})
		}
	}
}

export const qubicRpcProxy = createProxyConfig(
	'https://rpc.qubic.org',
	'/dev-proxy-qubic-rpc',
	'QUBIC-RPC-DEV-PROXY'
)
