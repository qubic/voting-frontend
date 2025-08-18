import React, { memo } from 'react'
import { Link } from 'react-router'

import { QubicLogoShort } from '@/assets/icons/logo'

const footerTextClass = 'font-space text-xs text-white'

interface FooterLinkProps {
	label: string
	to: string
	isInternal: boolean
}

function FooterLink({ label, to, isInternal }: FooterLinkProps) {
	if (isInternal) {
		return (
			<Link className={footerTextClass} to={to}>
				{label}
			</Link>
		)
	}
	return (
		<a href={to} className={footerTextClass} target="_blank" role="button" rel="noreferrer">
			{label}
		</a>
	)
}

function Footer() {
	const linkItems: FooterLinkProps[] = [
		{ label: 'Terms of Service', to: 'https://qubic.org/terms-of-service', isInternal: false },
		{ label: 'Privacy Policy', to: 'https://qubic.org/privacy-policy', isInternal: false }
	]

	return (
		<footer className="flex flex-col items-center justify-center gap-2.5 px-3 py-5 md:flex-row md:gap-8 md:py-10">
			<div className="flex items-center gap-2.5">
				<QubicLogoShort />
				<p className="font-space text-muted-foreground text-xs">
					{'\u00A9'} {new Date().getFullYear()} Qubic.
				</p>
			</div>
			<div className="flex flex-wrap items-center justify-center gap-2.5">
				{linkItems.map((item, index) => (
					<React.Fragment key={item.label}>
						<FooterLink label={item.label} to={item.to} isInternal={item.isInternal} />
						{index < linkItems.length - 1 && (
							<span className="text-muted-foreground">•</span>
						)}
					</React.Fragment>
				))}
			</div>
			<p className="font-space text-muted-foreground text-xs">Version {__APP_VERSION__}</p>
		</footer>
	)
}

const MemoizedFooter = memo(Footer)

export default MemoizedFooter
