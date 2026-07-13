const MENU_STORAGE_KEY = 'minicafe_menus';
const CART_STORAGE_KEY = 'minicafe_cart';
const ORDER_STORAGE_KEY = 'minicafe_orders';
const AUTH_USERS_STORAGE_KEY = 'minicafe_users';
const AUTH_SESSION_STORAGE_KEY = 'minicafe_session';

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


function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function getUsers() {
  const users = readStorage(AUTH_USERS_STORAGE_KEY, []);
  const hasAdmin = users.some((user) => user.role === 'admin');
  if (hasAdmin) return users;

  const adminUser = {
    id: 'admin-default',
    name: 'Cafe Admin',
    email: 'admin@minicafe.local',
    password: 'admin1234',
    role: 'admin',
    createdAt: new Date().toISOString()
  };
  const nextUsers = [adminUser, ...users];
  writeStorage(AUTH_USERS_STORAGE_KEY, nextUsers);
  return nextUsers;
}

function saveUsers(users) {
  writeStorage(AUTH_USERS_STORAGE_KEY, users);
}

function getCurrentUser() {
  const session = readStorage(AUTH_SESSION_STORAGE_KEY, null);
  if (!session) return null;
  return getUsers().find((user) => user.id === session.userId) || null;
}

function registerUser({ name, email, password, role = 'customer' }) {
  const normalizedEmail = normalizeEmail(email);
  const users = getUsers();

  if (!name || !normalizedEmail || !password) {
    return { ok: false, message: 'Please fill in every field.' };
  }

  if (password.length < 6) {
    return { ok: false, message: 'Password needs at least 6 characters.' };
  }

  if (users.some((user) => normalizeEmail(user.email) === normalizedEmail)) {
    return { ok: false, message: 'This email is already registered.' };
  }

  const user = {
    id: generateId(),
    name: String(name).trim(),
    email: normalizedEmail,
    password,
    role,
    createdAt: new Date().toISOString()
  };
  saveUsers([user, ...users]);
  writeStorage(AUTH_SESSION_STORAGE_KEY, { userId: user.id });
  return { ok: true, user };
}

function loginUser(email, password) {
  const normalizedEmail = normalizeEmail(email);
  const user = getUsers().find((item) => normalizeEmail(item.email) === normalizedEmail && item.password === password);
  if (!user) return { ok: false, message: 'Email or password is not correct.' };

  writeStorage(AUTH_SESSION_STORAGE_KEY, { userId: user.id });
  return { ok: true, user };
}

function logoutUser() {
  localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  clearCart();
}

function requireAuth(role) {
  const user = getCurrentUser();
  if (!user || (role && user.role !== role)) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/auth/login/?next=${next}${role ? `&role=${role}` : ''}`;
    return null;
  }
  return user;
}

function getAuthRedirect(user, fallback = '/') {
  if (user && user.role === 'admin') return '/admin/';
  return fallback;
}

function getPathPrefix() {
  return window.location.pathname.replace(/\/$/, '') || '/';
}

function isActivePath(path) {
  const current = getPathPrefix();
  const target = path.replace(/\/$/, '') || '/';
  return current === target || (target !== '/' && current.startsWith(target));
}

function makeNavLink(href, label) {
  const active = isActivePath(href) ? ' aria-current="page"' : '';
  return `<a href="${href}"${active}>${label}</a>`;
}

function renderCustomerNav(cartCount = getCart().reduce((sum, item) => sum + item.quantity, 0)) {
  const nav = $('.site-nav');
  if (!nav) return;

  const user = getCurrentUser();
  if (!user || user.role !== 'customer') {
    nav.innerHTML = [
      makeNavLink('/menus/list/', 'Menu'),
      makeNavLink('/auth/login/', 'Log in'),
      makeNavLink('/auth/signup/', 'Sign up')
    ].join('');
    return;
  }

  nav.innerHTML = [
    makeNavLink('/menus/list/', 'Menu'),
    makeNavLink('/basket/list/', `Basket <span id="cart-count" class="cart-count">${cartCount}</span>`),
    makeNavLink('/orders/list/', 'Orders'),
    makeNavLink('/my/', 'My'),
    '<button class="nav-logout" type="button" data-logout>Log out</button>'
  ].join('');

  const logoutButton = $('[data-logout]', nav);
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      logoutUser();
      window.location.href = '/menus/list/';
    });
  }
}

function renderAdminNav() {
  const nav = $('.admin-nav');
  if (!nav) return;

  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    nav.innerHTML = [makeNavLink('/auth/login/?role=admin', 'Admin login')].join('');
    return;
  }

  nav.innerHTML = [
    makeNavLink('/admin/', 'Dashboard'),
    makeNavLink('/admin/menus/list/', 'Menus'),
    makeNavLink('/admin/orders/list/', 'Orders'),
    '<button class="nav-logout" type="button" data-logout>Log out</button>'
  ].join('');

  const logoutButton = $('[data-logout]', nav);
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      logoutUser();
      window.location.href = '/auth/login/?role=admin';
    });
  }
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
  const currentUser = getCurrentUser();
  const order = {
    id: generateId(),
    items: [...items],
    userId: currentUser ? currentUser.id : null,
    customerName: currentUser ? currentUser.name : 'Guest',
    customerEmail: currentUser ? currentUser.email : '',
    total,
    status: ORDER_STATUS.PENDING.value,
    createdAt: new Date().toISOString(),
    completedAt: null
  };

  saveOrders([order, ...getOrders()]);
  return order;
}


function getCustomerOrders() {
  const user = getCurrentUser();
  if (!user) return [];
  return getOrders().filter((order) => !order.userId || order.userId === user.id);
}

function getCustomerOrderById(id) {
  return getCustomerOrders().find((order) => String(order.id) === String(id));
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
