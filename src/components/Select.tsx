import { ChevronDownIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'

import { cn } from '@/lib/utils'

export type Option = {
	readonly label: string
	readonly value: string | number
}

type Props = {
	label: string
	options: readonly Option[]
	onSelect: (option: Option) => void
	name?: string
	showLabel?: boolean
	defaultValue?: Option
	className?: string
}

export default function Select({
	label,
	options,
	onSelect,
	defaultValue,
	name = `select-${label}`,
	showLabel = false,
	className
}: Props) {
	const [selected, setSelected] = useState(defaultValue || { label, value: '' })

	const handleSelect = (option: Option) => {
		setSelected(option)
		onSelect(option)
	}

	useEffect(() => {
		if (options && defaultValue) {
			setSelected(
				(prev) => options.find((option) => option.value === prev.value) || options[0]
			)
			onSelect(selected)
		}
	}, [defaultValue, onSelect, options, selected])

	return (
		<Listbox value={selected} onChange={handleSelect} name={name}>
			<Label
				className={cn(
					'mb-1.5 block text-sm font-normal text-gray-400',
					!showLabel && 'sr-only'
				)}
			>
				{label}
			</Label>
			<div className={cn('font-space relative w-full', className)}>
				<ListboxButton className="text-foreground border-muted bg-primary-70 hover:border-primary-50 focus:border-primary-50 focus:ring-primary-50 active:ring-primary-50 relative w-full cursor-default rounded-md border py-2 pr-4 pl-3 text-left text-sm shadow-sm hover:cursor-pointer focus:ring-1 focus:outline-none sm:py-4 sm:pr-8 sm:pl-3.5 sm:text-base sm:leading-6">
					<span
						className={cn(
							'block truncate leading-tight',
							selected.label === label && 'text-muted-foreground'
						)}
					>
						{selected.label}
					</span>
					<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
						<ChevronDownIcon
							aria-hidden="true"
							className="text-muted-foreground size-4.5 sm:size-5"
						/>
					</span>
				</ListboxButton>

				<ListboxOptions
					transition
					className="bg-card ring-opacity-5 scrollbar-thin scrollbar-thumb-rounded-full ring-muted absolute z-10 mt-0.25 w-full overflow-auto rounded-md py-1.25 text-base shadow-2xl ring-1 drop-shadow-2xl focus:outline-none data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in data-[closed]:data-[leave]:opacity-0 sm:text-sm"
				>
					{options.map((option, index) => (
						<ListboxOption
							key={option.value}
							value={option}
							className={cn(
								index === 0 && 'rounded-t-md',
								'text-foreground group font-space data-[focus]:bg-primary-60 data-[selected]:bg-muted/80 relative cursor-default px-2.5 py-2 text-sm select-none hover:cursor-pointer data-[focus]:text-white sm:px-4 sm:py-2.5 sm:text-base'
							)}
						>
							<span className="block truncate font-normal group-data-[selected]:font-semibold">
								{option.label}
							</span>
						</ListboxOption>
					))}
				</ListboxOptions>
			</div>
		</Listbox>
	)
}
