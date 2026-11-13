/* =========================================================================
   Live shirt-back renderer
   renderShirt(kit, { name, number, font, ghost, label }) -> SVG string
   ========================================================================= */
(function () {
  let uid = 0;

  const FONTS = {
    modern: { family: "'Bebas Neue', Impact, sans-serif", name: 0.46, num: 1, weight: 400 },
    classic: { family: "'Oswald', 'Arial Narrow', sans-serif", name: 0.56, num: 0.84, weight: 600 },
    retro: { family: "'Graduate', Georgia, serif", name: 0.78, num: 0.7, weight: 400 },
  };

  const BODY =
    'M152,24 Q200,40 248,24 L306,38 L384,116 L344,170 L298,140 L300,420 Q200,432 100,420 L102,140 L56,170 L16,116 L94,38 Z';
  const SLEEVE_L = 'M94,38 L16,116 L56,170 L102,140 Z';
  const SLEEVE_R = 'M306,38 L384,116 L344,170 L298,140 Z';
  const CUFF_L = 'M16,116 L56,170 L64,162 L24,108 Z';
  const CUFF_R = 'M384,116 L344,170 L336,162 L376,108 Z';
  const COLLAR = 'M152,24 Q200,40 248,24 L246,33 Q200,50 154,33 Z';

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function pattern(k) {
    const s = k.stripe || k.trim || '#ffffff';
    let out = '';
    switch (k.pattern) {
      case 'stripes':
        for (let x = 36; x < 400; x += 64) out += `<rect x="${x}" y="0" width="32" height="440" fill="${s}"/>`;
        return out;
      case 'hoops':
        for (let y = 70; y < 440; y += 64) out += `<rect x="0" y="${y}" width="400" height="32" fill="${s}"/>`;
        return out;
      case 'halves':
        return `<rect x="200" y="0" width="200" height="440" fill="${s}"/>`;
      case 'sash':
        return `<polygon points="60,20 140,20 360,440 280,440" fill="${s}"/>`;
      case 'band':
        return `<rect x="0" y="176" width="400" height="26" fill="${s}"/><rect x="0" y="202" width="400" height="12" fill="${k.stripe2 || k.trim || s}"/>`;
      case 'marble':
        return `<g fill="none" stroke="${s}" stroke-linecap="round" opacity=".55">
          <path d="M30,70 L95,150 L82,230 L140,320 L128,430" stroke-width="1.6"/>
          <path d="M95,150 L150,170 L210,140" stroke-width="1.1"/>
          <path d="M370,90 L300,170 L322,260 L262,330 L290,440" stroke-width="1.6"/>
          <path d="M322,260 L250,250 L205,300" stroke-width="1.1"/>
          <path d="M200,60 L230,120 L190,210 L215,300 L180,400" stroke-width="1"/>
          <path d="M140,320 L90,350" stroke-width="1"/></g>`;
      default:
        return '';
    }
  }

  function renderShirt(kit, opts = {}) {
    const k = kit || {};
    const id = 'sh' + ++uid;
    const f = FONTS[opts.font || k.font || 'modern'] || FONTS.modern;
    const ghost = !!opts.ghost;
    const name = String(opts.name || '').toUpperCase().slice(0, 14);
    const num = String(opts.number ?? '').slice(0, 2);
    const textCol = k.text || '#ffffff';
    const trim = k.trim || '#ffffff';
    const nameSize = name ? Math.min(40, Math.max(16, 196 / (Math.max(name.length, 3) * f.name))) : 0;
    const numSize = 150 * f.num;
    const outline = k.outline ? `stroke="${k.outline}" stroke-width="3" paint-order="stroke"` : '';
    const label = opts.label || `Shirt back${name ? ' printed ' + name : ''}${num ? ' number ' + num : ''}`;

    return `<svg class="shirt-svg" viewBox="0 0 400 440" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" aria-label="${esc(label)}">
  <defs>
    <clipPath id="${id}c"><path d="${BODY}"/></clipPath>
    <linearGradient id="${id}h" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity=".32"/>
      <stop offset=".2" stop-color="#000" stop-opacity="0"/>
      <stop offset=".5" stop-color="#fff" stop-opacity=".07"/>
      <stop offset=".8" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".32"/>
    </linearGradient>
    <linearGradient id="${id}v" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".10"/>
      <stop offset=".45" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".22"/>
    </linearGradient>
    <path id="${id}a" d="M100,152 Q200,128 300,152"/>
  </defs>
  <g clip-path="url(#${id}c)">
    <rect width="400" height="440" fill="${k.base || '#222'}"/>
    ${pattern(k)}
    ${k.sleeves ? `<path d="${SLEEVE_L}" fill="${k.sleeves}"/><path d="${SLEEVE_R}" fill="${k.sleeves}"/>` : ''}
    <path d="${CUFF_L}" fill="${k.cuff || trim}"/><path d="${CUFF_R}" fill="${k.cuff || trim}"/>
    <rect x="0" y="412" width="400" height="20" fill="${trim}" opacity=".9"/>
    <path d="M150,190 Q164,300 142,420" stroke="#000" stroke-opacity=".07" stroke-width="10" fill="none"/>
    <path d="M262,170 Q248,290 266,420" stroke="#000" stroke-opacity=".06" stroke-width="8" fill="none"/>
    <path d="M110,150 Q120,138 100,128" stroke="#000" stroke-opacity=".1" stroke-width="4" fill="none"/>
    <path d="M290,150 Q280,138 300,128" stroke="#000" stroke-opacity=".1" stroke-width="4" fill="none"/>
    <rect width="400" height="440" fill="url(#${id}h)"/>
    <rect width="400" height="440" fill="url(#${id}v)"/>
  </g>
  <path d="${COLLAR}" fill="${trim}"/>
  <path d="${BODY}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="2" stroke-linejoin="round"/>
  <g fill="${textCol}" ${outline} opacity="${ghost ? 0.35 : 1}" style="font-family:${f.family};font-weight:${f.weight}">
    ${name ? `<text font-size="${nameSize.toFixed(1)}" letter-spacing="2.5" text-anchor="middle"><textPath href="#${id}a" xlink:href="#${id}a" startOffset="50%">${esc(name)}</textPath></text>` : ''}
    ${num !== '' ? `<text x="200" y="${(316 + (1 - f.num) * 20).toFixed(0)}" font-size="${numSize.toFixed(0)}" text-anchor="middle" letter-spacing="-2">${esc(num)}</text>` : ''}
  </g>
</svg>`;
  }

  window.renderShirt = renderShirt;
  window.SHIRT_FONTS = FONTS;
})();
