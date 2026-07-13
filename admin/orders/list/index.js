const ordersList = $('#orders-list');
const emptyState = $('#empty-state');
const resultCount = $('#result-count');
const statusFilter = $('#status-filter');
const searchInput = $('#search-input');

function getItemCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function populateStatusFilter() {
  Object.values(ORDER_STATUS).forEach((status) => {
    const option = document.createElement('option');
    option.value = status.value;
    option.textContent = status.label;
    statusFilter.append(option);
  });
}

function getFilteredOrders() {
  const status = statusFilter.value;
  const keyword = searchInput.value.trim().toLowerCase();

  return getOrders().filter((order) => {
    const matchesStatus = status === 'all' || order.status === status;
    const targetText = [
      order.id,
      getStatusLabel(order.status),
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

  resultCount.textContent = `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`;
  ordersList.hidden = !hasOrders;
  emptyState.hidden = hasOrders;

  renderList(
    ordersList,
    orders,
    (order) => {
      const itemCount = getItemCount(order.items);
      const preview = order.items
        .slice(0, 2)
        .map((item) => `${escapeHtml(item.name)} x ${escapeHtml(item.quantity)}`)
        .join(', ');
      const extraCount = Math.max(order.items.length - 2, 0);
      const previewText = extraCount > 0 ? `${preview} and ${extraCount} more` : preview;

      return `
        <article class="order-row">
          <div class="order-main">
            <p class="status-pill status-${escapeHtml(order.status)}">${escapeHtml(getStatusLabel(order.status))}</p>
            <h3>Order ${escapeHtml(order.id.slice(-6).toUpperCase())}</h3>
            <p>${previewText || 'No items'}</p>
            <span>${escapeHtml(formatDate(order.createdAt))}</span>
          </div>
          <div class="order-side">
            <strong>${formatPrice(order.total)}</strong>
            <span>${itemCount} ${itemCount === 1 ? 'item' : 'items'}</span>
            <a class="secondary-link" href="/admin/orders/detail/?id=${encodeURIComponent(order.id)}">Detail</a>
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
