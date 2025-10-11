import { APP_CONFIG } from '@/constants'
import Link from 'next/link'

interface FooterProps {
  className?: string
}

export function Footer({ className = '' }: FooterProps) {
  return (
    <footer
      className={`bg-gray-800 dark:bg-gray-900 text-white border-t border-gray-700 dark:border-gray-600 transition-colors duration-200 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-white dark:text-white transition-colors duration-200">
              {APP_CONFIG.name}
            </h3>
            <p className="text-gray-300 dark:text-gray-300 mb-4 transition-colors duration-200">
              {APP_CONFIG.description}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-400 transition-colors duration-200">
              Version {APP_CONFIG.version}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-md font-semibold mb-4 text-white dark:text-white transition-colors duration-200">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/confidence"
                  className="text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors duration-200"
                >
                  Confidence
                </Link>
              </li>
              <li>
                <Link
                  href="/upsets"
                  className="text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors duration-200"
                >
                  Upsets
                </Link>
              </li>
              <li>
                <Link
                  href="/teams"
                  className="text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors duration-200"
                >
                  Teams
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          {/* <div>
            <h4 className="text-md font-semibold mb-4 text-white dark:text-white transition-colors duration-200">
              Support
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/help"
                  className="text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors duration-200"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-300 dark:text-gray-300 hover:text-white dark:hover:text-white transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div> */}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-700 dark:border-gray-600 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400 dark:text-gray-400 transition-colors duration-200">
              © {new Date().getFullYear()} {APP_CONFIG.name}. All rights
              reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
