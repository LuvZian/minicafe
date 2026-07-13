renderAdminNav();
const currentAdmin = requireAuth('admin');
if (!currentAdmin) throw new Error('관리자 로그인이 필요해요.');

const ordersList = $('#orders-list');
const emptyState = $('#empty-state');
const resultCount = $('#result-count');
const statusFilter = $('#status-filter');
const searchInput = $('#search-input');

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

function getStatusName(statusValue) {
  return STATUS_NAMES[statusValue] || getStatusLabel(statusValue);
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

function populateStatusFilter() {
  Object.values(ORDER_STATUS).forEach((status) => {
    const option = document.createElement('option');
    option.value = status.value;
    option.textContent = getStatusName(status.value);
    statusFilter.append(option);
  });
}

function getFilteredOrders() {
  const status = statusFilter.value;
  const keyword = searchInput.value.trim().toLowerCase();

  return getOrders().filter((order) => {
    const matchesStatus = status === 'all' || order.status === status;
    const mood = getOrderMood(order);
    const targetText = [
      order.id,
      getStatusName(order.status),
      mood.label,
      ...order.items.map((item) => item.name),
      ...order.items.map((item) => getCategoryName(item.category))
    ]
      .join(' ')
      .toLowerCase();
    return matchesStatus && targetText.includes(keyword);
  });
}

function renderOrders() {
  const orders = getFilteredOrders();
  const hasOrders = orders.length > 0;

  resultCount.textContent = `${orders.length}건의 주문`;
  ordersList.hidden = !hasOrders;
  emptyState.hidden = hasOrders;

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
        <article class="order-row" data-season="${escapeHtml(mood.season)}">
          <div class="order-main">
            <p class="status-pill status-${escapeHtml(order.status)}">${escapeHtml(getStatusName(order.status))}</p>
            <h3>${escapeHtml(mood.label)} 주문 ${escapeHtml(order.id.slice(-6).toUpperCase())}</h3>
            <p>${previewText || '담긴 메뉴가 없어요.'}</p>
            <span>${escapeHtml(formatDate(order.createdAt))}</span>
          </div>
          <div class="order-side">
            <strong>${formatPrice(order.total)}</strong>
            <span>${itemCount}개 메뉴</span>
            <a class="secondary-link" href="/admin/orders/detail/?id=${encodeURIComponent(order.id)}">상세 보기</a>
          </div>
        </article>
      `;
    }
  );
}

populateStatusFilter();
statusFilter.addEventListener('change', renderOrders);
searchInput.addEventListener('input', renderOrders);
renderOrders();