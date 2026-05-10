import { useMemo, useState } from 'react'
import MapModal from '../components/MapModal'
import pantryData from '../data/pantries.js'

function itemForMap(item) {
  return {
    id: item.id,
    name: item.name,
    availableAt: item.availableAt,
  }
}

export default function Home() {
  const [mapItem, setMapItem] = useState(null)

  const mapPantries = useMemo(() => {
    if (!mapItem?.availableAt?.length) return []
    return pantryData.pantries.filter((p) => mapItem.availableAt.includes(p.id))
  }, [mapItem])

  return (
    <div className="min-h-dvh bg-background pt-4">
      <div className="px-4">
        <h1 className="text-2xl font-bold text-textMain">Campus pantry</h1>
        <p className="mt-1 text-sm text-textSub">Tap an item to see which pantries stock it.</p>
      </div>
      <ul className="mt-4 space-y-3 px-4">
        {pantryData.items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setMapItem(itemForMap(item))}
              className="flex w-full items-center gap-4 rounded-2xl bg-surface p-3 text-left shadow-card ring-1 ring-black/5 transition active:scale-[0.99]"
            >
              <img
                src={item.image}
                alt=""
                className="h-16 w-16 shrink-0 rounded-xl object-cover shadow-card"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-textMain">{item.name}</p>
                <p className="text-xs text-textSub">{item.category}</p>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {mapItem && (
        <MapModal
          key={mapItem.id}
          item={mapItem}
          pantries={mapPantries}
          onClose={() => setMapItem(null)}
        />
      )}
    </div>
  )
}
