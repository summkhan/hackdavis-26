import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import pantryData from '../data/pantries.js'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

/** Hi-fi pins: charcoal teardrop + white dot (matches map screen mock) */
const pantryPinSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52" fill="none">
  <path d="M20 49C20 49 37 31.15 37 20C37 10.0589 29.9411 3 20 3C10.0589 3 3 10.0589 3 20C3 31.15 20 49 20 49Z"
    fill="#332F2C" stroke="white" stroke-width="2.5"/>
  <circle cx="20" cy="20" r="5" fill="white"/>
</svg>
`.trim())

const pantryPinIcon = L.divIcon({
  className: 'u-map-pin',
  html: `<img src="data:image/svg+xml,${pantryPinSvg}" width="40" height="52" alt="" style="display:block"/>`,
  iconSize: [40, 52],
  iconAnchor: [20, 52],
})

const FILTER_CHIPS = [
  'Open Now',
  'Ready to Eat',
  'Produce',
  'Canned Food',
  'Meat',
  'Dairy',
  'Grains',
  'Snacks',
]

function minutesSinceMidnight(d) {
  return d.getHours() * 60 + d.getMinutes()
}

function isOpenNow(pantry, now = new Date()) {
  const windows = pantry.schedule
  if (!windows?.length) return true
  const dow = now.getDay()
  const m = minutesSinceMidnight(now)
  return windows.some((w) => {
    if (!w.days?.includes(dow)) return false
    const { openMin, closeMin } = w
    if (closeMin <= openMin) return m >= openMin || m < closeMin
    return m >= openMin && m < closeMin
  })
}

function buildPantryMeta(data) {
  return data.pantries.map((p) => {
    const items = data.items.filter((i) => i.availableAt.includes(p.id))
    const categories = new Set(items.map((i) => i.category))
    const hasReadyToEat = items.some(
      (i) => i.tags?.includes('ready-to-eat') || i.readyToEat === true,
    )
    return { ...p, items, categories, hasReadyToEat }
  })
}

function pantryMatchesChip(meta, chip, now) {
  if (chip === 'Open Now') return isOpenNow(meta, now)
  if (chip === 'Ready to Eat') return meta.hasReadyToEat
  if (chip === 'Produce')
    return meta.categories.has('Produce') || meta.categories.has('Fruits')
  if (chip === 'Canned Food') return meta.categories.has('Canned Food')
  if (chip === 'Meat') return meta.categories.has('Meat')
  if (chip === 'Dairy') return meta.categories.has('Dairy')
  if (chip === 'Grains') return meta.categories.has('Grains')
  if (chip === 'Snacks') return meta.categories.has('Snacks')
  return true
}

function filterMetaBySearch(metaList, q) {
  const s = q.trim().toLowerCase()
  if (!s) return metaList
  return metaList.filter(
    (p) =>
      p.name.toLowerCase().includes(s) ||
      p.items.some((i) => i.name.toLowerCase().includes(s) || i.category.toLowerCase().includes(s)),
  )
}

function filterMetaByChips(metaList, chips, now) {
  if (!chips.length) return metaList
  return metaList.filter((p) => chips.every((chip) => pantryMatchesChip(p, chip, now)))
}

function statusLabel(status) {
  if (status === 'well-stocked') return 'Well stocked'
  if (status === 'limited') return 'Limited'
  if (status === 'low') return 'Low'
  return status
}

function statusBadgeClass(status) {
  if (status === 'well-stocked') return 'bg-wellStocked/15 text-wellStocked border-wellStocked/30'
  if (status === 'limited') return 'bg-limited/15 text-limited border-limited/30'
  if (status === 'low') return 'bg-low/15 text-low border-low/30'
  return 'bg-textSub/10 text-textSub border-textSub/20'
}

function openDirections(lat, lng) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}

export default function MapView() {
  const [search, setSearch] = useState('')
  const [selectedChips, setSelectedChips] = useState([])
  const [sheetPantry, setSheetPantry] = useState(null)
  const [mapReady, setMapReady] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = requestAnimationFrame(() => setMapReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(t)
  }, [])

  const metaList = useMemo(() => buildPantryMeta(pantryData), [])

  const visiblePantries = useMemo(() => {
    const searched = filterMetaBySearch(metaList, search)
    return filterMetaByChips(searched, selectedChips, now)
  }, [metaList, search, selectedChips, now])

  const toggleChip = useCallback((label) => {
    setSelectedChips((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label],
    )
  }, [])

  const closeSheet = useCallback(() => setSheetPantry(null), [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') closeSheet()
    }
    if (sheetPantry) {
      document.addEventListener('keydown', onKey)
      return () => document.removeEventListener('keydown', onKey)
    }
  }, [sheetPantry, closeSheet])

  return (
    <div className="map-view-root relative mx-auto h-[calc(100dvh-5.25rem)] w-full max-w-[390px] bg-[#FAFAF7]">
      <div className="absolute inset-0 z-0">
        {mapReady ? (
          <MapContainer
            center={[38.5382, -121.7617]}
            zoom={15}
            scrollWheelZoom
            className="map-hifi-leaflet h-full w-full"
            style={{ height: '100%', width: '100%' }}
            zoomControl
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            {visiblePantries.map((pantry) => (
              <Marker
                key={pantry.id}
                position={[pantry.coordinates.lat, pantry.coordinates.lng]}
                icon={pantryPinIcon}
                eventHandlers={{
                  click: () => setSheetPantry(pantry),
                }}
              />
            ))}
          </MapContainer>
        ) : (
          <div className="flex h-full items-center justify-center bg-[#E8E4DC] text-sm text-neutral-500">
            Loading map…
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] px-4 pt-3">
        <div className="pointer-events-auto space-y-3">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9CA3AF]"
              strokeWidth={2}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items, pantries..."
              className="h-12 w-full rounded-full border border-[#1C1917] bg-white pl-11 pr-4 text-[15px] text-[#1C1917] shadow-sm outline-none placeholder:text-[#9CA3AF] focus:ring-2 focus:ring-black/10"
              aria-label="Search items and pantries"
            />
          </div>

          <div className="rounded-2xl bg-white px-3.5 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <p className="mb-2.5 text-xs font-semibold text-[#4B5563]">Filter By</p>
            <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-0.5 pt-0.5 [-webkit-overflow-scrolling:touch]">
              {FILTER_CHIPS.map((label) => {
                const on = selectedChips.includes(label)
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleChip(label)}
                    className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                      on
                        ? 'bg-[#4CAF50] text-white shadow-sm'
                        : 'bg-[#EDEDED] text-[#1C1917]'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {sheetPantry && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[1100] bg-black/40"
            aria-label="Close pantry details"
            onClick={closeSheet}
          />
          <div
            className="animate-sheet-up fixed bottom-0 left-1/2 z-[1110] w-full max-w-[390px] -translate-x-1/2 px-4 pb-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="map-pantry-sheet-title"
          >
            <div className="rounded-2xl bg-white p-5 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-black/10" />
              <h2 id="map-pantry-sheet-title" className="text-lg font-semibold text-[#1C1917]">
                {sheetPantry.name}
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">{sheetPantry.hours}</p>
              <span
                className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(sheetPantry.status)}`}
              >
                {statusLabel(sheetPantry.status)}
              </span>
              <button
                type="button"
                onClick={() =>
                  openDirections(sheetPantry.coordinates.lat, sheetPantry.coordinates.lng)
                }
                className="mt-5 w-full rounded-xl bg-[#4CAF50] py-3.5 text-center text-sm font-semibold text-white shadow-sm transition active:scale-[0.98]"
              >
                Get directions
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
