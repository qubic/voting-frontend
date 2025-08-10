import { Link } from 'react-router'

import { QvotingDarkLogo } from '@/assets/icons'
import { PublicRoutes } from '@/router/routes'

import ConnectWalletMenu from './ConnectWalletMenu/ConnectWalletMenu'

export default function Header() {
	return (
		<header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 h-[var(--header-height)] w-full border-b px-4 shadow-sm backdrop-blur sm:h-[var(--header-height-desktop)]">
			<div className="container mx-auto flex h-full items-center justify-between">
				<Link to={PublicRoutes.HOME}>
					<QvotingDarkLogo />
				</Link>

				<ConnectWalletMenu />
			</div>
		</header>
	)
}
