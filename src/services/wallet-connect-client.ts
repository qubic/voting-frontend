import { z } from 'zod'

import type Client from '@walletconnect/sign-client'
import { SignClient } from '@walletconnect/sign-client'
import type { SessionTypes, SignClientTypes } from '@walletconnect/types'

import { envConfig } from '@/configs'
import { LogFeature, makeLog } from '@/lib/logger'

const log = makeLog(LogFeature.WALLET_CONNECT_CLIENT)

const WcLocalStorageKeys = {
	SESSION_TOPIC: 'sessionTopic',
	WC_ACCOUNTS: 'wc_accounts',
	WC_SELECTED_ACCOUNT: 'wc_selectedAccount'
} as const

const QubicNsMethods = {
	WALLET_REQUEST_ACCOUNTS: 'qubic_requestAccounts',
	QUBIC_SEND_QUBIC: 'qubic_sendQubic',
	QUBIC_SIGN_TRANSACTION: 'qubic_signTransaction',
	QUBIC_SEND_TRANSACTION: 'qubic_sendTransaction',
	QUBIC_SIGN: 'qubic_sign'
} as const
export type QubicNsMethods = (typeof QubicNsMethods)[keyof typeof QubicNsMethods]

export const WalletEvents = {
	AMOUNT_CHANGED: 'amountChanged',
	ASSET_AMOUNT_CHANGED: 'assetAmountChanged',
	ACCOUNTS_CHANGED: 'accountsChanged'
} as const
export type WalletEvents = (typeof WalletEvents)[keyof typeof WalletEvents]

const QubicAccountAssetSchema = z.object({
	assetName: z.string(),
	issuerIdentity: z.string(),
	ownedAmount: z.number()
})

const QubicAccountSchema = z.object({
	address: z.string(),
	amount: z.number(),
	assets: z.array(QubicAccountAssetSchema),
	name: z.string()
})

export type QubicAccount = z.infer<typeof QubicAccountSchema>

const QubicAccountArraySchema = z.array(QubicAccountSchema)

const SignTransationResultSchema = z.object({
	signedTransaction: z.string(),
	transactionId: z.string(),
	tick: z.number()
})

export type SignTransationResult = z.infer<typeof SignTransationResultSchema>

const SendTransationResultSchema = z.object({
	transactionId: z.string(),
	tick: z.number()
})

export type SendTransationResult = z.infer<typeof SendTransationResultSchema>

const SignMessageResultSchema = z.object({
	signedData: z.string(),
	digest: z.string(),
	signature: z.string()
})

export type SignMessageResult = z.infer<typeof SignMessageResultSchema>

export type EventListener<E extends SignClientTypes.Event = SignClientTypes.Event> = {
	event: E
	listener: (args: SignClientTypes.EventArguments[E]) => void
}

export type WalletConnectEventListeners = Readonly<{
	[E in SignClientTypes.Event]: EventListener<E>
}>[SignClientTypes.Event]

export class WalletConnectClient {
	private signClient: Client | null = null

	private approval: (() => Promise<SessionTypes.Struct>) | undefined

	public qubicChainId = envConfig.QUBIC_CHAIN_ID

	public connectionURL = ''

	public sessionTopic = ''

	public isInitalized = false

	private handleError(message: string, error: unknown): Promise<never> {
		console.error('[ WalletConnectClient ] - ', message, error)
		return Promise.reject(error)
	}

	private handleSessionConnected(sessionInfo: SessionTypes.Struct): void {
		this.sessionTopic = sessionInfo.topic
		localStorage.setItem(WcLocalStorageKeys.SESSION_TOPIC, this.sessionTopic)
		log('Session connected', sessionInfo)
	}

	private isSessionActive(): boolean {
		if (!this.signClient) {
			log('WalletConnect Client not initialized')
			return false
		}

		if (!this.sessionTopic) {
			log('No session topic is set')
			return false
		}

		const session = this.signClient.session.get(this.sessionTopic)
		if (session && session.expiry * 1000 > Date.now()) {
			log('Session is still valid')
			return true
		}

		this.clearSession('Session expired')
		return false
	}

	private async makeRequest(method: QubicNsMethods, params: object): Promise<unknown> {
		try {
			if (!this.signClient) {
				throw new Error('WalletConnect Client not initialized')
			}

			if (!this.isSessionActive()) {
				throw new Error('No active session to make a request')
			}

			const result = await this.signClient.request({
				topic: this.sessionTopic,
				chainId: this.qubicChainId,
				request: { method, params }
			})

			log(`Request ${method} result:`, result)
			return result
		} catch (error) {
			return this.handleError(`Failed to execute ${method}`, error)
		}
	}

	public async initClient(eventListeners: WalletConnectEventListeners[] = []): Promise<Client> {
		log('Initializing Client...')
		try {
			if (this.signClient) {
				log('Client already initialized, returning existing instance')
				return this.signClient
			}

			if (!envConfig.WALLET_CONNECT_PROJECT_ID) {
				throw new Error('Missing WalletConnect Project ID!')
			}

			this.signClient = await SignClient.init({
				projectId: envConfig.WALLET_CONNECT_PROJECT_ID,
				metadata: {
					name: envConfig.APP_TITLE,
					description: envConfig.APP_DESCRIPTION,
					url: envConfig.APP_URL,
					icons: ['https://qx.qubic.org/assets/icons/favicon.ico']
				}
			})

			if (!this.signClient) {
				throw new Error('Failed to initialize WalletConnect Client')
			}

			log('Client Initialized!')

			this.isInitalized = true

			if (eventListeners.length > 0) {
				eventListeners.forEach(({ event, listener }) => {
					this.signClient?.on(
						event as SignClientTypes.Event,
						listener as (args: SignClientTypes.EventArguments[typeof event]) => void
					)
				})
			}

			return this.signClient
		} catch (error) {
			return this.handleError('Error initializing WalletConnect Client', error)
		}
	}

	public async restoreSession(): Promise<SessionTypes.Struct | null> {
		try {
			if (!this.signClient) {
				throw new Error('WalletConnect Client not initialized')
			}

			const storedSessionTopic = localStorage.getItem(WcLocalStorageKeys.SESSION_TOPIC)
			const sessions = this.signClient.session.getAll() || []

			if (storedSessionTopic) {
				const session = sessions.find((s) => s.topic === storedSessionTopic)
				if (session) {
					this.handleSessionConnected(session)
					return session
				}
				localStorage.removeItem(WcLocalStorageKeys.SESSION_TOPIC)
			}
			return null
		} catch (error) {
			return this.handleError('Error restoring session', error)
		}
	}

	public async genConnectUrl(): Promise<{
		uri: string
		approval: (() => Promise<SessionTypes.Struct>) | undefined
	}> {
		try {
			if (!this.signClient) {
				throw new Error('WalletConnect Client not initialized')
			}

			const { uri, approval } =
				(await this.signClient.connect({
					requiredNamespaces: {
						qubic: {
							methods: Object.values(QubicNsMethods),
							chains: [this.qubicChainId],
							events: Object.values(WalletEvents)
						}
					}
				})) || {}

			if (!uri) {
				throw new Error('Failed to generate connection URL')
			}

			this.connectionURL = uri
			this.approval = approval

			return { uri, approval }
		} catch (error) {
			return this.handleError('Error generating URL', error)
		}
	}

	public async makeAprove(): Promise<SessionTypes.Struct> {
		try {
			if (!this.signClient) {
				throw new Error('WalletConnect Client not initialized')
			}

			if (!this.approval) {
				log('No pending approval found')
				throw new Error('No pending approval found')
			}
			const session = await this.approval()
			this.handleSessionConnected(session)
			return session
		} catch (error) {
			return this.handleError('Approval rejected', error)
		}
	}

	public async requestAccounts(): Promise<QubicAccount[]> {
		try {
			const result = await this.makeRequest(QubicNsMethods.WALLET_REQUEST_ACCOUNTS, {})

			const validation = QubicAccountArraySchema.safeParse(result)

			if (!validation.success) {
				throw new Error('Schema validation error. Invalid account data format')
			}

			return validation.data
		} catch (error) {
			return this.handleError('Error requesting accounts', error)
		}
	}

	public clearSession(message: string, payload?: unknown): void {
		log(message, payload)
		this.sessionTopic = ''
		localStorage.removeItem(WcLocalStorageKeys.SESSION_TOPIC)
	}

	public async disconnectWallet(): Promise<void> {
		try {
			if (!this.signClient) {
				throw new Error('WalletConnect Client not initialized')
			}

			if (!this.sessionTopic) {
				throw new Error('No active session to disconnect')
			}

			await this.signClient.disconnect({
				topic: this.sessionTopic,
				reason: { code: 6000, message: 'User disconnected' }
			})

			this.clearSession('Session disconnected')
		} catch (error) {
			this.handleError('Error disconnecting', error)
		}
	}

	// Qubic Methods
	public sendQubic(from: string, to: string, amount: number): Promise<unknown> {
		return this.makeRequest(QubicNsMethods.QUBIC_SEND_QUBIC, {
			from,
			to,
			amount
		})
	}

	public async signTransaction(
		from: string,
		to: string,
		amount: number,
		tick?: number,
		inputType?: number,
		payload?: string
	): Promise<SignTransationResult> {
		try {
			const result = await this.makeRequest(QubicNsMethods.QUBIC_SIGN_TRANSACTION, {
				from,
				to,
				amount,
				tick,
				inputType,
				payload: payload || null
			})

			const validation = SignTransationResultSchema.safeParse(result)

			if (!validation.success) {
				throw new Error(
					'Schema validation error. Invalid signed transaction result data format'
				)
			}

			return validation.data
		} catch (error) {
			return this.handleError('Error signin transaction', error)
		}
	}

	public async sendTransaction(
		from: string,
		to: string,
		amount: number,
		tick?: number,
		inputType?: number,
		payload?: string
	): Promise<SendTransationResult> {
		try {
			const result = await this.makeRequest(QubicNsMethods.QUBIC_SEND_TRANSACTION, {
				from,
				to,
				amount,
				tick,
				inputType,
				payload: payload || null,
				nonce: `${new Date().getTime()}`
			})

			const validation = SendTransationResultSchema.safeParse(result)

			if (!validation.success) {
				throw new Error(
					'Schema validation error. Invalid send transaction result data format'
				)
			}

			return validation.data
		} catch (error) {
			return this.handleError('Error sending transaction', error)
		}
	}

	public async signMessage(from: string, message: string): Promise<SignMessageResult> {
		try {
			const result = await this.makeRequest(QubicNsMethods.QUBIC_SIGN, {
				from,
				message
			})

			const validation = SignMessageResultSchema.safeParse(result)

			if (!validation.success) {
				throw new Error(
					'Schema validation error. Invalid signed transaction result data format'
				)
			}

			return validation.data
		} catch (error) {
			return this.handleError('Error signin message', error)
		}
	}

	public removeListeners(events: SignClientTypes.Event[]) {
		if (!this.signClient) {
			throw new Error('SignClient not initialized')
		}
		events.forEach(this.signClient.removeAllListeners)
		log('Listeners removed successfully!')
	}
}

export default WalletConnectClient
