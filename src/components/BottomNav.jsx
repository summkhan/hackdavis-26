import { NavLink } from 'react-router-dom'
import { Home, MapPinned, User } from 'lucide-react'

const linkClass = 'flex h-9 w-9 items-center justify-center rounded-lg transition-colors'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[390px] -translate-x-1/2 bg-[#FFDABB] px-7 pb-2 pt-3">
      <div className="flex items-center justify-between">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `${linkClass} ${isActive ? 'text-[#37281D]' : 'text-[#37281D]/70'}`}
        >
          <Home className="h-7 w-7" strokeWidth={1.85} />
        </NavLink>
        <NavLink
          to="/map"
          className={({ isActive }) => `${linkClass} ${isActive ? 'text-[#37281D]' : 'text-[#37281D]/70'}`}
        >
          <MapPinned className="h-7 w-7" strokeWidth={1.85} />
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => `${linkClass} ${isActive ? 'text-[#37281D]' : 'text-[#37281D]/70'}`}
        >
          <User className="h-7 w-7" strokeWidth={1.85} />
        </NavLink>
      </div>
      <div className="mx-auto mt-2 h-[5px] w-[120px] rounded-[10px] bg-[#2D2D2D]" />
    </nav>
  )
}
