import { LogOutIcon } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/buttons'
import { Button } from '@/components/ui'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

type Props = {
	address: string
	isConnected: boolean
	onConnect: () => void
	onDisconnect: () => void
}

const AccountActions = memo(({ address, isConnected, onConnect, onDisconnect }: Props) => {
	const { t } = useTranslation()

	if (!isConnected) {
		return (
			<Button onClick={onConnect} variant="outline" className="w-fit" size="sm">
				{t('global.select')}
			</Button>
		)
	}

	return (
		<div className="flex items-center gap-0.25">
			<CopyButton text={address} />

			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						type="button"
						size="icon"
						variant="ghost"
						aria-label="disconnect account"
						className="flex"
						onClick={onDisconnect}
					>
						<LogOutIcon className="text-muted-foreground size-4.5 shrink-0" />
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>Disconnect Wallet</p>
				</TooltipContent>
			</Tooltip>
		</div>
	)
})

export default AccountActions
