const form = $('#menu-form');
const categorySelect = $('#category');
const formError = $('#form-error');

function renderCategories() {
  categorySelect.innerHTML = CATEGORIES.map(
    (category) => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.name)}</option>`
  ).join('');
}

function getFormValue() {
  return {
    name: $('#name').value,
    category: $('#category').value,
    price: $('#price').value,
    image: $('#image').value,
    description: $('#description').value
  };
}

function validateMenu(menu) {
  if (!menu.name.trim()) return 'Name is required.';
  if (!menu.category) return 'Category is required.';
  if (!Number(menu.price) || Number(menu.price) <= 0) return 'Price must be higher than 0.';
  if (!menu.description.trim()) return 'Description is required.';
  return '';
}

function showError(message) {
  formError.textContent = message;
  formError.hidden = !message;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const menu = getFormValue();
  const error = validateMenu(menu);
  if (error) {
    showError(error);
    return;
  }

  const created = createMenu(menu);
  window.location.href = `./detail.html?id=${encodeURIComponent(created.id)}`;
});

renderCategories();

