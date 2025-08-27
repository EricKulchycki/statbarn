import { Chip } from '@heroui/react'

type WinLossChipProps = {
  val: 'win' | 'loss'
}

export function WinLossChip({ val }: WinLossChipProps) {
  return (
    <Chip variant="flat" color={val === 'win' ? 'success' : 'danger'}>
      {val === 'win' ? 'Win' : 'Loss'}
    </Chip>
  )
}
