import { NavLink } from 'react-router-dom'
import { Home, MapPinned, User } from 'lucide-react'

const linkClass =
  'flex flex-col items-center gap-1 rounded-xl px-5 py-2 text-xs font-medium transition-colors'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[390px] -translate-x-1/2 border-t border-black/5 bg-[#FAFAF7]/95 px-4 py-2.5 shadow-soft backdrop-blur-sm">
      <div className="flex items-end justify-around">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${linkClass} ${isActive ? 'text-[#4CAF50]' : 'text-textSub hover:text-textMain'}`
          }
        >
          <Home className="h-6 w-6" strokeWidth={1.75} />
          Home
        </NavLink>
        <NavLink
          to="/map"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? 'text-[#4CAF50]' : 'text-textSub hover:text-textMain'}`
          }
        >
          <MapPinned className="h-6 w-6" strokeWidth={1.75} />
          Map
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${linkClass} ${isActive ? 'text-[#4CAF50]' : 'text-textSub hover:text-textMain'}`
          }
        >
          <User className="h-6 w-6" strokeWidth={1.75} />
          Profile
        </NavLink>
      </div>
    </nav>
  )
}
