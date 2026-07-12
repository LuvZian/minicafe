const MENU_STORAGE_KEY = 'minicafe_menus';
const CART_STORAGE_KEY = 'minicafe_cart';
const ORDER_STORAGE_KEY = 'minicafe_orders';

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function formatPrice(price) {
  return Number(price).toLocaleString('ko-KR') + '원';
}

function formatDate(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hour}:${minute}`;
}

function getCategoryName(categoryId) {
  const category = CATEGORIES.find((item) => item.id === categoryId);
  return category ? category.name : categoryId;
}

function getStatusLabel(statusValue) {
  const status = Object.values(ORDER_STATUS).find((item) => item.value === statusValue);
  return status ? status.label : statusValue;
}

function getMenus() {
  const menus = readStorage(MENU_STORAGE_KEY, null);
  if (menus) return menus;

  writeStorage(MENU_STORAGE_KEY, MENU_ITEMS);
  return [...MENU_ITEMS];
}

function saveMenus(menus) {
  writeStorage(MENU_STORAGE_KEY, menus);
}

function getMenuById(id) {
  return getMenus().find((menu) => String(menu.id) === String(id));
}

function normalizeMenu(menu) {
  return {
    name: String(menu.name || '').trim(),
    category: String(menu.category || '').trim(),
    price: Number(menu.price) || 0,
    description: String(menu.description || '').trim(),
    image: String(menu.image || '').trim()
  };
}

function createMenu(menu) {
  const menus = getMenus();
  const newMenu = {
    id: generateId(),
    ...normalizeMenu(menu)
  };

  menus.push(newMenu);
  saveMenus(menus);
  return newMenu;
}

function updateMenu(id, updates) {
  const menus = getMenus();
  const index = menus.findIndex((menu) => String(menu.id) === String(id));
  if (index === -1) return null;

  menus[index] = {
    ...menus[index],
    ...normalizeMenu(updates)
  };
  saveMenus(menus);
  return menus[index];
}

function deleteMenu(id) {
  saveMenus(getMenus().filter((menu) => String(menu.id) !== String(id)));
}

function getCart() {
  return readStorage(CART_STORAGE_KEY, []);
}

function saveCart(cart) {
  writeStorage(CART_STORAGE_KEY, cart);
}

function addToCart(menuId, quantity = 1) {
  const menu = getMenuById(menuId);
  if (!menu) return null;

  const cart = getCart();
  const existing = cart.find((item) => String(item.menuId) === String(menuId));
  const amount = Math.max(Number(quantity) || 1, 1);

  if (existing) {
    existing.quantity += amount;
  } else {
    cart.push({
      menuId: menu.id,
      name: menu.name,
      category: menu.category,
      price: menu.price,
      quantity: amount
    });
  }

  saveCart(cart);
  return cart;
}

function updateCartQuantity(menuId, quantity) {
  const nextQuantity = Number(quantity);
  if (nextQuantity <= 0) {
    removeFromCart(menuId);
    return;
  }

  const cart = getCart().map((item) =>
    String(item.menuId) === String(menuId) ? { ...item, quantity: nextQuantity } : item
  );
  saveCart(cart);
}

function removeFromCart(menuId) {
  saveCart(getCart().filter((item) => String(item.menuId) !== String(menuId)));
}

function clearCart() {
  saveCart([]);
}

function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getOrders() {
  return readStorage(ORDER_STORAGE_KEY, []);
}

function saveOrders(orders) {
  writeStorage(ORDER_STORAGE_KEY, orders);
}

function createOrder(items = getCart()) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    id: generateId(),
    items: [...items],
    total,
    status: ORDER_STATUS.PENDING.value,
    createdAt: new Date().toISOString(),
    completedAt: null
  };

  saveOrders([order, ...getOrders()]);
  return order;
}

function getOrderById(id) {
  return getOrders().find((order) => String(order.id) === String(id));
}

function updateOrderStatus(id, status) {
  const orders = getOrders();
  const order = orders.find((item) => String(item.id) === String(id));
  if (!order) return null;

  order.status = status;
  order.completedAt = status === ORDER_STATUS.COMPLETED.value ? new Date().toISOString() : order.completedAt;
  saveOrders(orders);
  return order;
}

function $(selector, parent = document) {
  return parent.querySelector(selector);
}

function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

function renderList(container, items, renderItem) {
  container.innerHTML = items.map(renderItem).join('');
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
