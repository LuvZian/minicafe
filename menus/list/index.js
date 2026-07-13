renderCustomerNav();
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
const state = {
  category: 'all',
  query: '',
  themeSeason: getRandomSeason()
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
            <a class="detail-link" href="/menus/detail/?id=${encodeURIComponent(menu.id)}">Detail</a>
            <button class="cart-button" type="button" data-add-to-cart="${escapeHtml(menu.id)}">Add</button>
          </div>
        </div>
      </article>
    `
  );
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
  const button = event.target.closest('button[data-add-to-cart]');
  if (!button) return;

  const menu = getMenuById(button.dataset.addToCart);
  if (!menu) return;

  addToCart(menu.id, 1);
  updateCartCount();
  showToast(`${menu.name} 장바구니에 담았어요`, menu.category);
});

applySeasonTheme();
renderCategoryTabs();
renderMenus();
updateCartCount();