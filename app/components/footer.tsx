import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-white">
              <ShoppingBag className="h-6 w-6 text-indigo-400" />
              <span className="text-xl font-bold tracking-tight">
                {process.env.NEXT_PUBLIC_SITE_NAME || 'My Store'}
              </span>
            </Link>
            <p className="text-sm max-w-xs">
              Shop the best premium products at unmatched prices. Quality and customer satisfaction is our top priority.
            </p>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/shop?sort=price_asc" className="hover:text-white transition-colors">
                  Budget Friendly
                </Link>
              </li>
              <li>
                <Link href="/shop?sort=rating" className="hover:text-white transition-colors">
                  Top Rated
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Account Column */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-white transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {currentYear} {process.env.NEXT_PUBLIC_SITE_NAME || 'My Store'}. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
