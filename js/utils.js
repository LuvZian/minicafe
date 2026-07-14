const AUTH_SESSION_STORAGE_KEY = 'minicafe_session';

function getSupabaseSettings() {
  const settings = window.MINICAFE_SUPABASE || {};
  const url = String(settings.url || '').replace(/\/$/, '');
  const anonKey = String(settings.anonKey || '');
  const isPlaceholder = !anonKey || anonKey.includes('YOUR_SUPABASE_ANON_KEY');

  return {
    url,
    anonKey,
    enabled: settings.enabled !== false && Boolean(url) && !isPlaceholder
  };
}

function getSessionValue() {
  try {
    const stored = sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

function setSessionValue(value) {
  sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(value));
}

function requestSupabase(method, path, body = null, prefer = '') {
  const settings = getSupabaseSettings();
  if (!settings.enabled) {
    throw new Error('Supabase is not configured. Check js/supabase-config.js.');
  }

  const xhr = new XMLHttpRequest();

  try {
    xhr.open(method, `${settings.url}/rest/v1/${path}`, false);
    xhr.setRequestHeader('apikey', settings.anonKey);
    xhr.setRequestHeader('Authorization', `Bearer ${settings.anonKey}`);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (prefer) xhr.setRequestHeader('Prefer', prefer);
    xhr.send(body === null ? null : JSON.stringify(body));

    if (xhr.status < 200 || xhr.status >= 300) {
      throw new Error(`Supabase request failed (${xhr.status}): ${xhr.responseText}`);
    }

    return xhr.responseText ? JSON.parse(xhr.responseText) : null;
  } catch (error) {
    console.error('Supabase request failed:', error);
    throw error;
  }
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

function getUsers() {
  return requestSupabase('GET', 'profiles?select=id,name,email,role,created_at&order=created_at.desc')
    .map((row) => ({ ...row, createdAt: row.created_at }));
}

function saveUsers(users) {
  users.forEach((user) => {
    requestSupabase('PATCH', `profiles?id=eq.${encodeURIComponent(user.id)}`, {
      name: String(user.name || '').trim()
    }, 'return=minimal');
  });
}

function getCurrentUser() {
  const session = getSessionValue();
  if (!session) return null;
  return getUsers().find((user) => user.id === session.userId) || null;
}

function registerUser({ name, email, password, role = 'customer' }) {
  const normalizedEmail = normalizeEmail(email);

  if (!name || !normalizedEmail || !password) {
    return { ok: false, message: 'Please fill in every field.' };
  }

  if (password.length < 6) {
    return { ok: false, message: 'Password needs at least 6 characters.' };
  }

  try {
    const user = requestSupabase('POST', 'rpc/register_minicafe_user', {
      p_id: generateId(), p_name: String(name).trim(), p_email: normalizedEmail, p_password: password
    });
    setSessionValue({ userId: user.id });
    return { ok: true, user };
  } catch (error) {
    const duplicate = String(error.message).includes('Email already registered');
    return { ok: false, message: duplicate ? 'This email is already registered.' : 'Could not create the account.' };
  }
}

function loginUser(email, password) {
  const normalizedEmail = normalizeEmail(email);
  const user = requestSupabase('POST', 'rpc/login_minicafe_user', {
    p_email: normalizedEmail, p_password: password
  });
  if (!user) return { ok: false, message: '이메일 또는 비밀번호가 맞지 않아요.' };

  setSessionValue({ userId: user.id });
  return { ok: true, user };
}

function logoutUser() {
  clearCart();
  sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
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
  let rows = requestSupabase('GET', 'menus?select=*&order=created_at.asc');
  if (rows.length === 0) {
    saveMenus(MENU_ITEMS);
    rows = requestSupabase('GET', 'menus?select=*&order=created_at.asc');
  }
  return rows.map(menuFromRow);
}

function saveMenus(menus) {
  if (!menus.length) return;
  requestSupabase('POST', 'menus?on_conflict=id', menus.map(menuToRow), 'resolution=merge-duplicates,return=minimal');
}

function menuFromRow(row) {
  return {
    id: row.id, name: row.name, category: row.category_id, kind: row.menu_type_id,
    optionConfig: row.option_config || {}, price: Number(row.price),
    description: row.description, image: row.image, soldOut: Boolean(row.is_sold_out)
  };
}

function menuToRow(menu) {
  const normalized = normalizeMenu(menu);
  return {
    id: String(menu.id), name: normalized.name, category_id: normalized.category,
    menu_type_id: normalized.kind, option_config: normalized.optionConfig,
    price: normalized.price, description: normalized.description, image: normalized.image,
    is_sold_out: normalized.soldOut, updated_at: new Date().toISOString()
  };
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
    image: String(menu.image || '').trim(),
    soldOut: Boolean(menu.soldOut)
  };
}

function createMenu(menu) {
  const newMenu = {
    id: generateId(),
    ...normalizeMenu(menu)
  };
  requestSupabase('POST', 'menus', menuToRow(newMenu), 'return=minimal');
  return newMenu;
}

function updateMenu(id, updates) {
  const existing = getMenuById(id);
  if (!existing) return null;
  const updated = { ...existing, ...normalizeMenu(updates) };
  const row = menuToRow(updated);
  delete row.id;
  requestSupabase('PATCH', `menus?id=eq.${encodeURIComponent(id)}`, row, 'return=minimal');
  return updated;
}

function deleteMenu(id) {
  requestSupabase('DELETE', `menus?id=eq.${encodeURIComponent(id)}`, null, 'return=minimal');
}


function getFavoriteMenuIds() {
  const user = getCurrentUser();
  if (!user || user.role !== 'customer') return [];

  try {
    return requestSupabase(
      'GET',
      `favorite_menus?user_id=eq.${encodeURIComponent(user.id)}&select=menu_id&order=created_at.desc`
    ).map((row) => String(row.menu_id));
  } catch (error) {
    console.warn('favorite_menus table is not ready yet.', error);
    return [];
  }
}

function getFavoriteMenus() {
  const favoriteIds = getFavoriteMenuIds();
  if (favoriteIds.length === 0) return [];

  const menuMap = new Map(getMenus().map((menu) => [String(menu.id), menu]));
  return favoriteIds.map((id) => menuMap.get(String(id))).filter(Boolean);
}

function isFavoriteMenu(menuId) {
  return getFavoriteMenuIds().includes(String(menuId));
}

function addFavoriteMenu(menuId) {
  const user = getCurrentUser();
  if (!user || user.role !== 'customer') return false;

  try {
    requestSupabase(
      'POST',
      'favorite_menus?on_conflict=user_id,menu_id',
      { user_id: user.id, menu_id: String(menuId) },
      'resolution=merge-duplicates,return=minimal'
    );
    return true;
  } catch (error) {
    console.warn('favorite_menus table is not ready yet.', error);
    return false;
  }
}

function removeFavoriteMenu(menuId) {
  const user = getCurrentUser();
  if (!user || user.role !== 'customer') return false;

  try {
    requestSupabase(
      'DELETE',
      `favorite_menus?user_id=eq.${encodeURIComponent(user.id)}&menu_id=eq.${encodeURIComponent(String(menuId))}`,
      null,
      'return=minimal'
    );
    return true;
  } catch (error) {
    console.warn('favorite_menus table is not ready yet.', error);
    return false;
  }
}

function toggleFavoriteMenu(menuId) {
  if (isFavoriteMenu(menuId)) {
    removeFavoriteMenu(menuId);
    return false;
  }

  return addFavoriteMenu(menuId);
}

function getFavoriteSeasonFromFavorites() {
  const scores = getFavoriteMenus().reduce((acc, menu) => {
    acc[menu.category] = (acc[menu.category] || 0) + 1;
    return acc;
  }, {});
  const [season] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0] || [];
  return season || '';
}
function getCart() {

  const user = getCurrentUser();
  if (!user) return [];
  const carts = requestSupabase('GET', `carts?user_id=eq.${encodeURIComponent(user.id)}&select=id&limit=1`);
  if (!carts.length) return [];
  return requestSupabase('GET', `cart_items?cart_id=eq.${encodeURIComponent(carts[0].id)}&select=*&order=created_at.asc`)
    .map(cartItemFromRow);
}

function saveCart(cart) {
  const user = getCurrentUser();
  if (!user) throw new Error('Login is required to save a cart.');
  const rows = requestSupabase(
    'POST', 'carts?on_conflict=user_id&select=id', { user_id: user.id, updated_at: new Date().toISOString() },
    'resolution=merge-duplicates,return=representation'
  );
  const cartId = rows[0].id;
  requestSupabase('DELETE', `cart_items?cart_id=eq.${encodeURIComponent(cartId)}`, null, 'return=minimal');
  if (cart.length) {
    requestSupabase('POST', 'cart_items', cart.map((item) => cartItemToRow(cartId, item)), 'return=minimal');
  }
}

function cartItemFromRow(row) {
  return {
    cartItemId: row.cart_item_key, menuId: row.menu_id, name: row.name, category: row.category_id,
    kind: row.menu_type_id, price: Number(row.price), quantity: Number(row.quantity), options: row.options || {}
  };
}

function cartItemToRow(cartId, item) {
  return {
    cart_item_key: item.cartItemId || getCartItemKey(item.menuId, item.options), cart_id: cartId,
    menu_id: String(item.menuId), name: item.name, category_id: item.category,
    menu_type_id: item.kind, price: Number(item.price), quantity: Number(item.quantity), options: item.options || {}
  };
}

function addToCart(menuId, quantity = 1, options = {}) {
  const menu = getMenuById(menuId);
  if (!menu || menu.soldOut) return null;

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
  return requestSupabase('GET', 'orders?select=*,order_items(*)&order=created_at.desc').map(orderFromRow);
}

function saveOrders(orders) {
  orders.forEach((order) => {
    requestSupabase('PATCH', `orders?id=eq.${encodeURIComponent(order.id)}`, {
      status: order.status, completed_at: order.completedAt
    }, 'return=minimal');
  });
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

  requestSupabase('POST', 'orders', {
    id: order.id, user_id: order.userId, customer_name: order.customerName,
    customer_email: order.customerEmail, total: order.total, status: order.status,
    created_at: order.createdAt, completed_at: order.completedAt
  }, 'return=minimal');
  if (items.length) {
    requestSupabase('POST', 'order_items', items.map((item) => ({
      order_id: order.id, menu_id: String(item.menuId), name: item.name,
      category_id: item.category, menu_type_id: item.kind, price: Number(item.price),
      quantity: Number(item.quantity), options: item.options || {}
    })), 'return=minimal');
  }
  return order;
}

function orderFromRow(row) {
  return {
    id: row.id, userId: row.user_id, customerName: row.customer_name,
    customerEmail: row.customer_email, total: Number(row.total), status: row.status,
    createdAt: row.created_at, completedAt: row.completed_at,
    items: (row.order_items || []).map((item) => ({
      menuId: item.menu_id, name: item.name, category: item.category_id,
      kind: item.menu_type_id, price: Number(item.price), quantity: Number(item.quantity), options: item.options || {}
    }))
  };
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
  const order = getOrderById(id);
  if (!order) return null;

  order.status = status;
  order.completedAt = status === ORDER_STATUS.COMPLETED.value ? new Date().toISOString() : order.completedAt;
  requestSupabase('PATCH', `orders?id=eq.${encodeURIComponent(id)}`, {
    status: order.status, completed_at: order.completedAt
  }, 'return=minimal');
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
