import { APP_CONFIG } from '@/constants'
import Link from 'next/link'
import Image from 'next/image'

interface HeaderProps {
  className?: string
}

export function Header({ className = '' }: HeaderProps) {
  return (
    <header
      className={`bg-gray-900 shadow-sm dark:border-gray-700 transition-colors duration-200 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
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
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/"
              className=" text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              Home
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
              Teams
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
