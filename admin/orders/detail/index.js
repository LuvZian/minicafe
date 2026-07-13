renderAdminNav();
const currentAdmin = requireAuth('admin');
if (!currentAdmin) throw new Error('관리자 로그인이 필요해요.');

const orderDetail = $('#order-detail');
const notFound = $('#not-found');
const orderTitle = $('#order-title');
const orderSeason = $('#order-season');
const orderStatus = $('#order-status');
const orderDate = $('#order-date');
const orderCount = $('#order-count');
const orderTotal = $('#order-total');
const statusSelect = $('#status-select');
const saveStatus = $('#save-status');
const statusMessage = $('#status-message');
const itemsList = $('#items-list');

let currentOrder = null;

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

function applyOrderTheme(order) {
  const mood = getOrderMood(order);
  document.body.dataset.season = mood.season === 'all' ? '' : mood.season;
  orderDetail.dataset.season = mood.season;
  orderSeason.textContent = '';
  orderSeason.hidden = true;
}

function populateStatusSelect() {
  Object.values(ORDER_STATUS).forEach((status) => {
    const option = document.createElement('option');
    option.value = status.value;
    option.textContent = getStatusName(status.value);
    statusSelect.append(option);
  });
}

function renderStatus(order) {
  orderStatus.innerHTML = `<span class="status-pill status-${escapeHtml(order.status)}">${escapeHtml(getStatusName(order.status))}</span>`;
  statusSelect.value = order.status;
}

function renderOrder(order) {
  const itemCount = getItemCount(order.items);
  const mood = getOrderMood(order);
  document.title = `${mood.label} 주문 상세 | Minicafe`;
  applyOrderTheme(order);

  orderTitle.textContent = `${mood.label} 주문 ${order.id.slice(-6).toUpperCase()}`;
  orderDate.textContent = formatDate(order.createdAt);
  orderCount.textContent = `${itemCount}개 메뉴`;
  orderTotal.textContent = formatPrice(order.total);
  renderStatus(order);

  renderList(
    itemsList,
    order.items,
    (item) => {
      const menu = getMenuForOrderItem(item);
      const season = menu.category || item.category || 'all';
      const optionSummary = getMenuOptionsSummary(item.options);
      return `
        <article class="order-item" data-season="${escapeHtml(season)}">
          <div class="item-thumb" style="--menu-image: url('${escapeHtml(menu.image || SEASON_IMAGES[season] || SEASON_IMAGES.spring)}')" aria-hidden="true"></div>
          <div class="item-main">
            <p class="item-meta">${escapeHtml(getCategoryName(season))} · ${formatPrice(item.price)}</p>
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.quantity)}개 담김</p>
            ${optionSummary ? `<p class=item-option>${escapeHtml(optionSummary)}</p>` : ''}
          </div>
          <strong>${formatPrice(item.price * item.quantity)}</strong>
        </article>
      `;
    }
  );
}

function renderPage() {
  currentOrder = getOrderById(getQueryParam('id'));
  if (!currentOrder) {
    document.body.dataset.season = '';
    orderDetail.hidden = true;
    notFound.hidden = false;
    return;
  }

  orderDetail.hidden = false;
  notFound.hidden = true;
  renderOrder(currentOrder);
}

saveStatus.addEventListener('click', () => {
  if (!currentOrder) return;
  const updated = updateOrderStatus(currentOrder.id, statusSelect.value);
  if (!updated) return;

  currentOrder = updated;
  renderStatus(currentOrder);
  statusMessage.textContent = `상태가 ${getStatusName(currentOrder.status)}(으)로 변경됐어요.`;
  window.clearTimeout(statusMessage.timer);
  statusMessage.timer = window.setTimeout(() => {
    statusMessage.textContent = '';
  }, 1800);
});

populateStatusSelect();
renderPage();