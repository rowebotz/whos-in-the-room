/* No runtime QR service: both images are served with the site. */
window.initRoomExperience = function ({people, orgs, clusters, openPerson, panel, closePanel}) {
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const phone = matchMedia('(max-width:960px)');
  const fullscreenPanel = matchMedia('(max-width:960px)');
  const directory = $('#directory');
  const list = $('#people-list');
  const query = $('#q');
  const category = $('#category');
  const header = $('.bar');
  const sorted = [...people].sort((a,b) => a.name.localeCompare(b.name));
  let returnFocus = null;
  category.innerHTML = '<option value="">All categories</option>' + clusters.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
  const cards = sorted.map(p => {
    const o = orgs[p.org];
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'person-card'; button.dataset.person = p.id;
    button.style.setProperty('--cc', `var(--c${clusters.indexOf(o.cluster)})`);
    button.setAttribute('aria-label', `${p.name}, ${o.shortName}. Open profile`);
    button.innerHTML = `<img src="${p.photo}" alt="" loading="lazy" width="56" height="56"><span><b>${esc(p.name)}</b><span class="org-name">${esc(o.shortName)}</span><span class="role">${esc(p.title)}</span></span><span class="chevron" aria-hidden="true">›</span>`;
    button.addEventListener('click', () => { query.blur(); openPerson(p.id); });
    list.appendChild(button);
    return {p,o,button,search: `${p.name} ${p.title} ${o.name} ${o.shortName}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()};
  });
  function filter() {
    const terms = query.value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().split(/\s+/).filter(Boolean);
    let count = 0;
    cards.forEach(({o,button,search}) => {
      const show = (!category.value || o.cluster === category.value) && terms.every(t => search.includes(t));
      button.hidden = !show; if (show) count++;
    });
    $('#result-count').textContent = `${count} ${count === 1 ? 'person' : 'people'}${count === people.length ? ` · ${Object.keys(orgs).length} organizations` : ' found'}`;
    $('#mobile-pick').disabled = count === 0;
    $('#empty-results').hidden = count > 0;
  }
  query.addEventListener('input', () => { if (phone.matches) { filter(); directory.scrollTop = 0; } });
  category.addEventListener('change', () => { filter(); directory.scrollTop = 0; });
  $('#clear-filters').addEventListener('click', () => { query.value = ''; category.value = ''; filter(); query.focus(); });
  $('#mobile-pick').addEventListener('click', () => {
    const visible = cards.filter(c => !c.button.hidden);
    if (visible.length) openPerson(visible[Math.floor(Math.random()*visible.length)].p.id);
  });
  $('#mobile-about').addEventListener('click', () => $('#dlg').showModal());
  function sync() {
    document.documentElement.style.setProperty('--mobile-header', `${header.getBoundingClientRect().height}px`);
    if (phone.matches) query.removeAttribute('list'); else query.setAttribute('list','names');
    const modal = !panel.hidden && fullscreenPanel.matches;
    panel.setAttribute('aria-modal', String(modal));
    header.inert = modal; $('#stage').inert = modal; directory.inert = modal;
    $('#close .lbl').textContent = phone.matches ? 'Back' : 'Back to room';
  }
  new ResizeObserver(sync).observe(header);
  phone.addEventListener('change', () => { filter(); sync(); });
  fullscreenPanel.addEventListener('change', sync);
  const shareDialog = $('#share-dialog');
  const resourcesDialog = $('#resources-dialog');
  const themeLabel = () => { $('#resources-theme').textContent = $('#theme').getAttribute('aria-label'); };
  $('#resources').addEventListener('click', () => { themeLabel(); resourcesDialog.showModal(); });
  $('#resources-close').addEventListener('click', () => resourcesDialog.close());
  $('#resources-theme').addEventListener('click', () => { $('#theme').click(); themeLabel(); });
  resourcesDialog.addEventListener('click', event => {
    const r = resourcesDialog.getBoundingClientRect();
    if (event.target === resourcesDialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) resourcesDialog.close();
  });
  $('#share').addEventListener('click', () => { $('#share-status').textContent = ''; shareDialog.showModal(); });
  $('#share-close').addEventListener('click', () => shareDialog.close());
  shareDialog.addEventListener('click', event => {
    const r = shareDialog.getBoundingClientRect();
    if (event.target === shareDialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) shareDialog.close();
  });
  $('#copy-link').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('https://whos-in-the-room.replit.app/');
      $('#share-status').textContent = 'Link copied.';
    } catch (_) {
      const range = document.createRange(); range.selectNodeContents($('#share-url'));
      const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
      $('#share-status').textContent = 'Select and copy the address above.';
    }
  });
  document.addEventListener('keydown', e => {
    if (panel.hidden || !fullscreenPanel.matches || e.key !== 'Tab') return;
    const focusable = [...panel.querySelectorAll('button,a[href],summary,[tabindex="0"]')].filter(el => el.getClientRects().length);
    const first = focusable[0], last = focusable[focusable.length-1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement.id === 'pname')) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  filter(); sync();
  return {
    isPhone: () => phone.matches,
    modalOpen: () => shareDialog.open || resourcesDialog.open,
    filter,
    panelOpened(fresh) { if (fresh) returnFocus = document.activeElement; sync(); },
    panelClosed() {
      sync();
      if (phone.matches) {
        const fallback = cards.find(c => !c.button.hidden)?.button || query;
        (returnFocus?.isConnected && returnFocus.matches('button,input,a,select') && returnFocus.getClientRects().length ? returnFocus : fallback).focus({preventScroll:true});
      }
    }
  };
};
