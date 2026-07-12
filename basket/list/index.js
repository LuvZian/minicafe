const basketList = $('#basket-list');
const emptyState = $('#empty-state');
const summaryCount = $('#summary-count');
const summaryTotal = $('#summary-total');
const summaryNote = $('#summary-note');
const clearButton = $('#clear-button');
const orderButton = $('#order-button');
const cartCount = $('#cart-count');
const toast = $('#toast');

const MENU_IMAGES = {
  1: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=700&q=80',
  2: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=700&q=80',
  3: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?auto=format&fit=crop&w=700&q=80',
  4: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80',
  5: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=700&q=80',
  6: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=700&q=80',
  7: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=700&q=80',
  8: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=700&q=80',
  9: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=700&q=80',
  10: 'https://marketlanemadras.com/cdn/shop/products/IMG_1907_85791865-8441-4fb0-abc1-5d747e6da6f7_900x900.jpg?v=1594190467',
  11: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=700&q=80',
  12: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=700&q=80'
};

const CATEGORY_IMAGES = {
  coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=700&q=80',
  tea: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=700&q=80',
  ade: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=700&q=80',
  dessert: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=700&q=80',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=700&q=80'
};

function normalizeQuantity(value) {
  const quantity = Number.parseInt(value, 10);
  if (Number.isNaN(quantity)) return 1;
  return Math.min(Math.max(quantity, 1), 99);
}

function getItemCount(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getMenuImage(item) {
  const menu = getMenuById(item.menuId);
  return (menu && menu.image) || MENU_IMAGES[item.menuId] || CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.coffee;
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

  basketList.hidden = !hasItems;
  emptyState.hidden = hasItems;
  clearButton.disabled = !hasItems;
  orderButton.disabled = !hasItems;
  cartCount.textContent = itemCount;
  summaryCount.textContent = itemCount;
  summaryTotal.textContent = formatPrice(getCartTotal());
  summaryNote.textContent = hasItems ? 'You can still adjust quantities.' : 'Add a menu item to start your basket.';

  renderList(
    basketList,
    cart,
    (item) => `
      <article class="basket-item" data-menu-id="${escapeHtml(item.menuId)}">
        <div class="item-image" style="--menu-image: url('${escapeHtml(getMenuImage(item))}')" aria-hidden="true"></div>
        <div>
          <p class="item-meta">${escapeHtml(getCategoryName(item.category))} · ${formatPrice(item.price)}</p>
          <h3 class="item-name">${escapeHtml(item.name)}</h3>
          <p class="item-total">${formatPrice(item.price * item.quantity)}</p>
        </div>
        <div class="item-controls">
          <div class="quantity-control" aria-label="${escapeHtml(item.name)} quantity">
            <button type="button" data-step="-1" aria-label="Decrease quantity">-</button>
            <input
              type="number"
              min="1"
              max="99"
              value="${escapeHtml(item.quantity)}"
              inputmode="numeric"
              data-quantity-input="${escapeHtml(item.menuId)}"
              aria-label="Quantity"
            />
            <button type="button" data-step="1" aria-label="Increase quantity">+</button>
          </div>
          <button class="remove-button" type="button" data-remove="${escapeHtml(item.menuId)}">Remove</button>
        </div>
      </article>
    `
  );
}

basketList.addEventListener('click', (event) => {
  const itemEl = event.target.closest('.basket-item');
  if (!itemEl) return;

  const removeButton = event.target.closest('button[data-remove]');
  if (removeButton) {
    removeFromCart(removeButton.dataset.remove);
    renderBasket();
    showToast('Item removed from basket');
    return;
  }

  const stepButton = event.target.closest('button[data-step]');
  if (!stepButton) return;

  const input = $('[data-quantity-input]', itemEl);
  const nextQuantity = normalizeQuantity(normalizeQuantity(input.value) + Number(stepButton.dataset.step));
  updateCartQuantity(itemEl.dataset.menuId, nextQuantity);
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
  showToast('Basket cleared');
});

orderButton.addEventListener('click', () => {
  const cart = getCart();
  if (cart.length === 0) return;

  const order = createOrder(cart);
  clearCart();
  renderBasket();
  showToast(`Order ${order.id} placed`);
  window.setTimeout(() => {
    window.location.href = `../../orders/detail/index.html?id=${encodeURIComponent(order.id)}`;
  }, 500);
});

renderBasket();
