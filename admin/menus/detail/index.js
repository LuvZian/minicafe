const detailRoot = $('#detail-root');
const menuId = getQueryParam('id');
const menu = getMenuById(menuId);

function menuInitial(name) {
  return escapeHtml(name.slice(0, 1).toUpperCase());
}

function renderNotFound() {
  detailRoot.innerHTML = `
    <div class="not-found">
      <h1>Menu not found</h1>
      <p>The menu may have been removed or the link is incorrect.</p>
      <a href="../list/index.html">Go to list</a>
    </div>
  `;
}

function renderDetail(item) {
  document.title = `${item.name} | Admin Menu`;
  detailRoot.innerHTML = `
    <article class="detail-layout">
      <div
        class="menu-visual"
        ${item.image ? `style="--menu-image: url('${escapeHtml(item.image)}')"` : ''}
        aria-label="${escapeHtml(item.name)} image"
      >
        ${item.image ? '' : menuInitial(item.name)}
      </div>
      <div class="detail-panel">
        <span class="category-pill">${escapeHtml(getCategoryName(item.category))}</span>
        <div>
          <h1 class="detail-title">${escapeHtml(item.name)}</h1>
          <p class="detail-description">${escapeHtml(item.description)}</p>
        </div>
        <div class="detail-price">${formatPrice(item.price)}</div>
        <div class="detail-actions">
          <a class="primary-link" href="../edit/index.html?id=${encodeURIComponent(item.id)}">Edit</a>
          <a class="secondary-link" href="../list/index.html">List</a>
          <button class="danger-button" type="button" id="delete-button">Delete</button>
        </div>
      </div>
    </article>
  `;

  $('#delete-button').addEventListener('click', () => {
    if (window.confirm(`${item.name} 메뉴를 삭제할까요?`)) {
      deleteMenu(item.id);
      window.location.href = '../list/index.html';
    }
  });
}

if (!menu) {
  renderNotFound();
} else {
  renderDetail(menu);
}

