renderAdminNav();
const currentAdmin = requireAuth('admin');
if (!currentAdmin) throw new Error('관리자 로그인이 필요해요.');
const searchInput = $('#search-input');
const categoryFilter = $('#category-filter');
const menuList = $('#menu-list');
const emptyState = $('#empty-state');
const totalCount = $('#total-count');
const categoryCount = $('#category-count');
const resultCount = $('#result-count');

const state = {
  query: '',
  category: 'all'
};

function renderCategoryFilter() {
  categoryFilter.innerHTML = [
    '<option value="all">전체 계절</option>',
    ...CATEGORIES.map((category) => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.name)}</option>`)
  ].join('');
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

function renderStats(menus, filteredMenus) {
  totalCount.textContent = menus.length;
  categoryCount.textContent = new Set(menus.map((menu) => menu.category)).size;
  resultCount.textContent = `${filteredMenus.length}개 메뉴`;
}

function renderMenus() {
  const menus = getMenus();
  const filteredMenus = sortMenusBySeasonKindPrice(getFilteredMenus());

  renderStats(menus, filteredMenus);
  emptyState.hidden = filteredMenus.length > 0;
  menuList.hidden = filteredMenus.length === 0;

  renderList(
    menuList,
    filteredMenus,
    (menu) => `
      <article class="menu-row" data-season="${escapeHtml(menu.category)}">
        <div class="menu-thumb" style="--menu-image: url('${escapeHtml(menu.image || SEASON_IMAGES[menu.category] || SEASON_IMAGES.spring)}')" aria-hidden="true"></div>
        <div class="menu-info">
          <p class="menu-meta">${escapeHtml(getCategoryName(menu.category))}</p>
          <h3 class="menu-title">${escapeHtml(menu.name)}</h3>
          <p class="menu-description">${escapeHtml(menu.description)}</p>
        </div>
        <strong class="price">${formatPrice(menu.price)}</strong>
        <div class="row-actions">
          <a class="secondary-link" href="/admin/menus/detail/?id=${encodeURIComponent(menu.id)}">상세</a>
          <a class="secondary-link" href="/admin/menus/edit/?id=${encodeURIComponent(menu.id)}">수정</a>
          <button class="danger-button" type="button" data-delete-id="${escapeHtml(menu.id)}">삭제</button>
        </div>
      </article>
    `
  );
}

searchInput.addEventListener('input', (event) => {
  state.query = event.target.value;
  renderMenus();
});

categoryFilter.addEventListener('change', (event) => {
  state.category = event.target.value;
  renderMenus();
});

menuList.addEventListener('click', (event) => {
  const button = event.target.closest('[data-delete-id]');
  if (!button) return;

  const menu = getMenuById(button.dataset.deleteId);
  if (!menu) return;

  if (window.confirm(`${menu.name} 메뉴를 삭제할까요?`)) {
    deleteMenu(menu.id);
    renderMenus();
  }
});

renderCategoryFilter();
renderMenus();