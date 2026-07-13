renderCustomerNav();
const currentUser = requireAuth('customer');
if (!currentUser) throw new Error('Authentication required');
const basketList = $('#basket-list');
const emptyState = $('#empty-state');
const summaryCount = $('#summary-count');
const summaryTotal = $('#summary-total');
const summaryNote = $('#summary-note');
const clearButton = $('#clear-button');
const orderButton = $('#order-button');
const cartCount = $('#cart-count');
const toast = $('#toast');

const SEASON_CLASSES = ['season-all', 'season-spring', 'season-summer', 'season-autumn', 'season-winter'];
const SEASON_NAMES = {
  spring: '봄',
  summer: '여름',
  autumn: '가을',
  winter: '겨울'
};

function normalizeQuantity(value) {
  const quantity = Number.parseInt(value, 10);
  if (Number.isNaN(quantity)) return 1;
  return Math.min(Math.max(quantity, 1), 99);
}

function getItemCount(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getMenuForCartItem(item) {
  return getMenuById(item.menuId) || item;
}

function getMenuImage(item) {
  const menu = getMenuForCartItem(item);
  return menu.image || SEASON_IMAGES[menu.category] || SEASON_IMAGES.spring;
}

function getRepresentativeSeason(cart) {
  if (cart.length === 0) return 'all';

  const scores = cart.reduce((acc, item) => {
    const menu = getMenuForCartItem(item);
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

function applyBasketSeason(cart) {
  const season = getRepresentativeSeason(cart);
  document.body.classList.remove(...SEASON_CLASSES);
  document.body.classList.add(`season-${season}`);
  document.body.dataset.season = season;
  return season;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

function renderBasket() {
  const cart = getCart();
  const hasItems = cart.length > 0;
  const itemCount = getItemCount(cart);
  const representativeSeason = applyBasketSeason(cart);
  const seasonLabel = SEASON_NAMES[representativeSeason];

  basketList.hidden = !hasItems;
  emptyState.hidden = hasItems;
  clearButton.disabled = !hasItems;
  orderButton.disabled = !hasItems;
  if (cartCount) cartCount.textContent = itemCount;
  summaryCount.textContent = itemCount;
  summaryTotal.textContent = formatPrice(getCartTotal());
  summaryNote.textContent = hasItems
    ? `${seasonLabel} 분위기로 장바구니를 정리했어요.`
    : '메뉴를 담으면 가장 많이 담긴 계절 분위기로 바뀌어요.';

  renderList(
    basketList,
    cart,
    (item) => {
      const menu = getMenuForCartItem(item);
      return `
        <article class="basket-item" data-cart-item-id="${escapeHtml(item.cartItemId || item.menuId)}" data-season="${escapeHtml(menu.category)}">
          <div class="item-image" style="--menu-image: url('${escapeHtml(getMenuImage(item))}')" aria-hidden="true"></div>
          <div>
            <p class="item-meta">${escapeHtml(getCategoryName(menu.category))} · ${escapeHtml(getMenuKindName(item.kind || getMenuKind(menu)))} · ${formatPrice(item.price)}</p>
            <h3 class="item-name">${escapeHtml(item.name)}</h3>            ${getMenuOptionsSummary(item.options) ? `<p class="item-option">${escapeHtml(getMenuOptionsSummary(item.options))}</p>` : ''}
            <p class="item-total">${formatPrice(item.price * item.quantity)}</p>
          </div>
          <div class="item-controls">
            <div class="quantity-control" aria-label="${escapeHtml(item.name)} 수량">
              <button type="button" data-step="-1" aria-label="수량 줄이기">-</button>
              <input
                type="number"
                min="1"
                max="99"
                value="${escapeHtml(item.quantity)}"
                inputmode="numeric"
                data-quantity-input="${escapeHtml(item.cartItemId || item.menuId)}"
                aria-label="수량"
              />
              <button type="button" data-step="1" aria-label="수량 늘리기">+</button>
            </div>
            <button class="remove-button" type="button" data-remove="${escapeHtml(item.cartItemId || item.menuId)}">삭제</button>
          </div>
        </article>
      `;
    }
  );
}

basketList.addEventListener('click', (event) => {
  const itemEl = event.target.closest('.basket-item');
  if (!itemEl) return;

  const removeButton = event.target.closest('button[data-remove]');
  if (removeButton) {
    removeFromCart(removeButton.dataset.remove);
    renderBasket();
    showToast('장바구니에서 삭제했어요');
    return;
  }

  const stepButton = event.target.closest('button[data-step]');
  if (!stepButton) return;

  const input = $('[data-quantity-input]', itemEl);
  const nextQuantity = normalizeQuantity(normalizeQuantity(input.value) + Number(stepButton.dataset.step));
  updateCartQuantity(itemEl.dataset.cartItemId, nextQuantity);
  renderBasket();
});

basketList.addEventListener('change', (event) => {
  const input = event.target.closest('[data-quantity-input]');
  if (!input) return;

  const quantity = normalizeQuantity(input.value);
  updateCartQuantity(input.dataset.quantityInput, quantity);
  renderBasket();
});

clearButton.addEventListener('click', () => {
  if (getCart().length === 0) return;
  clearCart();
  renderBasket();
  showToast('장바구니를 비웠어요');
});

orderButton.addEventListener('click', () => {
  const cart = getCart();
  if (cart.length === 0) return;

  const order = createOrder(cart);
  clearCart();
  renderBasket();
  showToast(`주문 ${order.id}을 접수했어요`);
  window.setTimeout(() => {
    window.location.href = `/orders/detail/?id=${encodeURIComponent(order.id)}`;
  }, 500);
});

renderBasket();