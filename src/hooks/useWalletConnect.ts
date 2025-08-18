import { useContext } from 'react'

import type { IWalletConnectContext } from '@/contexts'
import { WalletConnectContext } from '@/contexts'

export function useWalletConnect(): IWalletConnectContext {
	const context = useContext(WalletConnectContext)
	if (!context) {
		throw new Error('useWalletConnect must be used within a WalletConnectProvider')
	}
	return context
}
