'use client'

import { useMemo } from 'react'

import { CopyButton } from '@/components/buttons'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { EXPLORER_URL } from '@/constants/urls'
import { formatAddress } from '@/lib/formatters'
import { cn } from '@/lib/utils'

export const ExplorerLinkType = {
	ADDRESS: 'address',
	TRANSACTION: 'transaction',
	TICK: 'tick'
} as const

export type ExplorerLinkType = (typeof ExplorerLinkType)[keyof typeof ExplorerLinkType]

interface ExplorerLinkProps {
	value: string
	type: ExplorerLinkType
	label?: string | React.ReactNode
	className?: string
	tooltipContent?: string
	copy?: boolean
	ellipsis?: boolean
	showTooltip?: boolean
	noWrap?: boolean
}

const getExplorerLinkUrl = (value: string, type: ExplorerLinkType) => {
	switch (type) {
		case ExplorerLinkType.TRANSACTION:
			return `${EXPLORER_URL}/tx/${value}`
		case ExplorerLinkType.TICK:
			return `${EXPLORER_URL}/tick/${value}`
		case ExplorerLinkType.ADDRESS:
			return `${EXPLORER_URL}/address/${value}`
		default:
			throw new Error('Invalid link type')
	}
}

export default function ExplorerLink({
	value,
	type,
	label,
	className,
	tooltipContent = value,
	copy = false,
	ellipsis = false,
	showTooltip = false,
	noWrap = false
}: ExplorerLinkProps) {
	const linkContent = useMemo(() => {
		const getDisplayValue = () => {
			if (label) {
				return label
			}
			if (ellipsis) {
				return formatAddress(value)
			}
			return value
		}

		return (
			<div
				className={cn(
					'flex w-fit items-center gap-2',
					noWrap && 'whitespace-nowrap',
					className
				)}
			>
				<a
					className="text-primary hover:text-primary/80 text-sm break-all"
					href={getExplorerLinkUrl(value, type)}
					target="_blank"
					rel="noopener noreferrer"
				>
					{getDisplayValue()}
				</a>
				{copy && <CopyButton text={value} />}
			</div>
		)
	}, [value, type, label, ellipsis, copy, noWrap, className])

	if (showTooltip) {
		return (
			<Tooltip>
				<TooltipTrigger asChild>{linkContent}</TooltipTrigger>
				<TooltipContent>
					<p className="font-mono text-xs">{tooltipContent}</p>
				</TooltipContent>
			</Tooltip>
		)
	}

	return linkContent
}
