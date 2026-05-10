import 'leaflet/dist/leaflet.css'
import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import { ArrowLeft } from 'lucide-react'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CAMPUS_CENTER = [38.5382, -121.7617]

const greenIcon = L.divIcon({
  className: 'u-map-pin',
  html: `<div style="width:28px;height:28px;background:#4CAF50;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.2)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
})

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

export default function MapModal({ item, pantries, onClose }) {
  const [selectedId, setSelectedId] = useState(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMapReady(true)
    })
    return () => {
      cancelAnimationFrame(id)
    }
  }, [])

  const sheetPantry =
    selectedId == null ? null : (pantries.find((p) => p.id === selectedId) ?? null)

  const selectPantry = useCallback((pantry) => {
    setSelectedId(pantry.id)
  }, [])

  const closeSheet = useCallback(() => {
    setSelectedId(null)
  }, [])

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key !== 'Escape') return
      if (sheetPantry) closeSheet()
      else onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [sheetPantry, closeSheet, onClose])

  const mapMinHeightPx = 280
  const mapBlockStyle = { minHeight: mapMinHeightPx, flex: '1 1 auto' }

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px] transition-opacity"
        aria-label="Close map"
        onClick={onClose}
      />

      <div className="animate-map-modal-up relative z-10 flex h-[92dvh] w-full max-w-[390px] flex-col overflow-hidden rounded-t-3xl bg-background shadow-2xl ring-1 ring-black/10">
        <header className="flex shrink-0 items-center gap-3 rounded-b-2xl bg-surface px-4 py-3 shadow-card">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background text-textMain shadow-card ring-1 ring-black/5 transition active:scale-95"
            aria-label="Close"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-textSub">Showing pantries for</p>
            <h1 id="map-modal-title" className="truncate text-lg font-semibold text-textMain">
              {item.name}
            </h1>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col p-3">
          <div
            className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl shadow-card ring-1 ring-black/5"
            style={mapBlockStyle}
          >
            {mapReady ? (
              <MapContainer
                center={CAMPUS_CENTER}
                zoom={15}
                scrollWheelZoom
                className="z-0 min-h-0 flex-1 rounded-2xl"
                style={{ height: '100%', width: '100%', minHeight: mapMinHeightPx }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {pantries.map((pantry) => (
                  <Marker
                    key={pantry.id}
                    position={[pantry.coordinates.lat, pantry.coordinates.lng]}
                    icon={greenIcon}
                    eventHandlers={{
                      click: () => selectPantry(pantry),
                    }}
                  />
                ))}
              </MapContainer>
            ) : (
              <div
                className="flex flex-1 items-center justify-center rounded-2xl bg-surface text-sm text-textSub"
                style={{ minHeight: mapMinHeightPx }}
              >
                Loading map…
              </div>
            )}
          </div>
        </div>
      </div>

      {sheetPantry && (
        <>
          <button
            type="button"
            className="absolute inset-0 z-20 bg-black/25 backdrop-blur-[1px]"
            aria-label="Close pantry details"
            onClick={closeSheet}
          />
          <div
            className="animate-sheet-up absolute bottom-0 left-1/2 z-30 w-full max-w-[390px] -translate-x-1/2"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pantry-sheet-title"
          >
            <div className="mx-3 mb-3 rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-black/5">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-black/10" />
              <h2 id="pantry-sheet-title" className="text-lg font-semibold text-textMain">
                {sheetPantry.name}
              </h2>
              <p className="mt-1 text-sm text-textSub">{sheetPantry.hours}</p>
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
                className="mt-5 w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-white shadow-card transition active:scale-[0.98]"
              >
                Get directions
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )

  return createPortal(modal, document.body)
}
