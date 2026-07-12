const detailRoot = $('#detail-root');
const toast = $('#toast');
const menuId = getQueryParam('id');
const menu = getMenuById(menuId);

const MENU_IMAGES = {
  1: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=1200&q=80',
  2: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1200&q=80',
  3: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?auto=format&fit=crop&w=1200&q=80',
  4: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80',
  5: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=1200&q=80',
  6: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=1200&q=80',
  7: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=1200&q=80',
  8: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=1200&q=80',
  9: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=1200&q=80',
  10: 'https://marketlanemadras.com/cdn/shop/products/IMG_1907_85791865-8441-4fb0-abc1-5d747e6da6f7_1200x1200.jpg?v=1594190467',
  11: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80',
  12: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=1200&q=80'
};

const CATEGORY_IMAGES = {
  coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
  tea: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=80',
  ade: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=1200&q=80',
  dessert: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1200&q=80',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80'
};

function getMenuImage(item) {
  return item.image || MENU_IMAGES[item.id] || CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.coffee;
}

function normalizeQuantity(value) {
  const quantity = Number.parseInt(value, 10);
  if (Number.isNaN(quantity)) return 1;
  return Math.min(Math.max(quantity, 1), 99);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

function renderNotFound() {
  detailRoot.innerHTML = `
    <div class="not-found">
      <h1>Menu not found</h1>
      <p>The menu may have been removed or the link is incorrect.</p>
      <a href="../list/index.html">Go to menu</a>
    </div>
  `;
}

function renderDetail(item) {
  document.title = `${item.name} | Minicafe Menu`;
  detailRoot.innerHTML = `
    <article class="detail-layout">
      <div
        class="menu-visual"
        style="--menu-image: url('${escapeHtml(getMenuImage(item))}')"
        aria-label="${escapeHtml(item.name)} image"
      >
        <span>${escapeHtml(getCategoryName(item.category))}</span>
      </div>
      <div class="detail-panel">
        <span class="category-pill">${escapeHtml(getCategoryName(item.category))}</span>
        <div>
          <h1 class="detail-title">${escapeHtml(item.name)}</h1>
          <p class="detail-description">${escapeHtml(item.description)}</p>
        </div>
        <div class="detail-price">${formatPrice(item.price)}</div>
        <div class="purchase-box">
          <div class="quantity-row">
            <strong>Quantity</strong>
            <div class="quantity-control" aria-label="Quantity control">
              <button type="button" data-quantity-step="-1" aria-label="Decrease quantity">-</button>
              <input id="quantity-input" type="number" min="1" max="99" value="1" inputmode="numeric" />
              <button type="button" data-quantity-step="1" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button class="primary-button" type="button" id="add-button">Add to basket</button>
          <a class="secondary-link" href="../list/index.html">Keep browsing</a>
        </div>
      </div>
    </article>
  `;

  const quantityInput = $('#quantity-input');

  detailRoot.addEventListener('click', (event) => {
    const stepButton = event.target.closest('button[data-quantity-step]');
    if (stepButton) {
      quantityInput.value = normalizeQuantity(
        normalizeQuantity(quantityInput.value) + Number(stepButton.dataset.quantityStep)
      );
      return;
    }

    if (event.target.closest('#add-button')) {
      const quantity = normalizeQuantity(quantityInput.value);
      quantityInput.value = quantity;
      addToCart(item.id, quantity);
      showToast(`${item.name} ${quantity} added to basket`);
    }
  });

  quantityInput.addEventListener('change', () => {
    quantityInput.value = normalizeQuantity(quantityInput.value);
  });
}

if (!menu) {
  renderNotFound();
} else {
  renderDetail(menu);
}

