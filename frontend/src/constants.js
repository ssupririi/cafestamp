export const ITEM_ICONS = {
  Coffee: '☕',
  Pastry: '🥐',
  Matcha: '🍵',
  Brunch: '🥑',
  Dessert: '🍰',
  Tea: '🫖',
  Dinner: '🍽️',
};

export const ITEM_TYPES = Object.keys(ITEM_ICONS);

export const FLAVOR_TAGS = [
  'Flaky', 'Buttery', 'Smooth', 'Sweet', 'Creamy', 'Nutty', 'Fruity', 'Bitter', 'Matcha',
];

// Stamp ink colours, picked per café
export const INKS = ['#3e2723', '#b5655f', '#7f5836', '#688e68'];

export const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });