import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@/components'
import { Button } from '@/components/buttons'
import type { Option } from '@/components/Select'
import { formatAddress } from '@/lib/formatters'
import type { QubicAccount } from '@/services/wallet-connect-client'

import { ModalStep } from '../connect-wallet-modal.types'

interface Props {
	accounts: QubicAccount[]
	selectedAccount: QubicAccount | null
	setSelectedAccount: (account: QubicAccount | null) => void
	onModalStepChange: (step: ModalStep) => void
	onConfirm: () => void
}

const transformAccountToSelectOption = (account: QubicAccount) => ({
	label: `${account.name} (${formatAddress(account.address)})`,
	value: account.address
})

export default function AccountSelectStep({
	accounts,
	selectedAccount,
	setSelectedAccount,
	onModalStepChange,
	onConfirm
}: Props) {
	const { t } = useTranslation()
	const handleAccountSelection = useCallback(
		(selectedAddress: Option) => {
			const newSelectedAccount = accounts.find(
				(account) => account.address === selectedAddress.value
			)
			setSelectedAccount(newSelectedAccount ?? null)
		},
		[accounts, setSelectedAccount]
	)

	const selectOptions = useMemo(
		() => accounts.map((account) => transformAccountToSelectOption(account)),
		[accounts]
	)

	return (
		<div className="flex max-w-[424px] flex-col place-content-between gap-4">
			<p>{t('global.select_account')}:</p>
			<Select
				label="Select Account"
				onSelect={handleAccountSelection}
				options={selectOptions}
				defaultValue={selectOptions[0]}
			/>
			<div className="flex gap-2">
				<Button
					variant="outlined"
					onClick={() => onModalStepChange(ModalStep.CONNECTION_METHOD_SELECT)}
				>
					{t('global.cancel')}
				</Button>
				<Button onClick={onConfirm} disabled={!selectedAccount}>
					{t('global.confirm')}
				</Button>
			</div>
		</div>
	)
}
