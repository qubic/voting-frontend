type EnvConfig = {
	QUBIC_RPC_URL: string
}

export const envConfig: EnvConfig = {
	QUBIC_RPC_URL: import.meta.env.VITE_QUBIC_RPC_URL
}

export default envConfig
