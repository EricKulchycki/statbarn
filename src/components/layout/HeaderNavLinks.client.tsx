'use client'

import Link from 'next/link'
import { NAV_ITEMS } from './navConfig'

export function HeaderNavLinks() {
  return (
    <div className="hidden min-w-0 flex-1 justify-center md:flex">
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href}>
          <item.icon className="size-6" />
          <span className="hidden md:inline">{item.label}</span>
        </Link>
      ))}
    </div>
  )
}
