const PROFILE_STORAGE_KEY = 'minicafe_profile';

const cartCount = $('#cart-count');
const profileForm = $('#profile-form');
const profileName = $('#profile-name');
const profileMessage = $('#profile-message');
const basketStat = $('#basket-stat');
const basketCopy = $('#basket-copy');
const ordersStat = $('#orders-stat');
const ordersCopy = $('#orders-copy');
const favoriteStat = $('#favorite-stat');
const favoriteCopy = $('#favorite-copy');
const recentTitle = $('#recent-title');
const recentCopy = $('#recent-copy');
const recentLink = $('#recent-link');

function getProfile() {
  return readStorage(PROFILE_STORAGE_KEY, { name: '' });
}

function saveProfile(profile) {
  writeStorage(PROFILE_STORAGE_KEY, profile);
}

function getItemCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function getFavoriteCategory(orders) {
  const categoryCount = orders.reduce((result, order) => {
    order.items.forEach((item) => {
      result[item.category] = (result[item.category] || 0) + item.quantity;
    });
    return result;
  }, {});

  const [category] = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0] || [];
  return category || null;
}

function renderProfile() {
  const profile = getProfile();
  profileName.value = profile.name || '';
}

function renderActivity() {
  const cart = getCart();
  const orders = getOrders();
  const itemCount = getItemCount(cart);
  const favoriteCategory = getFavoriteCategory(orders);
  const recentOrder = orders[0];

  cartCount.textContent = itemCount;
  basketStat.textContent = itemCount;
  basketCopy.textContent = itemCount > 0 ? `${formatPrice(getCartTotal())} waiting in your basket.` : 'No items waiting.';

  ordersStat.textContent = orders.length;
  ordersCopy.textContent = orders.length > 0 ? `${formatPrice(orders.reduce((sum, order) => sum + order.total, 0))} ordered so far.` : 'No orders yet.';

  favoriteStat.textContent = favoriteCategory ? getCategoryName(favoriteCategory) : '-';
  favoriteCopy.textContent = favoriteCategory ? 'Based on your order history.' : 'Order history will shape this.';

  if (recentOrder) {
    recentTitle.textContent = `Order ${recentOrder.id.slice(-6).toUpperCase()}`;
    recentCopy.textContent = `${getStatusLabel(recentOrder.status)} · ${formatDate(recentOrder.createdAt)}`;
    recentLink.href = `/orders/detail/?id=${encodeURIComponent(recentOrder.id)}`;
    recentLink.textContent = 'View detail';
  }
}

profileForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = profileName.value.trim();
  saveProfile({ name });
  profileMessage.textContent = name ? `Saved as ${name}.` : 'Saved as Minicafe guest.';
  window.clearTimeout(profileMessage.timer);
  profileMessage.timer = window.setTimeout(() => {
    profileMessage.textContent = '';
  }, 1800);
});

renderProfile();
renderActivity();
