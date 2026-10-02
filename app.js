/* Protótipo navegável – melhoria de UX no e-commerce da Lojas Renner (TCC ESPM, Grupo 4).
   Tudo roda no navegador. Estado da sessão e resultados do teste ficam no localStorage deste aparelho. */
(function () {
  'use strict';

  const D = window.DADOS;
  const { RENNER_IMG, UNSPLASH, REGRAS, CAMPOS, CLIENTE, PRODUTO, VITRINE, CATEGORIAS, MENU_CARDS, AVALIACOES, FOTO_EXEMPLO, TAREFAS, SUS } = D;
  const DIA = 864e5;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const APP = $('#app');
  const OV = $('#ov-root');
  const PUSH = $('#push-root');
  const MODR = $('#mod-root');

  /* =========================================================
     Utilidades
     ========================================================= */
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cents = (v) => Math.round(v * 100) / 100;
  const brl = (v) => {
    const [i, d] = Math.abs(v).toFixed(2).split('.');
    return (v < 0 ? '- ' : '') + 'R$ ' + i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + d;
  };
  const num1 = (v) => v.toFixed(1).replace('.', ',');
  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (ts) => { const d = new Date(ts); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`; };
  const fmtShort = (ts) => { const d = new Date(ts); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
  const hoje0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const addBizDays = (ts, n) => { const d = new Date(ts); let k = 0; while (k < n) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) k++; } return d.getTime(); };
  const parcelas = (v) => { const n = Math.max(1, Math.min(7, Math.floor(v / 30))); return `${n}x de ${brl(v / n)}*`; };
  const sizeIdx = (t) => PRODUTO.tamanhos.indexOf(t);
  const altTxt = (cm) => (cm / 100).toFixed(2).replace('.', ',') + ' m';
  const maskEmail = (e) => e.replace(/^(..)[^@]*/, '$1****');
  const genId = () => '10' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0');
  const photoUrl = (f, w, h) => (/^(data:|https?:)/.test(f) ? f : UNSPLASH(f, w, h));

  // Valores do programa sempre lidos de REGRAS/CAMPOS (data.js), nunca escritos no texto
  const CAMPO = Object.fromEntries(CAMPOS.map((c) => [c.k, c]));
  const P = (...ks) => ks.reduce((s, k) => s + CAMPO[k].pts, 0);
  const MED = ['altura', 'busto', 'cintura', 'quadril'];
  const MAXP = REGRAS.maxPontos;
  const PRAZO = REGRAS.prazoDevolucaoDias;
  const reais = (pts) => brl(pts * REGRAS.reaisPorPonto);
  const MAXR = reais(MAXP);

  /* =========================================================
     Ícones (traço fino, como no site)
     ========================================================= */
  const sv = (body, vb = '0 0 24 24', sw = 1.5) => `<svg viewBox="${vb}" fill="none" stroke="#191919" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const I = {
    menu: sv('<rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/>', '0 0 24 24', 1.4),
    heart: sv('<path d="M12 20.3s-7.4-4.5-9.2-9.1C1.5 7.9 3.4 4.6 6.8 4.6c2.1 0 3.6 1.2 4.2 2.4.6-1.2 2.1-2.4 4.2-2.4 3.4 0 5.3 3.3 4 6.6-1.8 4.6-9.2 9.1-9.2 9.1z"/>', '0 0 24 24', 1.4),
    bag: `<svg viewBox="0 0 24 24" fill="none" stroke="#191919" stroke-width="1.35" stroke-linejoin="round" aria-hidden="true"><path d="M4.8 7.6h14.4l-1.1 13.2H5.9L4.8 7.6z"/><path d="M8.8 7.6V6.2a3.2 3.2 0 0 1 6.4 0v1.4"/><text x="12.2" y="17.9" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-weight="700" font-size="9.5" fill="#191919" stroke="none">r</text></svg>`,
    search: sv('<circle cx="10.5" cy="10.5" r="6.8"/><path d="M15.6 15.6 21 21"/>', '0 0 24 24', 1.4),
    camera: sv('<path d="M3 8.5h3.2l1.6-2.3h6.2l1.6 2.3H17a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6.5a2 2 0 0 1 2-2z"/><circle cx="11" cy="13.6" r="3"/><path d="M20.5 3.5v3M19 5h3M21.5 10.5v2M20.5 11.5h2"/>', '0 0 24 24', 1.3),
    chevL: sv('<path d="M15 4.5 7.5 12l7.5 7.5"/>'),
    chevR: sv('<path d="M9 4.5 16.5 12 9 19.5"/>'),
    chevD: sv('<path d="M4.5 9 12 16.5 19.5 9"/>'),
    close: sv('<path d="M5 5l14 14M19 5 5 19"/>'),
    check: sv('<path d="M4.5 12.5l4.8 4.8L19.5 7"/>', '0 0 24 24', 2),
    zoom: sv('<circle cx="10.5" cy="10.5" r="7"/><path d="M15.7 15.7 21 21M10.5 7.5v6M7.5 10.5h6"/>', '0 0 24 24', 1.3),
    sparkSearch: sv('<circle cx="11" cy="12" r="6"/><path d="M15.5 16.5 20 21M5 3.5v3M3.5 5h3M8.5 2.5v1.6M7.7 3.3h1.6"/>', '0 0 24 24', 1.3),
    starO: sv('<path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/>', '0 0 24 24', 1.3),
    hanger: sv('<path d="M12 7.5a2 2 0 1 1 2-2c0 1.2-2 1.5-2 3v.5L3 15.5h18L12 9"/><path d="M3 15.5V17h18v-1.5"/>', '0 0 24 24', 1.3),
    ruler: sv('<rect x="2.5" y="8" width="19" height="8" rx="1"/><path d="M6 8v3M9.5 8v4M13 8v3M16.5 8v4M20 8v3"/>', '0 0 24 24', 1.3),
    user: sv('<circle cx="12" cy="8" r="4"/><path d="M4 20.5c1-4 4.2-6 8-6s7 2 8 6"/>'),
    users: sv('<circle cx="9" cy="8.5" r="3.5"/><path d="M2.5 19.5c.8-3.4 3.4-5.2 6.5-5.2s5.7 1.8 6.5 5.2"/><circle cx="17" cy="9" r="2.8"/><path d="M17.5 14.3c2.2.3 3.7 1.8 4.2 4.2"/>'),
    gift: sv('<rect x="3.5" y="8.5" width="17" height="4" rx=".8"/><path d="M5 12.5v8h14v-8M12 8.5v12M12 8.5S10.8 4 8.2 4.6C6.5 5 7 8.5 12 8.5zM12 8.5s1.2-4.5 3.8-3.9C17.5 5 17 8.5 12 8.5z"/>'),
    info: sv('<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.2"/>'),
    clock: sv('<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.3 2"/>'),
    truck: sv('<path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3.2v2.8h-7z"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    box: sv('<path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z"/><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9"/>'),
    coin: sv('<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2c-.5-1-1.6-1.6-2.8-1.6-1.6 0-2.8.9-2.8 2.1 0 2.9 5.8 1.5 5.8 4.5 0 1.2-1.3 2.1-3 2.1-1.4 0-2.6-.7-3-1.8M12 6v1.6M12 16.4V18"/>'),
    lock: sv('<rect x="5" y="10.5" width="14" height="10" rx="1.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>'),
    thumb: sv('<path d="M7.5 10.5v9.5H4v-9.5zM7.5 10.5l3.6-6.6c1.5 0 2.4 1.2 2 2.7l-.8 3h5.6c1.3 0 2.2 1.2 1.9 2.4l-1.6 6.2c-.3 1.1-1.2 1.8-2.3 1.8H7.5"/>', '0 0 24 24', 1.3),
    camPlus: sv('<path d="M3 8.5h3.2l1.6-2.3h6.4l1.6 2.3H19a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6.5a2 2 0 0 1 2-2z"/><circle cx="12" cy="13.5" r="3.2"/>', '0 0 24 24', 1.4),
    sliders: sv('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>', '0 0 24 24', 1.4),
    fwd: sv('<path d="M3.5 6v12l8-6zM12.5 6v12l8-6z"/>'),
    restart: sv('<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 3.5v4h4"/>'),
    store: sv('<path d="M3.5 9.5 5 4.5h14l1.5 5M3.5 9.5h17M3.5 9.5c0 1.5 1.2 2.5 2.8 2.5s2.9-1 2.9-2.5c0 1.5 1.3 2.5 2.8 2.5s2.8-1 2.8-2.5c0 1.5 1.3 2.5 2.9 2.5s2.8-1 2.8-2.5M5 12v8h14v-8M10 20v-4.5h4V20"/>'),
    trophy: sv('<path d="M8 4.5h8v4.5a4 4 0 0 1-8 0zM8 6H4.5c0 2.5 1.3 4 3.6 4.2M16 6h3.5c0 2.5-1.3 4-3.6 4.2M12 13v3.5M8.5 20h7M9.5 20l.5-3.5h4l.5 3.5"/>'),
    photo: sv('<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8 8.5"/>'),
    medal: sv('<circle cx="12" cy="14.5" r="5.5"/><path d="M8.5 10 6 3.5h4l2 4 2-4h4L15.5 10M12 12.2l.9 1.7 1.9.3-1.4 1.3.3 1.9-1.7-.9-1.7.9.3-1.9-1.4-1.3 1.9-.3z"/>'),
    whats: sv('<path d="M4 20l1.2-3.7A8 8 0 1 1 8 19.1z"/><path d="M9 8.5c0 3.3 3 6.5 6.4 6.5l1-1.6-2-1-1 .9c-1-.4-2.3-1.7-2.8-2.8l.9-1-.9-2z"/>', '0 0 24 24', 1.2),
    tw: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#191919" d="M21 6.5c-.7.3-1.4.5-2.1.6.8-.5 1.3-1.2 1.6-2-.7.4-1.5.7-2.3.9a3.6 3.6 0 0 0-6.2 3.3A10.3 10.3 0 0 1 4.5 5.5a3.6 3.6 0 0 0 1.1 4.8c-.6 0-1.1-.2-1.6-.4 0 1.7 1.2 3.2 2.9 3.6-.5.1-1.1.2-1.6.1.5 1.4 1.8 2.5 3.4 2.5A7.3 7.3 0 0 1 3 17.6 10.3 10.3 0 0 0 8.6 19.2c6.7 0 10.4-5.6 10.4-10.4v-.5c.8-.5 1.4-1.1 2-1.8z"/></svg>',
    fb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#191919" d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#191919" d="M12.2 3C7.3 3 4.8 6.5 4.8 9.4c0 1.8.7 3.3 2.1 3.9.2.1.4 0 .5-.3l.2-.8c.1-.3 0-.4-.2-.6-.4-.5-.7-1.1-.7-2 0-2.6 1.9-4.9 5-4.9 2.8 0 4.3 1.7 4.3 3.9 0 2.9-1.3 5.4-3.2 5.4-1.1 0-1.8-.9-1.6-1.9.3-1.3.9-2.6.9-3.5 0-.8-.4-1.5-1.3-1.5-1.1 0-1.9 1.1-1.9 2.6 0 .9.3 1.6.3 1.6L8 17.8c-.4 1.6-.1 3.6 0 3.8 0 .1.2.2.3.1.1-.2 1.4-1.8 1.9-3.4l.7-2.8c.4.7 1.4 1.3 2.6 1.3 3.4 0 5.7-3.1 5.7-7.3C19.2 6.2 16.5 3 12.2 3z"/></svg>'
  };
  // Silhuetas de blusa para a modelagem (setas para dentro = justa, check = regular, setas para fora = ampla)
  const tee = (extra) => sv(`<path d="M8.5 4.5 4 7l1.8 3.5L7.5 9.8V20h9V9.8l1.7.7L20 7l-4.5-2.5c-.5 1.5-1.8 2.3-3.5 2.3S9 6 8.5 4.5z"/>${extra}`, '0 0 24 24', 1.2);
  const FIT_ICON = {
    justa: tee('<path d="M1.5 14.5h3M3.2 13l1.4 1.5L3.2 16M22.5 14.5h-3M20.8 13l-1.4 1.5 1.4 1.5"/>'),
    regular: tee('<path d="M9.8 14.2l1.6 1.6 3-3.2"/>'),
    ampla: tee('<path d="M4.5 14.5h-3M2.9 13l-1.4 1.5L2.9 16M19.5 14.5h3M21.1 13l1.4 1.5-1.4 1.5"/>')
  };

  let gradId = 0;
  function starSVG(frac) {
    const p = 'M12 2.6l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.1l-5.7 3 1.2-6.4-4.7-4.4 6.4-.8z';
    if (frac >= 0.99) return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${p}" fill="#FFC400" stroke="#FFC400" stroke-width="1" stroke-linejoin="round"/></svg>`;
    if (frac <= 0.01) return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${p}" fill="none" stroke="#FFC400" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
    const id = 'sg' + (++gradId);
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="${id}"><stop offset="${frac}" stop-color="#FFC400"/><stop offset="${frac}" stop-color="#fff"/></linearGradient></defs><path d="${p}" fill="url(#${id})" stroke="#FFC400" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
  }
  const stars = (v) => [0, 1, 2, 3, 4].map((i) => starSVG(Math.max(0, Math.min(1, v - i)))).join('');
  const starsA11y = (v, cls = '') => `<span class="stars ${cls}" role="img" aria-label="${num1(v)} de 5 estrelas">${stars(v)}</span>`;

  const logo = (c = '#D71920') => `<svg class="logo" viewBox="0 0 198 40" role="img" aria-label="Renner"><circle cx="20" cy="20" r="19.5" fill="${c}"/><text x="19.2" y="30.5" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-style="italic" font-weight="700" font-size="32" fill="#fff">r</text><text x="47" y="32" font-family="Marcellus,Georgia,serif" font-size="31.5" letter-spacing=".6" fill="${c}">RENNER</text></svg>`;

  /* =========================================================
     Estado da sessão (participante) e resultados do teste
     ========================================================= */
  const KEY = 'prototipo-renner-tcc:estado:v1';
  const RKEY = 'prototipo-renner-tcc:resultados:v1';
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };

  function freshState() {
    const h = Date.now();
    return {
      v: 1,
      cart: [],
      wish: [],
      sel: { cor: 0, tam: null },
      filters: emptyFilters(),
      pedidos: D.PEDIDOS_ANTERIORES(h, DIA),
      uteis: {},
      drafts: {},
      medidas: { ...CLIENTE.medidas },
      reminder: { pushShown: false, popupShown: false, snoozed: false },
      checkout: { entrega: 'normal', pagamento: 'pix', usarCashback: false },
      ui: {}
    };
  }
  const emptyFilters = () => ({ fotos: false, altura: null, tam: null, busto: null, cintura: null, parecidas: false, estrelas: null, ordem: 'uteis' });

  // Toda vez que o protótipo é ABERTO (arquivo ou aba nova), a experiência começa do zero, na home.
  // Recarregar a página na mesma aba mantém onde a pessoa estava (sessionStorage vive só na aba).
  const SESSAO = 'prototipo-renner-tcc:sessao-aba';
  let novaVisita = true;
  try { novaVisita = !sessionStorage.getItem(SESSAO); sessionStorage.setItem(SESSAO, String(Date.now())); } catch (e) { novaVisita = true; }

  let S = novaVisita ? null : store.get(KEY);
  // estado salvo por versão anterior: completa campos que faltarem
  S = S && S.v === 1 ? Object.assign(freshState(), S) : freshState();
  S.filters = Object.assign(emptyFilters(), S.filters);
  S.ui = {};
  if (novaVisita) {
    store.set(KEY, S);
    const h = location.hash || '';
    // mantém só as áreas do moderador/SUS; qualquer outro endereço salvo (pedido, avaliação...) volta para a home
    if (!/^#\/(moderador|sus)\b/.test(h) && h !== '' && h !== '#/') history.replaceState(null, '', location.pathname + location.search + '#/');
  }
  let RES = store.get(RKEY) || {};
  RES.settings = Object.assign({ pid: 'P01', perfil: 'Não definido', mode: 'push+popup', chip: true }, RES.settings || {});
  RES.participants = RES.participants || {};
  RES.events = RES.events || [];
  RES.running = RES.running || null;

  let saveTimer = null;
  function save(now) {
    clearTimeout(saveTimer);
    const run = () => { if (!store.set(KEY, S)) toast('Memória do navegador cheia: remova uma foto.'); };
    if (now) run(); else saveTimer = setTimeout(run, 120);
  }
  const MAX_EVENTOS = 15000;
  let resFalhou = false;
  function saveRes() {
    const ok = store.set(RKEY, RES);
    if (!ok && !resFalhou) toast('Atenção: não foi possível gravar os resultados. Baixe os CSVs agora na Área do moderador.', 5000);
    resFalhou = !ok;
    return ok;
  }

  function log(type, data) {
    RES.events.push(Object.assign({ t: Date.now(), p: RES.settings.pid, task: RES.running ? RES.running.tid : '', type, route: location.hash || '#/' }, data ? { d: data } : {}));
    if (RES.events.length > MAX_EVENTOS) RES.events.splice(0, RES.events.length - MAX_EVENTOS);
    saveRes();
  }

  /* =========================================================
     Regras de negócio
     ========================================================= */
  const cor = () => PRODUTO.cores[S.sel.cor] || PRODUTO.cores[0];
  const cartCount = () => S.cart.reduce((s, c) => s + c.qtd, 0);
  const subtotal = () => cents(S.cart.reduce((s, c) => s + c.preco * c.qtd, 0));
  const findOrder = (id) => S.pedidos.find((o) => o.id === id);
  const releaseAt = (o) => o.entregueEm + REGRAS.prazoDevolucaoDias * DIA;
  const remindersOn = () => RES.settings.mode !== 'nenhum';

  function sizeFor(v, k) {
    // primeiro tamanho cuja faixa comporta a medida (abaixo do PP também cai no PP)
    for (const t of PRODUTO.tamanhos) { if (v <= PRODUTO.tabela[t][k][1]) return t; }
    return PRODUTO.tamanhos[PRODUTO.tamanhos.length - 1];
  }
  function recommendedSize() {
    const m = S.medidas;
    const a = sizeFor(m.busto, 'busto'), b = sizeFor(m.cintura, 'cintura');
    return sizeIdx(a) >= sizeIdx(b) ? a : b;
  }

  function myReviews() {
    const out = [];
    S.pedidos.forEach((o) => o.itens.forEach((it) => { if (it.avaliacao && it.avaliacao.review) out.push(it.avaliacao.review); }));
    return out;
  }
  const reviewsAll = () => [...myReviews(), ...AVALIACOES];
  const reviewDate = (r) => (r.em ? r.em : hoje0() - r.dias * DIA);

  function ratingStats(list) {
    const n = list.length;
    const dist = [0, 0, 0, 0, 0, 0];
    list.forEach((r) => dist[r.nota]++);
    const avg = n ? list.reduce((s, r) => s + r.nota, 0) / n : 0;
    return { n, dist, avg: Math.round(avg * 10) / 10 };
  }
  // Resumo da modelagem (justa / regular / ampla), calculado das avaliações
  function fitStats(list) {
    const n = list.length;
    const c = { justa: 0, regular: 0, ampla: 0 };
    list.forEach((r) => { if (c[r.modelagem] != null) c[r.modelagem]++; });
    const p = (k) => (n ? Math.round((c[k] / n) * 100) : 0);
    const pos = n ? (c.justa * 16.67 + c.regular * 50 + c.ampla * 83.33) / n : 50;
    let head = 'Sem avaliações suficientes', top = null;
    if (n) {
      top = Object.keys(c).sort((a, b) => c[b] - c[a])[0];
      head = MOD_HEAD[top];
    }
    let nuance = '';
    if (n && top === 'regular' && c.justa / n >= 0.15 && c.justa > c.ampla) nuance = 'tende a justa';
    if (n && top === 'regular' && c.ampla / n >= 0.15 && c.ampla > c.justa) nuance = 'tende a ampla';
    return { n, c, pct: { justa: p('justa'), regular: p('regular'), ampla: p('ampla') }, pos, head, top, nuance };
  }
  // Tamanho com mais avaliações de modelagem "regular" no conjunto (empate: o menor). Base: quem comprou aquele tamanho.
  function bestFit(list) {
    const reg = {}, tot = {};
    list.forEach((r) => { tot[r.comprou] = (tot[r.comprou] || 0) + 1; if (r.modelagem === 'regular') reg[r.comprou] = (reg[r.comprou] || 0) + 1; });
    const k = Object.keys(reg).sort((a, b) => reg[b] - reg[a] || sizeIdx(a) - sizeIdx(b))[0];
    return k ? { t: k, n: reg[k], of: tot[k] } : null;
  }
  // Como quem comprou o tamanho t avaliou a modelagem
  function modelagemDoTamanho(t, list = reviewsAll()) {
    const b = list.filter((r) => r.comprou === t);
    const c = { justa: 0, regular: 0, ampla: 0 };
    b.forEach((r) => { if (c[r.modelagem] != null) c[r.modelagem]++; });
    return { n: b.length, ...c };
  }
  const isSimilar = (r) => r.altura && r.busto && Math.abs(r.altura - S.medidas.altura) <= 5 && Math.abs(r.busto - S.medidas.busto) <= 4;

  const ALTURAS = [
    { k: 'a1', label: 'Até 1,59 m', test: (r) => r.altura && r.altura < 160 },
    { k: 'a2', label: 'De 1,60 a 1,69 m', test: (r) => r.altura >= 160 && r.altura < 170 },
    { k: 'a3', label: '1,70 m ou mais', test: (r) => r.altura >= 170 }
  ];
  const BUSTOS = [
    { k: 'b1', label: 'Até 84 cm', test: (r) => r.busto && r.busto <= 84 },
    { k: 'b2', label: '85 a 92 cm', test: (r) => r.busto >= 85 && r.busto <= 92 },
    { k: 'b3', label: '93 a 100 cm', test: (r) => r.busto >= 93 && r.busto <= 100 },
    { k: 'b4', label: '101 cm ou mais', test: (r) => r.busto >= 101 }
  ];
  const CINTURAS = [
    { k: 'c1', label: 'Até 68 cm', test: (r) => r.cintura && r.cintura <= 68 },
    { k: 'c2', label: '69 a 76 cm', test: (r) => r.cintura >= 69 && r.cintura <= 76 },
    { k: 'c3', label: '77 a 84 cm', test: (r) => r.cintura >= 77 && r.cintura <= 84 },
    { k: 'c4', label: '85 cm ou mais', test: (r) => r.cintura >= 85 }
  ];
  const byK = (arr, k) => arr.find((o) => o.k === k);
  const MOD = { justa: 'Justa', regular: 'Regular', ampla: 'Ampla' };
  const MOD_HEAD = MOD; // o rótulo "Modelagem" já aparece ao lado, então o destaque é só o valor
  const TEC = { melhor: 'melhor do que esperava', esperado: 'como esperava', pior: 'pior do que esperava' };
  const CONF = { 1: 'pouco confortável', 2: 'confortável', 3: 'muito confortável' };

  function applyFilters(list, skip) {
    const f = S.filters;
    return list.filter((r) =>
      (skip === 'fotos' || !f.fotos || r.fotos.length) &&
      (skip === 'altura' || !f.altura || byK(ALTURAS, f.altura).test(r)) &&
      (skip === 'tam' || !f.tam || r.comprou === f.tam) &&
      (skip === 'busto' || !f.busto || byK(BUSTOS, f.busto).test(r)) &&
      (skip === 'cintura' || !f.cintura || byK(CINTURAS, f.cintura).test(r)) &&
      (skip === 'parecidas' || !f.parecidas || isSimilar(r)) &&
      (skip === 'estrelas' || !f.estrelas || r.nota === f.estrelas));
  }
  const anyFilter = () => { const f = S.filters; return !!(f.fotos || f.altura || f.tam || f.busto || f.cintura || f.parecidas || f.estrelas); };
  function sortReviews(list) {
    const o = S.filters.ordem;
    const l = [...list];
    const mineFirst = (a, b) => (b.mine ? 1 : 0) - (a.mine ? 1 : 0);
    if (o === 'recentes') l.sort((a, b) => reviewDate(b) - reviewDate(a));
    else if (o === 'fotos') l.sort((a, b) => mineFirst(a, b) || (b.fotos.length ? 1 : 0) - (a.fotos.length ? 1 : 0) || b.uteis - a.uteis);
    else if (o === 'menores') l.sort((a, b) => a.nota - b.nota || b.uteis - a.uteis);
    else l.sort((a, b) => mineFirst(a, b) || (b.uteis + (S.uteis[b.id] ? 1 : 0)) - (a.uteis + (S.uteis[a.id] ? 1 : 0)));
    return l;
  }

  // Pedido entregue com item ainda não avaliado (dentro da janela)
  function pendingReview() {
    const agora = Date.now();
    for (const o of S.pedidos) {
      if (o.seed || !o.entregueEm) continue;
      if (agora - o.entregueEm > REGRAS.janelaAvaliacaoDias * DIA) continue;
      const i = o.itens.findIndex((it) => !it.avaliacao);
      if (i >= 0) return { o, i, it: o.itens[i] };
    }
    return null;
  }

  function ledger() {
    const L = [];
    const agora = Date.now();
    S.pedidos.forEach((o) => {
      o.itens.forEach((it) => {
        if (!it.avaliacao) return;
        const rel = releaseAt(o);
        L.push({ tipo: 'aval', orderId: o.id, nome: it.nome, img: it.img, pts: it.avaliacao.pts, valor: cents(it.avaliacao.pts * REGRAS.reaisPorPonto),
          em: it.avaliacao.em, release: o.liberarJa ? Math.min(rel, agora) : rel, status: (o.liberarJa || agora >= rel) ? 'liberado' : 'pendente',
          isNew: !o.seed, fotos: it.avaliacao.fotos || 0, uteis: it.avaliacao.uteis || 0 });
      });
      if (o.cashbackUsado > 0) L.push({ tipo: 'uso', orderId: o.id, nome: 'Usado como desconto no pedido', img: o.itens[0] && o.itens[0].img, valor: o.cashbackUsado, em: o.criadoEm, status: 'usado' });
    });
    return L.sort((a, b) => b.em - a.em);
  }
  function saldo(L = ledger()) {
    let lib = 0, pend = 0, uso = 0;
    L.forEach((e) => { if (e.tipo === 'uso') uso += e.valor; else if (e.status === 'liberado') lib += e.valor; else pend += e.valor; });
    return { liberado: cents(Math.max(0, lib - uso)), pendente: cents(pend), usado: cents(uso) };
  }

  /* ---------- Formulário: pontos ---------- */
  function parseAltura(v) {
    if (v == null || v === '') return null;
    let n = parseFloat(String(v).replace(',', '.'));
    if (isNaN(n)) return null;
    if (n < 3) n = n * 100;
    n = Math.round(n);
    return n >= 130 && n <= 210 ? n : null;
  }
  const LIM = { busto: [60, 160], cintura: [45, 150], quadril: [60, 170] };
  function parseCm(v, k) {
    if (v == null || v === '') return null;
    const n = Math.round(parseFloat(String(v).replace(',', '.')));
    return !isNaN(n) && n >= LIM[k][0] && n <= LIM[k][1] ? n : null;
  }
  function fieldDone(d, k) {
    switch (k) {
      case 'nota': return d.nota > 0;
      case 'altura': return parseAltura(d.altura) != null;
      case 'busto': case 'cintura': case 'quadril': return parseCm(d[k], k) != null;
      case 'fotos': return d.fotos.length > 0;
      case 'comentario': return d.comentario.trim().length >= REGRAS.minCaracteresComentario;
      default: return !!d[k];
    }
  }
  const points = (d) => CAMPOS.reduce((s, c) => s + (fieldDone(d, c.k) ? c.pts : 0), 0);
  const medidasPts = (d) => MED.reduce((s, k) => s + (fieldDone(d, k) ? P(k) : 0), 0);
  const OBRIG = ['nota', 'modelagem']; // campos obrigatórios do formulário
  const OBRIG_LABEL = { nota: 'nota', modelagem: 'modelagem' };
  function draftFor(o, i) {
    const key = o.id + ':' + i;
    if (!S.drafts[key]) {
      S.drafts[key] = { nota: 0, comprado: o.itens[i].tam, modelagem: null, tecido: null, conforto: null,
        altura: '', busto: '', cintura: '', quadril: '', publico: true, fotos: [], comentario: '' };
    }
    return S.drafts[key];
  }
  function nextHint(d) {
    const miss = (k) => (fieldDone(d, k) ? 0 : P(k));
    const cands = [
      { pts: miss('fotos'), txt: 'Adicione uma foto usando a peça', id: 'q-fotos' },
      { pts: P(...MED) - medidasPts(d), txt: 'Informe suas medidas', id: 'q-medidas' },
      { pts: miss('comentario'), txt: 'Conte como ficou em você', id: 'q-comentario' },
      { pts: miss('modelagem'), txt: 'Avalie a modelagem', id: 'q-modelagem' },
      { pts: miss('nota'), txt: 'Dê uma nota para a peça', id: 'q-nota' },
      { pts: miss('tecido'), txt: 'Avalie o tecido', id: 'q-tecido' },
      { pts: miss('conforto'), txt: 'Avalie o conforto', id: 'q-conforto' }
    ].filter((c) => c.pts > 0).sort((a, b) => b.pts - a.pts);
    return cands[0] || null;
  }

  /* =========================================================
     Peças de layout
     ========================================================= */
  function header() {
    const n = cartCount();
    const pend = pendingReview() && remindersOn();
    return `
      <div class="strip"><b>Frete grátis*</b> acima de R$ 279 + <b>até 7x</b> sem juros</div>
      <div class="brands"><div class="on">${logo('#191919').replace('class="logo"', 'class="logo" style="height:20px;width:auto"')}</div><div class="off">ASHUA</div></div>
      <header class="hdr" id="hdr">
        <button class="hdr-menu" data-a="menu" aria-label="Abrir menu">${I.menu}<span>Menu</span>${pend ? '<i class="dot" aria-label="Você tem uma compra para avaliar"></i>' : ''}</button>
        <a class="hdr-logo" href="#/" aria-label="Página inicial">${logo()}</a>
        <div class="hdr-icons">
          <a href="#/lista-de-desejos" aria-label="Lista de desejos">${I.heart}</a>
          <a href="#/sacola" aria-label="Sacola${n ? `, ${n} ${n > 1 ? 'itens' : 'item'}` : ''}">${I.bag}${n ? `<span class="badge">${n}</span>` : ''}</a>
        </div>
      </header>
      <form class="search" data-form="search" role="search">${I.search}<input type="search" name="q" placeholder="Buscar produtos" aria-label="Buscar produtos" autocomplete="off">${I.camera}</form>`;
  }
  const subHeader = (title, back) => `<div class="subhdr"><a class="back" href="${back}" aria-label="Voltar">${I.chevL}</a><div class="ttl">${title}</div><span></span></div>`;

  function footer() {
    const acc = (t, links) => `<details class="acc"><summary>${t} ${I.chevD}</summary><div class="acc-body">${links.map((l) => `<a href="${l[1] || '#'}" ${l[1] ? '' : 'data-a="ilustrativo"'}>${l[0]}</a>`).join('')}</div></details>`;
    return `<footer class="footer">
      ${acc('Atendimento', [['Central de atendimento'], ['Trocas e devoluções'], ['Acompanhe seu pedido', '#/conta/pedidos'], ['Compre pelo WhatsApp']])}
      ${acc('Minha conta', [['Meus pedidos', '#/conta/pedidos'], ['Meu cashback', '#/conta/cashback'], ['Lista de desejos', '#/lista-de-desejos']])}
      ${acc('Institucional', [['Sobre a Renner'], ['Sustentabilidade'], ['Nossas lojas'], ['Cartões Renner']])}
      ${acc('Políticas', [['Política de privacidade'], ['Termos de uso'], ['Regulamento do cashback de avaliações', '#/conta/cashback']])}
      <p class="app-dl">Baixe o app Renner e compre com mais facilidade</p>
      <p class="disclaimer">Protótipo acadêmico de UX · TCC da Pós-Graduação em Comunicação Digital &amp; Business Intelligence (ESPM), Grupo 4, 2026. Não é o site oficial da Lojas Renner S.A. Avaliações, pedidos, pessoas e valores são fictícios. Fotos de produto: lojasrenner.com.br. Fotos de clientes: Unsplash. · ${modoRemoto() ? '' : '<a href="#/moderador">Área do moderador</a> · '}<a href="#/" data-a="recomecar">Recomeçar o protótipo</a></p>
    </footer>`;
  }

  function pcard(p) {
    const fav = S.wish.includes(p.id);
    const off = p.de ? Math.round((1 - p.preco / p.de) * 100) : 0;
    return `<div class="pcard" data-a="open-prod" data-id="${p.id}" role="link" tabindex="0" aria-label="${esc(p.nome)}">
      <div class="ph"><img src="${p.img}" alt="${esc(p.nome)}" loading="lazy">
        <button class="fav ${fav ? 'on' : ''}" data-a="fav" data-id="${p.id}" aria-label="${fav ? 'Remover da' : 'Adicionar à'} lista de desejos" aria-pressed="${fav}">${I.heart}</button>
        ${off ? `<span class="off">${off}% Off</span>` : ''}${p.flag ? `<span class="flag">${p.flag}</span>` : ''}</div>
      <span class="brandbox">${p.marca}</span>
      <div class="nm">${esc(p.nome)}</div>
      <div class="pr">${p.de ? `<s>${brl(p.de)}</s><b class="sale">${brl(p.preco)}</b>` : `<b>${brl(p.preco)}</b>`}</div>
      <div class="inst">${parcelas(p.preco)}</div>
    </div>`;
  }

  function fitMeter(st) {
    const top = st.top;
    return `<div class="fitmeter">
      <div class="fitmeter-h"><span>Modelagem</span><b>${st.head}${st.nuance ? ` <span>· ${st.nuance}</span>` : ''}</b></div>
      <div class="fitbar" aria-hidden="true"><span class="${top === 'justa' ? 'hl' : ''}"></span><span class="${top === 'regular' ? 'hl' : ''}"></span><span class="${top === 'ampla' ? 'hl' : ''}"></span><i class="marker" style="left:${st.pos}%"></i></div>
      <div class="fitlabels"><div><b>${st.pct.justa}%</b>Justa</div><div><b>${st.pct.regular}%</b>Regular</div><div><b>${st.pct.ampla}%</b>Ampla</div></div>
    </div>`;
  }

  function allPhotos(list) {
    const out = [];
    list.forEach((r) => r.fotos.forEach((f, i) => out.push({ r, i, f })));
    return out;
  }
  function photoStrip(list, ctx) {
    const ph = allPhotos(list);
    if (!ph.length) return '';
    return `<div class="thumbs" data-keep="thumbs-${ctx}">${ph.map((p, k) => `<button class="thumb" data-a="viewer-strip" data-ctx="${ctx}" data-k="${k}" aria-label="Foto de ${esc(p.r.nome)}, ${p.r.altura ? altTxt(p.r.altura) + ', ' : ''}comprou ${p.r.comprou}"><img src="${photoUrl(p.f, 200, 260)}" alt="" loading="lazy"><span class="tag">${p.r.altura ? altTxt(p.r.altura) + ' · ' : ''}${p.r.comprou}</span></button>`).join('')}</div>`;
  }

  /* =========================================================
     Telas
     ========================================================= */
  function viewHome() {
    const pend = pendingReview();
    const showCard = pend && remindersOn() && (S.reminder.pushShown || S.reminder.popupShown);
    const c0 = PRODUTO.cores[0];
    const benef = '<span><b>FRETE GRÁTIS*</b> acima de R$ 279</span><span><b>10% DE CASHBACK*</b> + até 7x sem juros no Cartão Renner</span><span><b>TROCA FÁCIL</b> em mais de 300 lojas</span><span><b>AVALIE E GANHE</b> cashback nas suas compras</span>';
    return `<div class="screen">${header()}
      ${showCard ? `<a class="reminder-card" href="#/avaliar/${pend.o.id}/${pend.i}?origem=lembrete-home"><img src="${pend.it.img}" alt=""><span class="t"><b>Você tem 1 compra para avaliar</b>Conte como ficou a ${esc(pend.it.nome.split(' ').slice(0, 2).join(' ').toLowerCase())} e ganhe até <em>${MAXP} pontos</em></span>${I.chevR}</a>` : ''}
      <section class="hero" aria-label="Destaques">
        <div class="hero-track" id="hero" data-keep="hero">
          <a class="hero-slide split" href="#/blusas" style="background:#EDE9E4">
            <div class="hero-copy"><div class="k">feminino</div><h2>básicos<br>que<br>vestem<br>bem</h2><div class="off">a partir de<small>R$ 49,90</small></div><span class="cta">Comprar</span></div>
            <img src="${RENNER_IMG(c0.codigo, 'large', 3)}" alt="Modelo usando a Blusa Básica Justinha off white">
          </a>
          <a class="hero-slide dark" href="#/conta/cashback">
            <img src="${RENNER_IMG('927869211', 'large', 3)}" alt="" style="object-position:center 20%">
            <div class="hero-copy"><div class="k">novidade</div><h2>Sua opinião<br>vale cashback</h2><div class="off" style="font-size:16px;font-weight:400">Avalie o que comprou e ganhe até <b>${MAXR}</b> por peça</div><span class="cta">Como funciona</span></div>
          </a>
        </div>
        <div class="hero-dots" id="hero-dots"><button class="on" data-a="hero-go" data-i="0" aria-label="Destaque 1"></button><button data-a="hero-go" data-i="1" aria-label="Destaque 2"></button></div>
      </section>
      <div class="benefits" aria-label="Benefícios"><div class="benefits-track">${benef}${benef}</div></div>
      <h2 class="sec-title">Compre por categoria</h2>
      <div class="cats" data-keep="cats">${CATEGORIAS.map((c) => `<a class="cat" ${c.href ? `href="${c.href}"` : 'href="#/" data-a="ilustrativo"'}><img src="${c.img}" alt="" loading="lazy"><span>${c.nome}</span></a>`).join('')}</div>
      <h2 class="sec-title">Básicos que todo mundo ama</h2>
      <div class="pgrid">${VITRINE.slice(0, 4).map(pcard).join('')}</div>
      <a class="promo-band" href="#/conta/cashback"><div><b>Sua opinião vale cashback</b><p>Avalie o que comprou, ganhe até ${MAXP} pontos por peça e use como desconto.</p></div><span class="pill">Saiba mais</span></a>
      ${footer()}</div>`;
  }

  function viewListing(r) {
    const q = r.q.q;
    return `<div class="screen">${header()}
      <nav class="crumbs" aria-label="Você está em"><a href="#/">Início</a> - <span>Feminino</span> - <b>Blusas e Camisetas</b></nav>
      <h1 class="list-title">${q ? `Resultados da busca por: <em>"${esc(q)}"</em>` : 'Blusas e camisetas'}</h1>
      <div class="list-bar"><span>${VITRINE.length} produtos</span><button class="btn-filter" data-a="ilustrativo">${I.sliders} FILTRAR E ORDENAR</button></div>
      <div class="pgrid">${VITRINE.map(pcard).join('')}</div>
      ${footer()}</div>`;
  }

  function viewPDP() {
    const c = cor();
    const all = reviewsAll();
    const rs = ratingStats(all);
    const fs = fitStats(all);
    const rec = recommendedSize();
    const sim = all.filter(isSimilar);
    const simRec = sim.filter((r) => r.comprou === rec);
    const simRecReg = simRec.filter((r) => r.modelagem === 'regular').length;
    const fav = S.wish.includes(PRODUTO.id);
    const nPhotos = allPhotos(all).length;
    const topTwo = sortReviews(all).slice(0, 2);
    const tip = fs.nuance === 'tende a justa'
      ? `É uma peça ajustada ao corpo: ${fs.pct.justa}% das clientes acharam a modelagem justa. Se você prefere mais soltinha ou está entre dois tamanhos, escolha o maior.`
      : fs.nuance === 'tende a ampla'
        ? `${fs.pct.ampla}% das clientes acharam a modelagem ampla. Se você prefere mais ajustada, considere 1 tamanho abaixo.`
        : `A maioria das clientes avalia a modelagem como ${MOD[fs.top || 'regular'].toLowerCase()}.`;
    const simTxt = simRec.length
      ? `${simRec.length} de ${sim.length} clientes com medidas parecidas com as suas (${altTxt(S.medidas.altura)}, busto ${S.medidas.busto} cm) compraram ${rec}, e ${simRecReg} delas acharam a modelagem regular. Ver avaliações delas`
      : `Veja como a peça ficou em ${sim.length} clientes com medidas parecidas com as suas (${altTxt(S.medidas.altura)}, busto ${S.medidas.busto} cm)`;

    return `<div class="screen has-bar">${header()}
      <div class="gallery">
        <div class="gal-track" id="gal" data-keep="gal">${c.fotos.map((n, i) => `<img src="${RENNER_IMG(c.codigo, 'zoom', n)}" alt="${esc(PRODUTO.nome)} ${c.nome}, foto ${i + 1}" ${i ? 'loading="lazy"' : ''} draggable="false">`).join('')}</div>
        <button class="gal-arrow l" data-a="gal" data-d="-1" aria-label="Foto anterior">${I.chevL}</button>
        <button class="gal-arrow r" data-a="gal" data-d="1" aria-label="Próxima foto">${I.chevR}</button>
        <span class="gal-zoom">${I.zoom}</span>
        <span class="gal-count" id="gal-count">1/${c.fotos.length}</span>
      </div>
      <div class="pdp-tabs"><button data-a="ilustrativo">${I.sparkSearch} Buscar similares</button><i></i><button data-a="go-reviews">${I.starO} Avaliações</button></div>
      <div class="pdp">
        <div class="pdp-title">
          <h1>${PRODUTO.nome} ${c.nome}</h1>
          <button class="pdp-rate" data-a="scroll" data-id="fitbox" aria-label="Nota da peça ${num1(rs.avg)} de 5. Ver modelagem e avaliações"><span>${num1(rs.avg)}</span>${starSVG(1)}</button>
        </div>
        <small class="code">Código: ${c.codigo}</small>
        <div class="price-box"><div class="now">${brl(PRODUTO.preco)}</div><div class="inst">${PRODUTO.parcelas} sem juros no Cartão Renner</div></div>

        <div class="attr-label">Cor: <b>${c.nome}</b></div>
        <div class="swatches" role="radiogroup" aria-label="Cor">${PRODUTO.cores.map((k, i) => `<button class="swatch ${i === S.sel.cor ? 'on' : ''}" data-a="color" data-i="${i}" role="radio" aria-checked="${i === S.sel.cor}" aria-label="${k.nome}"><i style="background:${k.hex}"></i></button>`).join('')}</div>

        <div class="attr-label" id="sizes-label">Tamanho</div>
        <div class="sizes" id="sizes" role="radiogroup" aria-labelledby="sizes-label">${PRODUTO.tamanhos.map((t) => `<button class="size ${S.sel.tam === t ? 'on' : ''}" data-a="size" data-t="${t}" role="radio" aria-checked="${S.sel.tam === t}">${t}${t === rec ? '<span class="rec">indicado</span>' : ''}</button>`).join('')}</div>
        ${S.ui.sizeErr && !S.sel.tam ? `<div class="size-msg" role="alert">${I.info.replace('#191919', '#D71920')} Selecione um tamanho para continuar.</div>` : ''}
        ${sizeHint()}

        <section class="fitbox" id="fitbox" aria-labelledby="fitbox-t">
          <div class="fitbox-kicker" id="fitbox-t">Avaliações desta peça</div>
          <div class="fitbox-rate"><span class="big">${num1(rs.avg)}</span>${starsA11y(rs.avg)}<button class="cnt" data-a="go-reviews">${rs.n} avaliações</button></div>
          <p class="fitbox-note">Nota da peça, dada por quem comprou e recebeu esta blusa. A nota da loja aparece separada, em "Vendido e entregue por".</p>
          ${fitMeter(fs)}
          <p class="fit-tip">${tip}</p>
          <button class="fit-me" data-a="go-reviews" data-f="parecidas">
            <span class="ic">${I.user}</span>
            <span><b>Para suas medidas: ${rec}</b><small>${simTxt}</small></span>${I.chevR}
          </button>
          <div class="fit-photos">
            <div class="fit-photos-h"><span>Fotos de clientes (${nPhotos})</span><button data-a="go-reviews" data-f="fotos">Ver todas</button></div>
            ${photoStrip(all, 'pdp')}
          </div>
          <button class="btn-out" data-a="go-reviews">Ver avaliações e filtrar por altura e tamanho</button>
        </section>

        <div class="about">Sobre o produto:</div>
        <div class="about-row"><button data-a="provador">${I.hanger} Encontre seu tamanho</button><i></i><button data-a="tabela">${I.ruler} Tabela de medidas</button></div>

        <div class="seller"><span class="bl">CORTELLE</span><i></i><div class="by">Vendido e Entregue por<b>Lojas Renner</b><div class="store-rate">${starSVG(1)} <span>Nota da loja ${num1(PRODUTO.notaLoja)} · entrega e atendimento</span></div></div></div>

        <div class="buy-row" id="buyrow"><button class="heart-btn ${fav ? 'on' : ''}" data-a="fav" data-id="${PRODUTO.id}" aria-label="Lista de desejos" aria-pressed="${fav}">${I.heart}</button><button class="btn-red" data-a="add">Adicionar à sacola</button></div>
        <div class="share">Curtiu? Compartilhe esta peça!<div class="share-icons"><span>${I.whats}</span><span>${I.tw}</span><span>${I.fb}</span><span>${I.pin}</span></div></div>

        <div class="frete"><h3>CALCULAR FRETE</h3>
          <form class="frete-row" data-form="cep"><input name="cep" inputmode="numeric" placeholder="Digite seu CEP" aria-label="CEP" maxlength="9" value="${esc(S.ui.cep || '')}"><button class="btn-black" type="submit">OK</button></form>
          ${S.ui.freteOk ? `<div class="frete-res"><b>Entrega normal:</b> até 5 dias úteis · ${brl(14.90)} (grátis acima de R$ 279)<br><b>Retirar na loja:</b> grátis, em até 2 dias úteis</div>` : '<a class="link" href="#/produto" data-a="ilustrativo" style="display:inline-block;margin-top:12px">Não sei meu CEP</a>'}
        </div>

        <details class="acc" style="margin-top:26px" open><summary>Descrição ${I.chevD}</summary><div class="acc-body">
          <p>Blusa feminina básica e ajustada, confeccionada em malha ribana de algodão, com gola redonda, mangas curtas e textura canelada.</p>
          <ul><li>Ajustada (justinha)</li><li>Gola redonda</li><li>Manga curta</li><li>Tecido: ribana</li></ul>
          <h4>Medidas da modelo</h4><p>Altura: ${PRODUTO.modelo.altura} · Busto: ${PRODUTO.modelo.busto} cm · Cintura: ${PRODUTO.modelo.cintura} cm · Quadril: ${PRODUTO.modelo.quadril} cm · Modelo veste: ${PRODUTO.modelo.veste}</p>
          <h4>Composição</h4><p>${PRODUTO.composicao}</p>
        </div></details>
      </div>

      <section class="pdp-reviews" id="avaliacoes">
        <h2>Avaliações</h2>
        ${ratingSummary(rs)}
        <div class="rv-wrap" style="padding:0">${topTwo.map(reviewCard).join('')}</div>
        <button class="btn-out" style="margin-top:18px" data-a="go-reviews">Ver todas as ${rs.n} avaliações</button>
      </section>
      <div class="info-blocks">
        <div class="info-block"><h3>Trocas e devoluções</h3><p>Troca fácil em mais de 300 Lojas Renner. Devolução de compras on-line em até ${REGRAS.prazoDevolucaoDias} dias após o recebimento.</p></div>
        <div class="info-block"><h3>Formas de pagamento</h3><div class="pay-grid"><div><b>CARTÃO RENNER</b>até 7x sem juros</div><div><b>OUTROS CARTÕES</b>até 5x sem juros</div><div><b>PIX</b>pagamento instantâneo</div></div></div>
      </div>
      ${footer()}
      <div class="fixed-bottom" id="pdp-bar"><div class="row"><button class="heart-btn ${fav ? 'on' : ''}" data-a="fav" data-id="${PRODUTO.id}" aria-label="Lista de desejos" aria-pressed="${fav}">${I.heart}</button><button class="btn-red" data-a="add">Adicionar à sacola${S.sel.tam ? ` · ${S.sel.tam}` : ''}</button></div></div>
    </div>`;
  }

  function sizeHint() {
    const t = S.sel.tam;
    if (!t) return '';
    const m = modelagemDoTamanho(t);
    const rec = recommendedSize();
    let txt = m.n
      ? `<b>Quem comprou ${t}:</b> ${m.regular} de ${m.n} acharam a modelagem regular${m.justa ? `, ${m.justa} justa` : ''}${m.ampla ? `, ${m.ampla} ampla` : ''}.`
      : `Ainda não há avaliações de quem comprou ${t}.`;
    if (rec !== t) txt += ` Pelas suas medidas, o indicado é <b>${rec}</b>.`;
    else txt += ' É o tamanho indicado para as suas medidas.';
    return `<div class="size-hint" aria-live="polite">${I.users}<div>${txt}</div></div>`;
  }

  function ratingSummary(rs) {
    return `<div class="rv-summary">
      <div class="score"><div class="n">${num1(rs.avg)}</div>${starsA11y(rs.avg, 'sm')}<p>Média de ${rs.n} avaliações</p></div>
      <div class="dist">${[5, 4, 3, 2, 1].map((k) => `<button data-a="f-star" data-v="${k}" class="${S.filters.estrelas === k ? 'on' : ''}" aria-label="${rs.dist[k]} avaliações com ${k} estrelas"><span>${k}${starSVG(1)}</span><span class="bar"><i style="width:${rs.n ? (rs.dist[k] / rs.n) * 100 : 0}%"></i></span><span>${rs.dist[k]}</span></button>`).join('')}</div>
    </div><p class="rv-explain">Essa é a nota que esta peça recebeu de quem comprou. Não é a nota da loja.</p>`;
  }

  function reviewCard(r) {
    const useful = !!S.uteis[r.id];
    const n = r.uteis + (useful ? 1 : 0);
    const f = S.filters;
    const hlA = f.altura || f.parecidas, hlB = f.busto || f.parecidas, hlC = f.cintura;
    return `<article class="rv" id="rv-${r.id}">
      <div class="rv-top">${starsA11y(r.nota, 'sm')}<span class="rv-date">${fmt(reviewDate(r))}</span></div>
      <div class="rv-name">${esc(r.nome)} ${r.mine ? '<span class="mine-tag">Sua avaliação</span>' : ''}<span class="verified">${I.check.replace('#191919', '#1B7A3A')} Compra verificada</span></div>
      ${r.altura ? `<div class="body-chips"><span class="${hlA ? 'hl' : ''}">${altTxt(r.altura)}</span><span class="${hlB ? 'hl' : ''}">Busto ${r.busto} cm</span><span class="${hlC ? 'hl' : ''}">Cintura ${r.cintura} cm</span><span>Quadril ${r.quadril} cm</span></div>` : ''}
      <dl class="rv-fitrow two"><div><dt>Tamanho comprado</dt><dd>${r.comprou}</dd></div><div><dt>Modelagem</dt><dd>${MOD[r.modelagem] || '–'}</dd></div></dl>
      <div class="rv-attrs">Cor: ${esc(r.cor)}${r.tecido ? ` · Tecido: ${TEC[r.tecido]}` : ''}${r.conforto ? ` · Conforto: ${CONF[r.conforto]}` : ''}</div>
      ${r.texto ? `<p class="rv-text">${esc(r.texto)}</p>` : '<p class="rv-text empty">A cliente não escreveu comentário, só preencheu as informações da peça.</p>'}
      ${r.fotos.length ? `<div class="rv-photos">${r.fotos.map((p, i) => `<button class="thumb" data-a="viewer" data-r="${r.id}" data-i="${i}" aria-label="Ampliar foto ${i + 1} de ${esc(r.nome)}"><img src="${photoUrl(p, 200, 260)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
      <div class="rv-useful">Esse comentário foi útil? <button class="useful-btn ${useful ? 'on' : ''}" data-a="useful" data-r="${r.id}" aria-pressed="${useful}" aria-label="Marcar como útil, ${n} pessoas acharam útil">${I.thumb} ${n}</button></div>
    </article>`;
  }

  function viewReviews() {
    const all = reviewsAll();
    const rs = ratingStats(all);
    const list = applyFilters(all);
    const fs = fitStats(list);
    const best = bestFit(list);
    const f = S.filters;
    const filtered = anyFilter();
    const chip = (on, a, label, attrs = '') => `<button class="chip ${on ? 'on' : ''}" data-a="${a}" ${attrs} aria-pressed="${on}">${label}</button>`;
    const altLabel = f.altura ? `Altura: ${byK(ALTURAS, f.altura).label.replace('De ', '')}` : 'Altura';
    const medLabel = (f.busto || f.cintura) ? `Medidas: ${[f.busto && 'busto ' + byK(BUSTOS, f.busto).label, f.cintura && 'cintura ' + byK(CINTURAS, f.cintura).label].filter(Boolean).join(', ')}` : 'Medidas';
    const sorted = sortReviews(list);
    return `<div class="screen has-bar">${subHeader('Avaliações', '#/produto')}
      <div class="rv-wrap">
        <div class="prod-mini"><img src="${RENNER_IMG(cor().codigo, 'medium', cor().fotos[0])}" alt=""><div><b>${PRODUTO.nome}</b><small>Nota e modelagem desta peça</small></div></div>
        ${ratingSummary(rs)}
        <div class="rv-fit" aria-live="polite">
          <p class="scope">${filtered ? `Modelagem entre as <b>${list.length}</b> avaliações filtradas` : `Modelagem segundo ${all.length} avaliações`}</p>
          ${list.length ? fitMeter(fs) : '<p class="scope">Nenhuma avaliação com esses filtros.</p>'}
          ${best ? `<div class="best"><span class="sz">${best.t}</span><span>É o tamanho com mais avaliações de modelagem regular${filtered ? ' no filtro' : ''}: <b>${best.n} de ${best.of}</b> clientes que compraram ${best.t}.</span></div>` : ''}
        </div>
        ${allPhotos(list).length ? `<div class="rv-photos-h"><h3>Fotos de clientes</h3><span>${allPhotos(list).length} fotos${filtered ? ' no filtro' : ''}</span></div>${photoStrip(list, 'rv')}` : ''}
        <div class="filterbar"><div class="chips" data-keep="chips" role="toolbar" aria-label="Filtros de avaliações">
          ${chip(f.parecidas, 'f-toggle', `${I.user} Parecidas comigo`, 'data-k="parecidas"')}
          ${chip(!!f.altura, 'f-sheet', `${altLabel} ${f.altura ? '' : '▾'}`, 'data-k="altura"')}
          ${chip(!!f.tam, 'f-sheet', `${f.tam ? 'Comprou: ' + f.tam : 'Tamanho comprado ▾'}`, 'data-k="tam"')}
          ${chip(!!(f.busto || f.cintura), 'f-sheet', `${medLabel} ${f.busto || f.cintura ? '' : '▾'}`, 'data-k="medidas"')}
          ${chip(f.fotos, 'f-toggle', `${I.camPlus} Com fotos`, 'data-k="fotos"')}
          ${f.estrelas ? chip(true, 'f-star', `${f.estrelas} estrelas <span class="x">×</span>`, `data-v="${f.estrelas}"`) : ''}
        </div></div>
        <div class="rv-results"><span><b>${list.length}</b> ${list.length === 1 ? 'avaliação' : 'avaliações'}</span>
          <label class="sr" for="ordem">Ordenar</label><select id="ordem" data-in="ordem">
            ${[['uteis', 'Mais úteis'], ['recentes', 'Mais recentes'], ['fotos', 'Com fotos primeiro'], ['menores', 'Menores notas']].map(([v, l]) => `<option value="${v}" ${f.ordem === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select></div>
        ${filtered ? '<button class="rv-clear" data-a="clear-filters">Limpar filtros</button>' : ''}
        <div id="rv-list">${sorted.length ? sorted.map(reviewCard).join('') : `<div class="empty-box"><b>Nenhuma avaliação com esses filtros</b>Tente tirar um dos filtros.<br><br><button class="btn-out sm" data-a="clear-filters">Limpar filtros</button></div>`}</div>
      </div>
      <div class="fixed-bottom">
        <div class="sizebar-label"><span>Escolha seu tamanho</span>${filtered && best ? '<span><i style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#D71920;vertical-align:middle"></i> mais indicado no filtro</span>' : ''}</div>
        <div class="sizebar">${PRODUTO.tamanhos.map((t) => `<button class="size ${S.sel.tam === t ? 'on' : ''} ${filtered && best && best.t === t ? 'best' : ''}" data-a="size" data-t="${t}" aria-pressed="${S.sel.tam === t}">${t}</button>`).join('')}<button class="btn-red" data-a="add">Adicionar</button></div>
      </div>
    </div>`;
  }

  function viewBag() {
    if (!S.cart.length) {
      return `<div class="screen">${header()}<div class="page-t">Sacola</div>
        <div class="empty-box"><b>Sua sacola está vazia</b>Que tal dar uma olhada nas novidades?<br><br><a class="btn-red" href="#/blusas" style="max-width:320px;margin:0 auto">Continuar comprando</a></div>${footer()}</div>`;
    }
    const sal = saldo();
    return `<div class="screen">${header()}<div class="page-t">Sacola (${cartCount()})</div>
      ${S.cart.map((c, i) => `<div class="bag-item"><img src="${c.img}" alt="">
        <div><div class="nm">${esc(c.nome)}</div>
          <div class="meta">Cor: ${c.cor}<span>Tam: <select data-in="cart-tam" data-i="${i}" aria-label="Tamanho">${PRODUTO.tamanhos.map((t) => `<option ${t === c.tam ? 'selected' : ''}>${t}</option>`).join('')}</select></span></div>
          <div class="bot"><div class="qty"><button data-a="qty" data-i="${i}" data-d="-1" aria-label="Diminuir quantidade">−</button><span>${c.qtd}</span><button data-a="qty" data-i="${i}" data-d="1" aria-label="Aumentar quantidade">+</button></div><b>${brl(c.preco * c.qtd)}</b></div>
          <button class="rm" data-a="rm" data-i="${i}">Remover</button></div></div>`).join('')}
      <div class="summary">
        <div class="ln"><span>Subtotal</span><span>${brl(subtotal())}</span></div>
        <div class="ln"><span>Frete</span><span>calculado no próximo passo</span></div>
        <div class="ln tot"><span>Total</span><span>${brl(subtotal())}</span></div>
      </div>
      ${sal.liberado > 0 ? `<div class="cb-box">${I.coin}<span>Você tem <b>${brl(sal.liberado)}</b> de cashback de avaliações liberado. Dá para usar no pagamento.</span></div>` : ''}
      <div class="summary"><div class="actions"><a class="btn-red" href="#/checkout">Finalizar compra</a><a class="btn-out" href="#/blusas">Continuar comprando</a></div></div>
      ${footer()}</div>`;
  }

  const FRETES = {
    normal: { label: 'Entrega normal', prazo: 'até 5 dias úteis', dias: 5, v: 14.90 },
    expressa: { label: 'Entrega expressa', prazo: 'até 2 dias úteis', dias: 2, v: 24.90 },
    loja: { label: 'Retirar na loja', prazo: 'Renner Shopping Ibirapuera, em até 2 dias úteis', dias: 2, v: 0 }
  };
  const PAGTOS = {
    pix: { label: 'Pix', sub: 'Aprovação na hora' },
    renner: { label: 'Cartão Renner •••• 4821', sub: 'Em até 7x sem juros' },
    credito: { label: 'Mastercard •••• 1234', sub: 'Em até 5x sem juros' }
  };
  function checkoutTotals() {
    const sub = subtotal();
    const fr = FRETES[S.checkout.entrega];
    const frete = S.checkout.entrega === 'normal' && sub >= 279 ? 0 : fr.v;
    const lib = saldo().liberado;
    const desc = S.checkout.usarCashback ? cents(Math.min(lib, sub + frete)) : 0;
    return { sub, frete, desc, total: cents(sub + frete - desc), lib };
  }
  function viewCheckout() {
    if (!S.cart.length) return viewBag();
    const t = checkoutTotals();
    const ck = S.checkout;
    const radio = (group, k, title, sub, val) => `<button class="radio ${ck[group] === k ? 'on' : ''}" data-a="ck" data-g="${group}" data-k="${k}" role="radio" aria-checked="${ck[group] === k}"><span class="r"></span><span class="t">${title}<small>${sub}</small></span>${val != null ? `<span class="v">${val}</span>` : ''}</button>`;
    return `<div class="screen has-bar">
      <div class="chk-hdr"><a href="#/sacola" aria-label="Voltar para a sacola" style="display:flex">${I.chevL}</a>${logo()}<span class="secure">${I.lock} Compra segura</span></div>
      <div class="page-t">Finalizar compra</div>
      <p class="page-sub">Comprando como ${CLIENTE.nome} ${CLIENTE.sobrenome} · ${maskEmail(CLIENTE.email)}</p>
      <section class="chk-sec" style="margin-top:10px"><h2><span class="n">1</span>Entrega</h2>
        <div class="addr"><div>${CLIENTE.nome} ${CLIENTE.sobrenome}<br>${CLIENTE.endereco.join('<br>')}</div><button data-a="ilustrativo">Alterar</button></div>
        <div role="radiogroup" aria-label="Forma de entrega">
          ${Object.entries(FRETES).map(([k, f]) => radio('entrega', k, f.label, f.prazo, k === 'normal' && t.sub >= 279 ? 'Grátis' : f.v ? brl(f.v) : 'Grátis')).join('')}
        </div>
      </section>
      <section class="chk-sec"><h2><span class="n">2</span>Pagamento</h2>
        <div role="radiogroup" aria-label="Forma de pagamento">${Object.entries(PAGTOS).map(([k, p]) => radio('pagamento', k, p.label, p.sub, null)).join('')}</div>
        ${t.lib > 0 ? `<button class="switch-row" data-a="ck-cashback" role="switch" aria-checked="${ck.usarCashback}"><span class="switch ${ck.usarCashback ? 'on' : ''}"></span><span>Usar <b>${brl(t.lib)}</b> de cashback de avaliações<br><small style="color:#5C5C5C">Saldo liberado no Meu cashback. Não é o cashback do Cartão Renner.</small></span></button>` : ''}
      </section>
      <section class="chk-sec"><h2><span class="n">3</span>Resumo</h2>
        <div class="mini-items">${S.cart.map((c) => `<div class="mini-item"><img src="${c.img}" alt=""><div>${esc(c.nome)}<small>Cor: ${c.cor} · Tam: ${c.tam} · Qtd: ${c.qtd}</small></div><b>${brl(c.preco * c.qtd)}</b></div>`).join('')}</div>
        <div class="summary" style="padding:14px 0 0">
          <div class="ln"><span>Subtotal</span><span>${brl(t.sub)}</span></div>
          <div class="ln"><span>Frete</span><span>${t.frete ? brl(t.frete) : 'Grátis'}</span></div>
          ${t.desc ? `<div class="ln disc"><span>Cashback de avaliações</span><span>- ${brl(t.desc)}</span></div>` : ''}
          <div class="ln tot"><span>Total</span><span>${brl(t.total)}</span></div>
        </div>
      </section>
      <p class="fine" style="margin-top:14px">Protótipo: nenhum pagamento é feito e nenhum dado de cartão é pedido.</p>
      <div class="fixed-bottom"><button class="btn-red" data-a="place-order">Finalizar pedido · ${brl(t.total)}</button></div>
    </div>`;
  }

  // Narrativa da entrega conforme a opção escolhida no checkout
  function entregaInfo(o) {
    const tipo = o.entregaTipo || 'normal';
    const dias = (FRETES[tipo] || FRETES.normal).dias;
    const loja = tipo === 'loja';
    return { dias, loja,
      quando: `${dias} dias depois`,
      fato: loja ? 'você retirou a blusa na loja física' : 'a blusa foi entregue na sua casa',
      pushT: loja ? 'Você retirou sua blusa! Como ficou em você?' : 'Sua blusa chegou! Como ficou em você?',
      kicker: loja ? 'Você retirou sua compra' : 'Sua compra chegou' };
  }
  // Em teste moderado o moderador controla o tempo pela T4; o botão some para a participante não avançar sozinha
  const moderado = () => !!RES.running || Object.keys((RES.participants[RES.settings.pid] || {}).tasks || {}).length > 0;
  // Fim da jornada: controle do protótipo para recomeçar do zero (compra → entrega → avaliação)
  function restartCard() {
    return `<div class="sim"><div class="k">${I.restart} Protótipo</div>
      <p><b>Você chegou ao fim da experiência.</b> Para fazer de novo desde a compra, recomece do início. A sacola, o pedido e a avaliação desta simulação são apagados.</p>
      <button class="btn-sim" data-a="recomecar">${I.restart} Recomeçar do início</button></div>`;
  }
  function simCard(o) {
    if (moderado()) return '';
    const e = entregaInfo(o);
    return `<div class="sim"><div class="k">${I.clock} Simulação do protótipo</div>
      <p><b>Avance no tempo:</b> ${e.quando}, ${e.fato}. Você volta a abrir o site da Renner.</p>
      <button class="btn-sim" data-a="sim-entrega" data-o="${o.id}">${I.fwd} Avançar ${e.dias} dias</button></div>`;
  }

  function viewOrderDone(r) {
    const o = findOrder(r.parts[1]);
    if (!o) return viewHome();
    return `<div class="screen">${header()}
      <div class="done-hero"><div class="ok">${I.check}</div><h1>Pedido realizado!</h1><p>Obrigada, ${CLIENTE.nome}. Enviamos a confirmação para ${maskEmail(CLIENTE.email)}.</p></div>
      <div class="box"><h3>Pedido nº ${o.id}</h3>
        <div class="kv" style="margin-top:8px"><span>Pagamento</span><span>${o.pagamento}</span></div>
        <div class="kv"><span>Entrega</span><span>${o.entrega}</span></div>
        <div class="kv"><span>Previsão</span><span>até ${fmt(o.previsao)}</span></div>
        <div class="kv"><span>Total</span><b>${brl(o.total)}</b></div>
        <div class="mini-items">${o.itens.map((c) => `<div class="mini-item"><img src="${c.img}" alt=""><div>${esc(c.nome)}<small>Cor: ${c.cor} · Tam: ${c.tam}</small></div><span>${c.qtd}x</span></div>`).join('')}</div>
      </div>
      <div class="teaser">${I.gift}<div><b>Ganhe cashback avaliando esta compra</b><p>Quando receber, conte como ficou e ganhe até ${MAXP} pontos (${MAXR}). O valor é liberado na sua conta depois do prazo de devolução.</p></div></div>
      ${o.entregueEm ? '' : simCard(o)}
      <div class="actions-col"><a class="btn-red" href="#/conta/pedidos">Acompanhar pedido</a><a class="btn-out" href="#/">Continuar comprando</a></div>
      ${footer()}</div>`;
  }

  function viewAccount() {
    const sal = saldo();
    const pend = pendingReview();
    const row = (href, ic, t, sub, right) => `<${href ? `a href="${href}"` : 'button data-a="ilustrativo"'}>${ic}<span>${t}${sub ? `<small>${sub}</small>` : ''}</span>${right || '<span></span>'}${I.chevR}</${href ? 'a' : 'button'}>`;
    return `<div class="screen">${header()}
      <div class="hello"><h1>Olá, ${CLIENTE.nome}</h1><p>${maskEmail(CLIENTE.email)}</p></div>
      <nav class="acct-list" aria-label="Minha conta">
        ${row('#/conta/pedidos', I.box, 'Meus pedidos', 'Acompanhe entregas e avalie suas compras', pend ? '<span class="pill">1 para avaliar</span>' : '')}
        ${row('#/conta/cashback', I.coin, 'Meu cashback', 'Cashback de avaliações', `<span class="pill dark">${brl(sal.liberado)}</span>`)}
        <button data-a="provador">${I.ruler}<span>Minhas medidas<small>Provador virtual: ${altTxt(S.medidas.altura)} · busto ${S.medidas.busto} cm</small></span><span></span>${I.chevR}</button>
        ${row('#/lista-de-desejos', I.heart, 'Lista de desejos')}
        ${row(null, I.user, 'Meus dados')}
        ${row(null, I.store, 'Meus endereços')}
        ${row(null, I.gift, 'Vale-troca e cartão-presente')}
      </nav>${footer()}</div>`;
  }

  function orderCard(o) {
    const delivered = !!o.entregueEm;
    const status = delivered
      ? `<span class="status ok">${I.check} Entregue em ${fmt(o.entregueEm)}</span>`
      : `<span class="status wait">${I.truck} Em preparação · chega até ${fmt(o.previsao)}</span>`;
    const agora = Date.now();
    return `<div class="order">
      <div class="order-h"><div><b>Pedido nº ${o.id}</b><span>Realizado em ${fmt(o.criadoEm)}</span></div><div style="text-align:right"><b>${brl(o.total)}</b><span>${o.pagamento.split(' ')[0] === 'Cartão' ? 'Cartão Renner' : o.pagamento.split(' •')[0]}</span></div></div>
      <div class="order-status">${status}</div>
      ${o.itens.map((it, i) => {
        let cta = '';
        if (it.avaliacao) {
          const rel = releaseAt(o);
          const lib = o.liberarJa || agora >= rel;
          cta = `<div class="reviewed"><div class="top"><b>${I.check.replace('stroke-width="2"', 'stroke-width="2" style="width:14px;height:14px;vertical-align:-2px"')} Avaliado · ${it.avaliacao.pts} pontos = ${brl(it.avaliacao.pts * REGRAS.reaisPorPonto)}</b><span class="st ${lib ? 'lib' : 'pend'}">${lib ? 'Liberado' : 'Pendente'}</span></div>
            <span>${lib ? `Cashback liberado em ${fmt(Math.min(rel, agora))}` : `Cashback liberado em ${fmt(rel)}, fim do prazo de devolução`}</span><a href="#/conta/cashback">Ver meu cashback</a></div>`;
        } else if (delivered && agora - o.entregueEm <= REGRAS.janelaAvaliacaoDias * DIA) {
          cta = `<div class="earn"><div class="earn-h">${I.gift}<div><b>Avalie e ganhe até ${MAXP} pontos</b><span>= até ${MAXR} de cashback na sua conta</span></div></div>
            <a class="btn-red" href="#/avaliar/${o.id}/${i}?origem=meus-pedidos">Avaliar e ganhar pontos</a>
            <p class="rule">Leva cerca de 1 minuto. Os pontos não dependem da nota.</p></div>`;
        } else if (!delivered) {
          cta = `<div class="waiting">${I.clock} Quando receber, avalie a peça e ganhe até ${MAXP} pontos de cashback.</div>`;
        }
        return `<div class="order-item"><img src="${it.img}" alt=""><div><div class="nm">${esc(it.nome)}</div><div class="meta">Cor: ${it.cor} · Tam: ${it.tam} · ${brl(it.preco)}</div></div></div>${cta}`;
      }).join('')}
      ${!delivered && simCard(o) ? `<div style="margin:0 14px 14px">${simCard(o).replace('class="sim"', 'class="sim" style="margin:0"')}</div>` : ''}
      <div class="order-links"><button data-a="ilustrativo">Detalhes do pedido</button><button data-a="ilustrativo">Trocar ou devolver</button></div>
    </div>`;
  }
  function viewOrders() {
    const orders = [...S.pedidos].sort((a, b) => b.criadoEm - a.criadoEm);
    return `<div class="screen">${header()}
      <nav class="crumbs"><a href="#/conta">Minha conta</a> - <b>Meus pedidos</b></nav>
      <div class="page-t">Meus pedidos</div>
      ${orders.map(orderCard).join('')}
      ${footer()}</div>`;
  }

  // Pílula de pontos de uma pergunta: "+10 pts" → "✓ +10" (ou "5/20 pts" quando parcial)
  const CHECK_PILL = I.check.replace('#191919', '#fff').replace('stroke-width="2"', 'stroke-width="2.4" style="width:11px;height:11px;vertical-align:-1px"');
  const pillHtml = (got, max) => (got >= max ? `${CHECK_PILL} +${max}` : got ? `${got}/${max} pts` : `+${max} pts`);
  function q(id, title, k, done, body, opts = {}) {
    const err = S.ui.formErr && S.ui.formErr.includes(k);
    const pts = opts.pts != null ? opts.pts : CAMPO[k].pts;
    const pill = opts.pill || pillHtml(done ? pts : 0, pts);
    return `<section class="q ${err ? 'err' : ''}" id="${id}" aria-labelledby="${id}-t">
      <div class="q-h"><h3 id="${id}-t">${title}${opts.req ? '<span class="req">obrigatório</span>' : ''}${opts.sub ? `<small>${opts.sub}</small>` : ''}</h3><span class="q-pts ${done ? 'done' : ''}" id="qp-${k}">${pill}</span></div>
      ${body}</section>`;
  }

  function viewForm(r) {
    const o = findOrder(r.parts[1]);
    const idx = +(r.parts[2] || 0);
    const it = o && o.itens[idx];
    if (!o || !it) return `<div class="screen">${subHeader('Avaliar compra', '#/conta/pedidos')}<div class="empty-box"><b>Pedido não encontrado</b><a class="link" href="#/conta/pedidos">Ir para Meus pedidos</a></div></div>`;
    if (it.avaliacao) return viewSent(r);
    if (!o.entregueEm) return `<div class="screen">${subHeader('Avaliar compra', '#/conta/pedidos')}<div class="empty-box"><b>Este pedido ainda não foi entregue</b>Você poderá avaliar quando receber.</div>${simCard(o)}</div>`;
    const d = draftFor(o, idx);
    const pts = points(d);
    const isMain = it.prod === PRODUTO.id;
    const chipRow = (k, opts, wide) => `<div class="chip-row ${wide ? 'wide' : ''}" role="radiogroup">${opts.map(([v, l]) => `<button class="opt-s ${d[k] === v ? 'on' : ''}" data-a="fv" data-k="${k}" data-v="${v}" role="radio" aria-checked="${d[k] === v}">${l}</button>`).join('')}</div>`;
    const sizes = PRODUTO.tamanhos.map((t) => [t, t]);
    const tamAvaliado = d.comprado || it.tam;
    const mp = medidasPts(d);
    const notaLeg = ['Toque nas estrelas', 'Não gostei', 'Gostei pouco', 'Razoável', 'Gostei', 'Amei'][d.nota];
    const rel = releaseAt(o);
    const meas = (k, label, unit, ph) => `<div class="meas"><label for="m-${k}">${label}</label><div class="inp ${fieldDone(d, k) ? 'ok' : ''}" id="mi-${k}"><input id="m-${k}" data-in="m" data-k="${k}" inputmode="decimal" placeholder="${ph}" value="${esc(d[k])}" autocomplete="off"><span class="u">${unit}</span></div></div>`;
    return `<div class="screen has-bar">${subHeader('Avaliar compra', '#/conta/pedidos')}
      <div class="pts-sticky" id="pts">${ptsPanel(d, pts)}</div>
      <div class="rvf">
        <div class="prod-mini"><img src="${it.img}" alt=""><div><b>${esc(it.nome)}</b><small>Cor: ${it.cor} · Tamanho: ${it.tam} · Pedido nº ${o.id}</small></div></div>
        <div class="note-pts">${I.info}<span><b>Seus pontos não dependem da nota.</b> Avaliações positivas e negativas valem o mesmo: o que conta é o quanto você preenche.</span></div>
        ${q('q-nota', 'Que nota você dá para a peça?', 'nota', fieldDone(d, 'nota'), `<div class="star-input" role="radiogroup" aria-label="Nota de 1 a 5">${[1, 2, 3, 4, 5].map((v) => `<button data-a="fv" data-k="nota" data-v="${v}" role="radio" aria-checked="${d.nota === v}" aria-label="${v} ${v > 1 ? 'estrelas' : 'estrela'}">${starSVG(d.nota >= v ? 1 : 0)}</button>`).join('')}</div><div class="star-legend">${notaLeg}</div>`, { req: true })}
        ${q('q-comprado', 'Tamanho comprado', 'comprado', fieldDone(d, 'comprado'), chipRow('comprado', sizes), { sub: 'Já preenchemos com o tamanho do seu pedido.' })}
        ${q('q-modelagem', 'Como você avalia a modelagem da peça?', 'modelagem', fieldDone(d, 'modelagem'), `<div class="fit-opts" role="radiogroup">${['ampla', 'regular', 'justa'].map((v) => `<button class="${d.modelagem === v ? 'on' : ''}" data-a="fv" data-k="modelagem" data-v="${v}" role="radio" aria-checked="${d.modelagem === v}">${FIT_ICON[v]}${MOD[v]}</button>`).join('')}</div>`, { req: true, sub: `Pensando no tamanho ${tamAvaliado}, que você comprou.` })}
        ${q('q-tecido', 'O que achou do tecido?', 'tecido', fieldDone(d, 'tecido'), chipRow('tecido', [['melhor', 'Melhor do que esperava'], ['esperado', 'Como esperava'], ['pior', 'Pior do que esperava']], true))}
        ${q('q-conforto', 'E o conforto?', 'conforto', fieldDone(d, 'conforto'), chipRow('conforto', [[1, 'Pouco confortável'], [2, 'Confortável'], [3, 'Muito confortável']], true))}
        ${q('q-medidas', 'Suas medidas', 'altura', mp === P(...MED), `
          <p class="q-help">Ajudam quem tem o corpo parecido com o seu a escolher o tamanho certo.</p>
          <button class="btn-out sm" style="margin-top:12px" data-a="usar-medidas">${I.ruler} Usar medidas do meu Provador Virtual</button>
          <div class="meas-grid">${meas('altura', 'Altura', 'm', '1,65')}${meas('busto', 'Busto', 'cm', '90')}${meas('cintura', 'Cintura', 'cm', '72')}${meas('quadril', 'Quadril', 'cm', '100')}</div>
          <button class="check-row" data-a="publico" role="checkbox" aria-checked="${d.publico}"><span class="bx">${d.publico ? I.check : ''}</span><span>Mostrar minhas medidas junto com a avaliação. Seu nome aparece abreviado (${CLIENTE.nome} ${CLIENTE.sobrenome[0]}.).</span></button>`,
          { pts: P(...MED), pill: pillHtml(mp, P(...MED)) })}
        ${q('q-fotos', 'Fotos usando a peça', 'fotos', fieldDone(d, 'fotos'), `
          <p class="q-help">Foto no espelho ou de corpo inteiro mostra como a peça fica em pessoas reais. É o que mais ajuda outras clientes.</p>
          ${d.fotos.length ? `<div class="photo-row">
            ${d.fotos.map((f, i) => `<div class="up-photo"><img src="${photoUrl(f, 200, 260)}" alt="Sua foto ${i + 1}"><button data-a="rm-foto" data-i="${i}" aria-label="Remover foto ${i + 1}">${I.close}</button></div>`).join('')}
            ${d.fotos.length < 3 ? `<button class="up-tile" data-a="foto-sheet">${I.camPlus}<span>Adicionar mais</span></button>` : ''}
          </div>` : `<button class="up-big" data-a="foto-sheet"><span class="up-badge">${I.coin} Envie e ganhe ${P('fotos')} pontos</span>${I.camPlus}<b>Adicionar fotos</b><small>Tire agora ou escolha da galeria</small></button>`}`)}
        ${q('q-comentario', 'Conte como ficou em você', 'comentario', fieldDone(d, 'comentario'), `
          <label class="sr" for="coment">Comentário</label>
          <textarea class="ta" id="coment" data-in="comentario" maxlength="600" placeholder="Ex.: Tenho 1,62 m e busto 88. Comprei M e ficou justinha, do jeito que eu queria. O tecido não fica transparente.">${esc(d.comentario)}</textarea>
          <div class="ta-count ${fieldDone(d, 'comentario') ? 'ok' : ''}" id="ta-count">${taCount(d)}</div>`)}
        <p class="rvf-end">Depois de enviar, os pontos ficam como <b>cashback pendente</b> até ${fmt(rel)}, fim do prazo de devolução (${REGRAS.prazoDevolucaoDias} dias após a entrega). Aí o valor é liberado no seu <b>Meu cashback</b>. ${isMain ? 'Sua avaliação aparece na página do produto.' : ''}</p>
      </div>
      <div class="fixed-bottom"><button class="btn-red" id="send-btn" data-a="send" aria-disabled="${!OBRIG.every((k) => fieldDone(d, k))}">Enviar avaliação · ${pts} pts</button></div>
    </div>`;
  }
  function taCount(d) {
    const n = d.comentario.trim().length;
    const min = REGRAS.minCaracteresComentario;
    const pts = P('comentario');
    return n >= min ? `${I.check.replace('#191919', '#1B7A3A').replace('stroke-width="2"', 'stroke-width="2" style="width:13px;height:13px;vertical-align:-2px"')} +${pts} pontos garantidos (${n} caracteres)` : `${n}/${min} caracteres para ganhar +${pts} pontos`;
  }
  function ptsPanel(d, pts) {
    const nx = nextHint(d);
    return `<div class="pts-row">
        <span class="gift">${I.gift}</span>
        <div class="pts-main"><b><span id="pts-num">${pts}</span> de ${REGRAS.maxPontos} pontos</b><span class="money">= <b id="pts-brl">${brl(pts * REGRAS.reaisPorPonto)}</b> de cashback</span></div>
        <span class="max">até ${brl(REGRAS.maxPontos * REGRAS.reaisPorPonto)}</span>
        <span class="pts-bubble" id="pts-bubble" aria-hidden="true"></span>
      </div>
      <div class="pts-bar" role="progressbar" aria-label="Pontos" aria-valuemin="0" aria-valuemax="${MAXP}" aria-valuenow="${pts}"><i id="pts-fill" style="width:${Math.min(100, (pts / MAXP) * 100)}%"></i></div>
      ${nx ? `<button class="pts-next" data-a="scroll" data-id="${nx.id}">${I.gift} <span>Próximo: ${nx.txt} e ganhe <u>+${nx.pts} pontos</u></span></button>` : `<div class="pts-next full">${I.check.replace('#191919', '#1B7A3A')} Avaliação completa: você garantiu o máximo de pontos!</div>`}`;
  }

  function viewSent(r) {
    const o = findOrder(r.parts[1]);
    const idx = +(r.parts[2] || 0);
    const it = o && o.itens[idx];
    if (!o || !it || !it.avaliacao) return viewOrders();
    const a = it.avaliacao;
    const rel = releaseAt(o);
    const valor = a.pts * REGRAS.reaisPorPonto;
    const lib = o.liberarJa || Date.now() >= rel;
    const publicada = !!a.review;
    // o que faltou de verdade (medidas agrupadas)
    const feitos = a.campos || [];
    const faltou = [];
    if (a.campos) {
      if (!feitos.includes('fotos')) faltou.push(`foto (+${P('fotos')})`);
      const medFalta = MED.filter((k) => !feitos.includes(k));
      if (medFalta.length) faltou.push(`medidas (+${P(...medFalta)})`);
      if (!feitos.includes('comentario')) faltou.push(`comentário (+${P('comentario')})`);
      ['modelagem', 'tecido', 'conforto', 'nota', 'comprado'].forEach((k) => { if (!feitos.includes(k)) faltou.push(`${CAMPO[k].label.toLowerCase()} (+${P(k)})`); });
    }
    return `<div class="screen">${subHeader('Avaliação enviada', '#/conta/pedidos')}
      <div class="sent-hero"><div class="ok">${I.check}</div><h1>Obrigada, ${CLIENTE.nome}!</h1><p>${publicada ? 'Sua avaliação já aparece na página da peça e vai ajudar outras clientes a escolher o tamanho certo.' : 'Sua avaliação vai ajudar outras clientes a escolher o tamanho certo.'}</p></div>
      <div class="pts-card">
        <div class="top"><div class="plus">+${a.pts} <small>pontos</small></div><div class="eq">= <b>${brl(valor)}</b> de cashback</div></div>
        <div class="rows">
          <div class="kv"><span>Status</span><span class="st ${lib ? 'lib' : 'pend'}">${lib ? 'Liberado' : 'Pendente'}</span></div>
          <div class="kv"><span>${lib ? 'Liberado em' : 'Liberação prevista'}</span><b>${fmt(lib ? Math.min(rel, Date.now()) : rel)}</b></div>
          <div class="kv"><span>Onde usar</span><span>Site e app Renner</span></div>
        </div>
      </div>
      <div class="timeline">
        <div class="tl"><span class="b f">${I.check}</span><div><b>${fmtShort(a.em)} · Avaliação enviada</b><span>Você ganhou ${a.pts} pontos (${brl(valor)}).</span></div></div>
        <div class="tl"><span class="b ${lib ? 'f' : ''}">${lib ? I.check : ''}</span><div><b>${fmtShort(rel)} · Fim do prazo de devolução</b><span>${REGRAS.prazoDevolucaoDias} dias depois da entrega (${fmtShort(o.entregueEm)}). Sem devolução, a compra está finalizada.</span></div></div>
        <div class="tl"><span class="b ${lib ? 'f' : ''}">${lib ? I.check : ''}</span><div><b>${fmtShort(rel)} · ${brl(valor)} liberados</b><span>O valor entra no Meu cashback, na sua conta, para usar em compras no site ou no app.</span></div></div>
      </div>
      ${faltou.length && a.pts < MAXP ? `<p class="fine">Faltaram ${MAXP - a.pts} pontos para o máximo: ${faltou.join(', ')}. Na próxima avaliação, vale preencher.</p>` : ''}
      <p class="fine">Se a compra for devolvida dentro do prazo, os pontos são cancelados. Este cashback é da sua conta Renner e é separado do cashback dos Cartões Renner.</p>
      <div class="actions-col"><a class="btn-red" href="#/conta/cashback">Ver meu cashback</a>${publicada ? '<a class="btn-out" href="#/avaliacoes" data-a="ver-minha">Ver minha avaliação na página</a>' : ''}<a class="btn-out" href="#/">Voltar para a loja</a></div>
      ${restartCard()}
    </div>`;
  }

  function viewCashback() {
    const L = ledger();
    const sal = saldo(L);
    const avals = L.filter((e) => e.tipo === 'aval');
    const next = avals.filter((e) => e.status === 'pendente').sort((a, b) => a.release - b.release)[0];
    const totalPts = avals.reduce((s, e) => s + e.pts, 0);
    const uteis = avals.reduce((s, e) => s + (e.uteis || 0), 0);
    const comFoto = avals.some((e) => e.fotos > 0);
    const completa = avals.some((e) => e.pts >= REGRAS.maxPontos);
    const bdg = (ok, ic, t, prog) => `<div class="bdg ${ok ? '' : 'lock'}"><div class="c">${ic}</div>${t}${prog ? `<span class="pg">${prog}</span>` : ''}</div>`;
    return `<div class="screen">${header()}
      <nav class="crumbs"><a href="#/conta">Minha conta</a> - <b>Meu cashback</b></nav>
      <div class="page-t">Meu cashback</div>
      <p class="page-sub">Cashback de avaliações: você ganha pontos ao avaliar o que comprou, e eles viram dinheiro para usar na Renner.</p>
      <div class="cb-cards">
        <div class="cb-card dark"><div class="lb">${I.check.replace('#191919', '#fff')} Liberado</div><div class="v">${brl(sal.liberado)}</div><p>Disponível agora para usar no site e no app</p></div>
        <div class="cb-card"><div class="lb">${I.clock} Pendente</div><div class="v">${brl(sal.pendente)}</div><p>Libera quando acaba o prazo de devolução</p></div>
      </div>
      ${next ? `<div class="next-rel">${I.clock}<span>Próxima liberação: <b>${brl(next.valor)}</b> em <b>${fmt(next.release)}</b></span></div>` : ''}
      <div class="impact"><div><b>${avals.length}</b><span>avaliações feitas</span></div><div><b>${totalPts}</b><span>pontos ganhos</span></div><div><b>${uteis}</b><span>pessoas acharam útil</span></div></div>
      <h3 class="h-sec">Suas conquistas</h3>
      <div class="badges">
        ${bdg(avals.length >= 1, I.medal, 'Primeira avaliação')}
        ${bdg(comFoto, I.photo, 'Avaliação com foto')}
        ${bdg(completa, I.trophy, 'Avaliação completa', completa ? '' : `${MAXP} pontos`)}
        ${bdg(avals.length >= 5, I.users, '5 avaliações', `${Math.min(avals.length, 5)}/5`)}
        ${bdg(uteis >= 50, I.thumb, 'Ajudou 50 pessoas', `${Math.min(uteis, 50)}/50`)}
      </div>
      <h3 class="h-sec">Histórico por pedido</h3>
      <div class="hist">${L.map((e) => `<div class="hist-i ${e.isNew && e.status === 'pendente' ? 'new' : ''}"><img src="${e.img}" alt="">
          <div><div class="nm">${esc(e.nome)}</div><div class="meta">Pedido nº ${e.orderId}${e.tipo === 'aval' ? ` · avaliado em ${fmt(e.em)}` : ` · ${fmt(e.em)}`}</div>
            <div class="meta">${e.tipo === 'uso' ? 'Desconto aplicado no pagamento' : e.status === 'pendente' ? `Libera em <b style="color:#191919">${fmt(e.release)}</b>` : `Liberado em ${fmt(e.release)}`}</div></div>
          <div class="val"><b>${e.tipo === 'uso' ? '- ' : '+'}${brl(e.valor)}</b>${e.tipo === 'aval' ? `<small>${e.pts} pontos</small>` : '<small>&nbsp;</small>'}<span class="st ${e.status === 'pendente' ? 'pend' : e.status === 'liberado' ? 'lib' : 'uso'}">${e.status === 'pendente' ? 'Pendente' : e.status === 'liberado' ? 'Liberado' : 'Usado'}</span></div></div>`).join('')}</div>
      <h3 class="h-sec">Como funciona</h3>
      <div class="timeline" style="margin-top:4px">
        <div class="tl"><span class="b f">${I.check}</span><div><b>Receba e avalie</b><span>Em até ${REGRAS.janelaAvaliacaoDias} dias após a entrega, por Meus pedidos ou pelo lembrete que enviamos.</span></div></div>
        <div class="tl"><span class="b f">${I.check}</span><div><b>Cada informação vale pontos</b><span>Até ${MAXP} por peça. Fotos valem +${P('fotos')}, comentário +${P('comentario')} e medidas +${P(...MED)}. A nota, boa ou ruim, não muda os pontos.</span></div></div>
        <div class="tl"><span class="b f">${I.check}</span><div><b>${REGRAS.maxPontos} pontos = ${brl(REGRAS.maxPontos * REGRAS.reaisPorPonto)}</b><span>O valor fica pendente até o fim do prazo de devolução (${REGRAS.prazoDevolucaoDias} dias após a entrega).</span></div></div>
        <div class="tl"><span class="b f">${I.check}</span><div><b>Liberado na sua conta</b><span>Use como desconto no pagamento, no site ou no app. Se a compra for devolvida, os pontos são cancelados.</span></div></div>
      </div>
      <div class="sep-card">${I.info}<span>Este saldo é da sua conta Renner e <b>não se mistura</b> com o cashback dos Cartões Renner (Realize), que continua no app do cartão.</span></div>
      ${restartCard()}
      ${footer()}</div>`;
  }

  function viewWish() {
    const items = VITRINE.filter((p) => S.wish.includes(p.id));
    return `<div class="screen">${header()}<div class="page-t">Lista de desejos</div>
      ${items.length ? `<div class="pgrid" style="margin-top:12px">${items.map(pcard).join('')}</div>` : '<div class="empty-box"><b>Sua lista está vazia</b>Toque no coração dos produtos para guardar aqui.</div>'}
      ${footer()}</div>`;
  }

  /* ---------- Moderador ---------- */
  function partRec(pid = RES.settings.pid) {
    if (!RES.participants[pid]) RES.participants[pid] = { perfil: RES.settings.perfil, tasks: {}, sus: null, criado: Date.now() };
    return RES.participants[pid];
  }
  const RES_LABEL = { sucesso: '✓ Sucesso', ajuda: '~ Com ajuda', falha: '✗ Não concluiu', interrompida: '! Interrompida' };
  function viewMod() {
    const st = RES.settings;
    const pr = RES.participants[st.pid];
    const run = RES.running;
    const parts = Object.entries(RES.participants);
    return `<div class="mod">
      <a href="#/" class="link">← Voltar para a loja</a>
      <h1 style="margin-top:12px">Área do moderador</h1>
      <p class="muted">Teste de usabilidade do protótipo. Os resultados ficam salvos neste aparelho até você apagar.</p>

      <h2>Participante</h2>
      <div class="card">
        <div class="row2"><div><label for="mod-p">Código</label><input type="text" id="mod-p" data-in="mod-p" value="${esc(st.pid)}"></div>
          <div><label for="mod-perfil">Perfil</label><select id="mod-perfil" data-in="mod-perfil">${['Insegura', 'Recorrente', 'Avaliadora', 'Não definido'].map((p) => `<option ${st.perfil === p ? 'selected' : ''}>${p}</option>`).join('')}</select></div></div>
        <div style="margin-top:10px"><label for="mod-rem">Lembrete pós-compra</label><select id="mod-rem" data-in="mod-reminder">
          ${[['push+popup', 'Push + pop-up ao abrir a loja (padrão)'], ['push', 'Só notificação push'], ['popup', 'Só pop-up ao abrir a loja'], ['nenhum', 'Nenhum: ela precisa achar em Meus pedidos']].map(([v, l]) => `<option value="${v}" ${st.mode === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <label style="display:flex;gap:8px;align-items:center;margin-top:12px;font-size:14px;color:#191919"><input type="checkbox" data-in="mod-chip" ${st.chip ? 'checked' : ''}> Mostrar cronômetro discreto na tela durante a tarefa</label>
        <div class="btns"><button class="b red" data-a="mod-reset">Reiniciar protótipo para nova participante</button><button class="b" data-a="mod-next">Próxima participante (novo código)</button></div>
        <p class="muted" style="margin-top:8px">Reiniciar limpa sacola, pedidos novos, avaliações e filtros desta sessão. Os resultados registrados continuam guardados.</p>
      </div>

      <h2>Roteiro rápido</h2>
      <div class="card muted" style="line-height:1.6">1. Explique que quem está sendo testada é a loja, não ela. 2. Peça para pensar em voz alta. 3. Leia o cenário e toque em <b>Iniciar</b>; o protótipo já abre no ponto certo. 4. As tarefas 2 a 5 terminam sozinhas; a 1 e a 6 você encerra. 5. No fim, abra o questionário SUS.</div>

      <h2>Tarefas</h2>
      ${TAREFAS.map((t) => {
        const r = pr && pr.tasks[t.id];
        const isRun = run && run.tid === t.id;
        return `<div class="task ${isRun ? 'run' : ''}"><h3><span>${t.id} · ${t.titulo}</span><span class="tcc">${t.tcc}</span></h3>
          <div class="scn">“${t.cenario}”</div>
          <div class="crit">Começa em: ${t.inicio}. ${t.criterio}</div>
          ${r ? `<div class="res"><b>${RES_LABEL[r.res] || r.res}</b> em ${r.t}s${r.meta ? ` · ${esc(Object.entries(r.meta).map(([k, v]) => `${k}: ${v}`).join(' · '))}` : ''}</div>` : ''}
          ${isRun ? '<label class="muted" for="mod-notes" style="display:block;margin-top:10px">Observações (vão para o CSV)</label><textarea id="mod-notes" rows="2" style="width:100%;border:1px solid #BDBDBD;padding:8px;font-size:14px"></textarea>' : ''}
          <div class="btns">${isRun
            ? `<button class="b pri" data-a="mod-end" data-r="sucesso">✓ Sucesso</button><button class="b" data-a="mod-end" data-r="ajuda">~ Com ajuda</button><button class="b" data-a="mod-end" data-r="falha">✗ Não concluiu</button><button class="b" data-a="mod-cancel">Cancelar</button>`
            : `<button class="b ${r ? '' : 'pri'}" data-a="mod-start" data-t="${t.id}">${r ? 'Refazer' : 'Iniciar'} ${t.id}</button>`}</div></div>`;
      }).join('')}

      <h2>Questionário SUS</h2>
      <div class="card"><a class="b pri" href="#/sus" style="display:inline-block;text-decoration:none">Abrir o questionário para a participante</a>
        <p class="muted" style="margin-top:8px">${pr && pr.sus ? `SUS de ${esc(st.pid)}: <b>${num1(pr.sus.score)}</b> pontos` : 'Ainda sem resposta desta participante.'} Referência: acima de 68 é considerado acima da média.</p></div>

      <h2>Resultados (${parts.length} ${parts.length === 1 ? 'participante' : 'participantes'})</h2>
      ${resFalhou ? '<div class="card" style="border-color:#D71920;color:#D71920"><b>A última gravação falhou.</b> Baixe os CSVs agora para não perder dados.</div>' : ''}
      ${RES.events.length > MAX_EVENTOS * 0.8 ? `<div class="card" style="border-color:#8A5300;color:#4A2E00">O registro de eventos está perto do limite (${RES.events.length} de ${MAX_EVENTOS}). Baixe o CSV de eventos e apague os resultados de teste-piloto.</div>` : ''}
      <div class="card" style="overflow-x:auto">
        ${parts.length ? `<table><thead><tr><th>Part.</th><th>Perfil</th>${TAREFAS.map((t) => `<th>${t.id}</th>`).join('')}<th>SUS</th></tr></thead><tbody>
          ${parts.map(([pid, p]) => `<tr><td><b>${esc(pid)}</b></td><td>${esc(p.perfil)}</td>${TAREFAS.map((t) => { const r = p.tasks[t.id]; return `<td>${r ? `${(RES_LABEL[r.res] || '').slice(0, 1)} ${r.t}s` : '–'}</td>`; }).join('')}<td>${p.sus ? num1(p.sus.score) : '–'}</td></tr>`).join('')}
        </tbody></table>${susMean()}` : '<p class="muted">Nenhum resultado ainda.</p>'}
        <div class="btns"><button class="b" data-a="mod-csv" data-t="tarefas">Baixar CSV das tarefas</button><button class="b" data-a="mod-csv" data-t="sus">Baixar CSV do SUS</button><button class="b" data-a="mod-csv" data-t="eventos">Baixar CSV de eventos (${RES.events.length})</button></div>
        <div class="btns"><button class="b" data-a="mod-clear">Apagar todos os resultados</button></div>
      </div>

      <h2>Atalhos</h2>
      <div class="card"><div class="btns">
        <button class="b" data-a="mod-go" data-h="#/produto">Abrir página do produto</button>
        <button class="b" data-a="mod-deliver">Simular entrega do último pedido</button>
        <button class="b" data-a="mod-push">Mostrar push agora</button>
        <button class="b" data-a="mod-popup">Mostrar pop-up agora</button>
        <button class="b" data-a="mod-release">Liberar cashback pendente (fim do prazo)</button>
      </div></div>
      <p class="muted" style="margin:24px 0 40px">Protótipo acadêmico · TCC ESPM Grupo 4 · dados fictícios.</p>
    </div>`;
  }
  function susMean() {
    const s = Object.values(RES.participants).map((p) => p.sus && p.sus.score).filter((v) => v != null);
    return s.length ? `<p class="muted" style="margin-top:8px">Média SUS: <b>${num1(s.reduce((a, b) => a + b, 0) / s.length)}</b> (n = ${s.length})</p>` : '';
  }

  function viewSUS() {
    const ja = RES.participants[RES.settings.pid] && RES.participants[RES.settings.pid].sus;
    if (S.ui.susDone || (ja && !S.ui.susRedo)) {
      return `<div class="sus"><div class="sent-hero"><div class="ok">${I.check}</div><h1>Obrigada por participar!</h1><p>Suas respostas foram registradas. Pode devolver o celular para a pessoa que está conduzindo o teste.</p></div>
        <div class="actions-col"><a class="btn-out" href="#/moderador">Área do moderador</a><button class="link" data-a="sus-redo" style="margin-top:6px">Responder de novo (substitui as respostas de ${esc(RES.settings.pid)})</button></div></div>`;
    }
    const ans = S.ui.sus || (S.ui.sus = Array(10).fill(0));
    return `<div class="sus">
      <div style="display:flex;justify-content:center;margin:8px 0 18px">${logo()}</div>
      <h1>O que você achou da loja?</h1>
      <p class="lead">Para cada frase, toque em um número de 1 (discordo totalmente) a 5 (concordo totalmente). Não existe resposta certa.</p>
      ${SUS.map((qq, i) => `<div class="sus-q"><p>${i + 1}. ${qq}</p>
        <div class="likert" role="radiogroup" aria-label="Frase ${i + 1}">${[1, 2, 3, 4, 5].map((v) => `<button class="${ans[i] === v ? 'on' : ''}" data-a="sus" data-i="${i}" data-v="${v}" role="radio" aria-checked="${ans[i] === v}">${v}</button>`).join('')}</div>
        <div class="likert-l"><span>Discordo totalmente</span><span>Concordo totalmente</span></div></div>`).join('')}
      <div style="margin:22px 0 40px"><button class="btn-red" data-a="sus-send">Enviar respostas</button></div>
    </div>`;
  }

  /* =========================================================
     Sobreposições: folhas, modais, visualizador, push
     ========================================================= */
  let OVS = null;
  function openOv(type, data) { OVS = { type, data: data || {} }; ovDrawnType = null; drawOv(); }
  function closeOv() { OVS = null; ovDrawnType = null; OV.innerHTML = ''; document.body.style.overflow = ''; }
  const sheet = (title, body, foot, label) => `<div class="overlay" data-a="ov-bg"><div class="sheet" role="dialog" aria-modal="true" aria-label="${label || title}" data-stop="1">
      <div class="sheet-h"><h2>${title}</h2><button data-a="close" aria-label="Fechar">${I.close}</button></div>
      <div class="sheet-b">${body}</div>${foot ? `<div class="sheet-f ${foot.one ? 'one' : ''}">${foot.html}</div>` : ''}</div></div>`;

  let ovDrawnType = null;
  function drawOv() {
    if (!OVS) return closeOv();
    document.body.style.overflow = 'hidden';
    const { type, data } = OVS;
    // redesenho da mesma folha (ex.: tocar uma opção de filtro): mantém rolagem, sem animar e sem mover o foco
    const redraw = ovDrawnType === type && OV.innerHTML !== '';
    const prevScroll = redraw && OV.querySelector('.sheet') ? OV.querySelector('.sheet').scrollTop : 0;
    const ae = redraw && OV.contains(document.activeElement) ? document.activeElement.dataset : null;
    const focusSel = ae && ae.a ? `[data-a="${ae.a}"]${ae.k ? `[data-k="${ae.k}"]` : ''}${ae.v ? `[data-v="${ae.v}"]` : ''}${ae.d ? `[data-d="${ae.d}"]` : ''}` : null;
    let html = '';
    if (type === 'menu') html = ovMenu();
    else if (type === 'filter') html = ovFilter(data.k);
    else if (type === 'tabela') html = ovTabela();
    else if (type === 'provador') html = ovProvador();
    else if (type === 'added') html = ovAdded(data);
    else if (type === 'fotos') html = ovFotos();
    else if (type === 'viewer') html = ovViewer(data);
    else if (type === 'popup') html = ovPopup(data);
    else if (type === 'modtask') html = ovModTask();
    OV.innerHTML = html;
    ovDrawnType = type;
    if (redraw) {
      OV.querySelectorAll('.overlay, .sheet, .modal, .viewer').forEach((el) => { el.style.animation = 'none'; });
      const sh = OV.querySelector('.sheet');
      if (sh) sh.scrollTop = prevScroll;
      const fe = focusSel && OV.querySelector(focusSel);
      if (fe) fe.focus({ preventScroll: true });
      return;
    }
    const f = OV.querySelector('[data-autofocus]') || OV.querySelector('.sheet-h button, .modal .x, .menu-top button, .viewer-top button');
    if (f) f.focus({ preventScroll: true });
  }

  function ovMenu() {
    const pend = pendingReview();
    return `<div class="menu-full" role="dialog" aria-modal="true" aria-label="Menu">
      <div class="menu-top"><a href="#/conta" class="who" style="text-decoration:none">Olá, ${CLIENTE.nome}<small>Minha conta</small></a><button data-a="close" aria-label="Fechar menu">${I.close}</button></div>
      <div class="menu-quick">
        <a href="#/conta/pedidos">${I.box}Meus pedidos${pend && remindersOn() ? '<span class="badge">1</span>' : ''}</a>
        <a href="#/conta/cashback">${I.coin}Meu cashback</a>
        <a href="#/conta">${I.user}Minha conta</a>
      </div>
      <div class="menu-search">${I.search}Buscar em Departamentos</div>
      <div class="menu-grid">${MENU_CARDS.map((c) => `<a class="menu-card" ${c.href ? `href="${c.href}"` : 'href="#/" data-a="ilustrativo"'}><img src="${c.img}" alt="" loading="lazy"><span>${c.nome}</span></a>`).join('')}</div>
    </div>`;
  }

  function ovFilter(k) {
    const all = reviewsAll();
    const f = S.filters;
    let title = '', body = '';
    const opt = (key, o, base) => {
      const n = base.filter(o.test).length;
      return `<button class="opt ${f[key] === o.k ? 'on' : ''}" data-a="f-set" data-k="${key}" data-v="${o.k}" ${n ? '' : 'disabled'} aria-pressed="${f[key] === o.k}"><span>${o.label}</span><small>${n} ${n === 1 ? 'avaliação' : 'avaliações'}</small></button>`;
    };
    if (k === 'altura') {
      title = 'Altura';
      const base = applyFilters(all, 'altura');
      body = `<p class="q-help" style="margin:0 0 14px">Veja como a peça ficou em clientes da sua altura. Sua altura salva: ${altTxt(S.medidas.altura)}.</p><div class="opt-list">${ALTURAS.map((o) => opt('altura', o, base)).join('')}</div>`;
    } else if (k === 'tam') {
      title = 'Tamanho comprado';
      const base = applyFilters(all, 'tam');
      body = `<p class="q-help" style="margin:0 0 14px">Veja o que aconteceu com quem comprou cada tamanho.</p><div class="opt-sizes">${PRODUTO.tamanhos.map((t) => { const n = base.filter((r) => r.comprou === t).length; return `<button class="opt ${f.tam === t ? 'on' : ''}" data-a="f-set" data-k="tam" data-v="${t}" ${n ? '' : 'disabled'} aria-pressed="${f.tam === t}">${t}<small>${n}</small></button>`; }).join('')}</div>`;
    } else if (k === 'medidas') {
      title = 'Medidas';
      body = `<p class="q-help" style="margin:0 0 4px">Suas medidas salvas: busto ${S.medidas.busto} cm · cintura ${S.medidas.cintura} cm.</p>
        <div class="opt-group-t">Busto</div><div class="opt-list">${BUSTOS.map((o) => opt('busto', o, applyFilters(all, 'busto'))).join('')}</div>
        <div class="opt-group-t">Cintura</div><div class="opt-list">${CINTURAS.map((o) => opt('cintura', o, applyFilters(all, 'cintura'))).join('')}</div>`;
    }
    const n = applyFilters(all).length;
    return sheet(title, body, { html: `<button class="btn-out" data-a="f-clear" data-k="${k}">Limpar</button><button class="btn-red" data-a="close">Ver ${n} ${n === 1 ? 'avaliação' : 'avaliações'}</button>` }, `Filtrar por ${title.toLowerCase()}`);
  }

  function ovTabela() {
    const rec = recommendedSize();
    const sel = S.sel.tam || rec;
    const rg = (a) => `${a[0]}–${a[1]}`;
    const body = `
      <p class="q-help" style="margin:0 0 12px">Medidas do <b>corpo</b>, em centímetros. Esta blusa é ajustada: se estiver entre dois tamanhos, escolha o maior.</p>
      <table class="sz-table"><thead><tr><th>Tam.</th><th>Busto</th><th>Cintura</th><th>Quadril</th></tr></thead><tbody>
        ${PRODUTO.tamanhos.map((t) => { const m = PRODUTO.tabela[t]; return `<tr class="${t === sel ? 'hl' : ''} ${t === rec ? 'me' : ''}"><td>${t}</td><td>${rg(m.busto)}</td><td>${rg(m.cintura)}</td><td>${rg(m.quadril)}</td></tr>`; }).join('')}
      </tbody></table>
      <div class="callout">${I.user}<span>Suas medidas salvas: busto <b>${S.medidas.busto}</b>, cintura <b>${S.medidas.cintura}</b>, quadril <b>${S.medidas.quadril}</b> cm. Tamanho indicado: <b>${rec}</b>.</span></div>
      <div class="howto"><div><span>1</span><p><b>Busto:</b> passe a fita na parte mais cheia do peito, sem apertar.</p></div><div><span>2</span><p><b>Cintura:</b> na parte mais fina do tronco, acima do umbigo.</p></div><div><span>3</span><p><b>Quadril:</b> na parte mais larga, com os pés juntos.</p></div></div>
      <p class="model-line">Medidas da modelo: ${PRODUTO.modelo.altura} · busto ${PRODUTO.modelo.busto} · cintura ${PRODUTO.modelo.cintura} · quadril ${PRODUTO.modelo.quadril} cm · veste ${PRODUTO.modelo.veste}</p>`;
    return sheet('Tabela de medidas', body, { html: `<button class="btn-red" data-a="pick-size" data-t="${rec}">Selecionar tamanho ${rec}</button>`, one: true });
  }

  function ovProvador() {
    const m = S.medidas;
    const rec = recommendedSize();
    const st = fitStats(reviewsAll());
    const inp = (k, label, unit, val) => `<div class="meas"><label for="p-${k}">${label}</label><div class="inp ok" id="pi-${k}"><input id="p-${k}" data-in="prov" data-k="${k}" inputmode="decimal" value="${esc(val)}"><span class="u">${unit}</span></div></div>`;
    const body = `
      <p class="q-help" style="margin:0">Suas medidas ficam salvas no Provador Virtual e indicam o tamanho em todas as peças.</p>
      <div class="meas-grid">${inp('altura', 'Altura', 'm', (m.altura / 100).toFixed(2).replace('.', ','))}${inp('busto', 'Busto', 'cm', m.busto)}${inp('cintura', 'Cintura', 'cm', m.cintura)}${inp('quadril', 'Quadril', 'cm', m.quadril)}</div>
      <div class="callout dark" style="margin-top:16px" id="prov-rec" aria-live="polite">${provRec(rec, st)}</div>`;
    return sheet('Encontre seu tamanho', body, { html: `<button class="btn-out" data-a="go-reviews" data-f="parecidas">Ver clientes parecidas</button><button class="btn-red" id="prov-use" data-a="pick-size" data-t="${rec}">Usar ${rec}</button>` });
  }
  const provRec = (rec, st) => `${I.hanger.replace(/#191919/g, '#fff')}<span>Tamanho indicado para você: <b style="font-size:16px">${rec}</b><br>${st.nuance === 'tende a justa' ? `Atenção: ${st.pct.justa}% das clientes acharam a modelagem justa. Se você gosta mais soltinha, considere 1 tamanho acima.` : ''}</span>`;
  // Lê um campo do provador; devolve o valor em cm ou null se inválido
  const parseProv = (k, v) => (k === 'altura' ? parseAltura(v) : parseCm(v, k));
  // Atualiza só o tamanho indicado (sem recriar a folha: o campo em edição e o teclado continuam)
  function refreshProvRec() {
    const rec = recommendedSize();
    const box = $('#prov-rec');
    if (box) box.innerHTML = provRec(rec, fitStats(reviewsAll()));
    const use = $('#prov-use');
    if (use) { use.dataset.t = rec; use.textContent = `Usar ${rec}`; }
  }

  function ovAdded(dt) {
    const c = (dt && dt.item) || S.cart[S.cart.length - 1];
    if (!c) return '';
    const m = modelagemDoTamanho(c.tam);
    const body = `<div class="mini-item"><img src="${c.img}" alt=""><div>${esc(c.nome)}<small>Cor: ${c.cor} · Tam: ${c.tam}</small></div><b>${brl(c.preco)}</b></div>
      ${m.n ? `<div class="callout">${I.users}<span>Clientes que compraram ${c.tam}: <b>${m.regular} de ${m.n}</b> acharam a modelagem regular${m.justa ? `, ${m.justa} justa` : ''}${m.ampla ? `, ${m.ampla} ampla` : ''}.</span></div>` : ''}`;
    return sheet('Adicionado à sacola', body, { html: '<button class="btn-out" data-a="close">Continuar</button><a class="btn-red" href="#/sacola">Ir para a sacola</a>' });
  }

  // Folha "Adicionar fotos" (fluxo de baixo para cima, como na Shein)
  function ovFotos() {
    const body = `
      <div class="opt-rows">
        <label class="opt-row">${I.camPlus}<span><b>Tirar foto agora</b><small>Abre a câmera do celular</small></span>${I.chevR}<input type="file" accept="image/*" capture="environment" data-in="fotos" class="sr"></label>
        <label class="opt-row">${I.photo}<span><b>Escolher da galeria</b><small>Até 3 fotos</small></span>${I.chevR}<input type="file" accept="image/*" multiple data-in="fotos" class="sr"></label>
        <button class="opt-row" data-a="foto-exemplo">${I.user}<span><b>Usar foto de exemplo</b><small>Simulação do protótipo, para quem não quer usar a própria foto</small></span>${I.chevR}</button>
      </div>
      <div class="callout">${I.info}<span><b>Dica:</b> foto no espelho ou de corpo inteiro, com boa luz, mostrando como a peça ficou em você.</span></div>`;
    return sheet('Adicionar fotos', body, null);
  }

  function ovViewer(dt) {
    const items = dt.items;
    const cur = items[dt.idx];
    const r = cur.r;
    return `<div class="viewer" role="dialog" aria-modal="true" aria-label="Foto de cliente">
      <div class="viewer-top"><span style="font-size:13px">${dt.idx + 1} de ${items.length}</span><button data-a="close" aria-label="Fechar foto">${I.close}</button></div>
      <div class="viewer-img"><img src="${photoUrl(cur.f, 900)}" alt="Foto de ${esc(r.nome)} usando a peça">
        ${items.length > 1 ? `<button class="gal-arrow l" data-a="viewer-nav" data-d="-1" aria-label="Foto anterior">${I.chevL}</button><button class="gal-arrow r" data-a="viewer-nav" data-d="1" aria-label="Próxima foto">${I.chevR}</button>` : ''}</div>
      <div class="viewer-cap"><div style="display:flex;justify-content:space-between;align-items:center"><b>${esc(r.nome)}</b>${starsA11y(r.nota, 'sm')}</div>
        ${r.altura ? `<div class="body-chips"><span>${altTxt(r.altura)}</span><span>Busto ${r.busto} cm</span><span>Cintura ${r.cintura} cm</span><span>Quadril ${r.quadril} cm</span></div>` : ''}
        <div class="fitline">Comprou <b>${r.comprou}</b> · modelagem <b>${(MOD[r.modelagem] || '–').toLowerCase()}</b> · cor ${esc(r.cor)}</div>
        <button class="btn-out sm" style="margin-top:12px;background:transparent;color:#fff;border-color:#fff" data-a="viewer-goto" data-r="${r.id}">Ver avaliação completa</button></div>
    </div>`;
  }

  function ovPopup(dt) {
    const p = dt.p;
    return `<div class="overlay center" data-a="ov-bg"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="pop-t" data-stop="1">
      <button class="x" data-a="popup-later" aria-label="Fechar">${I.close}</button>
      <img class="remind-img" src="${p.it.prod === PRODUTO.id ? RENNER_IMG(PRODUTO.cores.find((c) => c.nome === p.it.cor)?.codigo || PRODUTO.cores[0].codigo, 'large', 3) : p.it.img}" alt="">
      <div class="remind-b">
        <div class="k">${entregaInfo(p.o).kicker}</div>
        <h2 id="pop-t">Como ficou a blusa em você?</h2>
        <p>Avalie sua compra com poucos cliques e acumule pontos convertidos em cashback!</p>
        <details class="more-pts" data-a="mais-pontos">
          <summary>Mais informações sobre os pontos ${I.chevD}</summary>
          <div class="more-pts-b">
            <p>Cada informação vale pontos, até <b>${MAXP} pontos = ${MAXR}</b> por peça:</p>
            <ul>${[['Foto usando a peça', P('fotos')], ['Comentário', P('comentario')], ['Suas medidas', P(...MED)], ['Modelagem', P('modelagem')], ['Nota', P('nota')], ['Tamanho comprado', P('comprado')], ['Tecido', P('tecido')], ['Conforto', P('conforto')]]
              .map(([l, v]) => `<li><span>${l}</span><b>+${v}</b></li>`).join('')}</ul>
            <p>Os pontos não dependem da nota. O cashback é liberado na sua conta ${PRAZO} dias após a entrega, quando acaba o prazo de devolução.</p>
          </div>
        </details>
        <a class="btn-red" href="#/avaliar/${p.o.id}/${p.i}?origem=popup" data-a="popup-go" data-autofocus>Avaliar e ganhar pontos</a>
        <button class="later" data-a="popup-later">Agora não</button>
      </div></div></div>`;
  }

  function ovModTask() {
    const run = RES.running;
    if (!run) return '';
    const t = TAREFAS.find((x) => x.id === run.tid);
    const s = Math.round((Date.now() - run.start) / 1000);
    // sem o critério de sucesso: a folha pode ser vista pela participante
    return sheet(`${t.id} · ${Math.floor(s / 60)}:${pad(s % 60)}`, `
      <label class="q-help" for="mod-notes" style="display:block;margin:0 0 6px">Observações do moderador (opcional)</label>
      <textarea id="mod-notes" class="ta" style="min-height:70px;margin-top:0"></textarea>
      <div style="display:flex;justify-content:space-between;margin-top:12px"><button class="link" data-a="mod-end" data-r="ajuda">Sucesso com ajuda</button><a class="link" href="#/moderador">Abrir painel</a></div>`,
      { html: `<button class="btn-out" data-a="mod-end" data-r="falha">Não concluiu</button><button class="btn-red" data-a="mod-end" data-r="sucesso">Sucesso</button>` }, 'Encerrar tarefa');
  }

  /* ---------- Push e lembretes ---------- */
  let pushTimer = null;
  function showPush(p) {
    if (PUSH.querySelector('.push:not(.out)')) return; // já há um push na tela
    S.reminder.pushShown = true; save(true);
    log('push_exibido', { pedido: p.o.id });
    const e = entregaInfo(p.o);
    PUSH.innerHTML = `<div class="push-ctx"></div><button class="push" data-a="push-open" aria-label="Notificação da Renner: ${e.pushT} Toque para avaliar">
        <span class="ic">${logo('#fff').replace(/<text x="47"[^]*?<\/text>/, '').replace('viewBox="0 0 198 40"', 'viewBox="0 0 40 40"').replace('fill="#fff"/>', 'fill="#D71920"/>').replace('class="logo"', 'class="logo" style="width:30px;height:30px"')}</span>
        <span><span class="meta"><span>Renner</span><span>agora</span></span><b>${e.pushT}</b><p>Avalie em 1 minuto e ganhe até ${MAXP} pontos = ${MAXR} de cashback.</p></span>
        <span class="close" data-a="push-close" role="button" aria-label="Dispensar notificação">${I.close}</span>
      </button>`;
    clearTimeout(pushTimer);
    pushTimer = setTimeout(() => hidePush(true), 8000);
  }
  function hidePush(thenPopup) {
    clearTimeout(pushTimer);
    const el = PUSH.querySelector('.push');
    if (!el) return;
    el.classList.add('out');
    setTimeout(() => {
      PUSH.innerHTML = '';
      const p = pendingReview();
      if (thenPopup && p && RES.settings.mode.includes('popup') && !S.reminder.popupShown && currentKey() === '') showPopup(p);
      else if (currentKey() === '') render();
    }, 350);
  }
  function showPopup(p) {
    S.reminder.popupShown = true; save(true);
    log('popup_exibido', { pedido: p.o.id });
    openOv('popup', { p });
  }
  function runReminders() {
    const p = pendingReview();
    if (!p || OVS || PUSH.innerHTML) return;
    const m = RES.settings.mode;
    // cada temporizador confere o estado na hora de disparar (evita push/pop-up duplicado)
    if (m.includes('push') && !S.reminder.pushShown) {
      setTimeout(() => { const q = pendingReview(); if (q && currentKey() === '' && !OVS && !S.reminder.pushShown && !PUSH.innerHTML) showPush(q); }, 900);
      return;
    }
    if (m.includes('popup') && !S.reminder.popupShown) {
      setTimeout(() => { const q = pendingReview(); if (q && currentKey() === '' && !OVS && !S.reminder.popupShown && !PUSH.innerHTML) showPopup(q); }, 700);
    }
  }

  /* ---------- Toast, transição, confete ---------- */
  let toastTimer = null;
  function toast(msg, ms = 2600) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.style.display = '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.style.display = 'none'; }, ms);
  }
  function interstitial(title, sub, ms, then) {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;z-index:140;background:#111;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;animation:fade .3s ease';
    el.innerHTML = `<div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#aaa">Simulação</div><div style="font-size:30px;font-weight:700;margin-top:10px">${title}</div><div style="font-size:15px;color:#ddd;margin-top:8px">${sub}</div>`;
    document.body.appendChild(el);
    setTimeout(() => { el.remove(); then && then(); }, ms);
  }
  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('div');
    c.className = 'confetti';
    const cols = ['#D71920', '#191919', '#FFC400', '#ffffff'];
    for (let i = 0; i < 70; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = cols[i % cols.length];
      p.style.animationDuration = 1.6 + Math.random() * 1.6 + 's';
      p.style.animationDelay = Math.random() * 0.4 + 's';
      p.style.boxShadow = '0 0 0 1px rgba(0,0,0,.08)';
      c.appendChild(p);
    }
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3800);
  }

  /* =========================================================
     Roteador e renderização
     ========================================================= */
  function parseHash() {
    const h = (location.hash || '#/').replace(/^#/, '');
    const [path, qs] = h.split('?');
    return { path, parts: path.split('/').filter(Boolean), q: Object.fromEntries(new URLSearchParams(qs || '')) };
  }
  function currentKey() {
    const r = parseHash();
    let k = r.parts[0] || '';
    if (k === 'conta' && r.parts[1]) k = 'conta/' + r.parts[1];
    return k;
  }
  const VIEWS = {
    '': viewHome, 'blusas': viewListing, 'busca': viewListing, 'produto': viewPDP, 'avaliacoes': viewReviews,
    'sacola': viewBag, 'checkout': viewCheckout, 'pedido': viewOrderDone, 'conta': viewAccount, 'conta/pedidos': viewOrders,
    'conta/cashback': viewCashback, 'avaliar': viewForm, 'avaliacao-enviada': viewSent, 'lista-de-desejos': viewWish,
    'moderador': viewMod, 'sus': viewSUS
  };
  let lastKey = null;
  let io = null;

  function render(isNav) {
    const r = parseHash();
    const key = currentKey();
    const view = VIEWS[key] || viewHome;
    const y = window.scrollY;
    const keep = {};
    $$('[data-keep]').forEach((el) => { keep[el.dataset.keep] = el.scrollLeft; });
    const ae = document.activeElement;
    const aeId = ae && ae.id;
    const sel = aeId && typeof ae.selectionStart === 'number' ? [ae.selectionStart, ae.selectionEnd] : null;
    gradId = 0;
    APP.innerHTML = view(r);
    if (!isNav) {
      $$('[data-keep]').forEach((el) => { if (keep[el.dataset.keep] != null && !(S.ui.resetKeep || []).includes(el.dataset.keep)) el.scrollLeft = keep[el.dataset.keep]; });
      window.scrollTo(0, y);
      if (aeId) { const el = document.getElementById(aeId); if (el) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange) try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* tipo sem seleção */ } } }
    }
    S.ui.resetKeep = null;
    afterRender(key, r, isNav);
    lastKey = key;
  }

  function afterRender(key, r, isNav) {
    if (io) { io.disconnect(); io = null; }
    // sombra no header fixo
    const hdr = $('#hdr');
    if (hdr) hdr.classList.toggle('scrolled', window.scrollY > 110);
    // galeria
    const gal = $('#gal');
    if (gal) gal.addEventListener('scroll', () => { const i = Math.round(gal.scrollLeft / gal.clientWidth); const c = $('#gal-count'); if (c) c.textContent = `${i + 1}/${gal.children.length}`; }, { passive: true });
    const hero = $('#hero');
    if (hero) hero.addEventListener('scroll', () => { const i = Math.round(hero.scrollLeft / hero.clientWidth); $$('#hero-dots button').forEach((d, k) => d.classList.toggle('on', k === i)); }, { passive: true });
    // barra fixa da página de produto some quando o botão da página está visível
    const buy = $('#buyrow'), bar = $('#pdp-bar');
    if (buy && bar && 'IntersectionObserver' in window) {
      io = new IntersectionObserver((ents) => ents.forEach((e) => bar.classList.toggle('hide', e.isIntersecting)), { threshold: 0.3 });
      io.observe(buy);
    }
    if (isNav) {
      log('tela', { tela: key || 'home' });
      if (key === 'avaliar') {
        const origem = r.q.origem || 'direto';
        log('avaliar_aberto', { origem, pedido: r.parts[1] });
        taskAuto('avaliar_aberto', { origem });
      }
      if (r.q.ancora) { const el = document.getElementById(r.q.ancora); if (el) el.scrollIntoView(); }
    }
    if (key === '') runReminders();
    drawModChip();
    syncTela();
  }

  /* ---------- Endereço por tela (para o Maze registrar cada etapa do caminho) ----------
     O roteador usa "#/...", mas o Maze garante registrar mudanças de parâmetro no endereço.
     Por isso cada tela também aparece como ?tela=..., e filtros/origem como parâmetros extras. */
  const TELA_NOME = { '': 'home', 'conta/pedidos': 'pedidos', 'conta/cashback': 'cashback' };
  function telaQuery() {
    const r = parseHash();
    const k = currentKey();
    const p = new URLSearchParams();
    p.set('tela', TELA_NOME[k] || k || 'home');
    if (k === 'avaliar' && r.q.origem) p.set('origem', r.q.origem);
    if (k === 'avaliacoes' && anyFilter()) {
      p.set('filtro', Object.entries(S.filters).filter(([f, v]) => f !== 'ordem' && v).map(([f, v]) => (v === true ? f : `${f}-${v}`)).join('.'));
    }
    return '?' + p.toString();
  }
  function syncTela() {
    try {
      const q = telaQuery();
      if (location.search !== q) history.replaceState(null, '', location.pathname + q + location.hash);
    } catch (e) { /* file:// pode recusar: o protótipo segue funcionando */ }
  }

  /* ---------- Cenários por link: cada missão do Maze abre no ponto certo ----------
     ?cenario=inicio | produto | sacola | entrega | avaliar | enviada */
  const CEN_KEY = 'prototipo-renner-tcc:cenario';
  const MAZE_KEY = 'prototipo-renner-tcc:remoto';
  const modoRemoto = () => { try { return sessionStorage.getItem(MAZE_KEY) === '1'; } catch (e) { return false; } };
  const CENARIOS = {
    inicio: () => '#/',
    produto: () => '#/produto',
    sacola: () => {
      const c = PRODUTO.cores[0];
      S.cart = [{ id: PRODUTO.id, nome: PRODUTO.nome, cor: c.nome, tam: 'M', qtd: 1, preco: PRODUTO.preco, img: RENNER_IMG(c.codigo, 'medium', c.fotos[0]) }];
      S.sel.tam = 'M';
      return '#/sacola';
    },
    entrega: () => { ensureBlusaOrder(true); return '#/'; },
    avaliar: () => { const o = ensureBlusaOrder(true); return `#/avaliar/${o.id}/0?origem=link`; },
    enviada: () => { const o = ensureBlusaOrder(true); criarAvaliacaoExemplo(o, 0); return `#/avaliacao-enviada/${o.id}/0`; }
  };
  function aplicarCenario() {
    let cen = null;
    try { cen = new URLSearchParams(location.search).get('cenario'); } catch (e) { cen = null; }
    // só aceita os nomes da lista (o valor vem do endereço; "__proto__", "constructor" etc. são ignorados)
    if (!cen || !Object.prototype.hasOwnProperty.call(CENARIOS, cen)) return;
    let ultimo = null;
    try { ultimo = sessionStorage.getItem(CEN_KEY); sessionStorage.setItem(CEN_KEY, cen); sessionStorage.setItem(MAZE_KEY, '1'); } catch (e) { /* sem sessionStorage */ }
    // F5 durante a mesma missão não apaga o que a participante já fez
    if (!novaVisita && ultimo === cen) { try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { /* ok */ } return; }
    S = freshState();
    const hash = CENARIOS[cen]();
    save(true);
    log('cenario', { cenario: cen });
    try { history.replaceState(null, '', location.pathname + hash); } catch (e) { location.hash = hash; }
  }

  function go(hash) {
    if (location.hash === hash) { render(true); window.scrollTo(0, 0); } else location.hash = hash;
  }

  /* =========================================================
     Ações
     ========================================================= */
  function addToBag() {
    if (!S.sel.tam) {
      S.ui.sizeErr = true;
      toast('Selecione um tamanho');
      log('add_sem_tamanho');
      if (currentKey() === 'produto') { render(); const el = $('#sizes'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      return;
    }
    const c = cor();
    let item = S.cart.find((x) => x.id === PRODUTO.id && x.cor === c.nome && x.tam === S.sel.tam);
    if (item) item.qtd++;
    else { item = { id: PRODUTO.id, nome: PRODUTO.nome, cor: c.nome, tam: S.sel.tam, qtd: 1, preco: PRODUTO.preco, img: RENNER_IMG(c.codigo, 'medium', c.fotos[0]) }; S.cart.push(item); }
    S.ui.sizeErr = false;
    save(true);
    const meta = { tamanho: S.sel.tam, cor: c.nome, filtros: describeFilters() || 'nenhum', recomendado: recommendedSize() };
    log('add_sacola', meta);
    taskAuto('add_sacola', meta);
    render();
    openOv('added', { item });
  }
  function describeFilters() {
    const f = S.filters;
    return [f.parecidas && 'parecidas', f.altura && 'altura ' + byK(ALTURAS, f.altura).label, f.tam && 'comprou ' + f.tam,
      f.busto && 'busto ' + byK(BUSTOS, f.busto).label, f.cintura && 'cintura ' + byK(CINTURAS, f.cintura).label, f.fotos && 'com fotos', f.estrelas && f.estrelas + ' estrelas'].filter(Boolean).join(', ');
  }

  function placeOrder() {
    if (!S.cart.length) return; // toque duplo no botão não cria pedido vazio
    const t = checkoutTotals();
    const fr = FRETES[S.checkout.entrega];
    const agora = Date.now();
    const o = {
      id: genId(), criadoEm: agora, entregueEm: null, previsao: addBizDays(agora, fr.dias),
      entrega: `${fr.label} · ${fr.prazo}`, entregaTipo: S.checkout.entrega, pagamento: PAGTOS[S.checkout.pagamento].label, frete: t.frete, cashbackUsado: t.desc, total: t.total,
      itens: S.cart.map((c) => ({ prod: c.id, nome: c.nome, img: c.img, cor: c.cor, tam: c.tam, qtd: c.qtd, preco: c.preco }))
    };
    S.pedidos.unshift(o);
    S.cart = [];
    S.checkout.usarCashback = false;
    S.reminder = { pushShown: false, popupShown: false, snoozed: false };
    save(true);
    const meta = { pedido: o.id, total: brl(o.total), entrega: S.checkout.entrega, pagamento: S.checkout.pagamento, cashback_usado: brl(t.desc) };
    log('pedido', meta);
    taskAuto('pedido', { pedido: o.id, total: brl(o.total) });
    go('#/pedido/' + o.id);
  }

  function deliver(o, withStory) {
    const agora = Date.now();
    const e = entregaInfo(o);
    o.criadoEm = agora - e.dias * DIA;
    o.previsao = agora;
    o.entregueEm = agora;
    S.reminder = { pushShown: false, popupShown: false, snoozed: false };
    save(true);
    log('entrega_simulada', { pedido: o.id, entrega: o.entregaTipo || 'normal' });
    const done = () => { closeOv(); PUSH.innerHTML = ''; go('#/'); };
    const fato = e.fato.charAt(0).toUpperCase() + e.fato.slice(1);
    if (withStory) interstitial(`${e.quando}…`, `${fato}. Você volta a abrir o site da Renner.`, 1900, done);
    else done();
  }
  function ensureBlusaOrder(delivered) {
    let o = S.pedidos.find((x) => !x.seed && x.itens.some((it) => it.prod === PRODUTO.id));
    if (!o) {
      const c = PRODUTO.cores[0];
      const agora = Date.now();
      o = { id: genId(), criadoEm: agora, entregueEm: null, previsao: addBizDays(agora, 5), entrega: 'Entrega normal · até 5 dias úteis', entregaTipo: 'normal', pagamento: 'Pix', frete: 14.90, cashbackUsado: 0, total: 94.80,
        itens: [{ prod: PRODUTO.id, nome: PRODUTO.nome, img: RENNER_IMG(c.codigo, 'medium', c.fotos[0]), cor: c.nome, tam: recommendedSize(), qtd: 1, preco: PRODUTO.preco }] };
      S.pedidos.unshift(o);
    }
    if (delivered && !o.entregueEm) { o.criadoEm = Date.now() - 5 * DIA; o.entregueEm = Date.now(); }
    return o;
  }

  async function addPhotos(files) {
    const r = parseHash();
    const o = findOrder(r.parts[1]);
    if (!o) return;
    const d = draftFor(o, +(r.parts[2] || 0));
    const before = points(d);
    for (const file of [...files].slice(0, 3 - d.fotos.length)) {
      try { d.fotos.push(await shrink(file)); } catch (e) { toast('Não foi possível ler essa foto. Tente outra.'); }
    }
    log('foto_adicionada', { total: d.fotos.length });
    save(true);
    render();
    animatePts(before, points(d));
  }
  function shrink(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const max = 640;
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        res(cv.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('img')); };
      img.src = url;
    });
  }

  function animatePts(from, to) {
    if (from === to) return;
    const num = $('#pts-num'), bub = $('#pts-bubble');
    if (bub) {
      bub.textContent = (to > from ? '+' : '') + (to - from);
      bub.classList.toggle('neg', to < from);
      bub.classList.remove('go'); void bub.offsetWidth; bub.classList.add('go');
    }
    if (!num) return;
    const t0 = performance.now();
    let done = false;
    const step = (t) => {
      if (done) return;
      const k = Math.min(1, (t - t0) / 450);
      num.textContent = Math.round(from + (to - from) * k);
      if (k < 1) requestAnimationFrame(step); else done = true;
    };
    requestAnimationFrame(step);
    // garante o valor final mesmo se o navegador pausar a animação (aba em segundo plano)
    setTimeout(() => { done = true; if (num.isConnected) num.textContent = to; }, 520);
  }
  function refreshFormBits(d, before) {
    const pts = points(d);
    const panel = $('#pts');
    if (panel) panel.innerHTML = ptsPanel(d, pts);
    $('#pts-num') && ($('#pts-num').textContent = before);
    const btn = $('#send-btn');
    if (btn) { btn.textContent = `Enviar avaliação · ${pts} pts`; btn.setAttribute('aria-disabled', String(!OBRIG.every((k) => fieldDone(d, k)))); }
    const mp = medidasPts(d);
    const qm = $('#qp-altura');
    if (qm) { qm.className = 'q-pts' + (mp === P(...MED) ? ' done' : ''); qm.innerHTML = pillHtml(mp, P(...MED)); }
    MED.forEach((k) => { const w = $('#mi-' + k); if (w) w.classList.toggle('ok', fieldDone(d, k)); });
    const qc = $('#qp-comentario');
    if (qc) { const ok = fieldDone(d, 'comentario'); qc.className = 'q-pts' + (ok ? ' done' : ''); qc.innerHTML = pillHtml(ok ? P('comentario') : 0, P('comentario')); }
    const tc = $('#ta-count');
    if (tc) { tc.innerHTML = taCount(d); tc.classList.toggle('ok', fieldDone(d, 'comentario')); }
    animatePts(before, pts);
  }

  function sendReview() {
    const r = parseHash();
    const o = findOrder(r.parts[1]);
    const idx = +(r.parts[2] || 0);
    const it = o && o.itens[idx];
    if (!it || it.avaliacao) return;
    const d = draftFor(o, idx);
    const missing = OBRIG.filter((k) => !fieldDone(d, k));
    if (missing.length) {
      S.ui.formErr = missing;
      render();
      const el = $('#q-' + missing[0]);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      toast('Faltam campos obrigatórios: ' + missing.map((k) => OBRIG_LABEL[k]).join(' e ') + '.', 3200);
      log('envio_incompleto', { faltando: missing.join(',') });
      return;
    }
    const pts = points(d);
    const agora = Date.now();
    const alt = parseAltura(d.altura), bu = parseCm(d.busto, 'busto'), ci = parseCm(d.cintura, 'cintura'), qu = parseCm(d.quadril, 'quadril');
    const showBody = d.publico && alt && bu && ci && qu;
    const review = it.prod === PRODUTO.id ? {
      id: 'me-' + o.id + '-' + idx, mine: true, nome: `${CLIENTE.nome} ${CLIENTE.sobrenome[0]}.`, em: agora, nota: d.nota, cor: it.cor,
      comprou: d.comprado || it.tam, modelagem: d.modelagem, tecido: d.tecido, conforto: d.conforto ? +d.conforto : null,
      altura: showBody ? alt : null, busto: showBody ? bu : null, cintura: showBody ? ci : null, quadril: showBody ? qu : null,
      uteis: 0, fotos: d.fotos.slice(), texto: d.comentario.trim()
    } : null;
    const campos = CAMPOS.filter((c) => fieldDone(d, c.k)).map((c) => c.k);
    it.avaliacao = { pts, em: agora, fotos: d.fotos.length, uteis: 0, review, campos };
    delete S.drafts[o.id + ':' + idx];
    S.ui.formErr = null;
    save(true);
    log('avaliacao_enviada', { pts, nota: d.nota, campos: campos.join(',') });
    taskAuto('avaliacao_enviada', { pontos: pts, campos: campos.length + '/' + CAMPOS.length });
    go(`#/avaliacao-enviada/${o.id}/${idx}`);
    setTimeout(confetti, 150);
  }

  /* ---------- Moderador: tarefas ---------- */
  function taskAuto(evt, meta) {
    const run = RES.running;
    if (!run) return;
    const t = TAREFAS.find((x) => x.id === run.tid);
    if (t && t.auto === evt) endTask('sucesso', meta);
  }
  // Tarefa ainda rodando: nunca descartar em silêncio. Pergunta e registra como "interrompida".
  function closeRunningTask(acao) {
    const run = RES.running;
    if (!run) return true;
    const s = Math.round((Date.now() - run.start) / 1000);
    if (!confirm(`A tarefa ${run.tid} de ${run.pid} ainda está rodando (${Math.floor(s / 60)}:${pad(s % 60)}). Para ${acao}, ela será registrada como "interrompida". Continuar?`)) return false;
    endTask('interrompida', { motivo: acao });
    return true;
  }
  function startTask(tid) {
    if (RES.running && !closeRunningTask(`iniciar ${tid}`)) return;
    partRec();
    closeOv();
    PUSH.innerHTML = '';
    const begin = () => { RES.running = { pid: RES.settings.pid, tid, start: Date.now() }; saveRes(); log('tarefa_inicio', { tarefa: tid }); drawModChip(); };
    if (tid === 'T1') { S.filters = emptyFilters(); S.sel.tam = null; save(true); begin(); go('#/'); }
    else if (tid === 'T2') { S.filters = emptyFilters(); S.sel.tam = null; S.ui.sizeErr = false; save(true); begin(); go('#/produto'); }
    else if (tid === 'T3') {
      if (!S.cart.length) { const c = cor(); S.cart.push({ id: PRODUTO.id, nome: PRODUTO.nome, cor: c.nome, tam: S.sel.tam || recommendedSize(), qtd: 1, preco: PRODUTO.preco, img: RENNER_IMG(c.codigo, 'medium', c.fotos[0]) }); save(true); go('#/sacola'); }
      else if (currentKey() === 'moderador') go('#/sacola');
      begin();
    } else if (tid === 'T4') {
      const o = ensureBlusaOrder(false);
      o.itens.forEach((it) => { if (it.avaliacao && it.prod === PRODUTO.id) delete it.avaliacao; });
      Object.keys(S.drafts).forEach((k) => { if (k.startsWith(o.id)) delete S.drafts[k]; });
      begin();
      deliver(o, true);
      // o cronômetro começa quando a loja abre de novo (depois da tela "5 dias depois")
      setTimeout(() => { if (RES.running && RES.running.tid === 'T4') { RES.running.start = Date.now(); saveRes(); } }, 1900);
    } else if (tid === 'T5') {
      const o = ensureBlusaOrder(true);
      const i = Math.max(0, o.itens.findIndex((it) => it.prod === PRODUTO.id));
      delete o.itens[i].avaliacao;
      delete S.drafts[o.id + ':' + i];
      S.ui.formErr = null;
      save(true);
      begin();
      go(`#/avaliar/${o.id}/${i}?origem=moderador`);
    } else if (tid === 'T6') {
      // usa a avaliação que a participante acabou de enviar (a mais recente); só cria uma de exemplo se não houver
      const avaliados = S.pedidos.filter((x) => !x.seed && x.entregueEm && x.itens.some((it) => it.prod === PRODUTO.id && it.avaliacao));
      avaliados.sort((a, b) => Math.max(...b.itens.map((it) => (it.avaliacao ? it.avaliacao.em : 0))) - Math.max(...a.itens.map((it) => (it.avaliacao ? it.avaliacao.em : 0))));
      const o = avaliados[0] || ensureBlusaOrder(true);
      const i = Math.max(0, o.itens.findIndex((it) => it.prod === PRODUTO.id));
      if (!o.itens[i].avaliacao) {
        criarAvaliacaoExemplo(o, i);
        save(true);
        toast(`Avaliação de exemplo criada (${o.itens[i].avaliacao.pts} pontos) para esta tarefa.`);
      }
      begin();
      if (currentKey() === 'moderador') go(`#/avaliacao-enviada/${o.id}/${i}`);
    }
  }
  // Avaliação de exemplo completa (só sem comentário), publicada como as reais
  function criarAvaliacaoExemplo(o, i) {
    const it = o.itens[i];
    const campos = CAMPOS.map((c) => c.k).filter((k) => k !== 'comentario');
    const m = S.medidas;
    const review = { id: 'me-' + o.id + '-' + i, mine: true, nome: `${CLIENTE.nome} ${CLIENTE.sobrenome[0]}.`, em: Date.now(), nota: 5, cor: it.cor,
      comprou: it.tam, modelagem: 'regular', tecido: 'esperado', conforto: 3,
      altura: m.altura, busto: m.busto, cintura: m.cintura, quadril: m.quadril, uteis: 0, fotos: [FOTO_EXEMPLO], texto: '' };
    it.avaliacao = { pts: P(...campos), em: Date.now(), fotos: 1, uteis: 0, review, campos };
  }
  function endTask(res, meta) {
    const run = RES.running;
    if (!run) return;
    const secs = Math.round((Date.now() - run.start) / 1000);
    const pr = partRec(run.pid);
    const notes = (($('#mod-notes') && $('#mod-notes').value) || '').trim();
    pr.tasks[run.tid] = { res, t: secs, start: run.start, end: Date.now(), meta: meta || null, notas: notes };
    log('tarefa_fim', { tarefa: run.tid, resultado: res, segundos: secs });
    RES.running = null;
    saveRes();
    drawModChip();
    if (OVS && OVS.type === 'modtask') closeOv();
    if (currentKey() === 'moderador') render();
  }
  // Cronômetro discreto. Só abre a folha com TOQUE LONGO (0,6 s): um toque acidental da participante não faz nada.
  let chipTimer = null;
  function drawModChip() {
    clearInterval(chipTimer);
    const run = RES.running;
    if (!run || !RES.settings.chip || currentKey() === 'moderador' || currentKey() === 'sus') { MODR.innerHTML = ''; return; }
    let btn = MODR.querySelector('.mod-chip');
    if (!btn) {
      MODR.innerHTML = '<div class="mod-chip" role="timer" aria-label="Cronômetro do moderador (segure para encerrar)"><i></i><span></span></div>';
      btn = MODR.querySelector('.mod-chip');
      let hold = null;
      const cancel = () => { clearTimeout(hold); hold = null; btn.classList.remove('hold'); };
      btn.addEventListener('pointerdown', (e) => { e.preventDefault(); btn.classList.add('hold'); hold = setTimeout(() => { cancel(); openOv('modtask'); }, 600); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, cancel));
      btn.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    const label = btn.querySelector('span');
    const tick = () => {
      const s = Math.max(0, Math.round((Date.now() - run.start) / 1000));
      label.textContent = `${run.tid} · ${Math.floor(s / 60)}:${pad(s % 60)}`;
    };
    tick();
    chipTimer = setInterval(tick, 1000);
  }

  function csvDownload(tipo) {
    const sep = ';';
    const q = (v) => { const s = v == null ? '' : String(v); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const dt = (ts) => { const d = new Date(ts); return `${fmt(ts)} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`; };
    let rows = [];
    if (tipo === 'tarefas') {
      rows.push(['participante', 'perfil', 'tarefa', 'tarefa_tcc', 'titulo', 'resultado', 'tempo_segundos', 'inicio', 'fim', 'detalhes', 'observacoes']);
      Object.entries(RES.participants).forEach(([pid, p]) => TAREFAS.forEach((t) => { const r = p.tasks[t.id]; if (r) rows.push([pid, p.perfil, t.id, t.tcc, t.titulo, r.res, r.t, dt(r.start), dt(r.end), r.meta ? Object.entries(r.meta).map(([k, v]) => `${k}=${v}`).join(' | ') : '', r.notas || '']); }));
    } else if (tipo === 'sus') {
      rows.push(['participante', 'perfil', 'data', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10', 'escore_sus']);
      Object.entries(RES.participants).forEach(([pid, p]) => { if (p.sus) rows.push([pid, p.perfil, dt(p.sus.em), ...p.sus.respostas, String(p.sus.score).replace('.', ',')]); });
    } else {
      rows.push(['data_hora', 'participante', 'tarefa', 'evento', 'rota', 'detalhes']);
      RES.events.forEach((e) => rows.push([dt(e.t), e.p, e.task, e.type, e.route, e.d ? Object.entries(e.d).map(([k, v]) => `${k}=${v}`).join(' | ') : '']));
    }
    const csv = '﻿' + rows.map((r) => r.map(q).join(sep)).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    const d = new Date();
    a.href = URL.createObjectURL(blob);
    a.download = `teste-usabilidade-renner-${tipo}-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  const ACTIONS = {
    menu: () => { log('menu_aberto'); openOv('menu'); },
    close: () => closeOv(),
    'ov-bg': (ds, el, e) => { if (e.target === el) { if (OVS && OVS.type === 'popup') ACTIONS['popup-later'](); else closeOv(); } },
    ilustrativo: (ds, el, e) => { e.preventDefault(); toast('Esta parte não faz parte do protótipo.'); },
    'open-prod': (ds) => { if (ds.id === PRODUTO.id) { log('produto_aberto'); go('#/produto'); } else toast('Neste protótipo, só a Blusa Básica Justinha abre.'); },
    fav: (ds) => { const i = S.wish.indexOf(ds.id); if (i >= 0) S.wish.splice(i, 1); else { S.wish.push(ds.id); toast('Adicionado à lista de desejos'); } save(); render(); },
    'hero-go': (ds, el, e) => { e.preventDefault(); const h = $('#hero'); if (h) h.scrollTo({ left: h.clientWidth * +ds.i, behavior: 'smooth' }); },
    gal: (ds) => { const g = $('#gal'); if (!g) return; const n = g.children.length; let i = Math.round(g.scrollLeft / g.clientWidth) + +ds.d; i = (i + n) % n; g.scrollTo({ left: i * g.clientWidth, behavior: 'smooth' }); },
    color: (ds) => { S.sel.cor = +ds.i; S.ui.resetKeep = ['gal']; save(); render(); log('cor', { cor: cor().nome }); },
    size: (ds) => { S.sel.tam = ds.t; S.ui.sizeErr = false; save(); render(); log('tamanho_selecionado', { tamanho: ds.t, tela: currentKey(), filtros: describeFilters() || 'nenhum' }); },
    'pick-size': (ds) => { S.sel.tam = ds.t; S.ui.sizeErr = false; save(); closeOv(); log('tamanho_selecionado', { tamanho: ds.t, origem: 'folha' }); if (currentKey() === 'produto') { render(); const el = $('#sizes'); el && el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } else go('#/produto'); },
    add: () => addToBag(),
    scroll: (ds) => { const el = document.getElementById(ds.id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); if (ds.id === 'fitbox') log('nota_tocada'); },
    'go-reviews': (ds) => {
      closeOv();
      if (ds.f === 'parecidas') { S.filters = Object.assign(emptyFilters(), { parecidas: true }); }
      else if (ds.f === 'fotos') { S.filters = Object.assign(emptyFilters(), { fotos: true }); }
      save(); log('avaliacoes_abertas', { origem: currentKey() || 'home', filtro: ds.f || '' }); go('#/avaliacoes');
    },
    tabela: () => { log('tabela_medidas'); openOv('tabela'); },
    provador: () => { log('provador'); openOv('provador'); },
    'f-toggle': (ds) => { S.filters[ds.k] = !S.filters[ds.k]; save(); render(); log('filtro', { filtro: ds.k, valor: S.filters[ds.k], resultados: applyFilters(reviewsAll()).length }); },
    'f-sheet': (ds) => openOv('filter', { k: ds.k }),
    'f-set': (ds) => { S.filters[ds.k] = S.filters[ds.k] === ds.v ? null : ds.v; save(); render(); drawOv(); log('filtro', { filtro: ds.k, valor: S.filters[ds.k] || 'limpo', resultados: applyFilters(reviewsAll()).length }); },
    'f-clear': (ds) => { if (ds.k === 'medidas') { S.filters.busto = null; S.filters.cintura = null; } else S.filters[ds.k] = null; save(); render(); drawOv(); },
    'f-star': (ds) => { const v = +ds.v; S.filters.estrelas = S.filters.estrelas === v ? null : v; save(); if (currentKey() !== 'avaliacoes') go('#/avaliacoes'); else render(); log('filtro', { filtro: 'estrelas', valor: S.filters.estrelas || 'limpo' }); },
    'clear-filters': () => { const o = S.filters.ordem; S.filters = emptyFilters(); S.filters.ordem = o; save(); render(); log('filtros_limpos'); },
    useful: (ds) => { S.uteis[ds.r] = !S.uteis[ds.r]; save(); render(); },
    viewer: (ds) => { const r = reviewsAll().find((x) => x.id === ds.r); if (!r) return; openOv('viewer', { items: r.fotos.map((f, i) => ({ r, i, f })), idx: +ds.i }); log('foto_aberta', { avaliacao: ds.r }); },
    'viewer-strip': (ds) => { const list = ds.ctx === 'rv' ? applyFilters(reviewsAll()) : reviewsAll(); openOv('viewer', { items: allPhotos(list), idx: +ds.k }); log('foto_aberta', { origem: ds.ctx }); },
    'viewer-nav': (ds) => { const v = OVS.data; v.idx = (v.idx + +ds.d + v.items.length) % v.items.length; drawOv(); },
    'viewer-goto': (ds) => { closeOv(); const id = 'rv-' + ds.r; const jump = () => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); else toast('A avaliação está fora do filtro atual.'); }; if (currentKey() === 'avaliacoes') jump(); else { go('#/avaliacoes'); setTimeout(jump, 120); } },
    qty: (ds) => { const c = S.cart[+ds.i]; c.qtd = Math.max(1, Math.min(9, c.qtd + +ds.d)); save(); render(); },
    rm: (ds) => { S.cart.splice(+ds.i, 1); save(); render(); },
    ck: (ds) => { S.checkout[ds.g] = ds.k; save(); render(); },
    'ck-cashback': () => { S.checkout.usarCashback = !S.checkout.usarCashback; save(); render(); log('usar_cashback', { valor: S.checkout.usarCashback }); },
    'place-order': () => placeOrder(),
    'sim-entrega': (ds) => { const o = findOrder(ds.o); if (o) deliver(o, true); },
    'push-open': (ds, el, e) => {
      if (e.target.closest('[data-a="push-close"]')) return;
      const p = pendingReview(); clearTimeout(pushTimer); PUSH.innerHTML = '';
      log('push_tocado'); if (p) go(`#/avaliar/${p.o.id}/${p.i}?origem=push`);
    },
    'push-close': (ds, el, e) => { e.stopPropagation(); log('push_dispensado'); hidePush(true); },
    'popup-go': () => { log('popup_avaliar'); closeOv(); },
    'popup-later': () => { S.reminder.snoozed = true; save(true); log('popup_depois'); closeOv(); render(); toast('Tudo bem! Deixamos um lembrete aqui na página inicial.'); },
    fv: (ds) => {
      const r = parseHash(); const o = findOrder(r.parts[1]); if (!o) return;
      const d = draftFor(o, +(r.parts[2] || 0)); const before = points(d);
      const v = ds.k === 'nota' || ds.k === 'conforto' ? +ds.v : ds.v;
      d[ds.k] = v;
      if (S.ui.formErr) S.ui.formErr = S.ui.formErr.filter((k) => !fieldDone(d, k));
      save(); render(); animatePts(before, points(d));
      log('campo', { campo: ds.k, pontos: points(d) });
    },
    'usar-medidas': () => {
      const r = parseHash(); const o = findOrder(r.parts[1]); if (!o) return;
      const d = draftFor(o, +(r.parts[2] || 0)); const before = points(d);
      d.altura = (S.medidas.altura / 100).toFixed(2).replace('.', ','); d.busto = String(S.medidas.busto); d.cintura = String(S.medidas.cintura); d.quadril = String(S.medidas.quadril);
      save(); render(); animatePts(before, points(d)); log('medidas_provador_usadas');
    },
    publico: () => { const r = parseHash(); const o = findOrder(r.parts[1]); if (!o) return; const d = draftFor(o, +(r.parts[2] || 0)); d.publico = !d.publico; save(); render(); },
    'rm-foto': (ds) => { const r = parseHash(); const o = findOrder(r.parts[1]); if (!o) return; const d = draftFor(o, +(r.parts[2] || 0)); const before = points(d); d.fotos.splice(+ds.i, 1); save(); render(); animatePts(before, points(d)); },
    'foto-exemplo': () => { closeOv(); const r = parseHash(); const o = findOrder(r.parts[1]); if (!o) return; const d = draftFor(o, +(r.parts[2] || 0)); if (d.fotos.length >= 3) return; const before = points(d); d.fotos.push(FOTO_EXEMPLO); save(); render(); animatePts(before, points(d)); log('foto_exemplo'); },
    'foto-sheet': () => { log('fotos_folha_aberta'); openOv('fotos'); },
    'mais-pontos': (ds, el, e) => { if (e.target.closest('summary') && !el.open) log('popup_mais_pontos'); },
    send: () => sendReview(),
    'ver-minha': (ds, el, e) => { e.preventDefault(); S.filters = emptyFilters(); save(); go('#/avaliacoes'); },
    sus: (ds) => { const a = S.ui.sus || (S.ui.sus = Array(10).fill(0)); a[+ds.i] = +ds.v; render(); },
    'sus-send': () => {
      const a = S.ui.sus || [];
      const miss = a.findIndex((v) => !v);
      if (miss >= 0 || a.length < 10) { toast(`Responda a frase ${miss + 1} para enviar.`); const el = $$('.sus-q')[miss]; el && el.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      const score = a.reduce((s, v, i) => s + (i % 2 === 0 ? v - 1 : 5 - v), 0) * 2.5;
      partRec().sus = { respostas: a.slice(), score, em: Date.now() };
      saveRes(); log('sus_enviado', { escore: score });
      S.ui.sus = null; // não deixa o questionário preenchido para reenvio acidental
      S.ui.susRedo = false;
      S.ui.susDone = true; render(); window.scrollTo(0, 0);
    },
    'sus-redo': () => { if (!confirm(`Responder de novo? As respostas atuais de ${RES.settings.pid} serão substituídas.`)) return; S.ui.susRedo = true; S.ui.susDone = false; S.ui.sus = null; render(); window.scrollTo(0, 0); },
    'mod-start': (ds) => startTask(ds.t),
    'mod-end': (ds) => endTask(ds.r),
    'mod-cancel': () => { log('tarefa_cancelada', { tarefa: RES.running && RES.running.tid }); RES.running = null; saveRes(); drawModChip(); render(); },
    'mod-chip': () => openOv('modtask'),
    recomecar: (ds, el, e) => {
      e.preventDefault();
      if (RES.running) { if (!closeRunningTask('recomeçar a experiência')) return; }
      else if (!confirm('Recomeçar a experiência do início? A sacola, o pedido e a avaliação desta simulação serão apagados.')) return;
      S = freshState(); save(true); closeOv(); clearTimeout(pushTimer); PUSH.innerHTML = '';
      log('recomecar');
      go('#/');
      toast('Pronto! A experiência recomeçou do início.');
    },
    'mod-reset': () => {
      if (RES.running && !closeRunningTask('reiniciar o protótipo')) return;
      if (!RES.running && !confirm('Reiniciar o protótipo? Sacola, pedidos novos e avaliações desta sessão serão apagados. Os resultados do teste ficam guardados.')) return;
      S = freshState(); save(true); closeOv(); PUSH.innerHTML = ''; toast('Protótipo reiniciado.'); render();
    },
    'mod-next': () => {
      if (RES.running && !closeRunningTask('trocar de participante')) return;
      const atual = RES.settings.pid;
      const usado = !!RES.participants[atual] && (Object.keys(RES.participants[atual].tasks).length || RES.participants[atual].sus);
      let novo = atual;
      if (usado) {
        const n = Object.keys(RES.participants).map((k) => parseInt(k.replace(/\D/g, ''), 10)).filter((x) => !isNaN(x));
        novo = 'P' + pad((n.length ? Math.max(...n) : 0) + 1);
      }
      if (!confirm(`Começar a sessão de ${novo}? O protótipo volta ao início (sacola, pedidos novos e avaliações apagados). Os resultados registrados ficam guardados.`)) return;
      RES.settings.pid = novo;
      if (usado) RES.settings.perfil = 'Não definido';
      saveRes(); S = freshState(); save(true); closeOv(); PUSH.innerHTML = ''; toast(`Pronto para ${novo}.`); render();
    },
    'mod-clear': () => { if (!confirm('Apagar TODOS os resultados registrados neste aparelho? Baixe os CSVs antes.')) return; RES.participants = {}; RES.events = []; RES.running = null; saveRes(); render(); toast('Resultados apagados.'); },
    'mod-csv': (ds) => csvDownload(ds.t),
    'mod-go': (ds) => go(ds.h),
    'mod-deliver': () => { const o = S.pedidos.find((x) => !x.seed && !x.entregueEm) || ensureBlusaOrder(false); deliver(o, true); },
    'mod-push': () => { const o = ensureBlusaOrder(true); save(true); S.reminder.pushShown = false; S.reminder.popupShown = true; go('#/'); setTimeout(() => { const p = pendingReview(); if (p) showPush(p); else toast('Não há compra entregue sem avaliação.'); }, 300); return o; },
    'mod-popup': () => { ensureBlusaOrder(true); save(true); S.reminder.popupShown = false; S.reminder.pushShown = true; go('#/'); setTimeout(() => { const p = pendingReview(); if (p) showPopup(p); else toast('Não há compra entregue sem avaliação.'); }, 300); },
    'mod-release': () => { let n = 0; S.pedidos.forEach((o) => { if (o.entregueEm && o.itens.some((it) => it.avaliacao) && Date.now() < releaseAt(o)) { o.liberarJa = true; n++; } }); save(true); toast(n ? 'Cashback pendente liberado (simulação do fim do prazo).' : 'Não há cashback pendente.'); }
  };

  /* =========================================================
     Eventos globais
     ========================================================= */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    const el = e.target.closest('[data-a]');
    if (el) {
      const fn = ACTIONS[el.dataset.a];
      if (fn) {
        if (el.tagName === 'BUTTON' && el.closest('form')) e.preventDefault();
        fn(el.dataset, el, e);
        if (link && link.contains(el) && el.dataset.a !== 'ilustrativo' && el.dataset.a !== 'ver-minha' && OVS && OVS.type !== 'popup') closeOv();
        return;
      }
    }
    if (link && OVS) closeOv();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (OVS && OVS.type === 'popup') ACTIONS['popup-later'](); else if (OVS) closeOv(); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.pcard')) { e.preventDefault(); e.target.click(); }
  });
  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (f.dataset.form === 'search') {
      e.preventDefault();
      const v = f.q.value.trim();
      log('busca', { termo: v });
      go('#/busca?q=' + encodeURIComponent(v || 'blusa'));
    } else if (f.dataset.form === 'cep') {
      e.preventDefault();
      S.ui.cep = f.cep.value; S.ui.freteOk = f.cep.value.replace(/\D/g, '').length >= 8;
      if (!S.ui.freteOk) toast('Digite um CEP com 8 números.');
      render();
    }
  });
  document.addEventListener('input', (e) => {
    const el = e.target;
    const k = el.dataset && el.dataset.in;
    if (!k) return;
    if (k === 'm' || k === 'comentario') {
      const r = parseHash(); const o = findOrder(r.parts[1]); if (!o) return;
      const d = draftFor(o, +(r.parts[2] || 0)); const before = points(d);
      if (k === 'm') d[el.dataset.k] = el.value; else d.comentario = el.value;
      save(); refreshFormBits(d, before);
    } else if (k === 'prov') {
      const n = parseProv(el.dataset.k, el.value);
      const box = $('#pi-' + el.dataset.k);
      if (box) box.classList.toggle('ok', n != null);
      if (n != null) { S.medidas[el.dataset.k] = n; save(); refreshProvRec(); }
    } else if (k === 'mod-p') { RES.settings.pid = el.value.trim() || 'P01'; saveRes(); }
  });
  document.addEventListener('change', (e) => {
    const el = e.target;
    const k = el.dataset && el.dataset.in;
    if (!k) return;
    if (k === 'ordem') { S.filters.ordem = el.value; save(); render(); log('ordenar', { ordem: el.value }); }
    else if (k === 'cart-tam') {
      const i = +el.dataset.i; const c = S.cart[i]; c.tam = el.value;
      const dup = S.cart.findIndex((x, j) => j !== i && x.cor === c.cor && x.tam === c.tam);
      if (dup >= 0) { S.cart[dup].qtd += c.qtd; S.cart.splice(i, 1); }
      save(); render(); log('sacola_tamanho', { tamanho: el.value });
    } else if (k === 'fotos') { if (el.files && el.files.length) { const files = [...el.files]; closeOv(); addPhotos(files); } }
    else if (k === 'prov') {
      // ao sair do campo: valor inválido volta ao último válido, com aviso; a página por baixo se atualiza sem fechar a folha
      const n = parseProv(el.dataset.k, el.value);
      if (n == null) {
        toast(el.dataset.k === 'altura' ? 'Altura inválida. Use, por exemplo, 1,65.' : 'Medida inválida. Use centímetros, por exemplo, 90.');
        el.value = el.dataset.k === 'altura' ? (S.medidas.altura / 100).toFixed(2).replace('.', ',') : S.medidas[el.dataset.k];
        const box = $('#pi-' + el.dataset.k); if (box) box.classList.add('ok');
      }
      if (['produto', 'avaliacoes'].includes(currentKey())) render();
    }
    else if (k === 'mod-perfil') { RES.settings.perfil = el.value; if (RES.participants[RES.settings.pid]) RES.participants[RES.settings.pid].perfil = el.value; saveRes(); }
    else if (k === 'mod-reminder') { RES.settings.mode = el.value; saveRes(); toast('Lembrete pós-compra: ' + el.options[el.selectedIndex].text); }
    else if (k === 'mod-chip') { RES.settings.chip = el.checked; saveRes(); }
    else if (k === 'mod-p') render();
  });
  window.addEventListener('scroll', () => { const h = $('#hdr'); if (h) h.classList.toggle('scrolled', window.scrollY > 110); }, { passive: true });
  window.addEventListener('hashchange', () => {
    closeOv();
    if (PUSH.innerHTML && currentKey() !== '') { clearTimeout(pushTimer); PUSH.innerHTML = ''; }
    if (currentKey() !== 'sus') { S.ui.susDone = false; }
    render(true);
    if (!parseHash().q.ancora) window.scrollTo(0, 0);
  });

  aplicarCenario();
  render(true);
})();
