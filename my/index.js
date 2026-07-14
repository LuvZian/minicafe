renderCustomerNav();
const currentUser = requireAuth('customer');
if (!currentUser) throw new Error('Authentication required');

const SEASON_COPY = {
  spring: {
    label: '봄 향기',
    short: '봄',
    sentence: '은은하고 산뜻한 메뉴를 자주 찾고 있어요.'
  },
  summer: {
    label: '여름 햇살',
    short: '여름',
    sentence: '맑고 시원한 계절 메뉴가 잘 어울려요.'
  },
  autumn: {
    label: '가을 단풍',
    short: '가을',
    sentence: '깊고 포근한 메뉴 취향이 보여요.'
  },
  winter: {
    label: '겨울 눈꽃',
    short: '겨울',
    sentence: '차분하고 부드러운 메뉴를 좋아하는 편이에요.'
  },
  all: {
    label: '사계절',
    short: '사계절',
    sentence: '주문이 쌓이면 가장 잘 어울리는 계절을 찾아드릴게요.'
  }
};

const STATUS_LABELS = {
  pending: '주문 대기',
  confirmed: '주문 확인',
  preparing: '준비 중',
  ready: '준비 완료',
  completed: '완료',
  cancelled: '취소'
};

const cartCount = $('#cart-count');
const profileDisplayName = $('#profile-display-name');
const profileEmail = $('#profile-email');
const memberSince = $('#member-since');
const profileSeasonLabel = $('#profile-season-label');
const seasonStat = $('#season-stat');
const seasonCopy = $('#season-copy');
const seasonMenuLink = $('#season-menu-link');
const seasonMenuImage = $('#season-menu-image');
const seasonMenuName = $('#season-menu-name');
const seasonMenuPrice = $('#season-menu-price');
const profileForm = $('#profile-form');
const profileName = $('#profile-name');
const profileMessage = $('#profile-message');
const basketStat = $('#basket-stat');
const basketCopy = $('#basket-copy');
const basketTotal = $('#basket-total');
const ordersStat = $('#orders-stat');
const ordersCopy = $('#orders-copy');
const ordersTotal = $('#orders-total');
const favoriteStat = $('#favorite-stat');
const favoriteCopy = $('#favorite-copy');
const favoriteCount = $('#favorite-count');
const recentList = $('#recent-list');
const recentEmpty = $('#recent-empty');
const favoriteList = $('#favorite-list');
const favoriteEmpty = $('#favorite-empty');

function getItemCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function getItemSeason(item) {
  const menu = getMenuById(item.menuId);
  return (menu && menu.category) || item.category || 'spring';
}

function getSeasonScore(items) {
  return items.reduce((result, item) => {
    const season = getItemSeason(item);
    result[season] = (result[season] || 0) + item.quantity;
    return result;
  }, {});
}

function getRepresentativeSeason(items) {
  const [season] = Object.entries(getSeasonScore(items)).sort((a, b) => b[1] - a[1])[0] || [];
  return season || 'all';
}

function getFavoriteSeason(orders, favoriteMenus = []) {
  const orderedItems = orders.flatMap((order) => order.items || []);
  const favoriteItems = favoriteMenus.map((menu) => ({ menuId: menu.id, category: menu.category, quantity: 2 }));
  const score = getSeasonScore([...favoriteItems, ...orderedItems]);
  const [season, count] = Object.entries(score).sort((a, b) => b[1] - a[1])[0] || [];
  return { season: season || 'all', count: count || 0 };
}

function getRandomSeason() {
  const seasons = ['spring', 'summer', 'autumn', 'winter'];
  return seasons[Math.floor(Math.random() * seasons.length)];
}

function getRecommendedMenu(seasonKey, favoriteMenus = []) {
  const targetSeason = seasonKey === 'all' ? getRandomSeason() : seasonKey;
  const favoritePool = favoriteMenus.filter((menu) => menu.category === targetSeason);
  const pool = favoritePool.length > 0 ? favoritePool : getMenus().filter((menu) => menu.category === targetSeason);
  if (pool.length === 0) return null;
  const index = new Date().getDate() % pool.length;
  return pool[index];
}

function getFriendlyStatus(status) {
  return STATUS_LABELS[status] || getStatusLabel(status);
}

function getOrderPreview(order) {
  const names = (order.items || []).slice(0, 2).map((item) => item.name);
  const restCount = Math.max((order.items || []).length - names.length, 0);
  return restCount > 0 ? `${names.join(', ')} 외 ${restCount}개` : names.join(', ') || '주문 메뉴';
}

function updateCurrentUserName(name) {
  const users = getUsers();
  const nextUsers = users.map((user) => (user.id === currentUser.id ? { ...user, name } : user));
  saveUsers(nextUsers);
  currentUser.name = name;
}

function renderProfile(favoriteSeason = 'all') {
  const displayName = currentUser.name || 'Minicafe guest';
  const season = SEASON_COPY[favoriteSeason] || SEASON_COPY.all;

  profileDisplayName.textContent = displayName;
  profileEmail.textContent = currentUser.email || '이메일 정보 없음';
  memberSince.textContent = currentUser.createdAt ? `${formatDate(currentUser.createdAt)} 가입` : '오늘부터 함께하는 중';
  profileSeasonLabel.textContent = `${season.label} 취향`;
  profileName.value = currentUser.name || '';
}

function renderRecommendedMenu(menu) {
  if (!menu) return;
  seasonMenuLink.href = `/menus/detail/?id=${encodeURIComponent(menu.id)}`;
  seasonMenuImage.src = menu.image || '/assets/menu/sakura-wagashi-plate.png';
  seasonMenuImage.alt = `${menu.name} 이미지`;
  seasonMenuImage.dataset.menuId = String(menu.id);
  seasonMenuName.textContent = menu.name;
  seasonMenuPrice.textContent = formatPrice(menu.price);
}

function renderRecentOrders(orders) {
  const recentOrders = orders.slice(0, 3);
  recentEmpty.hidden = recentOrders.length > 0;

  recentList.innerHTML = recentOrders
    .map((order) => {
      const seasonKey = getRepresentativeSeason(order.items || []);
      const season = SEASON_COPY[seasonKey] || SEASON_COPY.all;
      return `
        <article class="mini-order-card" data-season="${escapeHtml(seasonKey)}">
          <div>
            <span class="order-season">${escapeHtml(season.label)}</span>
            <h3>${escapeHtml(getOrderPreview(order))}</h3>
            <p>${escapeHtml(getFriendlyStatus(order.status))} · ${escapeHtml(formatDate(order.createdAt))}</p>
          </div>
          <div class="mini-order-meta">
            <strong>${formatPrice(order.total)}</strong>
            <a href="/orders/detail/?id=${encodeURIComponent(order.id)}">상세 보기</a>
          </div>
        </article>
      `;
    })
    .join('');
}


function renderFavoriteMenus(favoriteMenus) {
  const menus = favoriteMenus.slice(0, 4);
  if (!favoriteList || !favoriteEmpty) return;

  favoriteEmpty.hidden = menus.length > 0;
  favoriteList.hidden = menus.length === 0;

  renderList(
    favoriteList,
    menus,
    (menu) => `
      <a class="favorite-menu-card" href="/menus/detail/?id=${encodeURIComponent(menu.id)}" data-season="${escapeHtml(menu.category)}">
        <img src="${escapeHtml(menu.image || SEASON_IMAGES[menu.category] || SEASON_IMAGES.spring)}" alt="${escapeHtml(menu.name)} 이미지" />
        <span>
          <small>${escapeHtml(getCategoryName(menu.category))}</small>
          <strong>${escapeHtml(menu.name)}</strong>
        </span>
      </a>
    `
  );
}
function renderActivity() {
  const cart = getCart();
  const orders = getCustomerOrders();
  const favoriteMenus = getFavoriteMenus();
  const itemCount = getItemCount(cart);
  const orderTotal = orders.reduce((sum, order) => sum + order.total, 0);
  const favorite = getFavoriteSeason(orders, favoriteMenus);
  const favoriteSeasonKey = favorite.count > 0 ? favorite.season : getRandomSeason();
  const favoriteSeason = SEASON_COPY[favoriteSeasonKey] || SEASON_COPY.all;
  const basketSeason = SEASON_COPY[getRepresentativeSeason(cart)] || SEASON_COPY.all;
  const recommendedMenu = getRecommendedMenu(favoriteSeasonKey, favoriteMenus);

  document.body.dataset.favoriteSeason = favoriteSeasonKey;
  renderProfile(favoriteSeasonKey);
  renderRecommendedMenu(recommendedMenu);

  if (cartCount) cartCount.textContent = itemCount;

  basketStat.textContent = itemCount;
  basketCopy.textContent = itemCount > 0 ? `${basketSeason.label} 메뉴가 장바구니에 담겨 있어요.` : '담긴 메뉴가 없어요.';
  basketTotal.textContent = formatPrice(getCartTotal());

  ordersStat.textContent = orders.length;
  ordersCopy.textContent = orders.length > 0 ? '내 주문 내역만 모아서 보여드려요.' : '아직 주문 내역이 없어요.';
  ordersTotal.textContent = formatPrice(orderTotal);

  favoriteStat.textContent = favorite.count > 0 ? favoriteSeason.label : '-';
  favoriteCopy.textContent = favorite.count > 0 ? favoriteSeason.sentence : SEASON_COPY.all.sentence;
  favoriteCount.textContent = favoriteMenus.length > 0 ? `${favoriteMenus.length}개 찜` : `${favorite.count}개 메뉴`;

  seasonStat.textContent = favoriteSeason.label;
  seasonCopy.textContent = favorite.count > 0 ? favoriteSeason.sentence : '아직 취향 기록이 적어서 오늘은 계절 메뉴를 랜덤으로 골라봤어요.';

  renderFavoriteMenus(favoriteMenus);
  renderRecentOrders(orders);
}

profileForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = profileName.value.trim() || 'Minicafe guest';
  updateCurrentUserName(name);
  profileMessage.textContent = `${name}님으로 저장했어요.`;
  renderActivity();
  window.clearTimeout(profileMessage.timer);
  profileMessage.timer = window.setTimeout(() => {
    profileMessage.textContent = '';
  }, 1800);
});

renderActivity();