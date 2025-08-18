import { useCallback, useEffect, useRef, useState } from 'react'

import { POLLING_INTERVALS } from '@/constants/polling-intervals'
import { LogFeature, makeLog } from '@/lib/logger'
import { useGetTickInfoQuery, useLazyGetTransactionQuery } from '@/store/apis/qubic-rpc'
import type { PendingTransaction } from '@/types'

const log = makeLog(LogFeature.TX_MONITOR)

import { toast } from 'sonner'

import { LOCAL_STORAGE_KEYS } from '@/constants/local-storage-keys'
import { TOASTS_DURATIONS } from '@/constants/toasts-durations'

export interface TransactionResult {
	success: boolean
	message: string
}

export const TX_MSG = {
	createPoll: {
		success: 'Poll created successfully',
		failed: 'Poll creation failed',
		pending: 'Poll creation pending'
	},
	vote: {
		success: 'Vote cast successfully',
		failed: 'Vote cast failed',
		pending: 'Vote cast pending'
	},
	cancelPoll: {
		success: 'Poll cancelled successfully',
		failed: 'Poll cancellation failed',
		pending: 'Poll cancellation pending'
	}
} as const

/* --------------------------
   Storage helpers
--------------------------- */
export function loadTransactionsHistoryFromStorage(): PendingTransaction[] {
	const stored = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTION_HISTORY)
	if (!stored) return []
	try {
		const parsed: PendingTransaction[] = JSON.parse(stored)
		return parsed
	} catch {
		localStorage.removeItem(LOCAL_STORAGE_KEYS.TRANSACTION_HISTORY)
		return []
	}
}

export function saveTransactionHistory(transaction: PendingTransaction) {
	const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTION_HISTORY)
	const history: PendingTransaction[] = existing ? JSON.parse(existing) : []
	const idx = history.findIndex((tx) => tx.txHash === transaction.txHash)
	const updated =
		idx >= 0
			? history.map((tx, i) => (i === idx ? transaction : tx))
			: [...history, transaction]
	localStorage.setItem(LOCAL_STORAGE_KEYS.TRANSACTION_HISTORY, JSON.stringify(updated))
}

export function getTransactionHistory(): PendingTransaction[] {
	const existing = localStorage.getItem(LOCAL_STORAGE_KEYS.TRANSACTION_HISTORY)
	return existing ? JSON.parse(existing) : []
}

/* --------------------------
   Toast helpers
--------------------------- */
export function showPendingToast(tx: PendingTransaction) {
	const id = tx.txHash
	toast.loading(TX_MSG[tx.type].pending, {
		id,
		duration: TOASTS_DURATIONS.PENDING,
		description: `Target tick: ${tx.targetTick}`,
		action: { label: 'Dismiss', onClick: () => toast.dismiss(id) }
	})
}

export function showResultToast(tx: PendingTransaction, result: TransactionResult) {
	if (result.success) {
		toast.success(`✅ ${result.message}`, {
			id: tx.txHash,
			description: '',
			duration: TOASTS_DURATIONS.SUCCESS,
			action: undefined
		})
	} else {
		toast.error(`❌ ${result.message}`, {
			id: tx.txHash,
			description: '',
			duration: TOASTS_DURATIONS.ERROR,
			action: undefined
		})
	}
}

type AddPendingTransactionInput =
	| Omit<Extract<PendingTransaction, { type: 'createPoll' }>, 'status'>
	| Omit<Extract<PendingTransaction, { type: 'vote' }>, 'status'>
	| Omit<Extract<PendingTransaction, { type: 'cancelPoll' }>, 'status'>

export const useTxMonitor = () => {
	// Storage strategy: All transactions (pending, success, failed) are stored in a single
	// localStorage key (TRANSACTION_HISTORY). We maintain two separate React states:
	// - pendingTransactions: for active monitoring and UI display
	// - transactionHistory: for completed transactions display
	const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([])
	const [transactionHistory, setTransactionHistory] = useState<PendingTransaction[]>([])

	const isInitializedRef = useRef(false)
	const lastTickProcessedRef = useRef(new Map<string, number>())

	const { data: tickInfo } = useGetTickInfoQuery(undefined, {
		pollingInterval: pendingTransactions.length > 0 ? POLLING_INTERVALS.TX_MONITOR : 0
	})
	const [getTransactionQuery] = useLazyGetTransactionQuery()

	/* --------------------------
     Helpers
  	--------------------------- */

	const checkTransactionResult = useCallback(
		async (tx: PendingTransaction): Promise<TransactionResult> => {
			if (!tickInfo?.tick || tickInfo.tick <= tx.targetTick) {
				return { success: false, message: TX_MSG[tx.type].pending }
			}
			try {
				const { data } = await getTransactionQuery(tx.txHash)
				if (!data) {
					return {
						success: false,
						message: `${TX_MSG[tx.type].failed}: Transaction not found on network at targeted tick ${tx.targetTick}`
					}
				}
				return {
					success: !!data.moneyFlew,
					message: data.moneyFlew ? TX_MSG[tx.type].success : TX_MSG[tx.type].failed
				}
			} catch {
				return {
					success: false,
					message: `${TX_MSG[tx.type].failed}: Transaction check failed`
				}
			}
		},
		[tickInfo?.tick, getTransactionQuery]
	)

	const markTxDoneSoon = useCallback((txHash: string) => {
		setTimeout(() => {
			setPendingTransactions((prev) => prev.filter((tx) => tx.txHash !== txHash))
			lastTickProcessedRef.current.delete(txHash)
		}, 1000)
	}, [])

	/* --------------------------
     Public
  	--------------------------- */

	const addPendingTransaction = useCallback((tx: AddPendingTransactionInput) => {
		const newTx: PendingTransaction = { ...tx, status: 'pending' }
		setPendingTransactions((prev) => [...prev, newTx])
		saveTransactionHistory(newTx)
		showPendingToast(newTx)
		return newTx.txHash
	}, [])

	const updateTransactionStatus = useCallback(
		(txHash: string, status: PendingTransaction['status'], errorMessage?: string) => {
			setPendingTransactions((prev) => {
				const next = prev.map((tx) =>
					tx.txHash === txHash
						? {
								...tx,
								status,
								errorMessage: status === 'success' ? undefined : errorMessage
							}
						: tx
				)
				const updated = next.find((tx) => tx.txHash === txHash)
				if (updated) {
					saveTransactionHistory(updated)
					// Update local history state
					setTransactionHistory((prevHistory) => {
						const existingIndex = prevHistory.findIndex((tx) => tx.txHash === txHash)
						return existingIndex >= 0
							? [
									...prevHistory.slice(0, existingIndex),
									updated,
									...prevHistory.slice(existingIndex + 1)
								]
							: [...prevHistory, updated]
					})
				}
				return next
			})
			if (status === 'success' || status === 'failed') markTxDoneSoon(txHash)
		},
		[markTxDoneSoon]
	)

	const removeTransaction = useCallback((txHash: string) => {
		setPendingTransactions((prev) => prev.filter((tx) => tx.txHash !== txHash))
		lastTickProcessedRef.current.delete(txHash)
	}, [])

	useEffect(() => {
		if (isInitializedRef.current) return
		isInitializedRef.current = true
		const allTransactions = loadTransactionsHistoryFromStorage()
		const pending = allTransactions.filter((tx) => tx.status === 'pending')
		const completed = allTransactions.filter((tx) => tx.status !== 'pending')
		setPendingTransactions(pending)
		setTransactionHistory(completed)
	}, [])

	useEffect(() => {
		if (!isInitializedRef.current) return
		// Save all transactions (both pending and completed) to the single TRANSACTION_HISTORY storage
		const allTransactions = [...pendingTransactions, ...transactionHistory]
		allTransactions.forEach((tx) => saveTransactionHistory(tx))
	}, [pendingTransactions, transactionHistory])

	// monitor (per-tick guarded)
	useEffect(() => {
		if (!tickInfo?.tick || !isInitializedRef.current) return

		const monitorTransactions = async () => {
			const currentTick = tickInfo.tick
			const currentPending = pendingTransactions.filter((tx) => tx.status === 'pending')
			if (currentPending.length === 0) {
				log('No pending transactions to monitor for tick:', currentTick)
				return
			}

			log('Monitoring transactions for tick:', currentTick, 'count:', currentPending.length)

			for (const tx of currentPending) {
				const lastTick = lastTickProcessedRef.current.get(tx.txHash)
				if (lastTick === currentTick) continue
				lastTickProcessedRef.current.set(tx.txHash, currentTick)

				const result = await checkTransactionResult(tx)
				if (result.success || result.message !== TX_MSG[tx.type].pending) {
					showResultToast(tx, result)
					updateTransactionStatus(
						tx.txHash,
						result.success ? 'success' : 'failed',
						result.success ? undefined : result.message
					)
				}
			}
		}

		monitorTransactions()
	}, [tickInfo?.tick, pendingTransactions, checkTransactionResult, updateTransactionStatus])

	return {
		pendingTransactions,
		transactionHistory,
		addPendingTransaction,
		removeTransaction,
		updateTransactionStatus,
		getTransactionHistory,
		isInitialized: isInitializedRef.current
	}
}
