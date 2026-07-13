renderCustomerNav();
const currentUser = requireAuth('customer');
if (!currentUser) throw new Error('로그인이 필요해요.');

const ordersList = $('#orders-list');
const emptyState = $('#empty-state');
const statusFilter = $('#status-filter');
const resultCount = $('#result-count');
const resultTotal = $('#result-total');
const cartCount = $('#cart-count');

const SEASON_NAMES = {
  spring: '봄 향기',
  summer: '여름 햇살',
  autumn: '가을 단풍',
  winter: '겨울 눈꽃'
};

const STATUS_NAMES = {
  pending: '접수 대기',
  confirmed: '주문 확인',
  preparing: '준비 중',
  ready: '픽업 가능',
  completed: '완료',
  cancelled: '취소'
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

function getOrderMood(order) {
  const season = getRepresentativeSeason(order.items);
  return {
    season,
    label: SEASON_NAMES[season] || '사계절'
  };
}

function getStatusName(statusValue) {
  return STATUS_NAMES[statusValue] || getStatusLabel(statusValue);
}

function getFilteredOrders() {
  const status = statusFilter.value;
  const orders = getCustomerOrders();
  return status === 'all' ? orders : orders.filter((order) => order.status === status);
}

function populateStatusFilter() {
  Object.values(ORDER_STATUS).forEach((status) => {
    const option = document.createElement('option');
    option.value = status.value;
    option.textContent = getStatusName(status.value);
    statusFilter.append(option);
  });
}

function renderOrders() {
  const orders = getFilteredOrders();
  const hasOrders = orders.length > 0;
  const total = orders.reduce((sum, order) => sum + order.total, 0);

  if (cartCount) cartCount.textContent = getItemCount(getCart());
  ordersList.hidden = !hasOrders;
  emptyState.hidden = hasOrders;
  resultCount.textContent = `${orders.length}건의 주문`;
  resultTotal.textContent = `총 ${formatPrice(total)}`;

  renderList(
    ordersList,
    orders,
    (order) => {
      const itemCount = getItemCount(order.items);
      const mood = getOrderMood(order);
      const preview = order.items
        .slice(0, 2)
        .map((item) => `${escapeHtml(item.name)} ${escapeHtml(item.quantity)}개`)
        .join(', ');
      const extraCount = Math.max(order.items.length - 2, 0);
      const previewText = extraCount > 0 ? `${preview} 외 ${extraCount}개` : preview;

      return `
        <article class="order-card" data-season="${escapeHtml(mood.season)}">
          <div class="order-main">
            <p class="status-pill status-${escapeHtml(order.status)}">${escapeHtml(getStatusName(order.status))}</p>
            <h3>${escapeHtml(mood.label)} 주문 ${escapeHtml(order.id.slice(-6).toUpperCase())}</h3>
            <p class="order-preview">${previewText || '담긴 메뉴가 없어요.'}</p>
            <p class="order-date">${escapeHtml(formatDate(order.createdAt))}</p>
          </div>
          <div class="order-side">
            <strong>${formatPrice(order.total)}</strong>
            <span>${itemCount}개 메뉴</span>
            <a class="detail-link" href="/orders/detail/?id=${encodeURIComponent(order.id)}">상세 보기</a>
          </div>
        </article>
      `;
    }
  );
}

populateStatusFilter();
statusFilter.addEventListener('change', renderOrders);
renderOrders();