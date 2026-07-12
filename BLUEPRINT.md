# ☕ 카페 앱 - 프로젝트 청사진

## 📁 폴더 구조 (완전 코로케이션)

```
minicafe/
|
|-- index.html
|-- index.css
|-- index.js
|
|-- menus/
|   |-- list/
|   |   |-- index.html
|   |   |-- index.css
|   |   `-- index.js
|   `-- detail/
|       |-- index.html
|       |-- index.css
|       `-- index.js
|
|-- basket/
|   `-- list/
|       |-- index.html
|       |-- index.css
|       `-- index.js
|
|-- orders/
|   |-- list/
|   |   |-- index.html
|   |   |-- index.css
|   |   `-- index.js
|   `-- detail/
|       |-- index.html
|       |-- index.css
|       `-- index.js
|
|-- my/
|   |-- index.html
|   |-- index.css
|   `-- index.js
|
|-- admin/
|   |-- index.html
|   |-- index.css
|   |-- index.js
|   |
|   |-- menus/
|   |   |-- list/
|   |   |   |-- index.html
|   |   |   |-- index.css
|   |   |   `-- index.js
|   |   |-- detail/
|   |   |   |-- index.html
|   |   |   |-- index.css
|   |   |   `-- index.js
|   |   |-- create/
|   |   |   |-- index.html
|   |   |   |-- index.css
|   |   |   `-- index.js
|   |   `-- edit/
|   |       |-- index.html
|   |       |-- index.css
|   |       `-- index.js
|   |
|   `-- orders/
|       |-- list/
|       |   |-- index.html
|       |   |-- index.css
|       |   `-- index.js
|       `-- detail/
|           |-- index.html
|           |-- index.css
|           `-- index.js
|
|-- css/
|   `-- variables.css
`-- js/
    |-- data.js
    `-- utils.js
```

## 👥 역할별 기능

| 역할 | 경로 | 주요 기능 |
|------|------|-----------|
| **고객** | `/`, `/menus/`, `/my/`, `/basket/`, `/orders/` | 메인, 메뉴 조회, 마이페이지, 장바구니, 주문 내역 |
| **관리자/사장** | `/admin/`, `/admin/menus/`, `/admin/orders/` | 대시보드, 메뉴 CRUD, 주문 관리 |

## 🎨 디자인

- **테마**: 라이트 + 따뜻한 브라운/크림 톤
- **분위기**: 미니멀 + 모던
- **카드 스타일**: Glass morphism
- **레이아웃**: 반응형 (모바일/데스크톱)

## 📐 코로케이션 원칙

- **HTML과 동일한 디렉토리에 css, js 파일을 평탄하게 배치** (별도 하위 폴더 없음)
- **파일명은 HTML 파일명과 동일하게 매칭** (`index.html` → `index.css`, `index.js`)
- 전역 공통 자원만 `/css/`, `/js/` 폴더에 분리
- 역할별 독립 폴더로 관심사를 분리

---

## ✅ 구현 TODO

### 1단계: 공유 자원

- [x] `css/variables.css` — 전역 CSS 변수, 리셋
- [x] `js/data.js` — 메뉴/카테고리 데이터
- [x] `js/utils.js` — 공통 유틸리티 (카트, 포맷 등)

### 2단계: 관리자 - 메뉴 관리 시스템

- [x] `admin/menus/list/index.html` — 메뉴 목록
- [x] `admin/menus/list/index.css`
- [x] `admin/menus/list/index.js`
- [x] `admin/menus/detail/index.html` — 메뉴 상세
- [x] `admin/menus/detail/index.css`
- [x] `admin/menus/detail/index.js`
- [x] `admin/menus/create/index.html` — 메뉴 추가
- [x] `admin/menus/create/index.css`
- [x] `admin/menus/create/index.js`
- [x] `admin/menus/edit/index.html` — 메뉴 수정
- [x] `admin/menus/edit/index.css`
- [x] `admin/menus/edit/index.js`

### 3단계: 고객 - 메뉴 조회 시스템

- [x] `menus/list/index.html` — 메뉴 목록
- [x] `menus/list/index.css`
- [x] `menus/list/index.js`
- [x] `menus/detail/index.html` — 메뉴 상세
- [x] `menus/detail/index.css`
- [x] `menus/detail/index.js`

### 4단계: 고객 - 장바구니 관리 시스템

- [ ] `basket/list/index.html` — 장바구니
- [ ] `basket/list/index.css`
- [ ] `basket/list/index.js`

### 5단계: 고객 - 주문 관리 시스템

- [ ] `orders/list/index.html` — 주문 내역 목록
- [ ] `orders/list/index.css`
- [ ] `orders/list/index.js`
- [ ] `orders/detail/index.html` — 주문 상세
- [ ] `orders/detail/index.css`
- [ ] `orders/detail/index.js`

### 6단계: 고객 - 메인 페이지

- [ ] `index.html`
- [ ] `index.css`
- [ ] `index.js`

### 7단계: 고객 - 마이페이지

- [ ] `my/index.html`
- [ ] `my/index.css`
- [ ] `my/index.js`

### 8단계: 관리자 - 대시보드 & 주문 관리

- [ ] `admin/index.html` — 대시보드
- [ ] `admin/index.css`
- [ ] `admin/index.js`
- [ ] `admin/orders/list/index.html` — 주문 목록
- [ ] `admin/orders/list/index.css`
- [ ] `admin/orders/list/index.js`
- [ ] `admin/orders/detail/index.html` — 주문 상세
- [ ] `admin/orders/detail/index.css`
- [ ] `admin/orders/detail/index.js`
