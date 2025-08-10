import { ChevronDownIcon, WalletIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { QubicIconDark } from '@/assets/icons'
import { useWalletConnect } from '@/hooks'
import { formatAddress } from '@/lib/formatters'
import { cn } from '@/lib/utils'

import Button, { type ButtonProps } from './Button'

type ConnectWalletButtonProps = Omit<ButtonProps, 'onClick' | 'children'> & {
	labelClassName?: string
	showArrowIcon?: boolean
	onClick?: () => void
	isMenuOpen?: boolean
}

export default function ConnectWalletButton({
	labelClassName,
	onClick,
	isMenuOpen,
	...buttonProps
}: ConnectWalletButtonProps) {
	const { t } = useTranslation()

	const { isWalletConnected, selectedAccount, handleConnectWallet } = useWalletConnect()

	const handleClick = () => {
		if (onClick) {
			onClick()
		} else {
			handleConnectWallet()
		}
	}

	return (
		<Button {...buttonProps} aria-label="Connect Wallet" onClick={handleClick}>
			{isWalletConnected && (
				<QubicIconDark className="size-7 rounded-full border bg-white p-0.5" />
			)}
			<span className={labelClassName}>
				{isWalletConnected
					? formatAddress(selectedAccount?.address)
					: t('global.connect_wallet')}
			</span>
			{isWalletConnected ? (
				<ChevronDownIcon
					className={cn(
						'text-muted-foreground ml-2 size-5 transition-transform duration-300',
						isMenuOpen ? 'rotate-180' : 'rotate-0'
					)}
				/>
			) : (
				<WalletIcon className="text-muted-foreground size-6 lg:size-5" />
			)}
		</Button>
	)
}
