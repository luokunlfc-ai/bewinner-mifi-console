/* Be Winner MiFi · 套餐管理页交互 */

(function () {
  // === Tab 切换 ===
  var tabs = document.querySelectorAll('.shop-tab');
  var panels = document.querySelectorAll('.shop-panel');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      panels.forEach(function (p) { p.classList.remove('active'); });
      var target = document.getElementById('panel' + capitalize(t.dataset.tab));
      if (target) target.classList.add('active');
    });
  });
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // === 套餐卡片选中（点击切换，同面板单选，跨面板可叠加） ===
  document.querySelectorAll('.shop-panel').forEach(function (panel) {
    panel.querySelectorAll('.pkg-card').forEach(function (card) {
      card.addEventListener('click', function () {
        if (card.classList.contains('selected')) {
          card.classList.remove('selected');
        } else {
          panel.querySelectorAll('.pkg-card').forEach(function (c) {
            c.classList.remove('selected');
          });
          card.classList.add('selected');
        }
        updatePrice();
        updateDetail();
      });
    });
  });

  // === 获取所有面板的选中项 ===
  function getSelections() {
    var items = [];
    document.querySelectorAll('.shop-panel').forEach(function (panel) {
      var sel = panel.querySelector('.pkg-card.selected');
      if (sel) {
        items.push({
          label: sel.dataset.label || '',
          price: parseInt(sel.dataset.price) || 0,
          isBond: sel.classList.contains('bond-style')
        });
      }
    });
    return items;
  }

  // === 合计价格联动 ===
  var priceEl = document.getElementById('buyPrice');
  function updatePrice() {
    var items = getSelections();
    var total = 0;
    items.forEach(function (it) { total += it.price; });
    priceEl.textContent = items.length ? total : '--';
  }

  // === 明细浮层 ===
  var detailPop = document.getElementById('detailPop');
  var detailBody = document.getElementById('detailBody');
  var detailBtn = document.getElementById('detailBtn');
  var detailOpen = false;

  function updateDetail() {
    var items = getSelections();
    if (!items.length) {
      detailBody.innerHTML = '<div class="dp-empty">未选择任何套餐</div>';
      return;
    }
    var html = '';
    var total = 0;
    items.forEach(function (it) {
      total += it.price;
      html += '<div class="dp-row">'
        + '<span class="dp-row-name">' + it.label + '</span>'
        + '<span class="dp-row-price' + (it.isBond ? ' bond-c' : '') + '">¥' + it.price + '</span>'
        + '</div>';
    });
    html += '<div class="dp-total">'
      + '<span class="dp-total-lbl">合计</span>'
      + '<span class="dp-total-val">¥' + total + '</span>'
      + '</div>';
    detailBody.innerHTML = html;
  }

  if (detailBtn) {
    detailBtn.addEventListener('click', function () {
      detailOpen = !detailOpen;
      detailPop.classList.toggle('show', detailOpen);
      detailBtn.classList.toggle('open', detailOpen);
      detailBtn.textContent = detailOpen ? '明细 ▾' : '明细 ▴';
    });
  }

  // 初始化
  updatePrice();
  updateDetail();

  // === 购买按钮 ===
  var buyBtn = document.getElementById('buyBtn');
  if (buyBtn) {
    buyBtn.addEventListener('click', function () {
      var items = getSelections();
      if (!items.length) {
        buyBtn.textContent = '请先选择套餐';
        buyBtn.style.background = '#94a3b8';
        setTimeout(function () {
          buyBtn.textContent = '确认购买';
          buyBtn.style.background = '';
        }, 1000);
        return;
      }
      buyBtn.textContent = '购买成功 ✓';
      buyBtn.style.background = '#22c55e';
      setTimeout(function () {
        buyBtn.textContent = '确认购买';
        buyBtn.style.background = '';
      }, 1200);
    });
  }

  // === 实名认证跳转 ===
  var idBtn = document.getElementById('btnIdVerify');
  if (idBtn) {
    idBtn.addEventListener('click', function () {
      window.open('https://eca.189.cn/', '_blank');
    });
  }

  // === Tabbar ===
  document.querySelectorAll('.tabbar .tab').forEach(function (t) {
    t.addEventListener('click', function () {
      if (t.getAttribute('href')) return;
      document.querySelectorAll('.tabbar .tab').forEach(function (x) { x.classList.remove('active'); });
      if (!t.classList.contains('center')) t.classList.add('active');
    });
  });
})();
