/* =========================================================================
   TOUCHLINE — store configuration & catalogue
   Everything the shop displays lives here. Swap in your real stock,
   prices, policies and reviews before going live.
   Photos are hot-linked from Unsplash (free licence, commercial use OK).
   ========================================================================= */

window.STORE = {
  name: 'TOUCHLINE',
  currencies: {
    GBP: { locale: 'en-GB', rate: 1 },
    EUR: { locale: 'de-DE', rate: 1.17 },
    USD: { locale: 'en-US', rate: 1.27 },
    // PKR: whole rupees, prices rounded up to the next 100 and ending in 99 (e.g. Rs 31,899).
    // Update `rate` (rupees per £1) to today's rate before going live.
    PKR: { locale: 'en-PK', rate: 375, decimals: 0, step: 100 },
  },
  freeShipping: 75,          // GBP threshold for free standard delivery
  printPrice: 15,            // name + number printing
  authenticUpcharge: 35,     // player-issue "Authentic" edition
  dispatchCutoffHour: 21,    // order before 21:00 for next-day delivery
  promoCodes: {
    KICKOFF10: { pct: 10, label: '10% off your order' },
  },
  delivery: [
    { id: 'standard', label: 'Standard', eta: '3–5 working days', price: 3.99, freeOver: true },
    { id: 'nextday', label: 'Next-day', eta: 'Order by 9pm', price: 6.99 },
    { id: 'matchday', label: 'Matchday Express', eta: 'Choose your delivery day', price: 9.99 },
  ],
  teamwearTiers: [
    { min: 1, price: 34.99, label: '1–9 shirts' },
    { min: 10, price: 29.99, label: '10–19 shirts' },
    { min: 20, price: 24.99, label: '20+ shirts' },
  ],
};

/* Unsplash image helper — w = pixel width requested from the CDN */
window.IMG = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${Math.round(w)}&q=72`;

/* Photo library (Unsplash photo ids) */
window.PHOTOS = {
  arsenalFront: '1577212017184-80cc0da11082',
  arsenalBack: '1577212017308-55c4d60d2609',
  retroRack: '1616124619460-ff4ed8f4683c',
  printBack: '1778454288878-9b3c0c975589',
  brazilHang: '1552066379-e7bfd22155c5',
  marbleKit: '1689624291789-7b402a15915a',
  marbleKit2: '1689624291744-034ee30c8799',
  unitedLocker: '1772474659559-7d009fef11df',
  united2122: '1662096909714-e2f206d0a636',
  argentinaMessi: '1671016233693-53162078ca1c',
  milanRetro: '1757876804347-b62e5bd391e6',
  colombia: '1763656812756-3539efd3e301',
  barcaAway: '1738091063217-1f59463342c9',
  orange16: '1693683224122-0a8e206f248d',
  neymar: '1666377454944-17a17d22a751',
  heritageKit: '1765791258069-5fce23e2b55a',
  barcaHome: '1707414038523-b5d1c8294786',
  scarfFans: '1556816214-fda351e4a7fb',
  spainFans: '1551854321-1432edd90a5c',
  brazilRetro: '1768854318260-f69ab6fc11e7',
  kidOrange: '1693683223409-4d946f3d458e',
  womenNavy: '1629977007371-0ba395424741',
  playerNavy: '1613125479775-0c09b9a46ae1',
  stadiumNight: '1705593973313-75de7bf95b56',
  stadiumRed: '1766756467595-fd3f1f62d562',
  flare: '1783335329013-a2b063f969e7',
  redKick: '1602674809970-89073c530b0a',
  stadiumWide: '1522778119026-d647f0596c20',
};

window.CATEGORIES = {
  club: 'Club',
  international: 'International',
  retro: 'Retro Vault',
  kids: "Kids & Women's",
  teamwear: 'Teamwear',
};

const ph = window.PHOTOS;
const ADULT = (s, m, l, xl, xxl) => ({ S: s, M: m, L: l, XL: xl, XXL: xxl });

/*  kit = colours used by the live shirt-back renderer
    pattern: plain | stripes | hoops | halves | sash | band | marble          */
window.PRODUCTS = [
  {
    id: 'man-utd-home-2425', name: 'Manchester United Home Shirt 2024/25', team: 'Manchester United',
    cat: 'club', region: 'England', league: 'Premier League', season: '2024/25',
    price: 84.99, rating: 4.8, reviews: 623, added: '2026-10-28', badges: ['new'],
    images: [{ id: ph.unitedLocker, pos: '50% 40%' }],
    kit: { base: '#D7191E', trim: '#111111', text: '#FFFFFF', font: 'modern' },
    stock: ADULT(6, 14, 11, 3, 0),
    blurb: 'Classic United red with black detailing. Lightweight, moisture-wicking knit built for 90 minutes in the stands.',
  },
  {
    id: 'argentina-home-messi', name: 'Argentina Home Shirt — Messi 10', team: 'Argentina',
    cat: 'international', region: 'Argentina', league: 'International', season: 'Current',
    price: 99.99, rating: 4.9, reviews: 1048, added: '2026-09-12', badges: ['bestseller'],
    images: [{ id: ph.argentinaMessi, pos: '50% 50%' }],
    kit: { base: '#FFFFFF', stripe: '#75AADB', pattern: 'stripes', trim: '#1B1B1B', text: '#111111', font: 'modern' },
    preset: { name: 'MESSI', number: '10' }, printIncluded: true,
    stock: ADULT(3, 9, 12, 7, 4),
    blurb: 'The albiceleste stripes with MESSI 10 printed as standard. Print can be swapped for any name at no extra cost.',
  },
  {
    id: 'brazil-home', name: 'Brazil Home Shirt', team: 'Brazil',
    cat: 'international', region: 'Brazil', league: 'International', season: 'Current',
    price: 89.99, rating: 4.8, reviews: 587, added: '2026-10-02', badges: [],
    images: [{ id: ph.brazilHang, pos: '50% 35%' }],
    kit: { base: '#FEDD00', trim: '#009C3B', text: '#009C3B', font: 'modern' },
    stock: ADULT(8, 15, 13, 9, 5),
    blurb: 'Canarinho yellow with green trim — the most recognisable shirt in world football.',
  },
  {
    id: 'arsenal-home-1920', name: 'Arsenal Home Shirt 2019/20', team: 'Arsenal',
    cat: 'retro', region: 'England', league: 'Premier League', season: '2019/20',
    price: 64.99, was: 79.99, rating: 4.9, reviews: 212, added: '2026-08-21', badges: ['sale'],
    images: [{ id: ph.arsenalFront, pos: '50% 45%' }, { id: ph.arsenalBack, pos: '50% 45%' }],
    kit: { base: '#C8102E', sleeves: '#FFFFFF', cuff: '#C8102E', trim: '#FFFFFF', text: '#FFFFFF', font: 'modern' },
    grade: 'A+', stock: ADULT(1, 2, 1, 0, 0),
    blurb: 'Red body, white sleeves — the first season of the modern three-stripe era. Vault-graded A+.',
  },
  {
    id: 'barcelona-away', name: 'Barcelona Away Shirt', team: 'FC Barcelona',
    cat: 'club', region: 'Spain', league: 'La Liga', season: 'Current',
    price: 79.99, rating: 4.7, reviews: 341, added: '2026-10-19', badges: ['new'],
    images: [{ id: ph.barcaAway, pos: '45% 50%' }],
    kit: { base: '#F3C93F', trim: '#A50044', text: '#0E1F4D', font: 'classic' },
    stock: ADULT(4, 10, 8, 6, 2),
    blurb: 'Senyera-inspired gold with blaugrana cuffs. A fan favourite on and off the pitch.',
  },
  {
    id: 'spain-home', name: 'Spain Home Shirt', team: 'Spain',
    cat: 'international', region: 'Spain', league: 'International', season: 'Current',
    price: 84.99, was: 94.99, rating: 4.7, reviews: 266, added: '2026-07-30', badges: ['sale'],
    images: [{ id: ph.spainFans, pos: '50% 40%' }],
    kit: { base: '#C60B1E', trim: '#FFC400', text: '#FFC400', font: 'modern' },
    stock: ADULT(5, 7, 9, 4, 2),
    blurb: 'La Roja in deep red with gold detailing — built for summer tournaments.',
  },
  {
    id: 'barcelona-home-rakuten', name: 'Barcelona Home Shirt — Rakuten Era', team: 'FC Barcelona',
    cat: 'retro', region: 'Spain', league: 'La Liga', season: '2017–22',
    price: 69.99, rating: 4.8, reviews: 154, added: '2026-09-05', badges: [],
    images: [{ id: ph.barcaHome, pos: '50% 50%' }],
    kit: { base: '#A50044', stripe: '#004D98', pattern: 'stripes', trim: '#FDB913', text: '#FDB913', font: 'classic' },
    grade: 'A', stock: ADULT(0, 2, 3, 1, 0),
    blurb: 'Blaugrana stripes from the Rakuten sponsorship years. Authentic, vault-graded A.',
  },
  {
    id: 'colombia-home', name: 'Colombia Home Shirt', team: 'Colombia',
    cat: 'international', region: 'Colombia', league: 'International', season: 'Current',
    price: 79.99, rating: 4.8, reviews: 198, added: '2026-10-24', badges: ['new'],
    images: [{ id: ph.colombia, pos: '50% 30%' }],
    kit: { base: '#FCD116', trim: '#003893', text: '#003893', font: 'classic' },
    stock: ADULT(6, 9, 10, 5, 3),
    blurb: 'Bright amarillo with an all-over tonal graphic and navy trim.',
  },
  {
    id: 'milan-away-bwin', name: 'AC Milan Away Shirt — "bwin" Era', team: 'AC Milan',
    cat: 'retro', region: 'Italy', league: 'Serie A', season: '2006–10',
    price: 74.99, rating: 4.9, reviews: 97, added: '2026-09-28', badges: ['rare'],
    images: [{ id: ph.milanRetro, pos: '42% 45%' }],
    kit: { base: '#F4F4F1', trim: '#C8102E', text: '#111111', font: 'classic' },
    grade: 'A', stock: ADULT(0, 1, 1, 0, 0),
    blurb: 'Clean white away shirt from the Rossoneri’s European-glory years. Only a handful in stock.',
  },
  {
    id: 'brazil-neymar-10', name: 'Brazil Home Shirt — Neymar Jr 10', team: 'Brazil',
    cat: 'international', region: 'Brazil', league: 'International', season: 'Current',
    price: 99.99, rating: 4.8, reviews: 402, added: '2026-08-14', badges: [],
    images: [{ id: ph.neymar, pos: '50% 40%' }],
    kit: { base: '#FEDD00', trim: '#009C3B', text: '#009C3B', font: 'modern' },
    preset: { name: 'NEYMAR JR', number: '10' }, printIncluded: true,
    stock: ADULT(2, 6, 8, 5, 1),
    blurb: 'Brazil home with NEYMAR JR 10 printed as standard. Swap the print for free.',
  },
  {
    id: 'man-utd-home-2122', name: 'Manchester United Home Shirt 2021/22', team: 'Manchester United',
    cat: 'retro', region: 'England', league: 'Premier League', season: '2021/22',
    price: 54.99, was: 69.99, rating: 4.6, reviews: 183, added: '2026-06-18', badges: ['sale'],
    images: [{ id: ph.united2122, pos: '88% 50%' }],
    kit: { base: '#DA291C', trim: '#FFFFFF', text: '#FFFFFF', font: 'modern' },
    grade: 'A', stock: ADULT(2, 3, 2, 1, 0),
    blurb: 'The TeamViewer-era home shirt. Pre-owned, inspected and vault-graded A.',
  },
  {
    id: 'brazil-retro-ls', name: 'Brazil Retro Long-Sleeve Shirt', team: 'Brazil',
    cat: 'retro', region: 'Brazil', league: 'International', season: 'Classic',
    price: 69.99, rating: 4.7, reviews: 121, added: '2026-10-10', badges: [],
    images: [{ id: ph.brazilRetro, pos: '50% 30%' }],
    kit: { base: '#FFE14D', trim: '#00843D', text: '#00843D', font: 'retro' },
    grade: 'A+', stock: ADULT(1, 3, 2, 2, 0),
    blurb: 'Long-sleeve canarinho with green trim. Throwback styling, modern comfort.',
  },
  {
    id: 'kids-match-orange', name: 'Kids Custom Match Shirt — Orange', team: 'Custom',
    cat: 'kids', region: 'Custom', league: 'Kids', season: 'Current',
    price: 29.99, rating: 4.9, reviews: 288, added: '2026-09-20', badges: [],
    images: [{ id: ph.kidOrange, pos: '50% 40%' }],
    kit: { base: '#FF6A13', trim: '#111111', text: '#111111', font: 'modern' },
    stock: { '5-6Y': 8, '7-8Y': 12, '9-10Y': 10, '11-12Y': 6, '13Y': 3 },
    blurb: 'Durable, machine-washable match shirt for young players — add their name and number.',
  },
  {
    id: 'womens-match-navy', name: "Women's Fit Match Shirt — Navy", team: 'Custom',
    cat: 'kids', region: 'Custom', league: "Women's", season: 'Current',
    price: 39.99, rating: 4.8, reviews: 164, added: '2026-10-06', badges: [],
    images: [{ id: ph.womenNavy, pos: '50% 40%' }],
    kit: { base: '#18264A', trim: '#8EC5FF', text: '#8EC5FF', font: 'modern' },
    stock: { XS: 5, S: 9, M: 11, L: 7, XL: 3 },
    blurb: "Tailored women's cut in deep navy with sky-blue print. Made for playing, not just watching.",
  },
  {
    id: 'teamwear-marble', name: 'Pro Teamwear Kit — Marble Black/Gold', team: 'Teamwear',
    cat: 'teamwear', region: 'Custom', league: 'Teamwear', season: 'Current',
    price: 34.99, rating: 4.9, reviews: 76, added: '2026-10-15', badges: ['new'],
    images: [{ id: ph.marbleKit, pos: '50% 45%' }, { id: ph.marbleKit2, pos: '50% 45%' }],
    kit: { base: '#141414', stripe: '#E9E9E9', pattern: 'marble', trim: '#D4AF37', text: '#D4AF37', font: 'modern' },
    stock: ADULT(40, 40, 40, 40, 40),
    blurb: 'Fully sublimated marble design — colours never crack or fade. Squad pricing from £24.99.',
  },
  {
    id: 'teamwear-heritage', name: 'Heritage Teamwear Kit — White/Red/Blue', team: 'Teamwear',
    cat: 'teamwear', region: 'Custom', league: 'Teamwear', season: 'Current',
    price: 32.99, rating: 4.7, reviews: 58, added: '2026-09-02', badges: [],
    images: [{ id: ph.heritageKit, pos: '50% 50%' }],
    kit: { base: '#FAFAFA', stripe: '#D7262E', stripe2: '#1F3F95', pattern: 'band', trim: '#1F3F95', text: '#1F3F95', font: 'classic' },
    stock: ADULT(40, 40, 40, 40, 40),
    blurb: 'Clean white with a bold chest band — a modern take on a classic look.',
  },
];

/* Sample reviews — replace with your real, verified customer reviews */
window.REVIEWS = [
  { name: 'Daniel R.', rating: 5, product: 'argentina-home-messi', title: 'Print looked exactly like the preview', body: 'Typed my son’s name in, saw it on the shirt instantly and that’s exactly what turned up the next day. Lettering is sharp and properly heat-pressed.' },
  { name: 'Aisha K.', rating: 5, product: 'arsenal-home-1920', title: 'Grading was spot on', body: 'Bought an A+ retro shirt and it honestly looks unworn. Love that they photograph and grade every vintage piece — no surprises.' },
  { name: 'Marco T.', rating: 5, product: 'teamwear-marble', title: 'Sorted our whole squad in 10 minutes', body: 'Built the kit online, saw the squad discount kick in at 20 shirts and ordered. Our Sunday league team has never looked this good.' },
  { name: 'Priya S.', rating: 4, product: 'womens-match-navy', title: 'Great fit, finally', body: 'A proper women’s cut that doesn’t look like an afterthought. Size finder recommended M and it fits perfectly.' },
  { name: 'Tom W.', rating: 5, product: 'brazil-home', title: 'Next-day actually meant next-day', body: 'Ordered at 8:40pm, had it before lunch. Checkout showed the price in euros for my brother too, which was handy.' },
  { name: 'Lena M.', rating: 5, product: 'barcelona-away', title: 'Better than the club shop', body: 'Same shirt, cheaper, and the size finder is genuinely useful. The live print preview is a game changer.' },
];
