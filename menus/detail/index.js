renderCustomerNav();
const detailRoot = $('#detail-root');
const toast = $('#toast');
const menuId = getQueryParam('id');
const menu = getMenuById(menuId);

const CATEGORY_IMAGES = {
  spring: SEASON_IMAGES.spring,
  summer: SEASON_IMAGES.summer,
  autumn: SEASON_IMAGES.autumn,
  winter: SEASON_IMAGES.winter
};

function getMenuImage(item) {
  return item.image || CATEGORY_IMAGES[item.category] || SEASON_IMAGES.spring;
}

function normalizeQuantity(value) {
  const quantity = Number.parseInt(value, 10);
  if (Number.isNaN(quantity)) return 1;
  return Math.min(Math.max(quantity, 1), 99);
}

function showToast(message, season = document.body.dataset.season) {
  toast.dataset.season = season;
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

function renderNotFound() {
  detailRoot.innerHTML = `
    <div class="not-found">
      <h1>메뉴를 찾을 수 없어요</h1>
      <p>메뉴가 삭제되었거나 링크가 올바르지 않을 수 있어요.</p>
      <a href="/menus/list/">메뉴로 돌아가기</a>
    </div>
  `;
}

function renderDetail(item) {
  document.body.dataset.season = item.category;
  document.body.classList.add('season-' + item.category);
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
            <strong>수량</strong>
            <div class="quantity-control" aria-label="수량 조절">
              <button type="button" data-quantity-step="-1" aria-label="수량 줄이기">-</button>
              <input id="quantity-input" type="number" min="1" max="99" value="1" inputmode="numeric" />
              <button type="button" data-quantity-step="1" aria-label="수량 늘리기">+</button>
            </div>
          </div>
          <button class="primary-button" type="button" id="add-button">장바구니 담기</button>
          <a class="secondary-link" href="/menus/list/">메뉴 더 보기</a>
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
      showToast(`${item.name} ${quantity}개를 장바구니에 담았어요`, item.category);
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
