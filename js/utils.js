const MENU_STORAGE_KEY = 'minicafe_menus';
const CART_STORAGE_KEY = 'minicafe_cart';
const ORDER_STORAGE_KEY = 'minicafe_orders';
const AUTH_USERS_STORAGE_KEY = 'minicafe_users';
const AUTH_SESSION_STORAGE_KEY = 'minicafe_session';
const MENU_VERSION_STORAGE_KEY = 'minicafe_menu_version';
const MENU_DATA_VERSION = 'season-menu-options-v1';

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
  return Number(price).toLocaleString('ko-KR') + '\uC6D0';
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

function getMenuKindName(kindId) {
  const kind = MENU_TYPES.find((item) => item.id === kindId);
  return kind ? kind.name : kindId;
}


const MENU_KIND_ORDER = {
  drink: 0,
  dessert: 1,
  goods: 2,
  unknown: 3
};

function getMenuKind(menu) {
  if (MENU_TYPES.some((kind) => kind.id === menu.kind)) return menu.kind;

  const image = String(menu.image || '').toLowerCase();
  const text = [menu.name, menu.description].join(' ').toLowerCase();

  const dessertImageKeywords = ['wagashi', 'castella', 'pudding', 'bingsu', 'cake', 'yakgwa', 'mochi', 'monaka'];
  const goodsImageKeywords = ['cup', 'sachet', 'fan', 'bottle', 'tin', 'pouch', 'pot', 'towel'];
  const drinkImageKeywords = ['tea', 'ade', 'latte', 'iced', 'roasted', 'yuja', 'pear'];

  const dessertTextKeywords = ['디저트', '화과자', '카스텔라', '푸딩', '빙수', '케이크', '약과', '모찌', '모나카', '다과'];
  const goodsTextKeywords = ['굿즈', '찻잔', '티백', '찻잎', '보틀', '부채', '향낭', '주전자', '타월'];
  const drinkTextKeywords = ['음료', '차', '에이드', '라떼', '아이스티'];

  if (dessertImageKeywords.some((keyword) => image.includes(keyword))) return 'dessert';
  if (goodsImageKeywords.some((keyword) => image.includes(keyword))) return 'goods';
  if (drinkImageKeywords.some((keyword) => image.includes(keyword))) return 'drink';
  if (dessertTextKeywords.some((keyword) => text.includes(keyword))) return 'dessert';
  if (goodsTextKeywords.some((keyword) => text.includes(keyword))) return 'goods';
  if (drinkTextKeywords.some((keyword) => text.includes(keyword))) return 'drink';
  return 'unknown';
}

function getMenuKindOrder(menu) {
  return MENU_KIND_ORDER[getMenuKind(menu)] ?? MENU_KIND_ORDER.unknown;
}

function getMenuSeasonOrder(menu) {
  const index = CATEGORIES.findIndex((category) => category.id === menu.category);
  return index === -1 ? CATEGORIES.length : index;
}

function sortMenusBySeasonKindPrice(menus) {
  return [...menus].sort((a, b) => {
    const seasonDiff = getMenuSeasonOrder(a) - getMenuSeasonOrder(b);
    if (seasonDiff) return seasonDiff;

    const kindDiff = getMenuKindOrder(a) - getMenuKindOrder(b);
    if (kindDiff) return kindDiff;

    const priceDiff = Number(a.price || 0) - Number(b.price || 0);
    if (priceDiff) return priceDiff;

    return String(a.name || '').localeCompare(String(b.name || ''), 'ko-KR');
  });
}

const MENU_OPTION_LABELS = {
  temperature: {
    hot: 'Hot',
    ice: 'Ice'
  },
  temperatureMode: {
    both: 'Hot / Ice 선택 가능',
    hotOnly: 'Hot only',
    iceOnly: 'Ice only'
  },
  serviceType: {
    dineIn: '매장',
    takeout: '포장'
  },
  giftWrap: {
    wrapped: '선물 포장',
    unwrapped: '미포장'
  }
};

function getMenuOptionConfig(menu) {
  const kind = getMenuKind(menu);
  if (kind !== 'drink') return {};

  const mode = menu?.optionConfig?.temperatureMode;
  return {
    temperatureMode: ['both', 'hotOnly', 'iceOnly'].includes(mode) ? mode : 'both'
  };
}

function normalizeMenuOptionConfig(menu) {
  const kind = MENU_TYPES.some((item) => item.id === menu.kind) ? menu.kind : getMenuKind(menu);
  if (kind !== 'drink') return {};

  const mode = menu?.optionConfig?.temperatureMode;
  return {
    temperatureMode: ['both', 'hotOnly', 'iceOnly'].includes(mode) ? mode : 'both'
  };
}

function getDefaultMenuOptions(menu) {
  const kind = getMenuKind(menu);
  if (kind === 'drink') {
    const { temperatureMode } = getMenuOptionConfig(menu);
    const temperature = temperatureMode === 'hotOnly' ? 'hot' : 'ice';
    return { temperature, serviceType: 'dineIn' };
  }
  if (kind === 'dessert') return { serviceType: 'dineIn', forkCount: 1 };
  if (kind === 'goods') return { giftWrap: 'unwrapped' };
  return {};
}

function normalizeMenuOptions(menu, options = {}) {
  const kind = getMenuKind(menu);
  const defaults = getDefaultMenuOptions(menu);
  const nextOptions = { ...defaults, ...options };

  if (kind === 'drink') {
    const serviceTypes = Object.keys(MENU_OPTION_LABELS.serviceType);
    const { temperatureMode } = getMenuOptionConfig(menu);
    const temperatures = temperatureMode === 'both'
      ? ['hot', 'ice']
      : [temperatureMode === 'hotOnly' ? 'hot' : 'ice'];

    return {
      temperature: temperatures.includes(nextOptions.temperature) ? nextOptions.temperature : defaults.temperature,
      serviceType: serviceTypes.includes(nextOptions.serviceType) ? nextOptions.serviceType : defaults.serviceType
    };
  }

  if (kind === 'dessert') {
    const serviceTypes = Object.keys(MENU_OPTION_LABELS.serviceType);
    const forkCount = Math.min(Math.max(Number.parseInt(nextOptions.forkCount, 10) || 1, 0), 20);
    return {
      serviceType: serviceTypes.includes(nextOptions.serviceType) ? nextOptions.serviceType : defaults.serviceType,
      forkCount
    };
  }

  if (kind === 'goods') {
    const giftWraps = Object.keys(MENU_OPTION_LABELS.giftWrap);
    return {
      giftWrap: giftWraps.includes(nextOptions.giftWrap) ? nextOptions.giftWrap : defaults.giftWrap
    };
  }

  return {};
}

function getMenuOptionsSummary(options = {}) {
  const parts = [];
  if (options.temperature) parts.push(MENU_OPTION_LABELS.temperature[options.temperature] || options.temperature);
  if (options.serviceType) parts.push(MENU_OPTION_LABELS.serviceType[options.serviceType] || options.serviceType);
  if (Number.isFinite(Number(options.forkCount))) parts.push(`포크 ${Number(options.forkCount)}개`);
  if (options.giftWrap) parts.push(MENU_OPTION_LABELS.giftWrap[options.giftWrap] || options.giftWrap);
  return parts.join(' · ');
}

function getCartItemKey(menuId, options = {}) {
  return `${menuId}::${JSON.stringify(options)}`;
}
function getStatusLabel(statusValue) {
  const status = Object.values(ORDER_STATUS).find((item) => item.value === statusValue);
  return status ? status.label : statusValue;
}


function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function getDefaultAdminUser() {
  return {
    id: 'admin-default',
    name: 'Minicafe Admin',
    email: 'admin@minicafe.local',
    password: 'admin1234',
    role: 'admin',
    createdAt: new Date().toISOString()
  };
}

function getUsers() {
  const users = readStorage(AUTH_USERS_STORAGE_KEY, []);
  const defaultAdmin = getDefaultAdminUser();
  const adminIndex = users.findIndex((user) => normalizeEmail(user.email) === defaultAdmin.email);

  if (adminIndex === -1) {
    const nextUsers = [defaultAdmin, ...users];
    writeStorage(AUTH_USERS_STORAGE_KEY, nextUsers);
    return nextUsers;
  }

  const savedAdmin = users[adminIndex];
  if (savedAdmin.role !== 'admin' || savedAdmin.password !== defaultAdmin.password) {
    const nextUsers = [...users];
    nextUsers[adminIndex] = {
      ...savedAdmin,
      id: savedAdmin.id || defaultAdmin.id,
      name: savedAdmin.name || defaultAdmin.name,
      email: defaultAdmin.email,
      password: defaultAdmin.password,
      role: 'admin'
    };
    writeStorage(AUTH_USERS_STORAGE_KEY, nextUsers);
    return nextUsers;
  }

  return users;
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
  if (!user) return { ok: false, message: '이메일 또는 비밀번호가 맞지 않아요.' };

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
      makeNavLink('/menus/list/', '메뉴'),
      makeNavLink('/auth/login/', '로그인'),
      makeNavLink('/auth/signup/', '회원가입')
    ].join('');
    return;
  }

  nav.innerHTML = [
    makeNavLink('/menus/list/', '메뉴'),
    makeNavLink('/basket/list/', `장바구니 <span id="cart-count" class="cart-count">${cartCount}</span>`),
    makeNavLink('/orders/list/', '주문'),
    makeNavLink('/my/', '마이'),
    '<button class="nav-logout" type="button" data-logout>로그아웃</button>'
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
    nav.innerHTML = [makeNavLink('/auth/login/?role=admin', '관리자 로그인')].join('');
    return;
  }

  nav.innerHTML = [
    makeNavLink('/admin/', '대시보드'),
    makeNavLink('/admin/menus/list/', '메뉴'),
    makeNavLink('/admin/orders/list/', '주문'),
    '<button class="nav-logout" type="button" data-logout>로그아웃</button>'
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
  const version = readStorage(MENU_VERSION_STORAGE_KEY, null);
  if (Array.isArray(menus) && menus.length > 0 && version === MENU_DATA_VERSION) {
    const normalizedMenus = menus.map((menu) => ({
      ...menu,
      kind: menu.kind || getMenuKind(menu),
      optionConfig: normalizeMenuOptionConfig(menu)
    }));
    if (
      normalizedMenus.some((menu, index) =>
        menu.kind !== menus[index].kind ||
        JSON.stringify(menu.optionConfig || {}) !== JSON.stringify(menus[index].optionConfig || {})
      )
    ) {
      saveMenus(normalizedMenus);
    }
    return normalizedMenus;
  }

  writeStorage(MENU_STORAGE_KEY, MENU_ITEMS);
  writeStorage(MENU_VERSION_STORAGE_KEY, MENU_DATA_VERSION);
  return MENU_ITEMS.map((menu) => ({ ...menu, kind: menu.kind || getMenuKind(menu), optionConfig: normalizeMenuOptionConfig(menu) }));
}

function saveMenus(menus) {
  writeStorage(MENU_STORAGE_KEY, menus);
  writeStorage(MENU_VERSION_STORAGE_KEY, MENU_DATA_VERSION);
}

function getMenuById(id) {
  return getMenus().find((menu) => String(menu.id) === String(id));
}

function normalizeMenu(menu) {
  return {
    name: String(menu.name || '').trim(),
    category: String(menu.category || '').trim(),
    kind: MENU_TYPES.some((kind) => kind.id === menu.kind) ? menu.kind : getMenuKind(menu),
    optionConfig: normalizeMenuOptionConfig(menu),
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

function addToCart(menuId, quantity = 1, options = {}) {
  const menu = getMenuById(menuId);
  if (!menu) return null;

  const normalizedOptions = normalizeMenuOptions(menu, options);
  const cartItemId = getCartItemKey(menu.id, normalizedOptions);
  const cart = getCart();
  const existing = cart.find((item) => item.cartItemId === cartItemId);
  const amount = Math.max(Number(quantity) || 1, 1);

  if (existing) {
    existing.quantity += amount;
  } else {
    cart.push({
      cartItemId,
      menuId: menu.id,
      name: menu.name,
      category: menu.category,
      kind: menu.kind || getMenuKind(menu),
      price: menu.price,
      quantity: amount,
      options: normalizedOptions
    });
  }

  saveCart(cart);
  return cart;
}

function updateCartQuantity(cartItemId, quantity) {
  const nextQuantity = Number(quantity);
  if (nextQuantity <= 0) {
    removeFromCart(cartItemId);
    return;
  }

  const cart = getCart().map((item) =>
    String(item.cartItemId || item.menuId) === String(cartItemId) ? { ...item, quantity: nextQuantity } : item
  );
  saveCart(cart);
}

function removeFromCart(cartItemId) {
  saveCart(getCart().filter((item) => String(item.cartItemId || item.menuId) !== String(cartItemId)));
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
