export const LogFeature = {
	WALLET_CONNECT_CLIENT: 'WALLET_CONNECT_CLIENT',
	WALLET_CONNECT_CONTEXT: 'WALLET_CONNECT_CONTEXT',
	QUTIL_CONTRACT_HOOK: 'QUTIL_CONTRACT_HOOK',
	ENCODERS: 'ENCODERS',
	DECODERS: 'DECODERS',
	CREATE_POLL_FORM: 'CREATE_POLL_FORM'
} as const

const enabledLogs: (typeof LogFeature)[keyof typeof LogFeature][] = [
	// LogFeature.WALLET_CONNECT_CLIENT,
	// LogFeature.WALLET_CONNECT_CONTEXT,
	LogFeature.QUTIL_CONTRACT_HOOK,
	// LogFeature.ENCODERS,
	LogFeature.DECODERS,
	LogFeature.CREATE_POLL_FORM
]

export const makeLog =
	(feature: keyof typeof LogFeature) =>
	(...args: Parameters<typeof console.log>) => {
		if (import.meta.env.MODE === 'development' && enabledLogs.includes(feature)) {
			console.log(`[${feature}] - `, ...args)
		}
	}
