import { Link } from 'react-router-dom'
import GooglePrefetchButton from '../GooglePrefetchButton'
import AdUnit from '../AdUnit'

export default function Footer() {
  return (
    <footer className="mt-16 border-t py-10 px-4" style={{ borderColor: '#1f1f1f', background: '#0a0a0a' }}>
      <div className="max-w-7xl mx-auto">
        {/* Ad unit above footer links */}
        <AdUnit className="mb-8" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo-192.png" alt="Monocry" width="28" height="28" style={{ borderRadius: '5px' }} />
              <span className="font-bold text-white">MONOCRY</span>
            </div>
            <p className="text-xs text-gray-500">Crypto news, markets &amp; predictions.</p>
            <div className="mt-3">
              <GooglePrefetchButton />
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Content</h4>
            {[['/', 'News'], ['/predictions', 'Predictions'], ['/markets', 'Markets'], ['/prices', 'Prices']].map(([to, label]) => (
              <Link key={to} to={to} className="block text-sm text-gray-500 hover:text-white py-0.5">{label}</Link>
            ))}
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Company</h4>
            {[['/about', 'About'], ['/advertise', 'Advertise'], ['/contact', 'Contact'], ['/careers', 'Careers']].map(([to, label]) => (
              <Link key={to} to={to} className="block text-sm text-gray-500 hover:text-white py-0.5">{label}</Link>
            ))}
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Legal</h4>
            {[['/privacy', 'Privacy'], ['/terms', 'Terms'], ['/cookies', 'Cookies']].map(([to, label]) => (
              <Link key={to} to={to} className="block text-sm text-gray-500 hover:text-white py-0.5">{label}</Link>
            ))}
          </div>
        </div>
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderColor: '#1f1f1f' }}>
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Monocry. All rights reserved.</p>
          <p className="text-xs text-gray-600">Not financial advice. DYOR.</p>
        </div>
      </div>
    </footer>
  )
}
