const orderDetail = $('#order-detail');
const notFound = $('#not-found');
const orderTitle = $('#order-title');
const orderStatus = $('#order-status');
const orderDate = $('#order-date');
const orderCount = $('#order-count');
const orderTotal = $('#order-total');
const statusSelect = $('#status-select');
const saveStatus = $('#save-status');
const statusMessage = $('#status-message');
const itemsList = $('#items-list');

let currentOrder = null;

function getItemCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function populateStatusSelect() {
  Object.values(ORDER_STATUS).forEach((status) => {
    const option = document.createElement('option');
    option.value = status.value;
    option.textContent = status.label;
    statusSelect.append(option);
  });
}

function renderStatus(order) {
  orderStatus.innerHTML = `<span class="status-pill status-${escapeHtml(order.status)}">${escapeHtml(getStatusLabel(order.status))}</span>`;
  statusSelect.value = order.status;
}

function renderOrder(order) {
  const itemCount = getItemCount(order.items);
  orderTitle.textContent = `Order ${order.id.slice(-6).toUpperCase()}`;
  orderDate.textContent = formatDate(order.createdAt);
  orderCount.textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
  orderTotal.textContent = formatPrice(order.total);
  renderStatus(order);

  renderList(
    itemsList,
    order.items,
    (item) => `
      <article class="order-item">
        <div>
          <p class="item-meta">${escapeHtml(getCategoryName(item.category))} · ${formatPrice(item.price)}</p>
          <h3>${escapeHtml(item.name)}</h3>
          <p>${escapeHtml(item.quantity)} ${item.quantity === 1 ? 'item' : 'items'}</p>
        </div>
        <strong>${formatPrice(item.price * item.quantity)}</strong>
      </article>
    `
  );
}

function renderPage() {
  currentOrder = getOrderById(getQueryParam('id'));
  if (!currentOrder) {
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
  statusMessage.textContent = `Status changed to ${getStatusLabel(currentOrder.status)}.`;
  window.clearTimeout(statusMessage.timer);
  statusMessage.timer = window.setTimeout(() => {
    statusMessage.textContent = '';
  }, 1800);
});

populateStatusSelect();
renderPage();
