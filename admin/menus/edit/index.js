const editRoot = $('#edit-root');
const menuId = getQueryParam('id');
const menu = getMenuById(menuId);

function categoryOptions(selectedCategory) {
  return CATEGORIES.map(
    (category) => `
      <option value="${escapeHtml(category.id)}" ${category.id === selectedCategory ? 'selected' : ''}>
        ${escapeHtml(category.name)}
      </option>
    `
  ).join('');
}

function renderNotFound() {
  editRoot.innerHTML = `
    <div class="form-shell not-found-shell">
      <div class="form-intro">
        <p class="eyebrow">Edit</p>
        <h1>Menu not found</h1>
        <p>The menu may have been removed or the link is incorrect.</p>
      </div>
      <div class="form-actions">
        <a class="secondary-link" href="../list/index.html">Go to list</a>
      </div>
    </div>
  `;
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

function validateMenu(nextMenu) {
  if (!nextMenu.name.trim()) return 'Name is required.';
  if (!nextMenu.category) return 'Category is required.';
  if (!Number(nextMenu.price) || Number(nextMenu.price) <= 0) return 'Price must be higher than 0.';
  if (!nextMenu.description.trim()) return 'Description is required.';
  return '';
}

function showError(message) {
  const formError = $('#form-error');
  formError.textContent = message;
  formError.hidden = !message;
}

function renderForm(item) {
  document.title = `Edit ${item.name} | Minicafe`;
  editRoot.innerHTML = `
    <section class="form-shell" aria-labelledby="page-title">
      <div class="form-intro">
        <p class="eyebrow">Edit</p>
        <h1 id="page-title">Edit menu</h1>
        <p>Update menu information while keeping the list clear and consistent.</p>
      </div>

      <form id="menu-form" class="menu-form">
        <label class="field">
          <span>Name</span>
          <input id="name" name="name" type="text" required maxlength="60" value="${escapeHtml(item.name)}" />
        </label>

        <label class="field">
          <span>Category</span>
          <select id="category" name="category" required>${categoryOptions(item.category)}</select>
        </label>

        <label class="field">
          <span>Price</span>
          <input id="price" name="price" type="number" min="0" step="100" required value="${escapeHtml(item.price)}" />
        </label>

        <label class="field field-wide">
          <span>Image URL</span>
          <input id="image" name="image" type="url" value="${escapeHtml(item.image)}" />
        </label>

        <label class="field field-wide">
          <span>Description</span>
          <textarea id="description" name="description" rows="5" required maxlength="180">${escapeHtml(item.description)}</textarea>
        </label>

        <p id="form-error" class="form-error" role="alert" hidden></p>

        <div class="form-actions">
          <button class="primary-button" type="submit">Save changes</button>
          <a class="secondary-link" href="../detail/index.html?id=${encodeURIComponent(item.id)}">Cancel</a>
        </div>
      </form>
    </section>
  `;

  $('#menu-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const nextMenu = getFormValue();
    const error = validateMenu(nextMenu);
    if (error) {
      showError(error);
      return;
    }

    updateMenu(item.id, nextMenu);
    window.location.href = `../detail/index.html?id=${encodeURIComponent(item.id)}`;
  });
}

if (!menu) {
  renderNotFound();
} else {
  renderForm(menu);
}


