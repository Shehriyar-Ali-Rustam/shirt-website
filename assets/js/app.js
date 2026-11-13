/* =========================================================================
   TOUCHLINE — storefront app (vanilla JS, no build step)
   ========================================================================= */
(() => {
  'use strict';

  const S = window.STORE;
  const P = window.PRODUCTS;
  const CATS = window.CATEGORIES;
  const PH = window.PHOTOS;
  const IMG = window.IMG;
  const REVIEWS = window.REVIEWS;
  const renderShirt = window.renderShirt;

  /* ---------- utils ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const byId = (id) => P.find((p) => p.id === id);
  const esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const r2 = (v) => Math.round(v * 100) / 100;
  const pad = (n) => String(n).padStart(2, '0');
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const store = {
    get(k, d) {
      try {
        const v = localStorage.getItem('touchline:' + k);
        return v == null ? d : JSON.parse(v);
      } catch {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem('touchline:' + k, JSON.stringify(v));
      } catch {
        /* storage unavailable — app still works for this visit */
      }
    },
  };

  function sanitizeCart(c) {
    return Array.isArray(c) ? c.filter((i) => i && i.qty > 0 && (i.custom || byId(i.id))) : [];
  }

  const savedCur = store.get('currency', 'GBP');
  const savedPromo = store.get('promo', null);
  const state = {
    cat: 'all',
    region: 'all',
    size: 'all',
    maxPrice: 100,
    sale: false,
    sort: 'featured',
    currency: S.currencies[savedCur] ? savedCur : 'GBP',
    cart: sanitizeCart(store.get('cart', [])),
    wish: (store.get('wish', []) || []).filter(byId),
    recent: (store.get('recent', []) || []).filter(byId),
    promo: savedPromo && S.promoCodes[savedPromo] ? savedPromo : null,
  };

  /* ---------- money ---------- */
  const cur = () => S.currencies[state.currency];
  const conv = (gbp) => {
    if (!gbp) return 0;
    if (state.currency === 'GBP') return gbp;
    const c = cur();
    if (c.step) return Math.ceil((gbp * c.rate) / c.step) * c.step - 1;
    return Math.max(0.99, Math.round(gbp * c.rate) - 0.01);
  };
  const roundCur = (v) => (cur().decimals === 0 ? Math.round(v) : r2(v));
  const fmt = (v) => {
    const c = cur();
    const opts = { style: 'currency', currency: state.currency };
    if (c.decimals === 0) Object.assign(opts, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    return new Intl.NumberFormat(c.locale, opts).format(v);
  };
  const price = (gbp) => fmt(conv(gbp));

  /* ---------- icons ---------- */
  const ICON = {
    heart:
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5C19 15.6 12 20 12 20z"/></svg>',
    star: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>',
    arrow:
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    truck:
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>',
    check:
      '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4.5 4.5L19 7"/></svg>',
    bag: '<svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M5 8h14l-1.2 12H6.2L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    heartBig:
      '<svg viewBox="0 0 24 24" width="52" height="52" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 20s-7-4.4-9.2-9A5 5 0 0 1 12 6a5 5 0 0 1 9.2 5C19 15.6 12 20 12 20z"/></svg>',
    info: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.5"/></svg>',
  };
  const stars = (n) =>
    Array.from({ length: 5 }, (_, i) => `<span style="opacity:${i < Math.round(n) ? 1 : 0.25}">${ICON.star}</span>`).join('');

  /* ---------- images ---------- */
  function srcset(id, w) {
    return [0.5, 1, 1.5].map((m) => `${IMG(id, w * m)} ${Math.round(w * m)}w`).join(', ');
  }
  function img(photo, w, alt = '', opts = {}) {
    const id = photo.id || photo;
    const pos = photo.pos ? ` style="object-position:${photo.pos}"` : '';
    return `<img src="${IMG(id, w)}" srcset="${srcset(id, w)}" sizes="${opts.sizes || w + 'px'}" alt="${esc(alt)}"${pos} loading="${
      opts.eager ? 'eager' : 'lazy'
    }" decoding="async">`;
  }
  function setImg(sel, id, w, sizes) {
    const el = $(sel);
    if (!el) return;
    el.srcset = srcset(id, w);
    el.sizes = sizes;
    el.src = IMG(id, w);
  }

  /* ---------- product helpers ---------- */
  const canPrint = (p) => p.cat !== 'retro';
  const hasEdition = (p) => p.cat === 'club' || p.cat === 'international';
  const sizesOf = (p) => Object.keys(p.stock);
  const totalStock = (p) => Object.values(p.stock).reduce((a, b) => a + b, 0);
  const isAdult = (p) => 'M' in p.stock;
  const hasPrint = (i) => !!(i.name || (i.number !== '' && i.number != null));
  const sanitizeName = (v) => v.replace(/[^\p{L} .'\-]/gu, '').slice(0, 12);
  const sanitizeNum = (v) => v.replace(/\D/g, '').slice(0, 2);
  function metaLine(p) {
    switch (p.cat) {
      case 'club': return `Club · ${p.league}`;
      case 'international': return `International · ${p.region}`;
      case 'retro': return `Retro · ${p.season}`;
      case 'kids': return p.league;
      default: return 'Teamwear · squad pricing';
    }
  }
  const GRADES = {
    'A+': { t: 'Grade A+ · Like new', d: 'No visible wear. Authenticated and photographed by our vault team.' },
    A: { t: 'Grade A · Excellent', d: 'Light signs of wear, crest and sponsor fully intact. Authenticated.' },
    B: { t: 'Grade B · Good', d: 'Visible wear, fully described and photographed.' },
  };

  function badgesHTML(p) {
    const b = [];
    if (p.badges.includes('new')) b.push('<span class="badge new">New</span>');
    if (p.was) b.push(`<span class="badge sale">−${Math.round((1 - p.price / p.was) * 100)}%</span>`);
    if (p.grade) b.push(`<span class="badge grade">Grade ${p.grade}</span>`);
    if (p.badges.includes('rare')) b.push('<span class="badge rare">Rare</span>');
    if (p.badges.includes('bestseller')) b.push('<span class="badge">Bestseller</span>');
    if (totalStock(p) <= 4) b.push('<span class="badge low">Almost gone</span>');
    return b.slice(0, 2).join('');
  }

  /* ---------- product card ---------- */
  function cardHTML(p, i = 0) {
    const wished = state.wish.includes(p.id);
    let alt = '';
    if (p.images[1]) {
      alt = img(p.images[1], 420, '', { sizes: '(max-width: 760px) 50vw, 320px' });
    } else if (canPrint(p)) {
      const opts = p.preset
        ? { name: p.preset.name, number: p.preset.number }
        : { name: 'YOUR NAME', number: '10', ghost: true };
      alt = `${renderShirt(p.kit, opts)}<span class="alt-tag">Back print preview</span>`;
    }
    const sizes = sizesOf(p)
      .map(
        (s) =>
          `<button class="qs" data-quick="${p.id}" data-size="${s}" ${p.stock[s] ? '' : 'disabled'} aria-label="Quick add size ${s}">${s.replace('Y', '')}</button>`
      )
      .join('');
    const swatches = [p.kit.base, p.kit.stripe || p.kit.sleeves, p.kit.trim]
      .filter(Boolean)
      .map((c) => `<i class="sw" style="background:${c}"></i>`)
      .join('');
    return `<article class="card" data-id="${p.id}" style="animation-delay:${Math.min(i, 12) * 45}ms">
      <div class="card-media" data-open="${p.id}">
        ${img(p.images[0], 420, p.name, { sizes: '(max-width: 760px) 50vw, 320px' })}
        ${alt ? `<div class="card-alt" aria-hidden="true">${alt}</div>` : ''}
        <div class="badges">${badgesHTML(p)}</div>
        <button class="wish-btn" data-wish="${p.id}" aria-pressed="${wished}" aria-label="Save ${esc(p.name)} to wishlist">${ICON.heart}</button>
        <div class="quick"><div class="quick-label"><span>Quick add</span><span>${p.preset ? `incl. ${esc(p.preset.name)} ${p.preset.number}` : 'Pick a size'}</span></div><div class="quick-sizes">${sizes}</div></div>
      </div>
      <div class="card-body">
        <div class="card-meta">${esc(metaLine(p))}</div>
        <h3 class="card-title"><button data-open="${p.id}">${esc(p.name)}</button></h3>
        <div class="rating">${ICON.star}<b>${p.rating.toFixed(1)}</b><span>(${p.reviews.toLocaleString('en-GB')})</span></div>
        <div class="card-foot">
          <div class="price ${p.was ? 'sale-price' : ''}">${price(p.price)}${p.was ? `<s>${price(p.was)}</s>` : ''}${
      p.cat === 'teamwear' ? '<small class="per"> /shirt</small>' : ''
    }</div>
          <div class="swatches" aria-hidden="true">${swatches}</div>
        </div>
      </div>
    </article>`;
  }

  /* ---------- categories ---------- */
  const CAT_TILES = [
    { cat: 'club', title: 'Club', sub: 'Premier League, La Liga & more', photo: { id: PH.unitedLocker, pos: '50% 35%' } },
    { cat: 'international', title: 'International', sub: 'Wear your country’s colours', photo: { id: PH.argentinaMessi, pos: '50% 50%' } },
    { cat: 'retro', title: 'Retro Vault', sub: 'Graded vintage classics', photo: { id: PH.retroRack, pos: '50% 50%' } },
    { cat: 'kids', title: "Kids & Women's", sub: 'Fits for every fan', photo: { id: PH.kidOrange, pos: '50% 30%' } },
    { cat: 'teamwear', title: 'Teamwear', sub: 'Custom kits, squad pricing', photo: { id: PH.marbleKit, pos: '50% 40%' } },
  ];
  const countCat = (c) => (c === 'all' ? P.length : P.filter((p) => p.cat === c).length);

  function renderCats() {
    $('#catGrid').innerHTML = CAT_TILES.map(
      (t, i) => `<button class="cat-tile reveal" data-filter-cat="${t.cat}" style="transition-delay:${i * 70}ms">
        ${img(t.photo, i === 0 ? 900 : 600, '', { sizes: i === 0 ? '(max-width: 760px) 100vw, 45vw' : '(max-width: 760px) 50vw, 30vw' })}
        <span class="cat-label"><span><b>${t.title}</b><small>${t.sub} · ${countCat(t.cat)} styles</small></span><span class="cat-go">${ICON.arrow}</span></span>
      </button>`
    ).join('');
  }

  /* ---------- shop: filters + grid ---------- */
  function renderChips() {
    const cats = [['all', 'All shirts'], ...Object.entries(CATS)];
    $('#catChips').innerHTML = cats
      .map(
        ([k, label]) =>
          `<button class="chip" role="tab" data-chip="${k}" aria-selected="${state.cat === k}">${label}<span class="n">${countCat(k)}</span></button>`
      )
      .join('');
  }
  function renderRegionOptions() {
    const regions = [...new Set(P.map((p) => p.region))].sort((a, b) => (a === 'Custom') - (b === 'Custom') || a.localeCompare(b));
    $('#fRegion').innerHTML =
      '<option value="all">All countries</option>' +
      regions.map((r) => `<option value="${esc(r)}">${r === 'Custom' ? 'Custom & teamwear' : esc(r)}</option>`).join('');
  }

  function filtered() {
    const list = P.filter(
      (p) =>
        (state.cat === 'all' || p.cat === state.cat) &&
        (state.region === 'all' || p.region === state.region) &&
        (state.size === 'all' || (p.stock[state.size] || 0) > 0) &&
        (state.maxPrice >= 100 || p.price <= state.maxPrice) &&
        (!state.sale || !!p.was)
    );
    const by = {
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
      new: (a, b) => b.added.localeCompare(a.added),
    }[state.sort];
    return by ? list.sort(by) : list;
  }

  function syncControls() {
    $('#fRegion').value = state.region;
    $('#fSize').value = state.size;
    $('#fSort').value = state.sort;
    $('#fSale').checked = state.sale;
    $('#fPrice').value = state.maxPrice;
    $('#fPriceOut').textContent = state.maxPrice >= 100 ? 'Any price' : price(state.maxPrice);
    $$('#catChips .chip').forEach((c) => c.setAttribute('aria-selected', c.dataset.chip === state.cat));
  }

  function renderGrid() {
    const list = filtered();
    $('#grid').innerHTML = list.map(cardHTML).join('');
    $('#emptyState').hidden = list.length > 0;
    $('#resultCount').textContent = `Showing ${list.length} of ${P.length} shirts`;
    syncControls();
  }

  function resetFilters() {
    Object.assign(state, { cat: 'all', region: 'all', size: 'all', maxPrice: 100, sale: false, sort: 'featured' });
  }
  function applyCat(c, keepFilters = false) {
    if (!keepFilters) resetFilters();
    if (c === 'sale') {
      state.cat = 'all';
      state.sale = true;
    } else {
      state.cat = c === 'all' || c in CATS ? c : 'all';
    }
    renderGrid();
  }

  /* ---------- rails ---------- */
  function renderVault() {
    $('#vaultRail').innerHTML = P.filter((p) => p.cat === 'retro').map(cardHTML).join('');
  }
  function addRecent(id) {
    state.recent = [id, ...state.recent.filter((x) => x !== id)].slice(0, 10);
    store.set('recent', state.recent);
  }
  function renderRecent() {
    const items = state.recent.map(byId).filter(Boolean);
    $('#recentSec').hidden = items.length === 0;
    $('#recentRail').innerHTML = items.map(cardHTML).join('');
  }

  /* ---------- wishlist ---------- */
  function toggleWish(id) {
    const p = byId(id);
    if (!p) return;
    const i = state.wish.indexOf(id);
    const on = i < 0;
    if (on) state.wish.unshift(id);
    else state.wish.splice(i, 1);
    store.set('wish', state.wish);
    $$(`.wish-btn[data-wish="${id}"], .buy-row [data-wish="${id}"]`).forEach((b) => b.setAttribute('aria-pressed', on));
    updateCounts(false);
    renderWish();
    if (on)
      toast(
        `${img(p.images[0], 120, '')}<div><b>Saved to wishlist</b><small>${esc(p.name)}</small></div><button class="btn btn-light" data-action="open-wish">View</button>`
      );
  }
  function renderWish() {
    const box = $('#wishItems');
    const items = state.wish.map(byId).filter(Boolean);
    if (!items.length) {
      box.innerHTML = `<div class="empty-bag">${ICON.heartBig}<h4>No saved shirts yet</h4><p>Tap the heart on any shirt to save it here.</p><a class="btn btn-primary" href="#shop" data-action="close-go">Browse shirts</a></div>`;
      return;
    }
    box.innerHTML = items
      .map(
        (p) => `<div class="wish-item">
          <button class="li-thumb" data-open="${p.id}" aria-label="View ${esc(p.name)}">${img(p.images[0], 180, p.name)}</button>
          <div>
            <div class="li-top"><b>${esc(p.name)}</b><span class="li-price">${price(p.price)}</span></div>
            <div class="li-meta">${esc(metaLine(p))}</div>
            <div class="btns"><button class="btn btn-primary btn-sm" data-open="${p.id}">Choose size</button><button class="remove-btn" data-wish="${p.id}">Remove</button></div>
          </div>
        </div>`
      )
      .join('');
  }

  /* ---------- cart ---------- */
  const itemKey = (i) =>
    [i.id, i.size, i.edition || '', i.name || '', i.number ?? '', i.font || '', i.custom ? JSON.stringify(i.custom) : ''].join('|');
  const tierFor = (qty) => [...S.teamwearTiers].reverse().find((t) => qty >= t.min) || S.teamwearTiers[0];
  const itemTitle = (i) => (i.custom ? i.custom.label : byId(i.id).name);

  function unitPrice(i) {
    if (i.custom) return conv(tierFor(i.qty).price);
    const p = byId(i.id);
    let u = conv(p.price);
    if (i.edition === 'authentic') u += conv(S.authenticUpcharge);
    if (hasPrint(i) && !p.printIncluded) u += conv(S.printPrice);
    return r2(u);
  }
  function totals() {
    const sub = r2(state.cart.reduce((a, i) => a + unitPrice(i) * i.qty, 0));
    const promo = state.promo && S.promoCodes[state.promo];
    const disc = promo ? roundCur((sub * promo.pct) / 100) : 0;
    return { sub, disc, after: r2(sub - disc), count: state.cart.reduce((a, i) => a + i.qty, 0) };
  }
  const saveCart = () => store.set('cart', state.cart);
  const sameSizeQty = (id, size, except) =>
    state.cart.filter((c) => c !== except && !c.custom && c.id === id && c.size === size).reduce((a, c) => a + c.qty, 0);

  function addToCart(item) {
    item = { ...item };
    if (!item.custom) {
      const p = byId(item.id);
      const max = p.stock[item.size] || 0;
      const room = max - sameSizeQty(item.id, item.size);
      if (room <= 0) {
        toast(`<span class="t-icon">${ICON.info}</span><div><b>That's all we have</b><small>All ${max} in size ${esc(item.size)} are already in your bag</small></div>`);
        return false;
      }
      if (item.qty > room) item.qty = room;
    }
    const key = itemKey(item);
    const ex = state.cart.find((c) => itemKey(c) === key);
    if (ex) ex.qty += item.qty;
    else state.cart.push(item);
    saveCart();
    renderCart();
    updateCounts(true);
    toastAdded(item);
    return true;
  }
  function changeQty(idx, d) {
    const i = state.cart[idx];
    if (!i) return;
    const next = i.qty + d;
    if (next <= 0) return removeItem(idx);
    const max = i.custom ? 200 : (byId(i.id).stock[i.size] || 0) - sameSizeQty(i.id, i.size, i);
    if (next > max) {
      toast(`<span class="t-icon">${ICON.info}</span><div><b>Limited stock</b><small>Only ${max} available in size ${esc(i.size)}</small></div>`);
      return;
    }
    i.qty = next;
    saveCart();
    renderCart();
    updateCounts(false);
  }
  function removeItem(idx) {
    state.cart.splice(idx, 1);
    saveCart();
    renderCart();
    updateCounts(false);
  }

  function toastAdded(item) {
    const p = item.custom ? null : byId(item.id);
    const thumb = p
      ? img(p.images[0], 120, '')
      : `<span class="t-svg">${renderShirt(item.custom.kit, { name: item.name, number: item.number, font: item.font })}</span>`;
    const detail = [item.size, hasPrint(item) ? [item.name, item.number].filter(Boolean).join(' ') : ''].filter(Boolean).join(' · ');
    toast(
      `${thumb}<div><b>Added to bag${item.qty > 1 ? ` (${item.qty})` : ''}</b><small>${esc(itemTitle(item))}${detail ? ' · ' + esc(detail) : ''}</small></div><button class="btn btn-light" data-action="open-cart">View bag</button>`
    );
  }

  function lineHTML(i, idx) {
    const p = i.custom ? null : byId(i.id);
    const thumb = p ? img(p.images[0], 180, p.name) : renderShirt(i.custom.kit, { name: i.name, number: i.number, font: i.font });
    const meta = [];
    if (i.size) meta.push(i.custom ? esc(i.size) : `Size ${esc(i.size)}`);
    if (i.edition) meta.push(i.edition === 'authentic' ? 'Authentic edition' : 'Fan edition');
    if (hasPrint(i)) meta.push(`<span class="print-chip">Print: ${esc([i.name, i.number].filter(Boolean).join(' '))}</span>`);
    if (i.custom) meta.push(`${fmt(unitPrice(i))} per shirt`);
    return `<div class="line-item">
      <div class="li-thumb">${thumb}</div>
      <div>
        <div class="li-top"><b>${esc(itemTitle(i))}</b><span class="li-price">${fmt(r2(unitPrice(i) * i.qty))}</span></div>
        <div class="li-meta">${meta.map((m) => `<span>${m}</span>`).join('')}</div>
        <div class="li-actions">
          <div class="stepper"><button data-qty="${idx}" data-d="-1" aria-label="Decrease quantity">−</button><span>${i.qty}</span><button data-qty="${idx}" data-d="1" aria-label="Increase quantity">+</button></div>
          <button class="remove-btn" data-remove="${idx}">Remove</button>
        </div>
      </div>
    </div>`;
  }

  function renderCart() {
    const t = totals();
    const thr = conv(S.freeShipping);
    const left = r2(thr - t.after);
    const bar = $('#shipBar');
    bar.hidden = !state.cart.length;
    bar.innerHTML = state.cart.length
      ? `${left > 0 ? `You're <b>${fmt(left)}</b> away from free delivery` : '<b>You’ve unlocked free delivery</b>'}<div class="bar"><i style="width:${clamp(
          (t.after / thr) * 100,
          4,
          100
        )}%"></i></div>`
      : '';
    $('#cartHeadCount').textContent = t.count ? `(${t.count})` : '';
    const foot = $('#cartFoot');
    if (!state.cart.length) {
      $('#cartItems').innerHTML = `<div class="empty-bag">${ICON.bag}<h4>Your bag is empty</h4><p>Let’s find you a shirt.</p><a class="btn btn-primary" href="#shop" data-action="close-go">Shop shirts</a></div>`;
      foot.hidden = true;
      foot.innerHTML = '';
      return;
    }
    foot.hidden = false;
    $('#cartItems').innerHTML = state.cart.map(lineHTML).join('');
    const promo = state.promo && S.promoCodes[state.promo];
    foot.innerHTML = `
      <form class="promo-form" id="promoForm">
        <input class="input" id="promoInput" placeholder="Promo code" value="${esc(state.promo || '')}" aria-label="Promo code" autocomplete="off">
        <button class="btn btn-ghost" type="submit">Apply</button>
      </form>
      <p class="promo-msg ${promo ? 'ok' : ''}" id="promoMsg" role="status">${
        promo ? `✓ ${esc(state.promo)}: ${esc(promo.label)} · <button class="remove-btn" data-action="remove-promo">Remove</button>` : ''
      }</p>
      <div class="totals">
        <div><span>Subtotal</span><span>${fmt(t.sub)}</span></div>
        ${t.disc ? `<div class="disc"><span>Discount</span><span>−${fmt(t.disc)}</span></div>` : ''}
        <div><span>Delivery</span><span>${left <= 0 ? 'Free' : 'From ' + price(S.delivery[0].price)}</span></div>
        <div class="grand"><span>Total</span><span>${fmt(t.after)}</span></div>
      </div>
      <button class="btn btn-primary btn-block" data-action="checkout">Checkout securely</button>
      <p class="drawer-note">Card · PayPal · Apple Pay · Klarna — 365-day free returns</p>`;
  }

  function updateCounts(bump = true) {
    const c = totals().count;
    const w = state.wish.length;
    const cc = $('#cartCount');
    const wc = $('#wishCount');
    cc.textContent = c;
    cc.hidden = !c;
    wc.textContent = w;
    wc.hidden = !w;
    if (bump && c) {
      cc.classList.remove('bump');
      void cc.offsetWidth;
      cc.classList.add('bump');
    }
  }

  function quickAdd(id, size) {
    const p = byId(id);
    if (!p) return;
    const item = { id, size, edition: hasEdition(p) ? 'fan' : null, qty: 1 };
    if (p.preset) Object.assign(item, { name: p.preset.name, number: p.preset.number, font: p.kit.font || 'modern' });
    addToCart(item);
  }

  /* ---------- product modal ---------- */
  let pm = null;

  function pmViews() {
    const v = pm.p.images.map((im) => ({ type: 'img', im }));
    if (canPrint(pm.p)) v.push({ type: 'print' });
    return v;
  }
  const printIdx = () => pmViews().findIndex((v) => v.type === 'print');
  const pmPrintOpts = () =>
    pm.print && (pm.name || pm.number)
      ? { name: pm.name, number: pm.number, font: pm.font }
      : { name: 'YOUR NAME', number: '10', font: pm.font, ghost: true };

  function openProduct(id) {
    const p = byId(id);
    if (!p) return;
    pm = {
      p,
      edition: hasEdition(p) ? 'fan' : null,
      size: null,
      print: !!p.preset,
      name: p.preset?.name || '',
      number: p.preset?.number || '',
      font: p.kit.font || 'modern',
      qty: 1,
      view: 0,
    };
    renderPM();
    const modal = $('#productModal');
    openLayer(modal, '.modal-close');
    $('.modal-scroll', modal).scrollTop = 0;
    addRecent(id);
    try {
      history.replaceState(null, '', '#shirt/' + id);
    } catch {
      /* file:// in some browsers */
    }
  }

  function detailsList(p) {
    if (p.cat === 'retro')
      return [
        'Original pre-owned shirt, authenticated by hand',
        `Condition grade ${p.grade}, photographed front, back and labels`,
        'Professionally cleaned and steamed before dispatch',
        'Covered by our money-back authenticity guarantee',
      ];
    if (p.cat === 'teamwear')
      return [
        'Fully sublimated print, so colours never crack or fade',
        'Lightweight, breathable recycled polyester',
        'Squad pricing applies automatically in the kit builder',
        'Free badge and sponsor logo set-up on orders of 10+',
      ];
    return [
      'Moisture-wicking, lightweight recycled polyester',
      hasEdition(p) ? 'Fan edition: regular stadium fit · Authentic: slim player cut' : 'Regular fit, built for playing',
      'Machine wash at 30°C inside out',
      'Name and number heat-pressed in our studio within 24 hours',
    ];
  }

  function renderPM() {
    const { p } = pm;
    const views = pmViews();
    const wished = state.wish.includes(p.id);
    const revs = REVIEWS.filter((r) => r.product === p.id);
    const related = P.filter((x) => x.id !== p.id && (x.cat === p.cat || x.region === p.region))
      .concat(P.filter((x) => x.id !== p.id))
      .filter((x, i, a) => a.indexOf(x) === i)
      .slice(0, 4);
    const lowSizes = sizesOf(p).filter((s) => p.stock[s] > 0 && p.stock[s] <= 3);

    $('#pmContent').innerHTML = `
    <div class="pm">
      <div class="pm-gallery">
        <div class="pm-main" id="pmMain"></div>
        ${
          views.length > 1
            ? `<div class="pm-thumbs" role="group" aria-label="Product views">${views
                .map(
                  (v, i) =>
                    `<button class="pm-thumb" data-view="${i}" aria-pressed="${i === pm.view}" aria-label="${
                      v.type === 'print' ? 'Back print preview' : 'Photo ' + (i + 1)
                    }">${v.type === 'img' ? img(v.im, 160, '') : renderShirt(p.kit, pmPrintOpts())}</button>`
                )
                .join('')}</div>`
            : ''
        }
      </div>
      <div class="pm-info">
        <div class="pm-meta"><span class="card-meta">${esc(metaLine(p))}</span><span class="rating"><span class="stars">${stars(p.rating)}</span> <b>${p.rating.toFixed(
      1
    )}</b> · ${p.reviews.toLocaleString('en-GB')} reviews</span></div>
        <h2 class="pm-title">${esc(p.name)}</h2>
        <div class="pm-price-row"><span class="pm-price" id="pmPrice"></span>${
          p.was ? `<s>${price(p.was)}</s><span class="save-pill">Save ${fmt(r2(conv(p.was) - conv(p.price)))}</span>` : ''
        }</div>
        <p class="pm-blurb">${esc(p.blurb)}</p>

        ${
          hasEdition(p)
            ? `<div class="pm-block"><h4>Edition</h4><div class="opt-cards">
            <button class="opt" data-edition="fan" aria-pressed="${pm.edition === 'fan'}"><b>Fan <span>${price(p.price)}</span></b><small>Regular stadium fit · breathable knit</small></button>
            <button class="opt" data-edition="authentic" aria-pressed="${pm.edition === 'authentic'}"><b>Authentic <span>+${price(
                S.authenticUpcharge
              )}</span></b><small>Player-issue slim cut · heat-applied crest</small></button>
          </div></div>`
            : ''
        }

        ${
          p.grade
            ? `<div class="pm-block"><div class="grade-box"><b>${p.grade}</b><span><strong>${GRADES[p.grade].t}</strong>${GRADES[p.grade].d}</span></div></div>`
            : ''
        }

        <div class="pm-block">
          <h4>Size ${isAdult(p) ? '<button class="link-btn" data-action="size-finder" data-context="pm">Find my size</button>' : '<small>Age in years</small>'}</h4>
          <div class="sizes" id="pmSizes" role="group" aria-label="Size">${sizesOf(p)
            .map(
              (s) =>
                `<button class="size ${p.stock[s] > 0 && p.stock[s] <= 3 ? 'low' : ''}" data-size="${s}" aria-pressed="${pm.size === s}" ${
                  p.stock[s] ? '' : 'disabled'
                }>${s}</button>`
            )
            .join('')}</div>
          <p class="stock-note ${lowSizes.length ? 'low' : ''}" id="pmStock">${
            lowSizes.length ? `Low stock in ${lowSizes.join(', ')}. Order soon.` : 'In stock and ready to dispatch'
          }</p>
        </div>

        ${
          canPrint(p)
            ? `<div class="pm-block"><div class="print-box">
            <label class="print-toggle">
              <span><b>${p.printIncluded ? 'Name & number included' : 'Add a name & number'}</b><small>${
                p.printIncluded ? 'Keep the player print or swap it for your own, free' : '+' + price(S.printPrice) + ' · see it live on the shirt'
              }</small></span>
              <input type="checkbox" class="sr-only" id="pmPrintToggle" ${pm.print ? 'checked' : ''}><span class="switch" aria-hidden="true"></span>
            </label>
            <div class="print-fields" id="pmPrintFields" ${pm.print ? '' : 'hidden'}>
              <div class="row2">
                <div class="field"><label for="pmName">Name <small class="char-count" id="pmNameCount">${pm.name.length}/12</small></label><input id="pmName" class="input big" maxlength="12" value="${esc(
                  pm.name
                )}" placeholder="YOUR NAME" autocomplete="off" spellcheck="false"></div>
                <div class="field"><label for="pmNum">Number</label><input id="pmNum" class="input big" inputmode="numeric" maxlength="2" value="${esc(
                  pm.number
                )}" placeholder="10" autocomplete="off"></div>
              </div>
              <div class="seg" id="pmFont" role="group" aria-label="Lettering style">${['modern', 'classic', 'retro']
                .map((f) => `<button type="button" data-pmfont="${f}" data-font="${f}" aria-pressed="${pm.font === f}">${cap(f)}</button>`)
                .join('')}</div>
            </div>
          </div></div>`
            : ''
        }

        <div class="pm-block">
          <div class="buy-row">
            <div class="stepper lg" aria-label="Quantity"><button data-pmqty="-1" aria-label="Decrease quantity">−</button><span id="pmQty">${pm.qty}</span><button data-pmqty="1" aria-label="Increase quantity">+</button></div>
            <button class="btn btn-primary" data-action="pm-add">Add to bag · <span id="pmAddPrice"></span></button>
            <button class="icon-btn" data-wish="${p.id}" aria-pressed="${wished}" aria-label="Save to wishlist">${ICON.heart}</button>
          </div>
          <div class="delivery-line">${ICON.truck}<span><b data-delivery-countdown>${deliveryText()}</b><br>Free UK delivery over ${price(
      S.freeShipping
    )} · 365-day free returns</span></div>
        </div>

        <details class="acc" open><summary>Product details</summary><div class="acc-body"><ul>${detailsList(p)
          .map((d) => `<li>${esc(d)}</li>`)
          .join('')}</ul></div></details>
        <details class="acc"><summary>Delivery &amp; returns</summary><div class="acc-body"><ul>
          ${S.delivery.map((d) => `<li><b>${d.label}</b>: ${d.eta}, ${d.freeOver ? `free over ${price(S.freeShipping)}, otherwise ` : ''}${price(d.price)}</li>`).join('')}
          <li>Free returns within 365 days. Personalised shirts can be exchanged for a different size.</li>
        </ul></div></details>
        <details class="acc"><summary>Authenticity promise</summary><div class="acc-body">Every shirt we sell is sourced from official suppliers or authenticated by hand in our vault. If you ever doubt a shirt’s authenticity, we’ll refund you in full and pay for the return.</div></details>
      </div>
    </div>
    ${revs.length ? `<div class="pm-reviews"><h3>What fans say</h3><div class="reviews-grid">${revs.map((r) => reviewHTML(r, false)).join('')}</div></div>` : ''}
    <div class="pm-related"><h3>You might also like</h3><div class="mini-grid">${related
      .map((x) => `<button class="mini" data-open="${x.id}">${img(x.images[0], 300, x.name, { sizes: '220px' })}<div><b>${esc(x.name)}</b>${price(x.price)}</div></button>`)
      .join('')}</div></div>`;
    pmRenderMain();
    pmRenderPrice();
  }

  function pmRenderMain() {
    const views = pmViews();
    const v = views[pm.view] || views[0];
    const main = $('#pmMain');
    if (!main) return;
    main.innerHTML =
      v.type === 'img'
        ? img(v.im, 800, pm.p.name, { sizes: '(max-width: 1000px) 100vw, 620px', eager: true })
        : `<div class="pm-print"><span class="pm-print-tag"><i class="pulse"></i> Live back preview</span>${renderShirt(pm.p.kit, pmPrintOpts())}</div>`;
    $$('#pmContent .pm-thumb').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.view === pm.view));
  }
  function pmUpdatePrint() {
    const pi = printIdx();
    if (pi < 0) return;
    if (pm.view !== pi) pm.view = pi;
    const svg = renderShirt(pm.p.kit, pmPrintOpts());
    const stage = $('#pmMain .pm-print');
    if (stage) stage.querySelector('svg').outerHTML = svg;
    else pmRenderMain();
    const th = $(`#pmContent .pm-thumb[data-view="${pi}"]`);
    if (th) th.innerHTML = renderShirt(pm.p.kit, pmPrintOpts());
    $$('#pmContent .pm-thumb').forEach((b) => b.setAttribute('aria-pressed', +b.dataset.view === pm.view));
    const cc = $('#pmNameCount');
    if (cc) cc.textContent = `${pm.name.length}/12`;
    pmRenderPrice();
  }
  function pmUnit() {
    return unitPrice({
      id: pm.p.id,
      edition: pm.edition,
      name: pm.print ? pm.name : '',
      number: pm.print ? pm.number : '',
    });
  }
  function pmRenderPrice() {
    const u = pmUnit();
    const a = $('#pmPrice');
    const b = $('#pmAddPrice');
    if (a) a.textContent = fmt(u);
    if (b) b.textContent = fmt(r2(u * pm.qty));
  }
  function pmSelectSize(s) {
    if (!pm || !pm.p.stock[s]) return;
    pm.size = s;
    $$('#pmSizes .size').forEach((b) => b.setAttribute('aria-pressed', b.dataset.size === s));
    const n = pm.p.stock[s];
    const note = $('#pmStock');
    note.className = 'stock-note' + (n <= 3 ? ' low' : '');
    note.textContent = n <= 3 ? `Only ${n} left in ${s}. Order soon.` : `Size ${s} in stock and ready to dispatch`;
    if (pm.qty > n) {
      pm.qty = n;
      $('#pmQty').textContent = pm.qty;
      pmRenderPrice();
    }
  }
  function pmAdd() {
    if (!pm.size) {
      const box = $('#pmSizes');
      box.classList.remove('shake');
      void box.offsetWidth;
      box.classList.add('shake');
      const n = $('#pmStock');
      n.className = 'stock-note err';
      n.textContent = 'Please choose a size first';
      box.scrollIntoView({ block: 'center', behavior: reduceMotion() ? 'auto' : 'smooth' });
      return;
    }
    const item = { id: pm.p.id, size: pm.size, edition: pm.edition, qty: pm.qty };
    if (pm.print && (pm.name || pm.number)) Object.assign(item, { name: pm.name.trim(), number: pm.number, font: pm.font });
    if (addToCart(item)) closeLayer($('#productModal'));
  }

  /* ---------- size finder ---------- */
  let sfContext = null;
  let sfFit = 0;
  const SIZE_ORDER = ['S', 'M', 'L', 'XL', 'XXL'];
  function calcSize(h, w, fit) {
    const hi = h < 170 ? 0 : h < 178 ? 1 : h < 185 ? 2 : h < 192 ? 3 : 4;
    const wi = w < 64 ? 0 : w < 76 ? 1 : w < 88 ? 2 : w < 100 ? 3 : 4;
    return SIZE_ORDER[clamp(Math.round(hi * 0.4 + wi * 0.6) + fit, 0, 4)];
  }
  function openSizeFinder(ctx) {
    sfContext = ctx || null;
    $('#sfResult').hidden = true;
    openLayer($('#sizeModal'), '#sfH');
  }
  function runSizeFinder() {
    const h = +$('#sfH').value;
    const w = +$('#sfW').value;
    if (!h || !w) return;
    const size = calcSize(h, w, sfFit);
    const fitWord = { '-1': 'fitted', 0: 'regular', 1: 'relaxed' }[sfFit];
    let action = '';
    const target = sfContext === 'pm' && pm ? pm.p : sfContext === 'studio' ? byId(studio.id) : null;
    if (target) {
      action = target.stock[size]
        ? `<button class="btn btn-primary btn-sm" data-action="sf-apply" data-size="${size}">Select ${size}</button>`
        : `<p><b>${size} is sold out</b> in this shirt. Try the size above or below.</p>`;
    }
    const box = $('#sfResult');
    box.innerHTML = `<div class="big-size">${size}</div><div><p>At <b>${h} cm</b> and <b>${w} kg</b> with a <b>${fitWord}</b> fit, we recommend <b>${size}</b>. Authentic editions are slim cut, so size up if you like more room.</p>${action}</div>`;
    box.hidden = false;
  }

  /* ---------- print studio ---------- */
  const studioProducts = P.filter((p) => canPrint(p) && p.cat !== 'teamwear');
  const studio = { id: 'man-utd-home-2425', name: '', number: '', font: 'modern', size: 'M' };

  function renderStudioOptions() {
    const groups = {};
    studioProducts.forEach((p) => (groups[p.cat] = groups[p.cat] || []).push(p));
    $('#sShirt').innerHTML = Object.entries(groups)
      .map(
        ([c, list]) =>
          `<optgroup label="${esc(CATS[c])}">${list
            .map((p) => `<option value="${p.id}" ${p.id === studio.id ? 'selected' : ''}>${esc(p.name)}: ${price(p.price)}</option>`)
            .join('')}</optgroup>`
      )
      .join('');
  }
  function studioSizes() {
    const p = byId(studio.id);
    if (!p.stock[studio.size]) studio.size = sizesOf(p).find((s) => p.stock[s] > 0 && (s === 'M' || !isAdult(p))) || sizesOf(p).find((s) => p.stock[s] > 0);
    $('#sSizes').innerHTML = sizesOf(p)
      .map(
        (s) =>
          `<button type="button" class="size ${p.stock[s] > 0 && p.stock[s] <= 3 ? 'low' : ''}" data-size="${s}" aria-pressed="${studio.size === s}" ${
            p.stock[s] ? '' : 'disabled'
          }>${s}</button>`
      )
      .join('');
  }
  function renderStudioShirt(pop = false) {
    const p = byId(studio.id);
    const empty = !studio.name && !studio.number;
    const box = $('#studioShirt');
    box.innerHTML = renderShirt(p.kit, empty ? { name: 'YOUR NAME', number: '10', font: studio.font, ghost: true } : { name: studio.name, number: studio.number, font: studio.font });
    if (pop) {
      box.classList.remove('pop');
      void box.offsetWidth;
      box.classList.add('pop');
    }
    const printed = !!(studio.name || studio.number);
    const unit = unitPrice({ id: p.id, name: studio.name, number: studio.number });
    $('#sBreakdown').textContent = printed
      ? `Shirt ${price(p.price)} + print ${p.printIncluded ? 'included' : price(S.printPrice)}`
      : 'Type a name or number to preview your print';
    $('#sTotal').textContent = fmt(unit);
    $('#sNameCount').textContent = `${studio.name.length}/12`;
    $$('#sFont button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.font === studio.font));
  }
  function renderStudio() {
    studioSizes();
    renderStudioShirt();
  }

  /* ---------- teamwear kit builder ---------- */
  const KB_PATTERNS = ['plain', 'stripes', 'hoops', 'halves', 'sash', 'band'];
  const KB_SWATCHES = [
    ['#111111', 'Black'], ['#FFFFFF', 'White'], ['#C8102E', 'Red'], ['#6C1D45', 'Claret'], ['#14213D', 'Navy'], ['#1F4FD1', 'Royal blue'],
    ['#75AADB', 'Sky blue'], ['#0F5132', 'Green'], ['#C8F031', 'Lime'], ['#FFD400', 'Yellow'], ['#FF6A13', 'Orange'], ['#D4AF37', 'Gold'],
  ];
  const kb = { pattern: 'stripes', base: '#0F5132', stripe: '#FFFFFF', text: '#C8F031', font: 'modern', name: '', number: '', qty: 15 };
  const kbKit = () => ({ base: kb.base, stripe: kb.stripe, trim: kb.stripe, text: kb.text, pattern: kb.pattern, font: kb.font });

  function renderKBSwatches() {
    $$('[data-kb-color]').forEach((row) => {
      const field = row.dataset.kbColor;
      row.innerHTML =
        KB_SWATCHES.map(
          ([c, n]) =>
            `<button type="button" class="swatch-btn" style="background:${c}" data-kb-swatch="${field}" data-color="${c}" aria-label="${n}" aria-pressed="${
              kb[field].toLowerCase() === c.toLowerCase()
            }"></button>`
        ).join('') +
        `<label class="swatch-custom" title="Pick any colour"><input type="color" data-kb-custom="${field}" value="${kb[field].toLowerCase()}" aria-label="Custom colour"></label>`;
    });
  }
  function renderKBPatterns() {
    $('#kbPatterns').innerHTML = KB_PATTERNS.map(
      (pt) =>
        `<button type="button" class="pattern-btn" data-kb-pattern="${pt}" aria-pressed="${kb.pattern === pt}">${renderShirt(
          { ...kbKit(), pattern: pt },
          { label: cap(pt) + ' pattern' }
        )}${cap(pt)}</button>`
    ).join('');
  }
  function renderKBStage() {
    const empty = !kb.name && !kb.number;
    $('#kbStage').innerHTML = renderShirt(kbKit(), empty ? { name: 'SUNDAY FC', number: '9', ghost: true } : { name: kb.name, number: kb.number });
  }
  function renderKBPrice() {
    const tier = tierFor(kb.qty);
    $('#kbTiers').innerHTML = S.teamwearTiers
      .map((t) => `<div class="tier ${t === tier ? 'active' : ''}"><small>${t.label}</small><b>${price(t.price)}</b></div>`)
      .join('');
    const per = conv(tier.price);
    const save = r2((conv(S.teamwearTiers[0].price) - per) * kb.qty);
    $('#kbPer').textContent = `${fmt(per)} per shirt × ${kb.qty}${save > 0 ? ` · you save ${fmt(save)}` : ''}`;
    $('#kbTotal').textContent = fmt(r2(per * kb.qty));
    $('#kbQty').value = kb.qty;
  }
  function renderKB() {
    renderKBSwatches();
    renderKBPatterns();
    renderKBStage();
    renderKBPrice();
  }
  function kbAdd() {
    addToCart({
      id: 'custom-kit',
      custom: { kit: kbKit(), label: 'Custom Squad Kit' },
      size: 'Mixed sizes · confirmed by email',
      qty: kb.qty,
      name: kb.name,
      number: kb.number,
      font: kb.font,
    });
  }

  /* ---------- reviews + gallery ---------- */
  function reviewHTML(r, reveal = true) {
    const p = byId(r.product);
    return `<article class="review ${reveal ? 'reveal' : ''}">
      <div class="stars" aria-label="${r.rating} out of 5 stars">${stars(r.rating)}</div>
      <h4>${esc(r.title)}</h4>
      <p>“${esc(r.body)}”</p>
      <div class="review-foot">${p ? img(p.images[0], 100, '') : ''}<div><b>${esc(r.name)}</b>${
        p ? `<button data-open="${p.id}">Bought: ${esc(p.name)}</button>` : ''
      }</div></div>
    </article>`;
  }
  function renderReviews() {
    const n = P.reduce((a, p) => a + p.reviews, 0);
    const avg = P.reduce((a, p) => a + p.rating * p.reviews, 0) / n;
    $('#reviews-title').textContent = `Rated ${avg.toFixed(1)} / 5 from ${n.toLocaleString('en-GB')} reviews`;
    $('#reviewsGrid').innerHTML = REVIEWS.slice(0, 3).map((r) => reviewHTML(r)).join('');
  }
  const STANDS = [
    { id: PH.flare, cap: 'Matchday' },
    { id: PH.spainFans, cap: 'Spain Home', open: 'spain-home' },
    { id: PH.brazilRetro, cap: 'Brazil Retro LS', open: 'brazil-retro-ls' },
    { id: PH.stadiumRed, cap: 'Matchday' },
    { id: PH.womenNavy, cap: "Women's Match Shirt", open: 'womens-match-navy' },
    { id: PH.scarfFans, cap: 'Matchday' },
    { id: PH.redKick, cap: 'Sunday league' },
    { id: PH.playerNavy, cap: 'Teamwear', open: 'teamwear-heritage' },
  ];
  function renderStands() {
    $('#standsGrid').innerHTML = STANDS.map(
      (s, i) =>
        `<figure class="reveal" style="transition-delay:${(i % 4) * 60}ms" ${s.open ? `data-open="${s.open}" role="button" tabindex="0" aria-label="Shop ${esc(s.cap)}"` : ''}>${img(
          s.id,
          560,
          s.cap,
          { sizes: '(max-width: 760px) 50vw, 25vw' }
        )}<figcaption>${esc(s.cap)}${s.open ? ' → Shop' : ''}</figcaption></figure>`
    ).join('');
  }

  /* ---------- search ---------- */
  const ALIASES = {
    'man utd': 'manchester united', 'man u': 'manchester united', mufc: 'manchester united', barca: 'barcelona', fcb: 'barcelona',
    brasil: 'brazil', selecao: 'brazil', gunners: 'arsenal', 'la roja': 'spain', espana: 'spain', vintage: 'retro', kid: 'kids',
  };
  const INDEX = P.map((p) => ({
    p,
    text: [
      p.name, p.team, p.region, p.league, p.season, CATS[p.cat], p.preset?.name,
      p.cat === 'retro' ? 'vintage classic old' : '',
      p.cat === 'kids' ? 'kids children junior youth women ladies' : '',
      p.cat === 'teamwear' ? 'custom kit club squad team sunday league' : '',
    ]
      .join(' ')
      .toLowerCase(),
  }));
  const POPULAR = ['Brazil', 'Messi', 'Retro', 'Barcelona', 'Man Utd', 'Kids', 'Teamwear'];
  let searchList = [];
  let searchSel = -1;

  function searchQuery(q) {
    let s = q.toLowerCase().trim();
    Object.entries(ALIASES).forEach(([k, v]) => (s = s.replace(new RegExp(`\\b${k}\\b`, 'g'), v)));
    const terms = s.split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return INDEX.filter((e) => terms.every((t) => e.text.includes(t)))
      .map((e) => e.p)
      .sort((a, b) => b.reviews - a.reviews);
  }
  function hl(text, q) {
    let out = esc(text);
    q.split(/\s+/)
      .filter((t) => t.length > 1)
      .forEach((t) => {
        out = out.replace(new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?![^<]*>)`, 'ig'), '<mark>$1</mark>');
      });
    return out;
  }
  const srItem = (p, q = '') =>
    `<button class="sr-item" data-open="${p.id}">${img(p.images[0], 120, '')}<span><b>${hl(p.name, q)}</b><small>${esc(
      metaLine(p)
    )}</small></span><span class="price">${price(p.price)}</span></button>`;
  const popularChips = () => `<h5>Popular searches</h5><div class="sr-chips">${POPULAR.map((t) => `<button class="chip" data-search-term="${t}">${t}</button>`).join('')}</div>`;

  function renderSearch(q) {
    const box = $('#searchResults');
    q = q.trim();
    searchSel = -1;
    if (!q) {
      searchList = [...P].sort((a, b) => b.reviews - a.reviews).slice(0, 4);
      box.innerHTML = `${popularChips()}<h5>Trending now</h5>${searchList.map((p) => srItem(p)).join('')}`;
      return;
    }
    searchList = searchQuery(q);
    box.innerHTML = searchList.length
      ? `<h5>${searchList.length} shirt${searchList.length === 1 ? '' : 's'}</h5>${searchList.map((p) => srItem(p, q)).join('')}`
      : `<div class="empty-bag"><h4>No shirts found for “${esc(q)}”</h4><p>Try a team, country or player name.</p></div>${popularChips()}`;
  }
  function openSearch() {
    const inp = $('#searchInput');
    inp.value = '';
    renderSearch('');
    openLayer($('#searchOverlay'), '#searchInput');
  }
  function moveSearchSel(d) {
    const items = $$('#searchResults .sr-item');
    if (!items.length) return;
    searchSel = (searchSel + d + items.length) % items.length;
    items.forEach((el, i) => el.classList.toggle('kb', i === searchSel));
    items[searchSel].scrollIntoView({ block: 'nearest' });
  }

  /* ---------- checkout ---------- */
  function shipCost(id, after) {
    const o = S.delivery.find((d) => d.id === id) || S.delivery[0];
    if (o.freeOver && after >= conv(S.freeShipping)) return 0;
    return conv(o.price);
  }
  function openCheckout() {
    if (!state.cart.length) return;
    closeLayer($('#cartDrawer'));
    renderCheckout();
    openLayer($('#checkoutModal'), '#coEmail');
  }
  function renderCheckout() {
    const t = totals();
    const sid = 'standard';
    const ship = shipCost(sid, t.after);
    $('#checkoutContent').innerHTML = `<form class="co" id="coForm" novalidate>
      <div class="co-form">
        <span class="kicker">Secure checkout</span>
        <h3>Where should we send it?</h3>
        <h4>Contact</h4>
        <div class="field"><label for="coEmail">Email</label><input class="input" id="coEmail" type="email" required autocomplete="email" placeholder="you@example.com"></div>
        <h4>Delivery address</h4>
        <div class="field"><label for="coName">Full name</label><input class="input" id="coName" required autocomplete="name"></div>
        <div class="field"><label for="coAddr">Address</label><input class="input" id="coAddr" required autocomplete="street-address"></div>
        <div class="row2 even">
          <div class="field"><label for="coCity">Town / city</label><input class="input" id="coCity" required autocomplete="address-level2"></div>
          <div class="field"><label for="coPost">Postcode</label><input class="input" id="coPost" required autocomplete="postal-code"></div>
        </div>
        <h4>Delivery method</h4>
        <div class="ship-opts">${S.delivery
          .map((d) => {
            const c = shipCost(d.id, t.after);
            return `<label class="ship-opt"><input type="radio" name="ship" value="${d.id}" ${d.id === sid ? 'checked' : ''}><div><b>${d.label}</b><small>${
              d.id === 'nextday' ? deliveryText() : d.eta
            }</small></div><span class="p">${c ? fmt(c) : 'Free'}</span></label>`;
          })
          .join('')}</div>
      </div>
      <aside class="co-summary">
        <h4>Order summary</h4>
        ${state.cart.map((i) => `<div class="co-line"><span>${i.qty} × ${esc(itemTitle(i))}${i.size && !i.custom ? ` (${esc(i.size)})` : ''}</span><span>${fmt(r2(unitPrice(i) * i.qty))}</span></div>`).join('')}
        <div class="totals" style="margin-top:16px">
          <div><span>Subtotal</span><span>${fmt(t.sub)}</span></div>
          ${t.disc ? `<div class="disc"><span>Discount (${esc(state.promo)})</span><span>−${fmt(t.disc)}</span></div>` : ''}
          <div><span>Delivery</span><span id="coShip">${ship ? fmt(ship) : 'Free'}</span></div>
          <div class="grand"><span>Total</span><span id="coTotal">${fmt(r2(t.after + ship))}</span></div>
        </div>
        <button class="btn btn-primary btn-block" type="submit">Place order · <span id="coBtnTotal">${fmt(r2(t.after + ship))}</span></button>
        <p class="demo-note">Demo checkout: no payment is taken. Connect Stripe or Shopify Payments to go live.</p>
      </aside>
    </form>`;
  }
  function updateCheckoutShip(id) {
    const t = totals();
    const ship = shipCost(id, t.after);
    $('#coShip').textContent = ship ? fmt(ship) : 'Free';
    const total = fmt(r2(t.after + ship));
    $('#coTotal').textContent = total;
    $('#coBtnTotal').textContent = total;
  }
  function placeOrder(form) {
    const fields = $$('input[required]', form);
    let ok = true;
    fields.forEach((f) => {
      const valid = f.checkValidity() && f.value.trim();
      f.classList.toggle('invalid', !valid);
      if (!valid && ok) {
        f.focus();
        ok = false;
      }
    });
    if (!ok) return;
    const first = $('#coName').value.trim().split(/\s+/)[0];
    const email = $('#coEmail').value.trim();
    const order = 'TL-' + Math.floor(100000 + Math.random() * 900000);
    state.cart = [];
    state.promo = null;
    saveCart();
    store.set('promo', null);
    renderCart();
    updateCounts(false);
    $('#checkoutContent').innerHTML = `<div class="success"><div class="tick">${ICON.check}</div><h3>Order confirmed</h3><p>Thanks, ${esc(
      first
    )}! Order <b>${order}</b> is being packed. We’d send a confirmation to <b>${esc(email)}</b>.</p><button class="btn btn-primary" data-action="close">Keep shopping</button></div>`;
  }

  /* ---------- layers (drawers, modals, search) ---------- */
  const layers = [];
  let lastFocus = null;
  function openLayer(el, focusSel) {
    if (!el || layers.includes(el)) return;
    if (!layers.length) lastFocus = document.activeElement;
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    layers.push(el);
    syncLayers();
    setTimeout(() => {
      const f = (focusSel && $(focusSel, el)) || $('button, a, input', el);
      if (f) f.focus({ preventScroll: true });
    }, 80);
  }
  function closeLayer(el) {
    const i = layers.indexOf(el);
    if (i < 0) return;
    layers.splice(i, 1);
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    if (el.id === 'productModal') {
      try {
        if (location.hash.startsWith('#shirt/')) history.replaceState(null, '', location.pathname + location.search);
      } catch {
        /* ignore */
      }
      renderRecent();
    }
    syncLayers();
    if (!layers.length && lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  const closeTop = () => layers.length && closeLayer(layers[layers.length - 1]);
  function syncLayers() {
    document.body.classList.toggle('locked', layers.length > 0);
    $('#scrim').classList.toggle('show', layers.some((l) => l.classList.contains('drawer')));
  }

  /* ---------- toasts ---------- */
  function toast(html, ms = 3600) {
    const stack = $('#toasts');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = html;
    stack.appendChild(t);
    const all = $$('.toast', stack);
    if (all.length > 3) all[0].remove();
    setTimeout(() => {
      t.classList.add('out');
      setTimeout(() => t.remove(), 320);
    }, ms);
  }

  /* ---------- timers ---------- */
  function nextDrop() {
    const now = new Date();
    const t = new Date(now);
    t.setHours(19, 0, 0, 0);
    let add = (5 - now.getDay() + 7) % 7;
    if (add === 0 && now >= t) add = 7;
    t.setDate(t.getDate() + add);
    return t;
  }
  const dropAt = nextDrop();
  function deliveryText() {
    const now = new Date();
    const cut = new Date(now);
    cut.setHours(S.dispatchCutoffHour, 0, 0, 0);
    if (now >= cut) return 'Order now for dispatch first thing tomorrow';
    const ms = cut - now;
    const h = Math.floor(ms / 36e5);
    const m = Math.floor(ms / 6e4) % 60;
    return `Order within ${h ? h + 'h ' : ''}${m}m for next-day delivery`;
  }
  function tick() {
    const ms = Math.max(0, dropAt - Date.now());
    const parts = { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 };
    $$('#dropCountdown [data-u]').forEach((el) => {
      const v = pad(parts[el.dataset.u]);
      if (el.textContent !== v) el.textContent = v;
    });
    const dt = deliveryText();
    $$('[data-delivery-countdown]').forEach((el) => {
      if (el.textContent !== dt) el.textContent = dt;
    });
  }
  function rotateAnnounce() {
    const spans = $$('#announce span');
    let i = 0;
    setInterval(() => {
      spans[i].classList.remove('is-active');
      i = (i + 1) % spans.length;
      spans[i].classList.add('is-active');
    }, 4500);
  }

  /* ---------- reveal on scroll ---------- */
  const io =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entries) =>
            entries.forEach((en) => {
              if (en.isIntersecting) {
                en.target.classList.add('in');
                io.unobserve(en.target);
              }
            }),
          { rootMargin: '0px 0px -6% 0px', threshold: 0.06 }
        )
      : null;
  function observeReveal() {
    $$('.reveal:not(.in)').forEach((el) => (io ? io.observe(el) : el.classList.add('in')));
  }

  function scrollToEl(sel) {
    const el = $(sel);
    if (el) el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------- re-render everything that shows a price ---------- */
  function renderPrices() {
    renderGrid();
    renderVault();
    renderRecent();
    renderWish();
    renderCart();
    renderStudioOptions();
    renderStudioShirt();
    renderKBPrice();
    if (pm && $('#productModal').classList.contains('open')) renderPM();
  }

  /* ---------- events ---------- */
  function handleAction(action, el, e) {
    switch (action) {
      case 'open-search': return openSearch();
      case 'open-cart': closeLayer($('#wishDrawer')); return openLayer($('#cartDrawer'), '.icon-btn');
      case 'open-wish': closeLayer($('#cartDrawer')); return openLayer($('#wishDrawer'), '.icon-btn');
      case 'open-menu': return openLayer($('#menuDrawer'), 'a');
      case 'close': {
        const layer = el.closest('.modal, .drawer, .search-overlay');
        return layer ? closeLayer(layer) : closeTop();
      }
      case 'close-go':
        e.preventDefault();
        while (layers.length) closeTop();
        resetFilters();
        renderGrid();
        return scrollToEl('#shop');
      case 'notify':
        scrollToEl('#newsletter');
        return setTimeout(() => $('#nlEmail').focus({ preventScroll: true }), 600);
      case 'reset-filters':
        resetFilters();
        return renderGrid();
      case 'size-finder':
        e.preventDefault();
        return openSizeFinder(el.dataset.context);
      case 'sf-apply': {
        const s = el.dataset.size;
        if (sfContext === 'pm') pmSelectSize(s);
        if (sfContext === 'studio') {
          studio.size = s;
          studioSizes();
        }
        return closeLayer($('#sizeModal'));
      }
      case 'pm-add': return pmAdd();
      case 'kb-add': return kbAdd();
      case 'checkout': return openCheckout();
      case 'remove-promo':
        state.promo = null;
        store.set('promo', null);
        return renderCart();
    }
  }

  document.addEventListener('click', (e) => {
    const t = e.target;
    let el;
    if ((el = t.closest('[data-quick]'))) return quickAdd(el.dataset.quick, el.dataset.size);
    if ((el = t.closest('[data-wish]'))) {
      e.preventDefault();
      return toggleWish(el.dataset.wish);
    }
    if ((el = t.closest('[data-view]'))) {
      pm.view = +el.dataset.view;
      return pmRenderMain();
    }
    if ((el = t.closest('[data-open]'))) {
      e.preventDefault();
      const layer = el.closest('.drawer, .search-overlay');
      if (layer) closeLayer(layer);
      return openProduct(el.dataset.open);
    }
    if ((el = t.closest('[data-filter-cat]'))) {
      e.preventDefault();
      const layer = el.closest('.drawer');
      if (layer) closeLayer(layer);
      applyCat(el.dataset.filterCat);
      return scrollToEl('#shop');
    }
    if ((el = t.closest('[data-chip]'))) return applyCat(el.dataset.chip, true);
    if ((el = t.closest('[data-rail]'))) {
      const r = $('#' + el.dataset.rail);
      return r.scrollBy({ left: +el.dataset.dir * r.clientWidth * 0.8, behavior: reduceMotion() ? 'auto' : 'smooth' });
    }
    if ((el = t.closest('[data-qty]'))) return changeQty(+el.dataset.qty, +el.dataset.d);
    if ((el = t.closest('[data-remove]'))) return removeItem(+el.dataset.remove);
    if ((el = t.closest('[data-search-term]'))) {
      const inp = $('#searchInput');
      inp.value = el.dataset.searchTerm;
      renderSearch(inp.value);
      return inp.focus();
    }
    /* product modal controls */
    if ((el = t.closest('[data-edition]'))) {
      pm.edition = el.dataset.edition;
      $$('#pmContent [data-edition]').forEach((b) => b.setAttribute('aria-pressed', b === el));
      return pmRenderPrice();
    }
    if ((el = t.closest('#pmSizes [data-size]'))) return pmSelectSize(el.dataset.size);
    if ((el = t.closest('[data-pmfont]'))) {
      pm.font = el.dataset.pmfont;
      $$('#pmFont button').forEach((b) => b.setAttribute('aria-pressed', b === el));
      return pmUpdatePrint();
    }
    if ((el = t.closest('[data-pmqty]'))) {
      const max = pm.size ? pm.p.stock[pm.size] - sameSizeQty(pm.p.id, pm.size) : 10;
      pm.qty = clamp(pm.qty + +el.dataset.pmqty, 1, Math.max(1, max));
      $('#pmQty').textContent = pm.qty;
      return pmRenderPrice();
    }
    /* studio */
    if ((el = t.closest('#sSizes [data-size]'))) {
      studio.size = el.dataset.size;
      return $$('#sSizes .size').forEach((b) => b.setAttribute('aria-pressed', b === el));
    }
    if ((el = t.closest('#sFont [data-font]'))) {
      studio.font = el.dataset.font;
      return renderStudioShirt(true);
    }
    /* size finder */
    if ((el = t.closest('#sfFit [data-fit]'))) {
      sfFit = +el.dataset.fit;
      return $$('#sfFit button').forEach((b) => b.setAttribute('aria-pressed', b === el));
    }
    /* kit builder */
    if ((el = t.closest('[data-kb-pattern]'))) {
      kb.pattern = el.dataset.kbPattern;
      $$('#kbPatterns .pattern-btn').forEach((b) => b.setAttribute('aria-pressed', b === el));
      return renderKBStage();
    }
    if ((el = t.closest('[data-kb-swatch]'))) {
      const f = el.dataset.kbSwatch;
      kb[f] = el.dataset.color;
      $$(`[data-kb-swatch="${f}"]`).forEach((b) => b.setAttribute('aria-pressed', b === el));
      const ci = $(`[data-kb-custom="${f}"]`);
      if (ci) ci.value = kb[f].toLowerCase();
      renderKBPatterns();
      return renderKBStage();
    }
    if ((el = t.closest('[data-kb-qty]'))) {
      kb.qty = clamp(kb.qty + +el.dataset.kbQty, 1, 60);
      return renderKBPrice();
    }
    if ((el = t.closest('[data-action]'))) return handleAction(el.dataset.action, el, e);
    if (t === $('#scrim')) return closeTop();
    if (t.classList.contains('modal')) return closeLayer(t);
    if ((el = t.closest('.drawer a[href^="#"]'))) return closeLayer(el.closest('.drawer'));
  });

  document.addEventListener('keydown', (e) => {
    const ae = document.activeElement;
    if (e.key === 'Escape' && layers.length) {
      e.preventDefault();
      return closeTop();
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      return openSearch();
    }
    const typing = ae && (/INPUT|TEXTAREA|SELECT/.test(ae.tagName) || ae.isContentEditable);
    if (!typing && e.key === '/' && !layers.length) {
      e.preventDefault();
      return openSearch();
    }
    if (ae && ae.id === 'searchInput') {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveSearchSel(1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); moveSearchSel(-1); }
      if (e.key === 'Enter') {
        e.preventDefault();
        const items = $$('#searchResults .sr-item');
        const pick = items[searchSel >= 0 ? searchSel : 0];
        if (pick) pick.click();
      }
    }
    if ((e.key === 'Enter' || e.key === ' ') && ae && ae.matches('figure[data-open]')) {
      e.preventDefault();
      openProduct(ae.dataset.open);
    }
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    switch (t.id) {
      case 'searchInput': return renderSearch(t.value);
      case 'fPrice':
        state.maxPrice = +t.value;
        return renderGrid();
      case 'pmName': {
        const v = sanitizeName(t.value);
        if (v !== t.value) t.value = v;
        pm.name = v.toUpperCase();
        return pmUpdatePrint();
      }
      case 'pmNum': {
        const v = sanitizeNum(t.value);
        if (v !== t.value) t.value = v;
        pm.number = v;
        return pmUpdatePrint();
      }
      case 'sName': {
        const v = sanitizeName(t.value);
        if (v !== t.value) t.value = v;
        studio.name = v.toUpperCase();
        return renderStudioShirt();
      }
      case 'sNum': {
        const v = sanitizeNum(t.value);
        if (v !== t.value) t.value = v;
        studio.number = v;
        return renderStudioShirt();
      }
      case 'kbName': {
        const v = sanitizeName(t.value);
        if (v !== t.value) t.value = v;
        kb.name = v.toUpperCase();
        return renderKBStage();
      }
      case 'kbNum': {
        const v = sanitizeNum(t.value);
        if (v !== t.value) t.value = v;
        kb.number = v;
        return renderKBStage();
      }
    }
    if (t.dataset.kbCustom) {
      const f = t.dataset.kbCustom;
      kb[f] = t.value;
      $$(`[data-kb-swatch="${f}"]`).forEach((b) => b.setAttribute('aria-pressed', false));
      renderKBPatterns();
      renderKBStage();
    }
    if (t.classList.contains('invalid') && t.value.trim()) t.classList.remove('invalid');
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    switch (t.id) {
      case 'fRegion': state.region = t.value; return renderGrid();
      case 'fSize': state.size = t.value; return renderGrid();
      case 'fSort': state.sort = t.value; return renderGrid();
      case 'fSale': state.sale = t.checked; return renderGrid();
      case 'currency':
      case 'currencyMobile':
        state.currency = t.value;
        store.set('currency', state.currency);
        $('#currency').value = $('#currencyMobile').value = state.currency;
        return renderPrices();
      case 'sShirt':
        studio.id = t.value;
        studioSizes();
        return renderStudioShirt(true);
      case 'kbQty':
        kb.qty = clamp(parseInt(t.value, 10) || 1, 1, 60);
        return renderKBPrice();
      case 'pmPrintToggle': {
        pm.print = t.checked;
        $('#pmPrintFields').hidden = !pm.print;
        pmUpdatePrint();
        if (pm.print && !pm.name) setTimeout(() => $('#pmName')?.focus(), 50);
        return;
      }
    }
    if (t.name === 'ship') updateCheckoutShip(t.value);
  });

  document.addEventListener('submit', (e) => {
    const f = e.target;
    e.preventDefault();
    switch (f.id) {
      case 'studioForm': {
        const p = byId(studio.id);
        const item = { id: p.id, size: studio.size, edition: hasEdition(p) ? 'fan' : null, qty: 1 };
        if (studio.name || studio.number) Object.assign(item, { name: studio.name.trim(), number: studio.number, font: studio.font });
        return addToCart(item);
      }
      case 'sfForm': return runSizeFinder();
      case 'promoForm': {
        const code = $('#promoInput').value.trim().toUpperCase();
        const msg = $('#promoMsg');
        if (S.promoCodes[code]) {
          state.promo = code;
          store.set('promo', code);
          return renderCart();
        }
        msg.className = 'promo-msg err';
        msg.textContent = code ? `“${code}” isn’t a valid code` : 'Enter a promo code';
        return;
      }
      case 'nlForm': {
        const inp = $('#nlEmail');
        const msg = $('#nlMsg');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) {
          msg.textContent = 'Please enter a valid email address.';
          return inp.focus();
        }
        msg.textContent = '✓ You’re on the list! Use code KICKOFF10 at checkout for 10% off.';
        inp.value = '';
        return;
      }
      case 'coForm': return placeOrder(f);
    }
  });

  window.addEventListener('scroll', () => $('#header').classList.toggle('scrolled', window.scrollY > 8), { passive: true });

  /* ---------- init ---------- */
  function init() {
    $('#currency').value = $('#currencyMobile').value = state.currency;
    $('#year').textContent = new Date().getFullYear();
    setImg('#heroImg', PH.stadiumNight, 1600, '100vw');
    setImg('#dropImg', PH.retroRack, 600, '380px');
    setImg('#studioPhoto', PH.printBack, 300, '(max-width: 760px) 30vw, 200px');
    setImg('#vaultImg1', PH.milanRetro, 800, '(max-width: 1000px) 70vw, 460px');
    setImg('#vaultImg2', PH.arsenalBack, 500, '(max-width: 1000px) 50vw, 320px');

    renderCats();
    renderChips();
    renderRegionOptions();
    renderGrid();
    renderVault();
    renderStudioOptions();
    renderStudio();
    renderKB();
    renderReviews();
    renderStands();
    renderRecent();
    renderCart();
    renderWish();
    updateCounts(false);

    tick();
    setInterval(tick, 1000);
    rotateAnnounce();
    observeReveal();

    const m = location.hash.match(/^#shirt\/([\w-]+)/);
    if (m && byId(m[1])) openProduct(m[1]);
  }

  init();
})();
