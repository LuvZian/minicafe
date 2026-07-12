const CATEGORIES = [
  { id: 'coffee', name: 'Coffee' },
  { id: 'tea', name: 'Tea' },
  { id: 'ade', name: 'Ade' },
  { id: 'dessert', name: 'Dessert' },
  { id: 'bakery', name: 'Bakery' }
];

const MENU_ITEMS = [
  {
    id: 1,
    name: 'Slow Morning Latte',
    category: 'coffee',
    price: 4800,
    description: 'Soft espresso with warm milk and a calm finish.',
    image: ''
  },
  {
    id: 2,
    name: 'House Americano',
    category: 'coffee',
    price: 3800,
    description: 'Clean and balanced coffee for everyday breaks.',
    image: ''
  },
  {
    id: 3,
    name: 'Vanilla Bean Latte',
    category: 'coffee',
    price: 5200,
    description: 'A gentle latte with mellow vanilla aroma.',
    image: ''
  },
  {
    id: 4,
    name: 'Einspanner',
    category: 'coffee',
    price: 5600,
    description: 'Deep coffee topped with lightly sweet cream.',
    image: ''
  },
  {
    id: 5,
    name: 'Chamomile Tea',
    category: 'tea',
    price: 4300,
    description: 'Floral herbal tea for a quiet pause.',
    image: ''
  },
  {
    id: 6,
    name: 'Green Tea Latte',
    category: 'tea',
    price: 5200,
    description: 'Creamy green tea with a soft earthy note.',
    image: ''
  },
  {
    id: 7,
    name: 'Lemon Garden Ade',
    category: 'ade',
    price: 5400,
    description: 'Sparkling lemon ade with a refreshing citrus scent.',
    image: ''
  },
  {
    id: 8,
    name: 'Grapefruit Ade',
    category: 'ade',
    price: 5600,
    description: 'Bright grapefruit soda with a clean bittersweet finish.',
    image: ''
  },
  {
    id: 9,
    name: 'Carrot Cake',
    category: 'dessert',
    price: 6200,
    description: 'Moist carrot cake with smooth cream cheese frosting.',
    image: ''
  },
  {
    id: 10,
    name: 'Basque Cheesecake',
    category: 'dessert',
    price: 6500,
    description: 'Rich cheesecake with a toasted caramel top.',
    image: ''
  },
  {
    id: 11,
    name: 'Butter Croissant',
    category: 'bakery',
    price: 3600,
    description: 'Flaky croissant baked with a deep butter aroma.',
    image: ''
  },
  {
    id: 12,
    name: 'Salt Bread',
    category: 'bakery',
    price: 3200,
    description: 'Simple savory bread with a crisp outside.',
    image: ''
  }
];

const ORDER_STATUS = {
  PENDING: { value: 'pending', label: 'Pending' },
  CONFIRMED: { value: 'confirmed', label: 'Confirmed' },
  PREPARING: { value: 'preparing', label: 'Preparing' },
  READY: { value: 'ready', label: 'Ready' },
  COMPLETED: { value: 'completed', label: 'Completed' },
  CANCELLED: { value: 'cancelled', label: 'Cancelled' }
};
