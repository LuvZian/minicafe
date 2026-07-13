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

function normalizeForkCount(value) {
  const count = Number.parseInt(value, 10);
  if (Number.isNaN(count)) return 1;
  return Math.min(Math.max(count, 0), 20);
}

function redirectToSignupForCart() {
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/auth/signup/?next=${next}`;
}

function canAddToCart() {
  const user = getCurrentUser();
  return user && user.role === 'customer';
}

function showToast(message, season = document.body.dataset.season) {
  toast.dataset.season = season;
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

function renderDrinkTemperatureOptions(item) {
  const { temperatureMode } = getMenuOptionConfig(item);
  if (temperatureMode === 'hotOnly') {
    return '<p class="option-fixed">이 메뉴는 따뜻한 음료로만 준비돼요.</p><input type="hidden" name="temperature" value="hot" />';
  }
  if (temperatureMode === 'iceOnly') {
    return '<p class="option-fixed">이 메뉴는 차가운 음료로만 준비돼요.</p><input type="hidden" name="temperature" value="ice" />';
  }
  return `
    <label><input type="radio" name="temperature" value="hot" /> Hot</label>
    <label><input type="radio" name="temperature" value="ice" checked /> Ice</label>
  `;
}

function renderOptionFields(item) {
  const kind = getMenuKind(item);
  if (kind === 'drink') {
    return `
      <fieldset class="option-group">
        <legend>온도</legend>
        ${renderDrinkTemperatureOptions(item)}
      </fieldset>
      <fieldset class="option-group">
        <legend>이용 방식</legend>
        <label><input type="radio" name="serviceType" value="dineIn" checked /> 매장</label>
        <label><input type="radio" name="serviceType" value="takeout" /> 포장</label>
      </fieldset>
    `;
  }

  if (kind === 'dessert') {
    return `
      <fieldset class="option-group">
        <legend>이용 방식</legend>
        <label><input type="radio" name="serviceType" value="dineIn" checked /> 매장</label>
        <label><input type="radio" name="serviceType" value="takeout" /> 포장</label>
      </fieldset>
      <label class="option-number fork-number">
        <span>포크 개수</span>
        <div class="quantity-control fork-control" aria-label="포크 개수 조절">
          <button type="button" data-fork-step="-1" aria-label="포크 개수 줄이기">-</button>
          <input id="fork-count" type="number" min="0" max="20" value="1" inputmode="numeric" />
          <button type="button" data-fork-step="1" aria-label="포크 개수 늘리기">+</button>
        </div>
      </label>
    `;
  }

  if (kind === 'goods') {
    return `
      <fieldset class="option-group">
        <legend>포장 선택</legend>
        <label><input type="radio" name="giftWrap" value="wrapped" /> 선물 포장</label>
        <label><input type="radio" name="giftWrap" value="unwrapped" checked /> 미포장</label>
      </fieldset>
    `;
  }

  return '<p class="option-help">선택 옵션이 없는 메뉴예요.</p>';
}

function getSelectedOptions(item, parent = detailRoot) {
  const kind = getMenuKind(item);
  if (kind === 'drink') {
    return {
      temperature: $('[name="temperature"]:checked', parent)?.value || $('[name="temperature"]', parent)?.value || 'ice',
      serviceType: $('[name="serviceType"]:checked', parent)?.value || 'dineIn'
    };
  }
  if (kind === 'dessert') {
    return {
      serviceType: $('[name="serviceType"]:checked', parent)?.value || 'dineIn',
      forkCount: $('#fork-count', parent)?.value || 1
    };
  }
  if (kind === 'goods') {
    return {
      giftWrap: $('[name="giftWrap"]:checked', parent)?.value || 'unwrapped'
    };
  }
  return {};
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
        <div class="customer-menu-meta">
          <span class="category-pill">${escapeHtml(getCategoryName(item.category))}</span>
          <span class="kind-pill">${escapeHtml(getMenuKindName(item.kind || getMenuKind(item)))}</span>
        </div>
        <div>
          <h1 class="detail-title">${escapeHtml(item.name)}</h1>
          <p class="detail-description">${escapeHtml(item.description)}</p>
        </div>
        <div class="detail-price">${formatPrice(item.price)}</div>
        <div class="purchase-box">
          <button class="primary-button" type="button" id="open-options-button">옵션 선택하고 담기</button>
          <a class="secondary-link" href="/menus/list/">메뉴 더 보기</a>
        </div>
      </div>
    </article>

    <div class="option-overlay" id="option-overlay" data-season="${escapeHtml(item.category)}" hidden>
      <section class="option-modal" role="dialog" aria-modal="true" aria-labelledby="option-title">
        <div class="option-head">
          <p>${escapeHtml(getMenuKindName(item.kind || getMenuKind(item)))} 옵션</p>
          <button type="button" class="option-close" data-close-options aria-label="옵션 닫기">×</button>
        </div>
        <h2 id="option-title">${escapeHtml(item.name)}</h2>
        <div class="option-preview" style="--option-image: url('${escapeHtml(getMenuImage(item))}')">
          <div class="option-preview-image" aria-hidden="true"></div>
          <div class="option-preview-copy">
            <span>${escapeHtml(getCategoryName(item.category))} · ${escapeHtml(getMenuKindName(item.kind || getMenuKind(item)))}</span>
            <strong>${formatPrice(item.price)}</strong>
          </div>
        </div>
        <label class="option-number quantity-in-modal">
          <span>수량</span>
          <div class="quantity-control" aria-label="수량 조절">
            <button type="button" data-quantity-step="-1" aria-label="수량 줄이기">-</button>
            <input id="quantity-input" type="number" min="1" max="99" value="1" inputmode="numeric" />
            <button type="button" data-quantity-step="1" aria-label="수량 늘리기">+</button>
          </div>
        </label>
        <div class="option-fields">
          ${renderOptionFields(item)}
        </div>
        <div class="option-actions">
          <button type="button" class="secondary-link" data-close-options>취소</button>
          <button type="button" class="primary-button" id="confirm-add-button">장바구니 담기</button>
        </div>
      </section>
    </div>
  `;

  const quantityInput = $('#quantity-input');
  const optionOverlay = $('#option-overlay');

  detailRoot.addEventListener('click', (event) => {
    const stepButton = event.target.closest('button[data-quantity-step]');
    if (stepButton) {
      quantityInput.value = normalizeQuantity(
        normalizeQuantity(quantityInput.value) + Number(stepButton.dataset.quantityStep)
      );
      return;
    }

    const forkButton = event.target.closest('button[data-fork-step]');
    if (forkButton) {
      const forkInput = $('#fork-count', optionOverlay);
      if (forkInput) {
        forkInput.value = normalizeForkCount(
          normalizeForkCount(forkInput.value) + Number(forkButton.dataset.forkStep)
        );
      }
      return;
    }

    if (event.target.closest('#open-options-button')) {
      quantityInput.value = 1;
      optionOverlay.hidden = false;
      return;
    }

    if (event.target.closest('[data-close-options]') || event.target === optionOverlay) {
      optionOverlay.hidden = true;
      return;
    }

    if (event.target.closest('#confirm-add-button')) {
      if (!canAddToCart()) {
        redirectToSignupForCart();
        return;
      }

      const quantity = normalizeQuantity(quantityInput.value);
      const options = normalizeMenuOptions(item, getSelectedOptions(item, optionOverlay));
      quantityInput.value = quantity;
      addToCart(item.id, quantity, options);
      optionOverlay.hidden = true;
      showToast(`${item.name} ${quantity}개를 장바구니에 담았어요`, item.category);
      renderCustomerNav();
    }
  });

  quantityInput.addEventListener('change', () => {
    quantityInput.value = normalizeQuantity(quantityInput.value);
  });

  optionOverlay.addEventListener('change', (event) => {
    if (event.target.matches('#fork-count')) {
      event.target.value = normalizeForkCount(event.target.value);
    }
  });
}

if (!menu) {
  renderNotFound();
} else {
  renderDetail(menu);
}