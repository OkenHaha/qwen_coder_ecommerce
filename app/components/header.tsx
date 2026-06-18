import Link from 'next/link'
import { auth, signOut } from '@/lib/auth'
import { CartButton } from './header-cart-button'
import { ShoppingBag, User, Settings, LogOut } from 'lucide-react'

export async function Header() {
  const session = await auth()
  const user = session?.user
  const isAdmin = user?.role === 'ADMIN'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              {process.env.NEXT_PUBLIC_SITE_NAME || 'My Store'}
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/shop"
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Shop
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Admin Panel
              </Link>
            )}
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {/* Cart Button (Client Component) */}
          <CartButton />

          {/* User Account Menu */}
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/account"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name || 'Account'}</span>
              </Link>
              
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/' })
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
