renderAdminNav();
const currentAdmin = requireAuth('admin');
if (!currentAdmin) throw new Error('관리자 로그인이 필요해요.');

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

function menuTypeOptions(selectedKind) {
  return MENU_TYPES.map(
    (kind) => `
      <option value="${escapeHtml(kind.id)}" ${kind.id === selectedKind ? 'selected' : ''}>
        ${escapeHtml(kind.name)}
      </option>
    `
  ).join('');
}

function temperatureModeOptions(selectedMode = 'both') {
  return Object.entries(MENU_OPTION_LABELS.temperatureMode).map(
    ([value, label]) => `<option value="${escapeHtml(value)}" ${value === selectedMode ? 'selected' : ''}>${escapeHtml(label)}</option>`
  ).join('');
}

function seasonFallbackImage(season) {
  return SEASON_IMAGES[season] || SEASON_IMAGES.spring;
}

function toCssUrl(imageUrl) {
  return `url('${String(imageUrl || '').replace(/'/g, "\\'")}')`;
}

function updateSeason(season) {
  const nextSeason = season || 'spring';
  document.body.dataset.season = nextSeason;

  const shell = $('.form-shell');
  if (shell) shell.dataset.season = nextSeason;
}

function updatePreviewImage() {
  const preview = $('.edit-preview');
  if (!preview) return;

  const category = $('#category')?.value || 'spring';
  const image = $('#image')?.value.trim() || seasonFallbackImage(category);
  preview.style.setProperty('--menu-image', toCssUrl(image));
}

function updateKindSettings() {
  const field = $('#temperature-mode-field');
  const select = $('#temperature-mode');
  const isDrink = $('#kind')?.value === 'drink';
  if (field) field.hidden = !isDrink;
  if (select) select.disabled = !isDrink;
  if (!isDrink && select) select.value = 'both';
}

function getOptionConfig() {
  if ($('#kind').value !== 'drink') return {};
  return {
    temperatureMode: $('#temperature-mode')?.value || 'both'
  };
}

function renderNotFound() {
  updateSeason('spring');
  document.title = '메뉴를 찾을 수 없어요 | Minicafe';
  editRoot.innerHTML = `
    <div class="form-shell not-found-shell" data-season="spring">
      <div class="form-intro">
        <p class="eyebrow">메뉴 수정</p>
        <h1>메뉴를 찾을 수 없어요</h1>
        <p>메뉴가 삭제되었거나 링크가 올바르지 않을 수 있어요.</p>
      </div>
      <div class="form-actions">
        <a class="secondary-link" href="/admin/menus/list/">목록으로 이동</a>
      </div>
    </div>
  `;
}

function getFormValue() {
  return {
    name: $('#name').value,
    category: $('#category').value,
    kind: $('#kind').value,
    optionConfig: getOptionConfig(),
    price: $('#price').value,
    soldOut: $('#sold-out')?.checked || false,
    image: $('#image').value,
    description: $('#description').value
  };
}

function validateMenu(nextMenu) {
  if (!nextMenu.name.trim()) return '메뉴 이름을 입력해주세요.';
  if (!nextMenu.category) return '계절을 선택해주세요.';
  if (!nextMenu.kind) return '관리자 카테고리를 선택해주세요.';
  if (!Number(nextMenu.price) || Number(nextMenu.price) <= 0) return '가격은 0원보다 커야 해요.';
  if (!nextMenu.description.trim()) return '메뉴 설명을 입력해주세요.';
  return '';
}

function showError(message) {
  const formError = $('#form-error');
  formError.textContent = message;
  formError.hidden = !message;
}

function renderForm(item) {
  updateSeason(item.category);
  document.title = `${item.name} 수정 | Minicafe`;
  const previewImage = item.image || seasonFallbackImage(item.category);
  const selectedKind = item.kind || getMenuKind(item);
  const selectedOptionConfig = getMenuOptionConfig(item);

  editRoot.innerHTML = `
    <section class="form-shell" data-season="${escapeHtml(item.category)}" aria-labelledby="page-title">
      <div class="form-intro">
        <p class="eyebrow">메뉴 수정</p>
        <h1 id="page-title">계절 메뉴를 다듬어요</h1>
        <p>현재 메뉴의 계절 분위기에 맞춰 이름, 가격, 이미지와 관리자 카테고리를 정리해요.</p>
        <div class="edit-preview" style="--menu-image: ${toCssUrl(previewImage)}" aria-hidden="true">
          <span>${escapeHtml(item.name)}</span>
        </div>
      </div>

      <form id="menu-form" class="menu-form">
        <label class="field">
          <span>메뉴 이름</span>
          <input id="name" name="name" type="text" required maxlength="60" value="${escapeHtml(item.name)}" />
        </label>

        <label class="field">
          <span>계절</span>
          <select id="category" name="category" required>${categoryOptions(item.category)}</select>
        </label>

        <label class="field">
          <span>관리자 카테고리</span>
          <select id="kind" name="kind" required>${menuTypeOptions(selectedKind)}</select>
        </label>

        <label class="field field-wide" id="temperature-mode-field">
          <span>음료 온도 설정</span>
          <select id="temperature-mode" name="temperatureMode">${temperatureModeOptions(selectedOptionConfig.temperatureMode)}</select>
        </label>

        <label class="field">
          <span>가격</span>
          <input id="price" name="price" type="number" min="0" step="100" required value="${escapeHtml(item.price)}" />
        </label>

        <label class="field stock-field">
          <span>판매 상태</span>
          <label class="stock-toggle">
            <input id="sold-out" name="soldOut" type="checkbox" ${item.soldOut ? 'checked' : ''} />
            <strong>품절로 표시</strong>
          </label>
        </label>
        <label class="field field-wide">
          <span>이미지 URL</span>
          <input id="image" name="image" type="text" value="${escapeHtml(item.image)}" />
        </label>

        <label class="field field-wide">
          <span>설명</span>
          <textarea id="description" name="description" rows="5" required maxlength="180">${escapeHtml(item.description)}</textarea>
        </label>

        <p id="form-error" class="form-error" role="alert" hidden></p>

        <div class="form-actions">
          <button class="primary-button" type="submit">수정 저장</button>
          <a class="secondary-link" href="/admin/menus/detail/?id=${encodeURIComponent(item.id)}">취소</a>
        </div>
      </form>
    </section>
  `;

  $('#category').addEventListener('change', (event) => {
    updateSeason(event.target.value);
    updatePreviewImage();
  });

  $('#kind').addEventListener('change', updateKindSettings);
  $('#image').addEventListener('input', updatePreviewImage);

  $('#name').addEventListener('input', (event) => {
    const previewTitle = $('.edit-preview span');
    if (previewTitle) previewTitle.textContent = event.target.value || '계절 메뉴';
  });

  $('#menu-form').addEventListener('submit', (event) => {
    event.preventDefault();

    const nextMenu = getFormValue();
    const error = validateMenu(nextMenu);
    if (error) {
      showError(error);
      return;
    }

    updateMenu(item.id, nextMenu);
    window.location.href = `/admin/menus/detail/?id=${encodeURIComponent(item.id)}`;
  });

  updateKindSettings();
}

if (!menu) {
  renderNotFound();
} else {
  renderForm(menu);
}