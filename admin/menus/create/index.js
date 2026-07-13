renderAdminNav();
const currentAdmin = requireAuth('admin');
if (!currentAdmin) throw new Error('관리자 로그인이 필요해요.');

const form = $('#menu-form');
const categorySelect = $('#category');
const formError = $('#form-error');

function renderCategories() {
  categorySelect.innerHTML = CATEGORIES.map(
    (category) => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.name)}</option>`
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
  const preview = $('.create-preview');
  if (!preview) return;

  const category = categorySelect.value || 'spring';
  const image = $('#image')?.value.trim() || seasonFallbackImage(category);
  preview.style.setProperty('--menu-image', toCssUrl(image));
}

function updatePreviewTitle() {
  const previewTitle = $('.create-preview span');
  if (!previewTitle) return;

  previewTitle.textContent = $('#name').value.trim() || '새 계절 메뉴';
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
  if (!menu.name.trim()) return '메뉴 이름을 입력해주세요.';
  if (!menu.category) return '계절을 선택해주세요.';
  if (!Number(menu.price) || Number(menu.price) <= 0) return '가격은 0원보다 커야 해요.';
  if (!menu.description.trim()) return '메뉴 설명을 입력해주세요.';
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
  window.location.href = `/admin/menus/detail/?id=${encodeURIComponent(created.id)}`;
});

categorySelect.addEventListener('change', (event) => {
  updateSeason(event.target.value);
  updatePreviewImage();
});

$('#image').addEventListener('input', updatePreviewImage);
$('#name').addEventListener('input', updatePreviewTitle);

renderCategories();
updateSeason(categorySelect.value || 'spring');
updatePreviewImage();