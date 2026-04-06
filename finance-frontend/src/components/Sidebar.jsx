import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, BarChart2, Users, LogOut, Hexagon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Avatar } from './ui'

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/analytics',    label: 'Analytics',    icon: BarChart2, roles: ['analyst', 'admin'] },
  { to: '/users',        label: 'Users',        icon: Users, roles: ['admin'] },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const visibleItems = navItems.filter(item =>
    !item.roles || item.roles.includes(user?.role)
  )

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-zinc-800">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Hexagon className="w-4 h-4 text-zinc-950 fill-zinc-950" />
        </div>
        <span className="font-display text-lg text-zinc-100 leading-none">FinLedger</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest px-3 py-2 mt-1">Menu</p>
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150
              ${isActive
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-zinc-800 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar name={user?.name} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-200 truncate">{user?.name}</p>
            <p className="text-xs text-zinc-500 capitalize">{user?.role}</p>
          </div>
          <button onClick={handleLogout} title="Logout"
            className="text-zinc-600 hover:text-red-400 transition-colors p-1 rounded cursor-pointer">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
