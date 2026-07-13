const CATEGORIES = [
  { id: 'spring', name: '봄' },
  { id: 'summer', name: '여름' },
  { id: 'autumn', name: '가을' },
  { id: 'winter', name: '겨울' }
];


const MENU_TYPES = [
  { id: 'drink', name: '음료' },
  { id: 'dessert', name: '디저트' },
  { id: 'goods', name: '굿즈' }
];
const SEASON_IMAGES = {
  spring: '/assets/photos/season-spring.png',
  summer: '/assets/photos/season-summer.png',
  autumn: '/assets/photos/season-autumn.png',
  winter: '/assets/photos/season-winter.png'
};

const MENU_ITEMS = [
  {
    id: 1,
    name: '봄꽃 차',
    category: 'spring',
    kind: 'drink',
    optionConfig: { temperatureMode: 'hotOnly' },
    price: 6400,
    description: '은은한 꽃향과 따뜻한 봄빛이 감도는 부드러운 차입니다.',
    image: '/assets/menu/spring-blossom-tea.png'
  },
  {
    id: 2,
    name: '딸기 꽃잎 에이드',
    category: 'spring',
    kind: 'drink',
    optionConfig: { temperatureMode: 'iceOnly' },
    price: 6800,
    description: '딸기와 꽃잎 시럽을 더한 산뜻한 탄산 에이드입니다.',
    image: '/assets/menu/strawberry-petal-ade.png'
  },
  {
    id: 3,
    name: '벚꽃 화과자 플레이트',
    category: 'spring',
    kind: 'dessert',
    price: 7200,
    description: '벚꽃빛 화과자를 작게 담은 봄 디저트 플레이트입니다.',
    image: '/assets/menu/sakura-wagashi-plate.png'
  },
  {
    id: 4,
    name: '복숭아 크림 카스텔라',
    category: 'spring',
    kind: 'dessert',
    price: 7600,
    description: '복숭아 크림을 포근하게 올린 부드러운 카스텔라입니다.',
    image: '/assets/menu/peach-cream-castella.png'
  },
  {
    id: 5,
    name: '봄꽃 찻잔',
    category: 'spring',
    kind: 'goods',
    price: 18000,
    description: '봄꽃 색감의 유약을 입힌 작은 도자기 찻잔입니다.',
    image: '/assets/menu/blossom-tea-cup.png'
  },
  {
    id: 6,
    name: '봄 티백 세트',
    category: 'spring',
    kind: 'goods',
    price: 16000,
    description: '가볍게 선물하기 좋은 꽃향 티백 세트입니다.',
    image: '/assets/menu/spring-tea-sachet-set.png'
  },
  {
    id: 7,
    name: '여름 정원 에이드',
    category: 'summer',
    kind: 'drink',
    optionConfig: { temperatureMode: 'iceOnly' },
    price: 6600,
    description: '허브 향과 초록빛 청량감이 살아있는 여름 에이드입니다.',
    image: '/assets/menu/summer-garden-ade.png'
  },
  {
    id: 8,
    name: '대나무 아이스티',
    category: 'summer',
    kind: 'drink',
    optionConfig: { temperatureMode: 'iceOnly' },
    price: 6200,
    description: '대나무 잎의 맑은 향을 담은 시원한 아이스티입니다.',
    image: '/assets/menu/bamboo-iced-tea.png'
  },
  {
    id: 9,
    name: '차가운 쌀 푸딩',
    category: 'summer',
    kind: 'dessert',
    price: 6900,
    description: '쌀 크림과 계절 과일을 곁들인 차가운 디저트입니다.',
    image: '/assets/menu/cool-rice-pudding.png'
  },
  {
    id: 10,
    name: '멜론 눈꽃 빙수',
    category: 'summer',
    kind: 'dessert',
    price: 8900,
    description: '멜론과 고운 얼음이 어우러진 여름 빙수입니다.',
    image: '/assets/menu/melon-snow-bingsu.png'
  },
  {
    id: 11,
    name: '대나무 부채',
    category: 'summer',
    kind: 'goods',
    price: 15000,
    description: '차 테이블에 시원한 분위기를 더하는 대나무 부채입니다.',
    image: '/assets/menu/bamboo-summer-fan.png'
  },
  {
    id: 12,
    name: '콜드브루 티 보틀',
    category: 'summer',
    kind: 'goods',
    price: 24000,
    description: '차를 차갑게 우려내기 좋은 슬림한 유리 보틀입니다.',
    image: '/assets/menu/cold-brew-tea-bottle.png'
  },
  {
    id: 13,
    name: '가을 구운 차',
    category: 'autumn',
    kind: 'drink',
    optionConfig: { temperatureMode: 'hotOnly' },
    price: 6200,
    description: '고소하게 덖은 찻잎의 깊은 향이 느껴지는 따뜻한 차입니다.',
    image: '/assets/menu/autumn-roasted-tea.png'
  },
  {
    id: 14,
    name: '감 생강 라떼',
    category: 'autumn',
    kind: 'drink',
    optionConfig: { temperatureMode: 'hotOnly' },
    price: 6900,
    description: '감의 달콤함과 생강의 온기가 어우러진 라떼입니다.',
    image: '/assets/menu/persimmon-ginger-latte.png'
  },
  {
    id: 15,
    name: '밤 차 케이크',
    category: 'autumn',
    kind: 'dessert',
    price: 7400,
    description: '밤의 고소함과 구운 차 향을 담은 촉촉한 케이크입니다.',
    image: '/assets/menu/chestnut-tea-cake.png'
  },
  {
    id: 16,
    name: '단풍 약과 세트',
    category: 'autumn',
    kind: 'dessert',
    price: 7800,
    description: '단풍빛 글레이즈를 입힌 달콤한 전통 약과 세트입니다.',
    image: '/assets/menu/maple-yakgwa-set.png'
  },
  {
    id: 17,
    name: '단풍 찻잎 틴',
    category: 'autumn',
    kind: 'goods',
    price: 22000,
    description: '가을 찻잎을 보관하기 좋은 단정한 계절 틴입니다.',
    image: '/assets/menu/maple-tea-tin.png'
  },
  {
    id: 18,
    name: '가을 향낭',
    category: 'autumn',
    kind: 'goods',
    price: 13000,
    description: '따뜻한 향을 담아 차분한 분위기를 더하는 작은 향낭입니다.',
    image: '/assets/menu/autumn-incense-pouch.png'
  },
  {
    id: 19,
    name: '겨울 유자차',
    category: 'winter',
    kind: 'drink',
    optionConfig: { temperatureMode: 'hotOnly' },
    price: 6500,
    description: '상큼한 유자 향과 따뜻한 김이 어울리는 겨울 차입니다.',
    image: '/assets/menu/winter-yuja-tea.png'
  },
  {
    id: 20,
    name: '눈 배차',
    category: 'winter',
    kind: 'drink',
    optionConfig: { temperatureMode: 'hotOnly' },
    price: 6700,
    description: '배의 맑은 단맛을 따뜻하게 우려낸 부드러운 차입니다.',
    image: '/assets/menu/snow-pear-tea.png'
  },
  {
    id: 21,
    name: '눈꽃 모찌 세트',
    category: 'winter',
    kind: 'dessert',
    price: 6800,
    description: '눈처럼 하얀 모찌를 담은 포근한 겨울 디저트입니다.',
    image: '/assets/menu/snow-mochi-set.png'
  },
  {
    id: 22,
    name: '흰팥 모나카',
    category: 'winter',
    kind: 'dessert',
    price: 7200,
    description: '바삭한 껍질과 흰팥 크림이 어우러진 모나카입니다.',
    image: '/assets/menu/white-bean-monaka.png'
  },
  {
    id: 23,
    name: '겨울 도자기 티팟',
    category: 'winter',
    kind: 'goods',
    price: 34000,
    description: '겨울 차 시간을 차분하게 만들어주는 도자기 티팟입니다.',
    image: '/assets/menu/winter-ceramic-pot.png'
  },
  {
    id: 24,
    name: '눈꽃 티 타월',
    category: 'winter',
    kind: 'goods',
    price: 12000,
    description: '눈꽃 무늬를 담은 부드러운 차 테이블 타월입니다.',
    image: '/assets/menu/snow-tea-towel.png'
  },
  {
    id: 25,
    name: '벚꽃 꿀차',
    category: 'spring',
    kind: 'drink',
    optionConfig: { temperatureMode: 'both' },
    price: 6900,
    description: '벚꽃 향과 꿀의 은은한 단맛을 따뜻하게도 차갑게도 즐기는 봄 차입니다.',
    image: '/assets/menu/spring-cherry-honey-tea.png'
  },
  {
    id: 26,
    name: '청매실 허브티',
    category: 'summer',
    kind: 'drink',
    optionConfig: { temperatureMode: 'both' },
    price: 6600,
    description: '청매실의 산뜻함과 허브 향을 담아 Hot 또는 Ice로 즐기는 여름 차입니다.',
    image: '/assets/menu/summer-plum-herbal-tea.png'
  },
  {
    id: 27,
    name: '밤보리 라떼',
    category: 'autumn',
    kind: 'drink',
    optionConfig: { temperatureMode: 'both' },
    price: 7000,
    description: '밤의 고소함과 볶은 보리 향이 어우러져 따뜻하게도 차갑게도 좋은 라떼입니다.',
    image: '/assets/menu/autumn-chestnut-barley-latte.png'
  },
  {
    id: 28,
    name: '유자 생강 허니티',
    category: 'winter',
    kind: 'drink',
    optionConfig: { temperatureMode: 'both' },
    price: 6800,
    description: '유자와 생강, 꿀의 균형을 담아 겨울에도 Hot 또는 Ice로 즐기는 차입니다.',
    image: '/assets/menu/winter-yuzu-ginger-honey-tea.png'
  }
];

const ORDER_STATUS = {
  PENDING: { value: 'pending', label: 'Pending' },
  CONFIRMED: { value: 'confirmed', label: 'Confirmed' },
  PREPARING: { value: 'preparing', label: 'Preparing' },
  READY: { value: 'ready', label: 'Ready' },
  COMPLETED: { value: 'completed', label: 'Completed' },
  CANCELLED: { value: 'cancelled', label: 'Cancelled' }
};