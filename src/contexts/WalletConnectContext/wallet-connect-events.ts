import { LogFeature, makeLog } from '@/lib/logger'
import {
	type QubicAccount,
	type WalletConnectClient,
	type WalletConnectEventListeners,
	WalletEvents
} from '@/services/wallet-connect-client'

import { WalletConnectionStatus } from './WalletConnectContext'

const log = makeLog(LogFeature.WALLET_CONNECT_CONTEXT)

const PROPOSAL_EXPIRE_EXCLUDED_STATUSES = [
	WalletConnectionStatus.PROPOSAL_EXPIRED,
	WalletConnectionStatus.USER_REJECTED_CONNECTION,
	WalletConnectionStatus.ERROR
]

type CreateWalletConnectListenersInput = {
	updateStatus: (status: WalletConnectionStatus) => void
	disconnect: () => void
	walletClient: WalletConnectClient
	statusRef: React.RefObject<WalletConnectionStatus>
	setAccounts: React.Dispatch<React.SetStateAction<QubicAccount[]>>
}

export function createWalletConnectListeners({
	updateStatus,
	disconnect,
	walletClient,
	statusRef,
	setAccounts
}: CreateWalletConnectListenersInput): WalletConnectEventListeners[] {
	return [
		{
			event: 'proposal_expire',
			listener: (payload) => {
				log('proposal_expire', payload)
				if (!PROPOSAL_EXPIRE_EXCLUDED_STATUSES.includes(statusRef.current)) {
					updateStatus(WalletConnectionStatus.PROPOSAL_EXPIRED)
				}
			}
		},
		{
			event: 'session_delete',
			listener: (payload) => {
				log('session_delete', payload)
				disconnect()
			}
		},
		{
			event: 'session_event',
			listener: (payload) => {
				log('session_event', payload.params.event.name)
				if (
					Object.values(WalletEvents).includes(payload.params.event.name as WalletEvents)
				) {
					walletClient.requestAccounts().then((requestedAccounts) => {
						setAccounts(requestedAccounts)
					})
				}
			}
		},
		{
			event: 'session_expire',
			listener: (payload) => {
				log('session_expire', payload)
				walletClient.clearSession('Session expired', payload)
			}
		}
	]
}

export function removeWalletConnectListeners(walletClient: WalletConnectClient) {
	walletClient.removeListeners([
		'proposal_expire',
		'session_delete',
		'session_event',
		'session_expire'
	])
}
