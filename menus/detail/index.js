const detailRoot = $('#detail-root');
const toast = $('#toast');
const menuId = getQueryParam('id');
const menu = getMenuById(menuId);

const TILE_COLORS = {
  coffee: ['#8b6b5b', '#4f3a32'],
  tea: ['#9cad8f', '#53664f'],
  ade: ['#e6bf6a', '#b8795c'],
  dessert: ['#d8a6a1', '#8b6b5b'],
  bakery: ['#e5c28e', '#b8795c']
};

function menuInitial(name) {
  return escapeHtml(name.slice(0, 1).toUpperCase());
}

function getTileStyle(item) {
  const colors = TILE_COLORS[item.category] || ['#8b6b5b', '#4f3a32'];
  return `--tile-start: ${colors[0]}; --tile-end: ${colors[1]};`;
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
      <div class="menu-visual" style="${getTileStyle(item)}" aria-label="${escapeHtml(item.name)} visual">
        ${menuInitial(item.name)}
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

