import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Badge } from '@/components/ui'
import { formatAddress, formatNumber } from '@/lib/formatters'
import type { QubicAccount } from '@/services/wallet-connect-client'

import AccountActions from './AccountActions'

type Props = {
	title: string
	accounts: QubicAccount[]
	type: 'ConnectedAccounts' | 'AvailableAccounts'
	isConnectedAccount: boolean
	onConnect: (account: QubicAccount) => void
	onDisconnect: () => void
}

export default function AccountsSection({
	title,
	accounts,
	type,
	isConnectedAccount,
	onConnect,
	onDisconnect
}: Props) {
	const { t } = useTranslation()

	const renderContent = useCallback(() => {
		if (accounts.length === 0 && type === 'AvailableAccounts') {
			return (
				<div className="text-xs text-slate-500">{t('global.no_additional_accounts')}</div>
			)
		}

		return accounts.map((account) => (
			<div
				key={account.address}
				className="flex items-start justify-between gap-8 whitespace-nowrap"
			>
				<div>
					<div className="flex items-center space-x-2">
						<p>{formatAddress(account.address)}</p>

						<Badge variant="muted">{account.name}</Badge>
					</div>
					{account.amount !== -1 && (
						<p className="mt-1 text-xs text-slate-500">
							{formatNumber(account.amount)} QUBIC
						</p>
					)}
				</div>

				<AccountActions
					address={account.address}
					isConnected={isConnectedAccount}
					onConnect={() => onConnect(account)}
					onDisconnect={onDisconnect}
				/>
			</div>
		))
	}, [accounts, isConnectedAccount, onConnect, onDisconnect, t, type])

	return (
		<section className="space-y-2.5">
			<h2 className="text-white">{title}</h2>

			{renderContent()}
		</section>
	)
}
