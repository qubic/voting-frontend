import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { DropdownMenu } from '@/components'
import { ConnectWalletButton } from '@/components/buttons'
import { useIsMobile, useWalletConnect } from '@/hooks'
import { formatAddress } from '@/lib/formatters'
import type { QubicAccount } from '@/services/wallet-connect-client'

import AccountsSection from './AccountsSection'

export default function ConnectWalletMenu() {
	const [showDropdown, setShowDropdown] = useState(false)
	const { t } = useTranslation()
	const isMobile = useIsMobile()

	const { isWalletConnected, selectedAccount, accounts, disconnect, setSelectedAccount } =
		useWalletConnect()

	const handleDropdownToggle = () => setShowDropdown((prev) => !prev)

	const handleChangeAccount = useCallback(
		(account: QubicAccount) => {
			setSelectedAccount(account)
			handleDropdownToggle()
			toast.success(
				t('global.account_changed', {
					account: `${formatAddress(account.address)} (${account.name})`
				})
			)
		},
		[setSelectedAccount, t]
	)

	const availableAccounts = accounts.filter(
		(account) => account.address !== selectedAccount?.address
	)

	if (!isWalletConnected || !selectedAccount) {
		return (
			<ConnectWalletButton
				className="w-fit p-2 sm:px-3.5 sm:py-2.5 lg:flex"
				variant={isMobile ? 'text' : 'filled'}
				color="secondary"
				labelClassName="hidden sm:block"
				isMenuOpen={showDropdown}
			/>
		)
	}

	return (
		<DropdownMenu show={showDropdown} onToggle={handleDropdownToggle}>
			<DropdownMenu.Trigger
				as={
					<ConnectWalletButton
						size="sm"
						color="secondary"
						variant="outlined"
						labelClassName="hidden lg:block text-foreground"
						isMenuOpen={showDropdown}
					/>
				}
			/>
			<DropdownMenu.Content className="top-13 -left-36 min-w-80 sm:right-0 sm:left-auto">
				<div className="grid gap-5 p-4">
					<AccountsSection
						title={t('global.selected_account')}
						type="ConnectedAccounts"
						accounts={[selectedAccount]}
						isConnectedAccount={isWalletConnected}
						onConnect={handleChangeAccount}
						onDisconnect={disconnect}
					/>
					<AccountsSection
						title={t('global.available_accounts')}
						type="AvailableAccounts"
						accounts={availableAccounts}
						isConnectedAccount={false}
						onConnect={handleChangeAccount}
						onDisconnect={disconnect}
					/>
				</div>
			</DropdownMenu.Content>
		</DropdownMenu>
	)
}
