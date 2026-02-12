'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl">📚</span>
              <span className="font-bold text-xl">Bookstore</span>
            </Link>
            
            {user && (
              <div className="hidden md:flex ml-10 space-x-4">
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-white/20'
                      : 'hover:bg-white/10'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/books"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/books')
                      ? 'bg-white/20'
                      : 'hover:bg-white/10'
                  }`}
                >
                  Libros
                </Link>
                <Link
                  href="/sales"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/sales')
                      ? 'bg-white/20'
                      : 'hover:bg-white/10'
                  }`}
                >
                  Ventas
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname.startsWith('/admin')
                        ? 'bg-white/20'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    Administración
                  </Link>
                )}
              </div>
            )}
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm">
                <div className="font-medium">{user.name}</div>
                <div className="text-indigo-200 text-xs">{user.role === 'admin' ? 'Administrador' : 'Usuario'}</div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
