import {
  HomeIcon,
  TrophyIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { ComponentType, SVGProps } from 'react'

export interface NavItem {
  href: string
  label: string
  shortLabel?: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  exact?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: HomeIcon, exact: true },
  {
    href: '/pickem',
    label: 'Make Picks',
    shortLabel: 'Picks',
    icon: TrophyIcon,
  },
  {
    href: '/historical',
    label: 'Rankings',
    shortLabel: 'Rankings',
    icon: UserGroupIcon,
  },
]

export function isNavItemActive(
  pathname: string,
  href: string,
  exact?: boolean
): boolean {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}
