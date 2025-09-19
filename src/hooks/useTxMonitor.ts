import { useCallback, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'

import { POLLING_INTERVALS } from '@/constants/polling-intervals'
import { LogFeature, makeLog } from '@/lib/logger'
import { useGetTickInfoQuery, useLazyGetTransactionQuery } from '@/store/apis/qubic-rpc'
import {
    addPendingTransaction as addPendingTx,
    initializeFromStorage,
    removeTransaction as removeTx,
    updateTransactionStatus as updateTxStatus
} from '@/store/slices/transactions.slice'
import type { PendingTransaction, TransactionStatus } from '@/types'

const log = makeLog(LogFeature.TX_MONITOR)

import { toast } from 'sonner'

import { TOASTS_DURATIONS } from '@/constants/toasts-durations'
import { selectTransactions } from '@/store/slices/transactions.slice'

import { useAppSelector } from './redux'

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
	},
	distributeQuToShareholders: {
		success: 'QU distributed to shareholders successfully',
		failed: 'QU distribution failed',
		pending: 'QU distribution pending'
	}
} as const

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
	| Omit<Extract<PendingTransaction, { type: 'distributeQuToShareholders' }>, 'status'>

export const useTxMonitor = () => {
	const dispatch = useDispatch()
	const { pendingTransactions, transactionHistory } = useAppSelector(selectTransactions)

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

	/* --------------------------
     Public
  	--------------------------- */

	const addPendingTransaction = useCallback(
		(tx: AddPendingTransactionInput) => {
			const newTx: PendingTransaction = { ...tx, status: 'pending' }
			dispatch(addPendingTx(newTx))
			showPendingToast(newTx)
			return newTx.txHash
		},
		[dispatch]
	)

	const updateTransactionStatus = useCallback(
		(txHash: string, status: PendingTransaction['status'], errorMessage?: string) => {
			dispatch(updateTxStatus({ txHash, status, errorMessage }))
		},
		[dispatch]
	)

	const removeTransaction = useCallback(
		(txHash: string) => {
			dispatch(removeTx(txHash))
			lastTickProcessedRef.current.delete(txHash)
		},
		[dispatch]
	)

	const refreshTransaction = useCallback(
		async (txHash: string) => {
			log('🔍 Starting refresh for tx:', txHash)

			const tx = [...pendingTransactions, ...transactionHistory].find(
				(t) => t.txHash === txHash
			)

			if (!tx) {
				log('❌ Transaction with hash', txHash, 'not found')
				return
			}

			try {
				const result = await checkTransactionResult(tx)

				if (result.success || result.message !== TX_MSG[tx.type].pending) {
					showResultToast(tx, result)

					const newStatus: TransactionStatus = result.success ? 'success' : 'failed'

					dispatch(
						updateTxStatus({
							txHash,
							status: newStatus,
							errorMessage: result.success ? undefined : result.message
						})
					)
				}
			} catch (error) {
				console.error('❌ Refresh failed:', error)
			}
		},
		[pendingTransactions, transactionHistory, checkTransactionResult, dispatch]
	)

	useEffect(() => {
		if (isInitializedRef.current) return
		isInitializedRef.current = true

		dispatch(initializeFromStorage())
	}, [dispatch])

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
		refreshTransaction,
		isInitialized: isInitializedRef.current
	}
}
