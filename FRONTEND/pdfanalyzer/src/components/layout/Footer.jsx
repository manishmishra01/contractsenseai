import { Link } from 'react-router-dom'
import { FileSearch, Shield, Github } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FileSearch className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold text-gray-900">
                ContractSense AI
              </span>
            </div>
            <p className="text-sm text-gray-600">
              AI-powered contract risk intelligence platform.
              Analyze agreements, detect risky clauses, and
              generate executive insights in minutes.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Upload Contract
                </Link>
              </li>
              <li>
                <Link
                  to="/history"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Analysis History
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Trust & Security
            </h4>
            <div className="flex items-start space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-green-600 mt-1" />
              <span>
                Your documents are processed securely and
                never stored permanently without consent.
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} ContractSense AI. All rights reserved.
          </p>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a
              href="#"
              className="hover:text-gray-700 transition-colors flex items-center space-x-1"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a href="#" className="hover:text-gray-700 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-700 transition-colors">
              Terms
            </a>
          </div>
        </div>

      </div>
    </footer>
  )
}
