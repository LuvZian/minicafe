const orderDetail = $('#order-detail');
const notFound = $('#not-found');
const orderTitle = $('#order-title');
const orderStatus = $('#order-status');
const orderDate = $('#order-date');
const orderCount = $('#order-count');
const orderTotal = $('#order-total');
const itemsList = $('#items-list');
const cartCount = $('#cart-count');

function getItemCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function renderOrderDetail() {
  const order = getOrderById(getQueryParam('id'));
  cartCount.textContent = getItemCount(getCart());

  if (!order) {
    orderDetail.hidden = true;
    notFound.hidden = false;
    return;
  }

  orderDetail.hidden = false;
  notFound.hidden = true;

  const itemCount = getItemCount(order.items);
  orderTitle.textContent = `Order ${order.id.slice(-6).toUpperCase()}`;
  orderStatus.innerHTML = `<span class="status-pill status-${escapeHtml(order.status)}">${escapeHtml(getStatusLabel(order.status))}</span>`;
  orderDate.textContent = formatDate(order.createdAt);
  orderCount.textContent = `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`;
  orderTotal.textContent = formatPrice(order.total);

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

renderOrderDetail();
