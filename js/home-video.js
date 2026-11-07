/* ============================================================
   首页背景视频控制（桌面 + 手机）
   - 只在首页创建 <video>，其它页面零开销
   - 静音 + 内联播放，满足 iOS/Android 自动播放策略
   - 自动播放被拦截时，等用户首次触摸/点击后重试
   - 兼容 pjax 切换：每次 pjax 完成重新对齐 DOM
   - 页面切到后台时暂停，回来再播
   ============================================================ */
(function () {
  'use strict';

  var SRC = '/videos/home-bg.mp4';
  var POSTER = '/images/index-bg.svg';

  function isHome() {
    var p = window.location.pathname.replace(/index\.html$/, '');
    return p === '/' || p === '';
  }

  /* 移动端（尤其 iOS 低电量模式）可能拒绝自动播放。
     此时挂一个一次性的交互监听，用户碰一下屏幕就再试一次。 */
  function armRetry(v) {
    if (v.dataset.retryArmed) return;
    v.dataset.retryArmed = '1';
    var events = ['touchend', 'click', 'pointerdown'];

    function retry() {
      events.forEach(function (e) { document.removeEventListener(e, retry); });
      delete v.dataset.retryArmed;
      if (isHome()) play(v);
    }

    events.forEach(function (e) {
      document.addEventListener(e, retry, { passive: true });
    });
  }

  function play(v) {
    try {
      var p = v.play();
      if (p && typeof p.catch === 'function') p.catch(function () { armRetry(v); });
    } catch (e) {
      armRetry(v);
    }
  }

  function createVideo() {
    var v = document.createElement('video');
    v.id = 'home-video';
    /* 顺序要紧：先静音、先声明内联播放，再给 src */
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('muted', '');
    v.setAttribute('autoplay', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');
    v.playsInline = true;
    v.loop = true;
    v.preload = 'metadata';
    v.poster = POSTER;
    v.setAttribute('disablepictureinpicture', '');
    v.src = SRC;
    document.body.appendChild(v);
    return v;
  }

  function sync() {
    var header = document.getElementById('page-header');
    if (!header) return;

    var v = document.getElementById('home-video');

    if (!isHome()) {
      if (v) {
        if (!v.paused) v.pause();
        if (v.parentNode === header) header.removeChild(v);
      }
      return;
    }

    if (!v) v = createVideo();
    if (v.parentNode !== header) header.insertBefore(v, header.firstChild);
    play(v);
  }

  document.addEventListener('pjax:complete', sync);
  document.addEventListener('pjax:success', sync);
  document.addEventListener('visibilitychange', function () {
    var v = document.getElementById('home-video');
    if (!v) return;
    if (document.hidden) v.pause();
    else if (isHome()) play(v);
  });

  sync();
})();
