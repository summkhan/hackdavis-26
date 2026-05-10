import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
const FIGMA_PANTRY_POPUP_IMAGE =
  'https://www.figma.com/api/mcp/asset/8d097491-0eaf-4296-825a-2192af7e9f7a'

const FILTER_CHIPS = [
  'Open Now',
  'Dairy',
  'Meat',
  'Spices',
  'Ready to Eat',
  'Produce',
  'Canned Food',
  'Baked Goods',
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
  const pantryAddressById = {
    1: '170 E Quad, Davis, CA 95616',
    2: 'South Hall, Davis, CA 95616',
    3: 'Segundo Dining Commons, Davis, CA 95616',
  }

  return data.pantries.map((p) => {
    const items = data.items.filter((i) => i.availableAt.includes(p.id))
    const categories = new Set(items.map((i) => i.category))
    const hasReadyToEat = items.some(
      (i) => i.tags?.includes('ready-to-eat') || i.readyToEat === true,
    )
    const previewImage = FIGMA_PANTRY_POPUP_IMAGE
    return {
      ...p,
      items,
      categories,
      hasReadyToEat,
      previewImage,
      address: pantryAddressById[p.id] ?? 'Davis, CA 95616',
    }
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
  if (chip === 'Spices')
    return meta.categories.has('Spices') || meta.categories.has('Spices & Herbs')
  if (chip === 'Baked Goods') return meta.categories.has('Baked Goods')
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
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [selectedChips, setSelectedChips] = useState([])
  const [itemSelectedChips, setItemSelectedChips] = useState(['Open Now'])
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
  const selectedItemId = Number(searchParams.get('item') || 0)
  const selectedItem = useMemo(
    () => pantryData.items.find((item) => item.id === selectedItemId) ?? null,
    [selectedItemId],
  )
  const itemMode = Boolean(selectedItem)

  const itemModeChips = useMemo(() => {
    if (!selectedItem) return []
    const chips = []
    if (selectedItem.tags?.includes('ready-to-eat')) chips.push('Ready to Eat')
    if (selectedItem.category === 'Dairy') chips.push('Dairy')
    if (selectedItem.category === 'Produce' || selectedItem.category === 'Fruits') chips.push('Produce')
    return chips.slice(0, 2)
  }, [selectedItem])
  const itemFilterChips = useMemo(() => ['Open Now', ...itemModeChips], [itemModeChips])

  const visiblePantries = useMemo(() => {
    if (selectedItem?.availableAt?.length) {
      const candidatePantries = metaList.filter((pantry) => selectedItem.availableAt.includes(pantry.id))
      if (!itemSelectedChips.length) return candidatePantries
      return candidatePantries.filter((pantry) =>
        itemSelectedChips.every((chip) => pantryMatchesChip(pantry, chip, now)),
      )
    }
    const searched = filterMetaBySearch(metaList, search)
    return filterMetaByChips(searched, selectedChips, now)
  }, [metaList, search, selectedChips, now, selectedItem, itemSelectedChips])

  const toggleChip = useCallback((label) => {
    setSelectedChips((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label],
    )
  }, [])
  const toggleItemChip = useCallback((label) => {
    setItemSelectedChips((prev) =>
      prev.includes(label) ? prev.filter((c) => c !== label) : [...prev, label],
    )
  }, [])

  useEffect(() => {
    setItemSelectedChips(['Open Now'])
  }, [selectedItemId])

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
    <div className="map-view-root relative mx-auto h-[100dvh] min-h-[100dvh] w-full max-w-[390px] overflow-hidden bg-[#F7F7F7]">
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

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1000] px-[21px] pt-[56px]">
        {itemMode ? (
          <div className="pointer-events-auto rounded-2xl bg-[#FFF1E4] px-4 pb-3 pt-2">
            <div className="flex gap-3">
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="mt-[6px] h-[90px] w-[120px] rounded-lg object-cover shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-[20px] font-medium leading-none text-black">{selectedItem.name}</h1>
                <p className="mt-[10px] text-[14px] leading-none text-black/50">Filter By</p>
                <div className="mt-[3px]">
                  <button
                    type="button"
                    onClick={() => toggleItemChip('Open Now')}
                    className={`inline-flex rounded-lg px-2 py-0.5 text-[16px] font-medium leading-none text-black ${
                      itemSelectedChips.includes('Open Now')
                        ? 'bg-[rgba(145,200,139,0.5)]'
                        : 'bg-[#EFE8DF]'
                    }`}
                  >
                    Open Now
                  </button>
                </div>
                {itemFilterChips.length > 1 && (
                  <>
                    <p className="mt-[6px] text-[14px] leading-none text-black/50">Also has</p>
                    <div className="mt-[3px] flex gap-2">
                      {itemFilterChips.filter((chip) => chip !== 'Open Now').map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => toggleItemChip(chip)}
                          className={`inline-flex rounded-lg px-2 py-0.5 text-[16px] font-medium leading-none text-black ${
                            itemSelectedChips.includes(chip)
                              ? 'bg-[rgba(145,200,139,0.5)]'
                              : 'bg-[#EFE8DF]'
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="pointer-events-auto">
            <div className="relative h-[39px]">
              <Search
                className="pointer-events-none absolute left-[14px] top-1/2 h-4 w-4 -translate-y-1/2 text-[#37281D]"
                strokeWidth={2}
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search items, pantries..."
                className="h-full w-full rounded-[99px] border-[1.4px] border-[#1A1614] bg-[#FFF1E4] pl-10 pr-4 text-[14px] font-normal text-[#37281D] outline-none placeholder:text-[#37281D] focus:ring-2 focus:ring-black/10"
                aria-label="Search items and pantries"
              />
            </div>

            <div className="mt-[21px] rounded-lg bg-[#FFF1E4] p-2 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
              <p className="mb-1.5 text-sm font-normal leading-none text-[#37281D]">Filter By</p>
              <div className="hide-scrollbar flex flex-wrap gap-2 [-webkit-overflow-scrolling:touch]">
                {FILTER_CHIPS.map((label) => {
                  const on = selectedChips.includes(label)
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleChip(label)}
                      className={`shrink-0 rounded-lg px-2 py-0.5 text-base font-medium leading-none transition-colors ${
                        on
                          ? 'bg-[rgba(145,200,139,0.5)] text-[#37281D]'
                          : 'bg-[#EFE8DF] text-[#37281D]'
                      }`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {sheetPantry && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-[1100] bg-transparent"
            aria-label="Close pantry details"
            onClick={closeSheet}
          />
          <div
            className="animate-sheet-up absolute inset-x-0 bottom-[calc(18px+4.75rem+env(safe-area-inset-bottom,0px))] z-[1110] mx-auto w-[345px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="map-pantry-sheet-title"
          >
            <div className="overflow-hidden rounded-2xl bg-[#FFF1E4] shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
              {sheetPantry.previewImage ? (
                <img
                  src={sheetPantry.previewImage}
                  alt={`${sheetPantry.name} pantry`}
                  className="h-[140px] w-full object-cover"
                />
              ) : (
                <div className="h-[140px] w-full bg-[#D9D9D9]" />
              )}

              <div className="px-4 pb-4 pt-4">
                <h2
                  id="map-pantry-sheet-title"
                  className="text-[34px] font-bold leading-[0.95] tracking-[-0.01em] text-black"
                >
                  {sheetPantry.name}
                </h2>
                <p className="mt-1.5 text-[20px] font-medium leading-[1.02] text-black">
                  {sheetPantry.address}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    openDirections(sheetPantry.coordinates.lat, sheetPantry.coordinates.lng)
                  }
                  className="mt-5 h-[43px] w-full rounded-[30px] border-2 border-[#37281D] bg-[rgba(145,200,139,0.5)] text-[20px] font-medium text-[#2D2D2D] transition active:scale-[0.99]"
                >
                  Get directions
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
