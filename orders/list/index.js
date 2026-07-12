const ordersList = $('#orders-list');
const emptyState = $('#empty-state');
const statusFilter = $('#status-filter');
const resultCount = $('#result-count');
const resultTotal = $('#result-total');
const cartCount = $('#cart-count');

function getItemCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function getFilteredOrders() {
  const status = statusFilter.value;
  const orders = getOrders();
  return status === 'all' ? orders : orders.filter((order) => order.status === status);
}

function populateStatusFilter() {
  Object.values(ORDER_STATUS).forEach((status) => {
    const option = document.createElement('option');
    option.value = status.value;
    option.textContent = status.label;
    statusFilter.append(option);
  });
}

function renderOrders() {
  const orders = getFilteredOrders();
  const hasOrders = orders.length > 0;
  const total = orders.reduce((sum, order) => sum + order.total, 0);

  cartCount.textContent = getItemCount(getCart());
  ordersList.hidden = !hasOrders;
  emptyState.hidden = hasOrders;
  resultCount.textContent = `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`;
  resultTotal.textContent = `${formatPrice(total)} total`;

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
        <article class="order-card">
          <div class="order-main">
            <p class="status-pill status-${escapeHtml(order.status)}">${escapeHtml(getStatusLabel(order.status))}</p>
            <h3>Order ${escapeHtml(order.id.slice(-6).toUpperCase())}</h3>
            <p class="order-preview">${previewText || 'No items'}</p>
            <p class="order-date">${escapeHtml(formatDate(order.createdAt))}</p>
          </div>
          <div class="order-side">
            <strong>${formatPrice(order.total)}</strong>
            <span>${itemCount} ${itemCount === 1 ? 'item' : 'items'}</span>
            <a class="detail-link" href="../detail/index.html?id=${encodeURIComponent(order.id)}">View detail</a>
          </div>
        </article>
      `;
    }
  );
}

populateStatusFilter();
statusFilter.addEventListener('change', renderOrders);
renderOrders();
