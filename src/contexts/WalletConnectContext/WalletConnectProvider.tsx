import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { SessionTypes } from '@walletconnect/types'

import { useAppDispatch } from '@/hooks'
import { extractErrorMessage } from '@/lib/errors'
import { LogFeature, makeLog } from '@/lib/logger'
import type { QubicAccount } from '@/services/wallet-connect-client'
import { WalletConnectClient } from '@/services/wallet-connect-client'
import { ModalType, showModal } from '@/store/slices/modal.slice'

import { createWalletConnectListeners, removeWalletConnectListeners } from './wallet-connect-events'
import {
	type IWalletConnectContext,
	WalletConnectContext,
	WalletConnectionStatus
} from './WalletConnectContext'

const log = makeLog(LogFeature.WALLET_CONNECT_CONTEXT)

export default function WalletConnectProvider({ children }: { children: React.ReactNode }) {
	const dispatch = useAppDispatch()

	const [session, setSession] = useState<SessionTypes.Struct | null>(null)
	const [wcUri, setWcUri] = useState<string>('')
	const [status, setStatus] = useState<WalletConnectionStatus>(WalletConnectionStatus.IDLE)
	const [accounts, setAccounts] = useState<QubicAccount[]>([])
	const [selectedAccount, setSelectedAccount] = useState<QubicAccount | null>(null)

	const isWalletConnected = useMemo(() => !!session && accounts.length > 0, [session, accounts])

	const walletClient = useMemo(() => new WalletConnectClient(), [])

	const statusRef = useRef(status)
	const sessionRef = useRef(session)

	statusRef.current = status
	sessionRef.current = session

	/**
	 * Helper function to update the connection status.
	 */
	const updateStatus = useCallback((newStatus: WalletConnectionStatus) => {
		setStatus((prevStatus) => {
			log(`Status changed from ${prevStatus} to ${newStatus}`)
			return newStatus
		})
	}, [])

	const connect = useCallback(async () => {
		try {
			// Making sure that uri is empty before connecting
			setWcUri('')
			updateStatus(WalletConnectionStatus.CONNECTING)

			const { uri } = await walletClient.genConnectUrl()

			setWcUri(uri)

			const newSession = await walletClient.makeAprove()

			setSession(newSession)

			updateStatus(WalletConnectionStatus.REQUESTING_ACCOUNTS)
			const requestedAccounts = await walletClient.requestAccounts()

			setAccounts(requestedAccounts)
			updateStatus(WalletConnectionStatus.CONNECTED)
		} catch (error) {
			console.error('Connection Error:', error)

			const errorMessage = extractErrorMessage(error)
			if (errorMessage.includes('Proposal expired')) {
				updateStatus(WalletConnectionStatus.PROPOSAL_EXPIRED)
			} else if (
				error &&
				typeof error === 'object' &&
				'code' in error &&
				error.code === 5000
			) {
				updateStatus(WalletConnectionStatus.USER_REJECTED_CONNECTION)
			} else {
				updateStatus(WalletConnectionStatus.ERROR)
			}
		} finally {
			setWcUri('')
		}
	}, [updateStatus, walletClient])

	const disconnect = useCallback(async () => {
		try {
			if (!sessionRef.current) {
				throw new Error('No active session to disconnect')
			}

			await walletClient.disconnectWallet()

			setSession(null)
			setAccounts([])
			setSelectedAccount(null)
			updateStatus(WalletConnectionStatus.IDLE)
		} catch (error) {
			console.error('Error while trying to disconnect:', error)
		}
	}, [updateStatus, walletClient])

	const handleConnectWallet = useCallback(() => {
		dispatch(showModal({ modalType: ModalType.CONNECT_WALLET }))
	}, [dispatch])

	useEffect(() => {
		const initWalletClient = async () => {
			await walletClient.initClient(
				createWalletConnectListeners({
					updateStatus,
					disconnect,
					walletClient,
					statusRef,
					setAccounts
				})
			)

			const restoredSession = await walletClient.restoreSession()

			if (restoredSession) {
				log('Restored session:', restoredSession)
				setSession(restoredSession)
				const requestedAccounts = await walletClient.requestAccounts()
				setAccounts(requestedAccounts)
				setSelectedAccount(requestedAccounts[0])
			}
		}

		initWalletClient()

		return () => {
			if (walletClient.isInitalized) {
				removeWalletConnectListeners(walletClient)
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps -- We only want to run this effect once
	}, [])

	const contextValue: IWalletConnectContext = useMemo(
		() => ({
			walletClient,
			session,
			status,
			wcUri,
			connect,
			disconnect,
			accounts,
			selectedAccount,
			setSelectedAccount,
			isWalletConnected,
			handleConnectWallet
		}),
		[
			walletClient,
			session,
			status,
			wcUri,
			connect,
			disconnect,
			accounts,
			selectedAccount,
			isWalletConnected,
			handleConnectWallet
		]
	)

	log({ session, status, accounts, selectedAccount })

	return (
		<WalletConnectContext.Provider value={contextValue}>
			{children}
		</WalletConnectContext.Provider>
	)
}
