import type { ReactElement, ReactNode } from 'react'
import React, { forwardRef, useCallback, useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

interface DropdownMenuProps {
	children: ReactNode
	show: boolean
	className?: string
	onToggle: () => void
}

interface DropdownMenuTriggerPropsBase {
	onToggle?: () => void
	className?: string
}

interface DropdownMenuTriggerWithAs extends DropdownMenuTriggerPropsBase {
	as: ReactElement<React.HTMLProps<HTMLButtonElement>>
	children?: never
}

interface DropdownMenuTriggerWithChildren extends DropdownMenuTriggerPropsBase {
	as?: never
	children: ReactNode
}

type DropdownMenuTriggerProps = DropdownMenuTriggerWithAs | DropdownMenuTriggerWithChildren

interface DropdownMenuOptionsProps {
	children: ReactNode
	className?: string
}

function DropdownMenu({ className, children, show, onToggle }: DropdownMenuProps) {
	const dropdownRef = useRef<HTMLDivElement>(null)
	const triggerRef = useRef<HTMLElement | null>(null)

	const handleClickOutside = useCallback(
		(event: MouseEvent) => {
			if (!show) return
			if (
				dropdownRef.current?.contains(event.target as Node) ||
				triggerRef.current?.contains(event.target as Node)
			) {
				return
			}
			onToggle()
		},
		[onToggle, show]
	)

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [handleClickOutside, show])

	const trigger = React.Children.toArray(children).find(
		(child) => React.isValidElement(child) && child.type === DropdownMenu.Trigger
	) as ReactElement

	const content = React.Children.toArray(children).find(
		(child) => React.isValidElement(child) && child.type === DropdownMenu.Content
	) as ReactElement

	return (
		<div className={cn('relative flex text-left', className)}>
			{trigger &&
				React.cloneElement(
					trigger as ReactElement<{ ref: React.Ref<HTMLElement>; onToggle: () => void }>,
					{
						ref: triggerRef,
						onToggle
					}
				)}

			{show &&
				content &&
				React.cloneElement(content as ReactElement<{ ref: React.Ref<HTMLDivElement> }>, {
					ref: dropdownRef
				})}
		</div>
	)
}

const ClonedComponent = <T extends HTMLElement>({
	as,
	onToggle,
	className
}: {
	as: ReactElement<React.HTMLProps<T>>
	onToggle?: () => void
	className?: string
}) =>
	React.cloneElement(as, {
		onClick: onToggle,
		className: cn(as.props.className, className)
	})

DropdownMenu.Trigger = forwardRef<HTMLElement, DropdownMenuTriggerProps>(
	function DropdownMenuTrigger({ children, onToggle, className, as }, ref) {
		if (as) {
			return (
				<div ref={ref as React.Ref<HTMLDivElement>}>
					<ClonedComponent as={as} onToggle={onToggle} className={className} />
				</div>
			)
		}

		return (
			<button
				type="button"
				onClick={onToggle}
				className={className}
				ref={ref as React.Ref<HTMLButtonElement>}
			>
				{children}
			</button>
		)
	}
)

DropdownMenu.Content = forwardRef<HTMLDivElement, DropdownMenuOptionsProps>(
	function DropdownMenuContent({ children, className }, ref) {
		return (
			<div
				ref={ref}
				className={cn(
					'bg-card ring-opacity-5 ring-muted absolute top-10 z-50 mt-0.5 w-fit origin-top-right rounded-md border shadow-lg transition duration-1000 ease-in-out focus:outline-none ltr:right-0 ltr:left-auto rtl:right-auto rtl:left-0',
					className
				)}
				role="menu"
				aria-orientation="vertical"
				aria-labelledby="dropdown-content"
			>
				{children}
			</div>
		)
	}
)

export default DropdownMenu
