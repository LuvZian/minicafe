renderCustomerNav();
const cartCount = $('#cart-count');
const heroSlidesRoot = $('#hero-slides');
const heroDotsRoot = $('#hero-dots');
const heroPrev = $('#hero-prev');
const heroNext = $('#hero-next');
const todayVisual = $('#today-visual');
const todayName = $('#today-name');
const todayDescription = $('#today-description');
const todayPrice = $('#today-price');
const todayLink = $('#today-link');
const summaryGrid = $('.summary-grid');
const featuredEyebrow = $('#featured-eyebrow');
const featuredTitle = $('#featured-title');
const featuredGrid = $('#featured-grid');

const SEASON_LABELS = {
  spring: '봄 향기',
  summer: '여름 햇살',
  autumn: '가을 단풍',
  winter: '겨울 눈꽃'
};

const SEASON_SHORT_LABELS = {
  spring: '봄',
  summer: '여름',
  autumn: '가을',
  winter: '겨울'
};

const MENU_IMAGES = {
  1: SEASON_IMAGES.spring,
  2: SEASON_IMAGES.summer,
  3: SEASON_IMAGES.autumn,
  4: SEASON_IMAGES.winter,
  5: SEASON_IMAGES.spring,
  6: SEASON_IMAGES.summer,
  7: SEASON_IMAGES.autumn,
  8: SEASON_IMAGES.winter,
  9: SEASON_IMAGES.spring,
  10: SEASON_IMAGES.summer,
  11: SEASON_IMAGES.autumn,
  12: SEASON_IMAGES.winter
};

const CATEGORY_IMAGES = {
  spring: SEASON_IMAGES.spring,
  summer: SEASON_IMAGES.summer,
  autumn: SEASON_IMAGES.autumn,
  winter: SEASON_IMAGES.winter
};

const HERO_SLIDES = [
  {
    season: 'spring',
    image: SEASON_IMAGES.spring,
    kicker: '봄 향기',
    title: '꽃잎 사이로 번지는 다정한 계절',
    copy: '벚꽃빛 차와 부드러운 디저트, 작은 계절 소품을 단정하게 담았어요.'
  },
  {
    season: 'summer',
    image: SEASON_IMAGES.summer,
    kicker: '여름 햇살',
    title: '초록 그늘 아래 쉬어가는 여유',
    copy: '시원한 차와 맑은 과일 향, 가벼운 굿즈로 여름의 결을 느껴보세요.'
  },
  {
    season: 'autumn',
    image: SEASON_IMAGES.autumn,
    kicker: '가을 단풍',
    title: '붉은 잎처럼 깊어지는 오후',
    copy: '구운 차의 향, 밤과 감의 달콤함, 차분한 계절 소품을 준비했어요.'
  },
  {
    season: 'winter',
    image: SEASON_IMAGES.winter,
    kicker: '겨울 눈꽃',
    title: '하얀 창가에 머무는 따뜻한 김',
    copy: '유자와 배의 온기, 포근한 디저트, 겨울 차 시간을 위한 물건을 골랐어요.'
  }
];

let activeHeroSlide = 0;
let heroTimer = null;
let swipeStartX = 0;
let swipeStartY = 0;
let isSwipingHero = false;
let menus = [];

function getItemCount(items) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

function getMenuImage(menu) {
  return menu.image || MENU_IMAGES[menu.id] || CATEGORY_IMAGES[menu.category] || SEASON_IMAGES.spring;
}

function getActiveSeason() {
  return HERO_SLIDES[activeHeroSlide].season;
}

function renderHeroSlides() {
  if (!heroSlidesRoot || !heroDotsRoot) return;

  if (heroSlidesRoot.children.length === 0) {
    heroSlidesRoot.innerHTML = HERO_SLIDES.map(
      (slide, index) => `
        <article class="hero-slide" aria-hidden="true" data-season="${escapeHtml(slide.season)}">
          <div class="hero-slide-media">
            <img src="${escapeHtml(slide.image)}" alt="${escapeHtml(slide.kicker)} 이미지" loading="${index === 0 ? 'eager' : 'lazy'}" />
          </div>
          <div class="hero-slide-content">
            <p class="eyebrow">${escapeHtml(slide.kicker)}</p>
            <h2>${escapeHtml(slide.title)}</h2>
            <p>${escapeHtml(slide.copy)}</p>
            <div class="hero-actions">
              <a class="primary-link" href="/menus/list/?season=${encodeURIComponent(slide.season)}">계절 메뉴 보기</a>
              <a class="secondary-link" href="/auth/login/">로그인하기</a>
            </div>
          </div>
        </article>
      `
    ).join('');
  }

  if (heroDotsRoot.children.length === 0) {
    heroDotsRoot.innerHTML = HERO_SLIDES.map(
      (slide, index) => `
        <button
          type="button"
          data-hero-slide="${index}"
          aria-label="${escapeHtml(slide.kicker)} 보기"
          aria-selected="false"
        ></button>
      `
    ).join('');
  }

  const activeSlide = HERO_SLIDES[activeHeroSlide];
  document.body.dataset.season = activeSlide.season;
  document.body.classList.remove('season-spring', 'season-summer', 'season-autumn', 'season-winter');
  document.body.classList.add('season-' + activeSlide.season);

  [...heroSlidesRoot.children].forEach((slide, index) => {
    const isActive = index === activeHeroSlide;
    slide.classList.toggle('is-active', isActive);
    slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
  });

  [...heroDotsRoot.children].forEach((dot, index) => {
    const isActive = index === activeHeroSlide;
    dot.classList.toggle('is-active', isActive);
    dot.setAttribute('aria-selected', String(isActive));
  });
}

function showHeroSlide(index) {
  activeHeroSlide = (index + HERO_SLIDES.length) % HERO_SLIDES.length;
  renderHeroSlides();
  renderFeatured();
}

function restartHeroTimer() {
  window.clearInterval(heroTimer);
  heroTimer = window.setInterval(() => showHeroSlide(activeHeroSlide + 1), 5200);
}

function bindHeroSlider() {
  if (!heroSlidesRoot || !heroDotsRoot) return;

  const heroRoot = heroSlidesRoot.closest('.hero-copy-block');

  heroDotsRoot.addEventListener('click', (event) => {
    const button = event.target.closest('[data-hero-slide]');
    if (!button) return;
    showHeroSlide(Number(button.dataset.heroSlide));
    restartHeroTimer();
  });

  if (heroPrev) {
    heroPrev.addEventListener('click', () => {
      showHeroSlide(activeHeroSlide - 1);
      restartHeroTimer();
    });
  }

  if (heroNext) {
    heroNext.addEventListener('click', () => {
      showHeroSlide(activeHeroSlide + 1);
      restartHeroTimer();
    });
  }

  if (heroRoot) {
    heroRoot.addEventListener('pointerdown', (event) => {
      if (event.target.closest('a, button')) return;
      swipeStartX = event.clientX;
      swipeStartY = event.clientY;
      isSwipingHero = true;
      heroRoot.setPointerCapture(event.pointerId);
    });

    heroRoot.addEventListener('pointerup', (event) => {
      if (!isSwipingHero) return;
      isSwipingHero = false;
      const diffX = event.clientX - swipeStartX;
      const diffY = event.clientY - swipeStartY;
      if (Math.abs(diffX) < 48 || Math.abs(diffX) < Math.abs(diffY)) return;
      showHeroSlide(activeHeroSlide + (diffX < 0 ? 1 : -1));
      restartHeroTimer();
    });

    heroRoot.addEventListener('pointercancel', () => {
      isSwipingHero = false;
    });
  }

  renderHeroSlides();
  restartHeroTimer();
}

function getTodayPick(menuItems) {
  if (menuItems.length === 0) return null;
  const index = new Date().getDate() % menuItems.length;
  return menuItems[index];
}

function renderTodayPick(menu) {
  if (!menu) return;

  todayVisual.style.setProperty('--menu-image', `url('${getMenuImage(menu)}')`);
  todayName.textContent = menu.name;
  todayDescription.textContent = menu.description;
  todayPrice.textContent = formatPrice(menu.price);
  todayLink.href = `/menus/detail/?id=${encodeURIComponent(menu.id)}`;
}

function renderSummary() {
  if (!summaryGrid) return;

  const user = getCurrentUser();
  if (!user || user.role !== 'customer') {
    if (cartCount) cartCount.textContent = '0';
    summaryGrid.innerHTML = `
      <article class="summary-card">
        <p class="eyebrow dark">메뉴</p>
        <h2>계절 메뉴 둘러보기</h2>
        <p>로그인 전에도 메뉴는 편하게 볼 수 있어요.</p>
        <a class="secondary-link" href="/menus/list/">메뉴 보기</a>
      </article>
      <article class="summary-card">
        <p class="eyebrow dark">로그인</p>
        <h2>주문은 로그인 후에</h2>
        <p>장바구니와 주문 내역은 회원 계정에서 안전하게 관리돼요.</p>
        <a class="secondary-link" href="/auth/login/">로그인</a>
      </article>
      <article class="summary-card">
        <p class="eyebrow dark">회원가입</p>
        <h2>처음이라면 회원가입</h2>
        <p>나만의 계절 찬장과 주문 기록을 만들 수 있어요.</p>
        <a class="secondary-link" href="/auth/signup/">회원가입</a>
      </article>
    `;
    return;
  }

  const cart = getCart();
  const orders = getCustomerOrders();
  const itemCount = getItemCount(cart);
  const recentOrder = orders[0];

  if (cartCount) cartCount.textContent = itemCount;
  summaryGrid.innerHTML = `
    <article class="summary-card">
      <p class="eyebrow dark">장바구니</p>
      <h2>${itemCount > 0 ? `${itemCount}개 메뉴가 기다려요` : '장바구니가 비어 있어요'}</h2>
      <p>${itemCount > 0 ? `${formatPrice(getCartTotal())} 만큼 담겨 있어요.` : '마음에 드는 계절 메뉴를 골라 담아보세요.'}</p>
      <a class="secondary-link" href="/basket/list/">장바구니 보기</a>
    </article>
    <article class="summary-card">
      <p class="eyebrow dark">주문</p>
      <h2>${recentOrder ? `최근 주문 ${recentOrder.id.slice(-6).toUpperCase()}` : '아직 주문이 없어요'}</h2>
      <p>${recentOrder ? `${getStatusLabel(recentOrder.status)} - ${formatDate(recentOrder.createdAt)}` : '주문하면 이곳에 계절 기록이 쌓여요.'}</p>
      <a class="secondary-link" href="/orders/list/">주문 보기</a>
    </article>
    <article class="summary-card">
      <p class="eyebrow dark">나의 찬장</p>
      <h2>${escapeHtml(user.name)}님의 계절 찬장</h2>
      <p>내 정보와 취향 계절을 한곳에서 확인할 수 있어요.</p>
      <a class="secondary-link" href="/my/">내 정보 보기</a>
    </article>
  `;
}

function renderFeatured() {
  if (!featuredGrid) return;

  const season = getActiveSeason();
  const seasonalMenus = menus.filter((menu) => menu.category === season);
  const featured = seasonalMenus.slice(0, 4);
  const label = SEASON_LABELS[season] || '계절';
  const shortLabel = SEASON_SHORT_LABELS[season] || '계절';

  if (featuredEyebrow) featuredEyebrow.textContent = `${shortLabel} 추천`;
  if (featuredTitle) featuredTitle.textContent = `${label} 메뉴`;

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
            <a class="detail-link" href="/menus/detail/?id=${encodeURIComponent(menu.id)}">자세히 보기</a>
          </div>
        </div>
      </article>
    `
  );
}

menus = getMenus();
bindHeroSlider();
renderTodayPick(getTodayPick(menus));
renderSummary();
renderFeatured();