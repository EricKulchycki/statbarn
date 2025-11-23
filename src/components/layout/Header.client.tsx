'use client'

import { useIsMobile } from '@/hooks/useIsMobile'
import {
  ChartBarIcon,
  HomeIcon,
  TableCellsIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid'
import { Header } from './Header.server'
import { useRouter } from 'next/navigation'

interface Props {
  accuracyPercentage: number
}

export function Nav(props: Props) {
  const { accuracyPercentage } = props
  const isMobile = useIsMobile()

  if (isMobile) {
    // Simplified header for mobile
    return <MobileNav />
  }

  return <Header percentage={accuracyPercentage} />
}

export function MobileNav() {
  const router = useRouter()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 flex justify-around items-center h-14 md:hidden">
      <div
        onClick={() => router.push('/')}
        className="flex flex-col items-center text-slate-300 hover:text-blue-400"
      >
        <HomeIcon className="w-6 h-6 mb-1" />
        <span className="text-xs">Home</span>
      </div>
      <div
        onClick={() => router.push('/model-confidence')}
        className="flex flex-col items-center text-slate-300 hover:text-blue-400"
      >
        <ChartBarIcon className="w-6 h-6 mb-1" />
        <span className="text-xs">Confidence</span>
      </div>
      <div
        onClick={() => router.push('/upsets')}
        className="flex flex-col items-center text-slate-300 hover:text-blue-400"
      >
        <TableCellsIcon className="w-6 h-6 mb-1" />
        <span className="text-xs">Upsets</span>
      </div>
      <div
        onClick={() => router.push('/historical')}
        className="flex flex-col items-center text-slate-300 hover:text-blue-400"
      >
        <UserGroupIcon className="w-6 h-6 mb-1" />
        <span className="text-xs">Teams</span>
      </div>
    </nav>
  )
}
