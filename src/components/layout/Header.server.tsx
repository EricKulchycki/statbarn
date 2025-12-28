import { APP_CONFIG } from '@/constants'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@heroui/react'
import { UserButton } from '@/components/auth/UserButton'

interface HeaderProps {
  percentage: number
  className?: string
}

export function Header({ percentage, className = '' }: HeaderProps) {
  return (
    <header
      className={`bg-gray-900 shadow-sm dark:border-gray-700 transition-colors duration-200 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0 mr-2">
              <Link href="/">
                <Image
                  src="/statbarn_logo.png"
                  alt="App Logo"
                  width={200}
                  height={80}
                  priority
                />
              </Link>
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-gray-300 dark:text-gray-400 transition-colors duration-200">
                {APP_CONFIG.description}
              </p>
            </div>
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800">
              <span className="text-sm text-gray-300">Accuracy:</span>
              <span
                className={cn(
                  'text-lg font-bold',
                  percentage < 50
                    ? 'text-red-400'
                    : percentage < 55
                      ? 'text-orange-400'
                      : 'text-green-400'
                )}
              >
                {percentage.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/"
                className=" text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                href="/pickem"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Make Picks
              </Link>
              <Link
                href="/upsets"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Upsets
              </Link>
              <Link
                href="/model-confidence"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Confidence
              </Link>
              <Link
                href="/historical"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Power Rankings
              </Link>
            </nav>
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  )
}
