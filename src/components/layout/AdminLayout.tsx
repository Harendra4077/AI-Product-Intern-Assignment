import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/appointments', label: 'Appointments', icon: Calendar, end: false },
  { to: '/admin/calendar', label: 'Calendar', icon: Calendar, end: false },
  { to: '/admin/clients', label: 'Clients', icon: Users, end: false },
  { to: '/admin/settings', label: 'Settings', icon: Settings, end: false },
];

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F7F2] flex">
      {/* Sidebar – desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 xl:w-64 flex-shrink-0 bg-white border-r border-[#E8E7DF] sticky top-0 h-screen">
        <SidebarContent onClose={() => {}} />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[#26352E]/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-2xl animate-slide-up">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-[#E8E7DF] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#354B3C] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">K</span>
            </div>
            <span className="font-bold text-[#26352E]">kayro</span>
            <span className="text-xs text-[#788078] font-medium px-2 py-0.5 bg-[#F0E9DD] rounded-full ml-1">
              Dashboard
            </span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 rounded-lg hover:bg-[#F8F7F2] text-[#788078]"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 xl:p-10 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-[#E8E7DF]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#354B3C] rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">K</span>
          </div>
          <div>
            <p className="font-bold text-[#26352E] leading-none">kayro</p>
            <p className="text-[10px] text-[#788078] font-medium">Dashboard</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-[#F8F7F2] text-[#788078]"
          aria-label="Close menu"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nutritionist info */}
      <div className="px-4 py-4 border-b border-[#E8E7DF]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E7EDE4] flex items-center justify-center">
            <span className="text-sm font-bold text-[#354B3C]">PS</span>
          </div>
          <div>
            <p className="text-sm font-bold text-[#26352E] leading-tight">Dr. Priya Sharma</p>
            <p className="text-xs text-[#788078]">Nutritionist</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1" aria-label="Dashboard navigation">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
                isActive
                  ? 'bg-[#354B3C] text-white'
                  : 'text-[#788078] hover:bg-[#F8F7F2] hover:text-[#26352E]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} aria-hidden="true" />
                {item.label}
                {isActive && (
                  <ChevronRight size={14} className="ml-auto" aria-hidden="true" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Back to client */}
      <div className="p-4 border-t border-[#E8E7DF]">
        <NavLink
          to="/client"
          className="flex items-center gap-2 text-xs text-[#788078] hover:text-[#26352E] transition-colors font-medium"
        >
          ← Back to client app
        </NavLink>
      </div>
    </>
  );
}
