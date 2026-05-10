import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MapView from './pages/MapView'
import BottomNav from './components/BottomNav'

function ProfilePlaceholder() {
  return (
    <div className="min-h-dvh bg-background px-4 pb-24 pt-8">
      <h1 className="text-xl font-semibold text-textMain">Profile</h1>
      <p className="mt-2 text-sm text-textSub">Coming soon.</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="mx-auto min-h-screen max-w-[390px] overflow-y-auto rounded-2xl bg-background shadow-soft">
        <div className="pb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/profile" element={<ProfilePlaceholder />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
