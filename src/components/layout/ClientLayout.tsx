import { NavLink, Outlet } from 'react-router-dom';
import { Home, Calendar, User, PlusCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { to: '/client', label: 'Home', icon: Home, end: true },
  { to: '/client/appointments', label: 'My Visits', icon: Calendar, end: false },
  { to: '/client/book', label: 'Book', icon: PlusCircle, end: false },
  { to: '/client/profile', label: 'Profile', icon: User, end: false },
];

export function ClientLayout() {
  return (
    <div className="min-h-screen bg-[#F8F7F2] flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#F8F7F2]/90 backdrop-blur-sm border-b border-[#E8E7DF]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#354B3C] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-tight">K</span>
            </div>
            <span className="font-bold text-[#26352E] text-lg tracking-tight">kayro</span>
          </div>
          <NavLink
            to="/admin"
            className="text-xs text-[#788078] hover:text-[#354B3C] transition-colors font-medium border border-[#E8E7DF] px-3 py-1.5 rounded-lg"
          >
            Dashboard →
          </NavLink>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 pb-24 pt-4">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-[#E8E7DF] mobile-safe-bottom"
        aria-label="Main navigation"
      >
        <div className="max-w-lg mx-auto grid grid-cols-4">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              aria-label={item.label}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 py-3 px-2 text-xs font-semibold transition-colors duration-200',
                  item.to === '/client/book'
                    ? isActive
                      ? 'text-[#354B3C]'
                      : 'text-[#718B73]'
                    : isActive
                    ? 'text-[#354B3C]'
                    : 'text-[#B0B8B0]',
                  item.to === '/client/book' && 'relative'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.to === '/client/book' ? (
                    <div
                      className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 -mt-6 shadow-lg',
                        isActive ? 'bg-[#354B3C]' : 'bg-[#354B3C]'
                      )}
                    >
                      <item.icon size={22} className="text-white" aria-hidden="true" />
                    </div>
                  ) : (
                    <item.icon
                      size={20}
                      aria-hidden="true"
                      className={cn(
                        'transition-colors',
                        isActive ? 'text-[#354B3C]' : 'text-[#B0B8B0]'
                      )}
                    />
                  )}
                  <span className={item.to === '/client/book' ? 'text-[#354B3C]' : ''}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
