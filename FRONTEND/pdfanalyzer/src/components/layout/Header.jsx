import { Link, useLocation } from 'react-router-dom'
import { FileSearch, History } from 'lucide-react'
import clsx from 'clsx'

export default function Header() {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FileSearch className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              ContractSense AI
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex space-x-4">
            <Link
              to="/"
              className={clsx(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive('/')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              Upload
            </Link>
            <Link
              to="/history"
              className={clsx(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1',
                isActive('/history')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}