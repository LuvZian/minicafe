renderCustomerNav();
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
const state = {
  category: 'all',
  query: '',
  themeSeason: getRandomSeason(),
  activeMenu: null
};

const menuGrid = $('#menu-grid');
const emptyState = $('#empty-state');
const resultCount = $('#result-count');
const categoryTabs = $('#category-tabs');
const searchInput = $('#search-input');
const cartCount = $('#cart-count');
const toast = $('#toast');
const pageBody = document.body;

const SEASON_THEME_CLASS = ['season-spring', 'season-summer', 'season-autumn', 'season-winter'];

const CATEGORY_IMAGES = {
  spring: SEASON_IMAGES.spring,
  summer: SEASON_IMAGES.summer,
  autumn: SEASON_IMAGES.autumn,
  winter: SEASON_IMAGES.winter
};

const CATEGORY_COPY = {
  all: {
    kicker: 'Seasonal menu',
    title: '계절별 음료, 디저트, 굿즈를 한눈에',
    copy: '전체 메뉴를 둘러보면서 오늘 어울리는 계절의 분위기를 느껴보세요.'
  },
  spring: {
    kicker: 'Spring',
    title: '봄의 분홍빛 차와 작은 선물',
    copy: '꽃향이 은은한 음료와 부드러운 디저트, 봄빛 굿즈를 모았어요.'
  },
  summer: {
    kicker: 'Summer',
    title: '초록 그늘 아래 시원한 계절 메뉴',
    copy: '맑은 차, 차가운 디저트, 바람이 느껴지는 여름 굿즈를 만나보세요.'
  },
  autumn: {
    kicker: 'Autumn',
    title: '붉은 잎과 구운 차의 따뜻함',
    copy: '로스티한 음료와 밤, 단풍빛 디저트, 차분한 가을 굿즈를 준비했어요.'
  },
  winter: {
    kicker: 'Winter',
    title: '하얀 겨울에 어울리는 따뜻한 한 잔',
    copy: '김이 오르는 차와 눈처럼 부드러운 디저트, 조용한 겨울 굿즈를 골라보세요.'
  }
};

function getRandomSeason() {
  return SEASONS[Math.floor(Math.random() * SEASONS.length)];
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

function updateCartCount() {
  if (cartCount) cartCount.textContent = getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function getMenuImage(menu) {
  return menu.image || CATEGORY_IMAGES[menu.category] || SEASON_IMAGES.spring;
}

function applySeasonTheme() {
  const themeSeason = state.category === 'all' ? state.themeSeason : state.category;
  pageBody.classList.remove(...SEASON_THEME_CLASS);
  pageBody.classList.add(`season-${themeSeason}`);
  pageBody.dataset.season = themeSeason;

  const copy = CATEGORY_COPY[state.category] || CATEGORY_COPY.all;
  document.documentElement.style.setProperty('--menu-hero-image', `url('${CATEGORY_IMAGES[themeSeason]}')`);

  const hero = $('.menu-hero');
  if (!hero) return;
  const eyebrow = $('.eyebrow', hero);
  const title = $('#page-title');
  const heroCopy = $('.hero-copy', hero);
  if (eyebrow) eyebrow.textContent = copy.kicker;
  if (title) title.textContent = copy.title;
  if (heroCopy) heroCopy.textContent = copy.copy;
}

function getFilteredMenus() {
  const query = state.query.trim().toLowerCase();

  return getMenus().filter((menu) => {
    const categoryMatches = state.category === 'all' || menu.category === state.category;
    const queryMatches =
      !query ||
      menu.name.toLowerCase().includes(query) ||
      menu.description.toLowerCase().includes(query) ||
      getCategoryName(menu.category).toLowerCase().includes(query);

    return categoryMatches && queryMatches;
  });
}

function renderCategoryTabs() {
  const tabs = [{ id: 'all', name: '전체' }, ...CATEGORIES];

  categoryTabs.innerHTML = tabs
    .map(
      (category) => `
        <button
          type="button"
          class="${state.category === category.id ? 'is-active' : ''}"
          data-category="${escapeHtml(category.id)}"
          aria-selected="${state.category === category.id}"
        >
          ${escapeHtml(category.name)}
        </button>
      `
    )
    .join('');
}

function renderMenus() {
  const menus = sortMenusBySeasonKindPrice(getFilteredMenus());
  resultCount.textContent = `${menus.length} menus`;
  emptyState.hidden = menus.length > 0;
  menuGrid.hidden = menus.length === 0;

  renderList(
    menuGrid,
    menus,
    (menu) => `
      <article class="menu-card" data-season="${escapeHtml(menu.category)}">
        <a
          class="menu-visual"
          style="--menu-image: url('${escapeHtml(getMenuImage(menu))}')"
          href="/menus/detail/?id=${encodeURIComponent(menu.id)}"
          aria-label="${escapeHtml(menu.name)} detail"
        >
          <span>${escapeHtml(getCategoryName(menu.category))}</span>
        </a>
        <div class="menu-body">
          <div class="menu-meta price-only">
            <strong>${formatPrice(menu.price)}</strong>
          </div>
          <h2 class="menu-title">${escapeHtml(menu.name)}</h2>
          <p class="menu-description">${escapeHtml(menu.description)}</p>
          <div class="menu-actions">
            <a class="detail-link" href="/menus/detail/?id=${encodeURIComponent(menu.id)}">상세</a>
            <button class="cart-button" type="button" data-open-options="${escapeHtml(menu.id)}">옵션 선택</button>
          </div>
        </div>
      </article>
    `
  );
}

function renderDrinkTemperatureOptions(menu) {
  const { temperatureMode } = getMenuOptionConfig(menu);
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

function renderOptionFields(menu) {
  const kind = getMenuKind(menu);
  if (kind === 'drink') {
    return `
      <fieldset class="option-group">
        <legend>온도</legend>
        ${renderDrinkTemperatureOptions(menu)}
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

function getSelectedOptions(menu, parent) {
  const kind = getMenuKind(menu);
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

function ensureOptionOverlay() {
  let overlay = $('#menu-option-overlay');
  if (overlay) return overlay;

  document.body.insertAdjacentHTML('beforeend', '<div class="option-overlay menu-list-option-overlay" id="menu-option-overlay" hidden></div>');
  return $('#menu-option-overlay');
}

function openOptionOverlay(menu) {
  const overlay = ensureOptionOverlay();
  state.activeMenu = menu;
  overlay.dataset.season = menu.category;
  overlay.innerHTML = `
    <section class="option-modal" role="dialog" aria-modal="true" aria-labelledby="option-title">
      <div class="option-head">
        <p>${escapeHtml(getMenuKindName(menu.kind || getMenuKind(menu)))} 옵션</p>
        <button type="button" class="option-close" data-close-options aria-label="옵션 닫기">×</button>
      </div>
      <h2 id="option-title">${escapeHtml(menu.name)}</h2>
      <div class="option-preview" style="--option-image: url('${escapeHtml(getMenuImage(menu))}')">
        <div class="option-preview-image" aria-hidden="true"></div>
        <div class="option-preview-copy">
          <span>${escapeHtml(getCategoryName(menu.category))} · ${escapeHtml(getMenuKindName(menu.kind || getMenuKind(menu)))}</span>
          <strong>${formatPrice(menu.price)}</strong>
        </div>
      </div>
      <label class="option-number quantity-in-modal">
        <span>수량</span>
        <div class="quantity-control" aria-label="수량 조절">
          <button type="button" data-quantity-step="-1" aria-label="수량 줄이기">-</button>
          <input id="option-quantity-input" type="number" min="1" max="99" value="1" inputmode="numeric" />
          <button type="button" data-quantity-step="1" aria-label="수량 늘리기">+</button>
        </div>
      </label>
      <div class="option-fields">
        ${renderOptionFields(menu)}
      </div>
      <div class="option-actions">
        <button type="button" class="secondary-link" data-close-options>취소</button>
        <button type="button" class="primary-button" data-confirm-options>장바구니 담기</button>
      </div>
    </section>
  `;
  overlay.hidden = false;
}

function closeOptionOverlay() {
  const overlay = $('#menu-option-overlay');
  if (overlay) {
    overlay.hidden = true;
    delete overlay.dataset.season;
  }
  state.activeMenu = null;
}

function showToast(message, season = state.themeSeason) {
  toast.dataset.season = season;
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

categoryTabs.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-category]');
  if (!button) return;

  state.category = button.dataset.category;
  if (state.category === 'all') state.themeSeason = getRandomSeason();
  applySeasonTheme();
  renderCategoryTabs();
  renderMenus();
});

searchInput.addEventListener('input', (event) => {
  state.query = event.target.value;
  renderMenus();
});

menuGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-open-options]');
  if (!button) return;

  const menu = getMenuById(button.dataset.openOptions);
  if (!menu) return;
  openOptionOverlay(menu);
});

document.addEventListener('click', (event) => {
  const overlay = $('#menu-option-overlay');
  if (!overlay || overlay.hidden) return;

  const stepButton = event.target.closest('button[data-quantity-step]');
  if (stepButton) {
    const input = $('#option-quantity-input', overlay);
    input.value = normalizeQuantity(normalizeQuantity(input.value) + Number(stepButton.dataset.quantityStep));
    return;
  }

  const forkButton = event.target.closest('button[data-fork-step]');
  if (forkButton) {
    const input = $('#fork-count', overlay);
    if (input) {
      input.value = normalizeForkCount(normalizeForkCount(input.value) + Number(forkButton.dataset.forkStep));
    }
    return;
  }

  if (event.target.closest('[data-close-options]') || event.target === overlay) {
    closeOptionOverlay();
    return;
  }

  if (event.target.closest('[data-confirm-options]') && state.activeMenu) {
    if (!canAddToCart()) {
      redirectToSignupForCart();
      return;
    }

    const input = $('#option-quantity-input', overlay);
    const quantity = normalizeQuantity(input.value);
    const options = normalizeMenuOptions(state.activeMenu, getSelectedOptions(state.activeMenu, overlay));
    addToCart(state.activeMenu.id, quantity, options);
    showToast(`${state.activeMenu.name} ${quantity}개를 장바구니에 담았어요`, state.activeMenu.category);
    updateCartCount();
    renderCustomerNav();
    closeOptionOverlay();
  }
});

document.addEventListener('change', (event) => {
  if (event.target.matches('#option-quantity-input')) {
    event.target.value = normalizeQuantity(event.target.value);
  }
  if (event.target.matches('#fork-count')) {
    event.target.value = normalizeForkCount(event.target.value);
  }
});

applySeasonTheme();
renderCategoryTabs();
renderMenus();
updateCartCount();