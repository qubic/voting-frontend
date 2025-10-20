import { Terminal } from 'lucide-react'
import { Link } from 'react-router'

import { QvotingDarkLogo } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { PublicRoutes } from '@/router/routes'

import ConnectWalletMenu from './ConnectWalletMenu/ConnectWalletMenu'

export default function Header() {
	return (
		<header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 h-[var(--header-height)] w-full border-b px-4 shadow-sm backdrop-blur sm:h-[var(--header-height-desktop)]">
			<div className="container mx-auto flex h-full items-center justify-between">
				<Link to={PublicRoutes.HOME}>
					<QvotingDarkLogo />
				</Link>

				<div className="flex items-center gap-3">
					<Link to={PublicRoutes.CLI_VOTING}>
						<Button variant="outlined" size="sm" className="hidden sm:flex items-center gap-2">
							<Terminal className="h-4 w-4" />
							<span>CLI Voting</span>
						</Button>
					</Link>
					<ConnectWalletMenu />
				</div>
			</div>
		</header>
	)
}
