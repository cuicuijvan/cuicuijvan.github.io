/* ============================================================
   脆脆卷的博客 - 简洁三栏版式的布局逻辑
   纯 DOM 重排，无任何动画 / 特效
   ============================================================ */
(function () {
  'use strict';

  var main = document.querySelector('main.main');
  var inner = document.querySelector('.main-inner');
  if (!main || !inner) return;

  var hero = document.getElementById('site-hero');
  var left = document.getElementById('site-left');
  var right = document.getElementById('site-right');

  /* ---------- 1. 顶栏右侧搜索框（站内搜索，跳百度） ---------- */
  var header = document.querySelector('.header');
  if (header) {
    var form = document.createElement('form');
    form.className = 'site-search';
    var input = document.createElement('input');
    input.type = 'search';
    input.placeholder = '搜索本站';
    input.setAttribute('aria-label', '搜索本站');
    form.appendChild(input);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value.trim();
      if (q) {
        window.open('https://www.baidu.com/s?wd=' +
          encodeURIComponent('site:cuicuijvan.github.io ' + q), '_blank');
      }
    });
    header.appendChild(form);
  }

  /* ---------- 2. 组装三栏 ---------- */
  var grid = document.createElement('div');
  grid.className = 'site-grid';
  var col = document.createElement('div');
  col.className = 'site-col-main';

  main.insertBefore(grid, inner);
  if (left) grid.appendChild(left);
  grid.appendChild(col);
  if (right) grid.appendChild(right);
  col.appendChild(inner);

  /* 首页才显示常驻站点信息条 */
  var path = window.location.pathname.replace(/index\.html$/, '');
  if (hero && (path === '/' || path === '')) {
    col.insertBefore(hero, inner);
  }

  /* ---------- 3. 侧栏统计数字 ---------- */
  var counts = document.querySelectorAll('.site-state-item-count');
  var nums = [];
  for (var i = 0; i < counts.length && i < 3; i++) {
    nums.push((counts[i].textContent || '').trim() || '0');
  }
  if (!nums.length) {
    nums = [String(document.querySelectorAll('.post-block').length), '0', '0'];
  }
  while (nums.length < 3) nums.push('0');
  var statB = document.querySelectorAll('.side-stat b');
  for (var j = 0; j < statB.length && j < nums.length; j++) {
    statB[j].textContent = nums[j];
  }

  /* ---------- 4. 侧栏最新文章 ---------- */
  var recent = document.getElementById('side-recent');
  if (recent) {
    var links = document.querySelectorAll('.post-title-link');
    var total = Math.min(links.length, 6);
    for (var k = 0; k < total; k++) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = links[k].getAttribute('href') || '/';
      a.textContent = (links[k].textContent || '').trim() || '未命名';
      li.appendChild(a);
      recent.appendChild(li);
    }
    var more = document.createElement('li');
    var moreLink = document.createElement('a');
    moreLink.href = '/archives/';
    moreLink.textContent = '查看全部文章 →';
    more.appendChild(moreLink);
    recent.appendChild(more);
  }
})();
