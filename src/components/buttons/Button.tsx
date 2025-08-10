import { cn } from '@/lib/utils'

import { LoadingSpinner } from '../loaders'

type Variant = 'filled' | 'outlined' | 'text' | 'link'
type Color = 'primary' | 'secondary'
type Size = 'xxs' | 'xs' | 'sm' | 'md' | 'lg'

export type ButtonProps<T extends React.ElementType = 'button'> = {
	children: React.ReactNode
	variant?: Variant
	size?: Size
	color?: Color
	className?: string
	as?: T
	isLoading?: boolean
	loadingText?: string
} & React.ComponentPropsWithoutRef<T>

const sizeClasses = {
	xxs: 'px-2 py-1.5 text-xxs gap-1',
	xs: 'px-3 py-2 text-xs gap-1.5',
	sm: 'px-4 py-2 text-sm',
	md: 'px-6 py-3 text-base',
	lg: 'px-7 py-3.5 text-lg'
} as const

const colorVariantClasses = {
	primary: {
		filled: 'text-primary-foreground bg-primary hover:bg-primary-40 disabled:hover:bg-primary/90',
		outlined:
			'text-primary border border-primary hover:bg-primary-60 disabled:hover:bg-transparent',
		text: 'text-primary-30 hover:bg-primary-60 disabled:hover:bg-transparent',
		link: 'text-primary-30 hover:text-primary-40 p-0 hover:underline disabled:hover:text-primary-30'
	},
	secondary: {
		filled: 'text-foreground bg-secondary/80 hover:bg-secondary/60 disabled:hover:bg-secondary-80',
		outlined:
			'text-primary border border-muted hover:bg-secondary/60 disabled:hover:bg-transparent',
		text: 'text-primary hover:bg-secondary/60 disabled:hover:bg-transparent',
		link: 'text-primary p-0 hover:underline disabled:hover:text-primary'
	}
} as const

export default function Button<T extends React.ElementType = 'button'>({
	children,
	variant = 'filled',
	color = 'primary',
	size = 'md',
	className,
	as,
	isLoading = false,
	loadingText = 'Loading...',
	...restProps
}: ButtonProps<T>) {
	const Component: React.ElementType = as || 'button'

	return (
		<Component
			{...restProps}
			className={cn(
				'font-space flex w-full items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap transition duration-300 hover:cursor-pointer disabled:cursor-not-allowed disabled:no-underline disabled:opacity-30',
				sizeClasses[size],
				colorVariantClasses[color][variant],
				className
			)}
		>
			{isLoading ? (
				<div className="flex items-center gap-2">
					<LoadingSpinner />
					<span>{loadingText}</span>
				</div>
			) : (
				children
			)}
		</Component>
	)
}
