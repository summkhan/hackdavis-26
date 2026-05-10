import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import pantryData from '../data/pantries.js'

const TOP_CATEGORIES = [
  {
    label: 'Produce',
    image: 'https://www.figma.com/api/mcp/asset/a8df4e91-ab2d-4131-a699-820bb4f3c323',
  },
  {
    label: 'Baked Goods',
    image: 'https://www.figma.com/api/mcp/asset/684cafa0-958c-4422-bb6c-196f554189ab',
  },
  {
    label: 'Dairy',
    image: 'https://www.figma.com/api/mcp/asset/c89c9b77-53c8-433b-adda-a9bea4887828',
  },
  {
    label: 'Meat',
    image: 'https://www.figma.com/api/mcp/asset/004e58a3-8259-47d7-a761-9b4d9bf32d91',
  },
  {
    label: 'Spices\n& Herbs',
    image: 'https://www.figma.com/api/mcp/asset/7c3b4328-cc26-4c3c-bafb-4755b36cc615',
  },
]

const SECTION_DEFS = [
  { title: 'Veggies', categories: ['Produce'] },
  { title: 'Fruits', categories: ['Fruits'] },
  { title: 'Baked Goods/Snacks/Other', categories: ['Baked Goods/Snacks/Other'] },
  { title: 'Meat', categories: ['Meat'] },
  { title: 'Dairy/Eggs', categories: ['Dairy'] },
  { title: 'Hygeine', categories: ['Hygeine'] },
  { title: 'Spreads/Canned Goods', categories: ['Spreads/Canned Goods'] },
  { title: 'Spices & Herbs', categories: ['Spices & Herbs'] },
]

export default function Home() {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return pantryData.items
    return pantryData.items.filter(
      (item) => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q),
    )
  }, [search])

  const sections = useMemo(
    () =>
      SECTION_DEFS.map((section) => ({
        ...section,
        items: filteredItems.filter((item) => section.categories.includes(item.category)),
      })).filter((section) => section.items.length),
    [filteredItems],
  )

  return (
    <div className="min-h-dvh bg-[#FFF1E4] pb-24 pt-4">
      <div className="px-5">
        <div className="relative mt-2 h-[39px]">
          <Search
            className="pointer-events-none absolute left-[12px] top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8580]"
            strokeWidth={2}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items, pantries..."
            className="h-full w-full rounded-[99px] border-[1.4px] border-[#8A8580] bg-[#FDFBF6] pl-9 pr-4 text-[14px] text-[#37281D] outline-none placeholder:text-[#8A8580]"
          />
        </div>

        <div className="hide-scrollbar mt-6 flex gap-4 overflow-x-auto pb-1">
          {TOP_CATEGORIES.map((category) => (
            <div key={category.label} className="w-[72px] shrink-0 text-center">
              <img
                src={category.image}
                alt=""
                className="mx-auto h-[72px] w-[72px] object-contain"
              />
              <p className="mt-1 whitespace-pre-line text-[16px] font-medium leading-tight text-black">
                {category.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-6 pl-5">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-[24px] font-medium leading-none text-black">{section.title}</h2>
            <div className="hide-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1 pr-5">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(`/map?item=${item.id}`)}
                  className="w-[120px] shrink-0 text-center"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-[90px] w-[120px] rounded-lg object-cover"
                  />
                  <p className="mt-2 text-[12px] font-medium leading-none text-[#38281D]">{item.name}</p>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
