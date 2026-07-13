renderAdminNav();
const currentAdmin = requireAuth('admin');
if (!currentAdmin) throw new Error('Admin authentication required');
const menuCount = $('#menu-count');
const orderCount = $('#order-count');
const openCount = $('#open-count');
const revenueTotal = $('#revenue-total');
const recentOrders = $('#recent-orders');
const emptyOrders = $('#empty-orders');

function getItemCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function isOpenOrder(order) {
  return ![ORDER_STATUS.COMPLETED.value, ORDER_STATUS.CANCELLED.value].includes(order.status);
}

function renderDashboard() {
  const menus = getMenus();
  const orders = getOrders();
  const openOrders = orders.filter(isOpenOrder);
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const latest = orders.slice(0, 5);

  menuCount.textContent = menus.length;
  orderCount.textContent = orders.length;
  openCount.textContent = openOrders.length;
  revenueTotal.textContent = formatPrice(revenue);

  recentOrders.hidden = latest.length === 0;
  emptyOrders.hidden = latest.length > 0;

  renderList(
    recentOrders,
    latest,
    (order) => `
      <article class="recent-row">
        <div>
          <p class="status-pill status-${escapeHtml(order.status)}">${escapeHtml(getStatusLabel(order.status))}</p>
          <h3>Order ${escapeHtml(order.id.slice(-6).toUpperCase())}</h3>
          <p>${getItemCount(order.items)} ${getItemCount(order.items) === 1 ? 'item' : 'items'} · ${escapeHtml(formatDate(order.createdAt))}</p>
        </div>
        <div class="recent-side">
          <strong>${formatPrice(order.total)}</strong>
          <a class="secondary-link" href="/admin/orders/detail/?id=${encodeURIComponent(order.id)}">Open</a>
        </div>
      </article>
    `
  );
}

renderDashboard();
