const cartCount = $('#cart-count');
const todayVisual = $('#today-visual');
const todayName = $('#today-name');
const todayDescription = $('#today-description');
const todayPrice = $('#today-price');
const todayLink = $('#today-link');
const basketTitle = $('#basket-title');
const basketCopy = $('#basket-copy');
const ordersTitle = $('#orders-title');
const ordersCopy = $('#orders-copy');
const featuredGrid = $('#featured-grid');

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

function getItemCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function getMenuImage(menu) {
  return menu.image || MENU_IMAGES[menu.id] || CATEGORY_IMAGES[menu.category] || CATEGORY_IMAGES.coffee;
}

function getTodayPick(menus) {
  if (menus.length === 0) return null;
  const index = new Date().getDate() % menus.length;
  return menus[index];
}

function renderTodayPick(menu) {
  if (!menu) return;

  todayVisual.style.setProperty('--menu-image', `url('${getMenuImage(menu)}')`);
  todayName.textContent = menu.name;
  todayDescription.textContent = menu.description;
  todayPrice.textContent = formatPrice(menu.price);
  todayLink.href = `./menus/detail/index.html?id=${encodeURIComponent(menu.id)}`;
}

function renderSummary() {
  const cart = getCart();
  const orders = getOrders();
  const itemCount = getItemCount(cart);
  const recentOrder = orders[0];

  cartCount.textContent = itemCount;
  basketTitle.textContent = itemCount > 0 ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'} waiting` : 'Your basket is empty';
  basketCopy.textContent = itemCount > 0 ? `${formatPrice(getCartTotal())} ready in your basket.` : 'Pick something warm or sweet to begin.';

  ordersTitle.textContent = recentOrder ? `Recent order ${recentOrder.id.slice(-6).toUpperCase()}` : 'No orders yet';
  ordersCopy.textContent = recentOrder
    ? `${getStatusLabel(recentOrder.status)} · ${formatDate(recentOrder.createdAt)}`
    : 'Your recent cafe moments will stay here.';
}

function renderFeatured(menus) {
  const featured = menus.slice(0, 4);
  renderList(
    featuredGrid,
    featured,
    (menu) => `
      <article class="featured-card">
        <div class="featured-visual" style="--menu-image: url('${escapeHtml(getMenuImage(menu))}')" aria-hidden="true"></div>
        <div class="featured-body">
          <p class="menu-meta">${escapeHtml(getCategoryName(menu.category))}</p>
          <h3>${escapeHtml(menu.name)}</h3>
          <p>${escapeHtml(menu.description)}</p>
          <div class="featured-footer">
            <strong>${formatPrice(menu.price)}</strong>
            <a class="detail-link" href="./menus/detail/index.html?id=${encodeURIComponent(menu.id)}">Detail</a>
          </div>
        </div>
      </article>
    `
  );
}

const menus = getMenus();
renderTodayPick(getTodayPick(menus));
renderSummary();
renderFeatured(menus);
