/** Mock pantry inventory for the campus food app */

export const CATEGORY_FILTERS = [
  { id: 'produce', label: 'Produce' },
  { id: 'bakedGoods', label: 'Baked Goods' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'protein', label: 'Protein' },
  { id: 'grains',  label: 'Grains' },
  { id: 'snacks',  label: 'Snacks' },
]

/**
 * @typedef {'produce'|'bakedGoods'|'fruits'|'protein'|'grains'|'snacks'} PantryCategoryId
 * @typedef {'Halal'|'Vegan'|'GF'} DietaryTag
 * @typedef {'mu'|'scc'|'west'} PantrySiteId
 */

/**
 * Approximate map pins aligned with real UC Davis programs/buildings.
 * Coordinates are for mapping demos only — always confirm hours and room on official sites.
 * @see https://aggiecompass.ucdavis.edu — Aggie Compass @ Memorial Union
 * @see https://thepantry.ucdavis.edu — The Pantry (ASUCD), MU
 */
export const pantrySites = [
  {
    id: 'mu',
    name: 'Aggie Compass — Memorial Union',
    lat: 38.54135,
    lng: -121.74941,
    detail: 'Basic Needs Center, East Wing, Memorial Union',
  },
  {
    id: 'scc',
    name: 'Student Community Center',
    lat: 38.5399,
    lng: -121.7614,
    detail: 'Satellite pantry — SCC front desk (check host hours)',
  },
  {
    id: 'west',
    name: 'West Village (approx.)',
    lat: 38.5466,
    lng: -121.7742,
    detail:
      'Approximate west-campus pin for demos — verify local distributions separately',
  },
]

/** @type {Array<{ id: string; name: string; category: PantryCategoryId; image: string; tags: DietaryTag[] }>} */
const pantryItemsRaw = [
  {
    id: '1',
    name: 'Baby Spinach',
    category: 'produce',
    image:
      'https://images.unsplash.com/photo-1580918174928-01ba62d50769?w=400&h=400&fit=crop',
    tags: ['Vegan', 'GF'],
  },
  {
    id: '2',
    name: 'Carrots',
    category: 'produce',
    image:
      'https://images.unsplash.com/photo-1445286459986-b585c93f053e?w=400&h=400&fit=crop',
    tags: ['Vegan', 'GF'],
  },
  {
    id: '3',
    name: 'Bell Peppers',
    category: 'produce',
    image:
      'https://images.unsplash.com/photo-1594282477452-270375ab922f?w=400&h=400&fit=crop',
    tags: ['Vegan', 'GF'],
  },
  {
    id: '4',
    name: 'Whole Wheat Bread',
    category: 'bakedGoods',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop',
    tags: ['Vegan'],
  },
  {
    id: '5',
    name: 'Bagels',
    category: 'bakedGoods',
    image:
      'https://images.unsplash.com/photo-1710529896510-e039ff2636ee?auto=format&fit=crop&w=800&h=800&q=85',
    tags: ['Vegan'],
  },
  {
    id: '6',
    name: 'Muffins',
    category: 'bakedGoods',
    image:
      'https://images.unsplash.com/photo-1607958996333-41aef7caef39?w=400&h=400&fit=crop',
    tags: ['Halal'],
  },
  {
    id: '7',
    name: 'Apples',
    category: 'fruits',
    image:
      'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=400&fit=crop',
    tags: ['Vegan', 'GF'],
  },
  {
    id: '8',
    name: 'Bananas',
    category: 'fruits',
    image:
      'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop',
    tags: ['Vegan', 'GF'],
  },
  {
    id: '9',
    name: 'Oranges',
    category: 'fruits',
    image:
      'https://images.unsplash.com/photo-1547514701-42782101795e?w=400&h=400&fit=crop',
    tags: ['Vegan', 'GF'],
  },
  {
    id: '10',
    name: 'Canned Tuna',
    category: 'protein',
    image:
      'https://images.unsplash.com/photo-1587734817258-8bc35cfdb31e?w=400&h=400&fit=crop',
    tags: ['Halal', 'GF'],
  },
  {
    id: '11',
    name: 'Black Beans',
    category: 'protein',
    image:
      'https://images.unsplash.com/photo-1564834728448-bdf60093cd01?w=400&h=400&fit=crop',
    tags: ['Vegan', 'GF'],
  },
  {
    id: '12',
    name: 'Chicken Breast',
    category: 'protein',
    image:
      'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop',
    tags: ['Halal', 'GF'],
  },
  {
    id: '13',
    name: 'Brown Rice',
    category: 'grains',
    image:
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
    tags: ['Vegan', 'GF'],
  },
  {
    id: '14',
    name: 'Oats',
    category: 'grains',
    image:
      'https://images.unsplash.com/photo-1517684666006-6bd39e299814?w=400&h=400&fit=crop',
    tags: ['Vegan', 'GF'],
  },
  {
    id: '15',
    name: 'Pasta',
    category: 'grains',
    image:
      'https://images.unsplash.com/photo-1551462147-fba062f9e7ce?w=400&h=400&fit=crop',
    tags: ['Vegan'],
  },
  {
    id: '16',
    name: 'Granola Bars',
    category: 'snacks',
    image:
      'https://images.unsplash.com/photo-1494390248089-33d779a6cb01?w=400&h=400&fit=crop',
    tags: ['GF'],
  },
  {
    id: '17',
    name: 'Trail Mix',
    category: 'snacks',
    image:
      'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=400&fit=crop',
    tags: ['Vegan', 'GF'],
  },
  {
    id: '18',
    name: 'Crackers',
    category: 'snacks',
    image:
      'https://images.unsplash.com/photo-1698158225819-2430cd5bfab5?auto=format&fit=crop&w=800&h=800&q=85',
    tags: ['Vegan'],
  },
]

const SITE_ROTATION = /** @type {const} */ (['mu', 'scc', 'west'])

/** Items include `siteId` so the map can focus the right pantry when opened from a card. */
export const pantryItems = pantryItemsRaw.map((item, i) => ({
  ...item,
  siteId: SITE_ROTATION[i % SITE_ROTATION.length],
}))

/** @param {PantrySiteId} siteId */
export function getPantrySite(siteId) {
  return pantrySites.find((s) => s.id === siteId)
}
