import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import MapView from './pages/MapView'
import BottomNav from './components/BottomNav'

function ProfilePlaceholder() {
  return (
    <div className="min-h-dvh bg-[#FFF1E4] px-4 pb-24 pt-8">
      <h1 className="text-xl font-semibold text-textMain">Register as a Pantry</h1>
      <p className="mt-2 text-sm text-textSub">Verify your status as a pantry to show students what items you have! Coming soon.</p>
    </div>
  )
}

function AppLayout() {
  const { pathname } = useLocation()
  const routePaddingClass = pathname === '/map' ? 'pb-0' : 'pb-20'

  return (
    <div className="mx-auto min-h-screen max-w-[390px] overflow-y-auto rounded-2xl bg-background shadow-soft">
      <div className={routePaddingClass}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/profile" element={<ProfilePlaceholder />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
