renderAdminNav();
const currentAdmin = requireAuth('admin');
if (!currentAdmin) throw new Error('관리자 로그인이 필요해요.');
const detailRoot = $('#detail-root');
const menuId = getQueryParam('id');
const menu = getMenuById(menuId);

function menuInitial(name) {
  return escapeHtml(name.slice(0, 1).toUpperCase());
}

function renderNotFound() {
  document.body.dataset.season = 'spring';
  detailRoot.innerHTML = `
    <div class="not-found">
      <h1>메뉴를 찾을 수 없어요</h1>
      <p>메뉴가 삭제되었거나 링크가 올바르지 않을 수 있어요.</p>
      <a href="/admin/menus/list/">목록으로 이동</a>
    </div>
  `;
}

function renderDetail(item) {
  const kind = item.kind || getMenuKind(item);
  const optionBadge = kind === 'drink'
    ? `<span class="kind-pill">온도 설정 · ${escapeHtml(MENU_OPTION_LABELS.temperatureMode[getMenuOptionConfig(item).temperatureMode])}</span>`
    : '';

  document.title = `${item.name} | 메뉴 상세`;
  document.body.dataset.season = item.category;
  detailRoot.innerHTML = `
    <article class="detail-layout ${item.soldOut ? 'is-sold-out' : ''}" data-season="${escapeHtml(item.category)}">
      <div
        class="menu-visual"
        style="--menu-image: url('${escapeHtml(item.image || SEASON_IMAGES[item.category] || SEASON_IMAGES.spring)}')"
        aria-label="${escapeHtml(item.name)} 이미지"
      >
        ${item.image ? '' : menuInitial(item.name)}
      </div>
      <div class="detail-panel">
        <div class="admin-menu-meta" aria-label="관리자 메뉴 분류">
          <span class="category-pill">계절 · ${escapeHtml(getCategoryName(item.category))}</span>
          <span class="kind-pill">관리자 카테고리 · ${escapeHtml(getMenuKindName(kind))}</span>
          ${optionBadge}
          ${item.soldOut ? '<span class="sold-out-badge">품절</span>' : '<span class="available-badge">판매중</span>'}
        </div>
        <div>
          <h1 class="detail-title">${escapeHtml(item.name)}</h1>
          <p class="detail-description">${escapeHtml(item.description)}</p>
        </div>
        <div class="detail-price">${formatPrice(item.price)}</div>
        <div class="detail-actions">
          <a class="primary-link" href="/admin/menus/edit/?id=${encodeURIComponent(item.id)}">수정</a>
          <a class="secondary-link" href="/admin/menus/list/">목록</a>
          <button class="danger-button" type="button" id="delete-button">삭제</button>
        </div>
      </div>
    </article>
  `;

  $('#delete-button').addEventListener('click', () => {
    if (window.confirm(`${item.name} 메뉴를 삭제할까요?`)) {
      deleteMenu(item.id);
      window.location.href = '/admin/menus/list/';
    }
  });
}

if (!menu) {
  renderNotFound();
} else {
  renderDetail(menu);
}