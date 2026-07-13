renderCustomerNav();
const currentUser = requireAuth('customer');
if (!currentUser) throw new Error('Authentication required');
const orderDetail = $('#order-detail');
const notFound = $('#not-found');
const orderTitle = $('#order-title');
const orderStatus = $('#order-status');
const orderDate = $('#order-date');
const orderCount = $('#order-count');
const orderTotal = $('#order-total');
const itemsList = $('#items-list');
const cartCount = $('#cart-count');

const SEASON_CLASSES = ['season-all', 'season-spring', 'season-summer', 'season-autumn', 'season-winter'];
const SEASON_NAMES = {
  spring: '봄 향기',
  summer: '여름 햇살',
  autumn: '가을 단풍',
  winter: '겨울 눈꽃'
};

function getItemCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function getMenuForOrderItem(item) {
  return getMenuById(item.menuId) || item;
}

function getRepresentativeSeason(items) {
  if (!items || items.length === 0) return 'all';

  const scores = items.reduce((acc, item) => {
    const menu = getMenuForOrderItem(item);
    const season = menu.category;
    if (!SEASON_NAMES[season]) return acc;

    if (!acc[season]) acc[season] = { quantity: 0, total: 0 };
    acc[season].quantity += item.quantity;
    acc[season].total += item.price * item.quantity;
    return acc;
  }, {});

  const [winner] = Object.entries(scores).sort((a, b) => {
    if (b[1].quantity !== a[1].quantity) return b[1].quantity - a[1].quantity;
    return b[1].total - a[1].total;
  })[0] || ['all'];

  return winner;
}

function applyOrderSeason(items) {
  const season = getRepresentativeSeason(items);
  document.body.classList.remove(...SEASON_CLASSES);
  document.body.classList.add(`season-${season}`);
  document.body.dataset.season = season;
  return season;
}

function renderOrderDetail() {
  const order = getCustomerOrderById(getQueryParam('id'));
  if (cartCount) cartCount.textContent = getItemCount(getCart());

  if (!order) {
    applyOrderSeason([]);
    orderDetail.hidden = true;
    notFound.hidden = false;
    return;
  }

  orderDetail.hidden = false;
  notFound.hidden = true;

  const itemCount = getItemCount(order.items);
  const representativeSeason = applyOrderSeason(order.items);
  const seasonLabel = SEASON_NAMES[representativeSeason] || '전체';

  orderTitle.textContent = `${seasonLabel} ${order.id.slice(-6).toUpperCase()}`;
  orderStatus.innerHTML = `<span class="status-pill status-${escapeHtml(order.status)}">${escapeHtml(getStatusLabel(order.status))}</span>`;
  orderDate.textContent = formatDate(order.createdAt);
  orderCount.textContent = `${itemCount}개`;
  orderTotal.textContent = formatPrice(order.total);

  renderList(
    itemsList,
    order.items,
    (item) => {
      const menu = getMenuForOrderItem(item);
      return `
        <article class="order-item" data-season="${escapeHtml(menu.category)}">
          <div>
            <p class="item-meta">${escapeHtml(getCategoryName(menu.category))} · ${formatPrice(item.price)}</p>
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.quantity)}개 담김</p>
          </div>
          <strong>${formatPrice(item.price * item.quantity)}</strong>
        </article>
      `;
    }
  );
}

renderOrderDetail();