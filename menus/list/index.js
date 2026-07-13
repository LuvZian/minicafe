renderCustomerNav();
const state = {
  category: 'all',
  query: ''
};

const menuGrid = $('#menu-grid');
const emptyState = $('#empty-state');
const resultCount = $('#result-count');
const categoryTabs = $('#category-tabs');
const searchInput = $('#search-input');
const cartCount = $('#cart-count');
const toast = $('#toast');

const MENU_IMAGES = {
  1: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=900&q=80',
  2: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=900&q=80',
  3: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?auto=format&fit=crop&w=900&q=80',
  4: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80',
  5: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?auto=format&fit=crop&w=900&q=80',
  6: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=900&q=80',
  7: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=900&q=80',
  8: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=900&q=80',
  9: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=900&q=80',
  10: 'https://marketlanemadras.com/cdn/shop/products/IMG_1907_85791865-8441-4fb0-abc1-5d747e6da6f7_900x900.jpg?v=1594190467',
  11: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=80',
  12: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=900&q=80'
};

const CATEGORY_IMAGES = {
  coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
  tea: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80',
  ade: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=900&q=80',
  dessert: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
  bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80'
};

function updateCartCount() {
  if (cartCount) cartCount.textContent = getCart().reduce((sum, item) => sum + item.quantity, 0);
}

function getMenuImage(menu) {
  return menu.image || MENU_IMAGES[menu.id] || CATEGORY_IMAGES[menu.category] || CATEGORY_IMAGES.coffee;
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
  const tabs = [{ id: 'all', name: 'All' }, ...CATEGORIES];

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
  const menus = getFilteredMenus();
  resultCount.textContent = `${menus.length} menus`;
  emptyState.hidden = menus.length > 0;
  menuGrid.hidden = menus.length === 0;

  renderList(
    menuGrid,
    menus,
    (menu) => `
      <article class="menu-card">
        <a
          class="menu-visual"
          style="--menu-image: url('${escapeHtml(getMenuImage(menu))}')"
          href="/menus/detail/?id=${encodeURIComponent(menu.id)}"
          aria-label="${escapeHtml(menu.name)} detail"
        >
          <span>${escapeHtml(getCategoryName(menu.category))}</span>
        </a>
        <div class="menu-body">
          <div class="menu-meta">
            <span>${escapeHtml(getCategoryName(menu.category))}</span>
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

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

categoryTabs.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-category]');
  if (!button) return;

  state.category = button.dataset.category;
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
  showToast(`${menu.name} added to basket`);
});

renderCategoryTabs();
renderMenus();
updateCartCount();

