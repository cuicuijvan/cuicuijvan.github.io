/* ============================================================
   脆脆卷的博客 - 交互特效
   开场动画 / 樱花飘落 / 点击特效 / 光标小尾巴
   原生 JS，无第三方依赖
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia.bind(window) : null;
  var reduceMotion = mq ? mq('(prefers-reduced-motion: reduce)').matches : false;
  var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function drop(el) { if (el && el.parentNode) el.parentNode.removeChild(el); }

  /* ----------------------------------------------------------
     1. 开场动画：等页面就绪后淡出遮罩，页面内容弹入
     ---------------------------------------------------------- */
  function initIntro() {
    var intro = document.getElementById('cute-intro');
    var scheduled = false;
    var finished = false;

    function finish() {
      if (finished) return;
      finished = true;
      root.classList.remove('cute-loading');
      document.body.classList.add('cute-ready');
      if (intro) {
        intro.classList.add('is-hidden');
        setTimeout(function () { drop(intro); }, 900);
      }
    }

    function schedule() {
      if (scheduled) return;
      scheduled = true;
      /* 至少停留 900ms，让开场看得清 */
      setTimeout(finish, 900);
    }

    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule);
      /* 兜底：图片/CDN 卡住时也不让用户干等 */
      setTimeout(schedule, 1600);
    }
  }

  /* ----------------------------------------------------------
     2. 樱花飘落（Canvas）
     ---------------------------------------------------------- */
  function initSakura() {
    var canvas = document.getElementById('cute-sakura');
    if (!canvas || reduceMotion || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var colors = ['#ffb3c6', '#ffc9d9', '#ff9ebb', '#ffd8e4'];
    var dark = mq ? mq('(prefers-color-scheme: dark)').matches : false;
    var petals = [];
    var W = 0;
    var H = 0;
    var raf = 0;
    var running = false;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makePetal(fromTop) {
      return {
        x: Math.random() * W,
        y: fromTop ? -20 - Math.random() * H * 0.4 : Math.random() * H,
        r: 5 + Math.random() * 6,
        speed: 0.35 + Math.random() * 0.7,
        drift: 0.35 + Math.random() * 0.85,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.02,
        alpha: (dark ? 0.30 : 0.45) + Math.random() * 0.25,
        color: pick(colors)
      };
    }

    function draw(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, -p.r);
      ctx.bezierCurveTo(p.r * 0.95, -p.r * 0.55, p.r * 0.95, p.r * 0.55, 0, p.r);
      ctx.bezierCurveTo(-p.r * 0.95, p.r * 0.55, -p.r * 0.95, -p.r * 0.55, 0, -p.r);
      ctx.fill();
      ctx.restore();
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < petals.length; i++) {
        var p = petals[i];
        p.phase += 0.01;
        p.y += p.speed;
        p.x += Math.sin(p.phase) * p.drift;
        p.rot += p.spin;
        if (p.y > H + 20 || p.x < -30 || p.x > W + 30) {
          petals[i] = makePetal(true);
          continue;
        }
        draw(p);
      }
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    resize();
    for (var i = 0; i < 16; i++) petals.push(makePetal(false));
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });
    start();
  }

  /* ----------------------------------------------------------
     3. 鼠标点击：冒出一句话 + 散开的彩色光点
     ---------------------------------------------------------- */
  function initClickEffects() {
    if (reduceMotion) return;
    var words = ['脆脆卷', '加油鸭', '今天也要开心', '好运 +1', '摸摸头', '收到啦', '♥', '✦', '★', '♪'];
    var colors = ['#ff7fa3', '#ff9ebb', '#5fb8ea', '#b392f5', '#f5a95c', '#63c9a4'];

    document.addEventListener('click', function (e) {
      if (e.button && e.button !== 0) return;
      var x = e.clientX;
      var y = e.clientY;
      if (typeof x !== 'number' || typeof y !== 'number') return;

      var word = document.createElement('span');
      word.className = 'cute-click-word';
      word.textContent = pick(words);
      word.style.left = x + 'px';
      word.style.top = (y - 12) + 'px';
      word.style.color = pick(colors);
      document.body.appendChild(word);
      setTimeout(function () { drop(word); }, 1200);

      for (var i = 0; i < 6; i++) {
        var spark = document.createElement('i');
        spark.className = 'cute-spark';
        spark.style.left = x + 'px';
        spark.style.top = y + 'px';
        spark.style.background = pick(colors);
        var angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.45;
        var dist = 32 + Math.random() * 36;
        spark.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
        spark.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
        document.body.appendChild(spark);
        (function (el) { setTimeout(function () { drop(el); }, 820); })(spark);
      }
    });
  }

  /* ----------------------------------------------------------
     4. 鼠标跟随的小光点（触屏设备不启用）
     ---------------------------------------------------------- */
  function initCursor() {
    if (reduceMotion || isTouch) return;
    var dot = document.createElement('div');
    dot.className = 'cute-cursor';
    document.body.appendChild(dot);

    var tx = -100;
    var ty = -100;
    var cx = -100;
    var cy = -100;
    var running = false;

    function step() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      dot.style.transform = 'translate(' + (cx - 6) + 'px,' + (cy - 6) + 'px)';
      if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) {
        requestAnimationFrame(step);
      } else {
        running = false;
      }
    }

    window.addEventListener('mousemove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
      dot.classList.add('is-active');
      if (!running) {
        running = true;
        requestAnimationFrame(step);
      }
    });
    document.addEventListener('mouseleave', function () {
      dot.classList.remove('is-active');
    });
  }

  /* ----------------------------------------------------------
     5. 常驻首页门面：只在首页把它放到文章列表之前
        元素本身默认 display:none，插入后才由 CSS 显示，无闪烁
     ---------------------------------------------------------- */
  function initHero() {
    var path = window.location.pathname.replace(/index\.html$/, '');
    if (path !== '/' && path !== '') return;
    var hero = document.getElementById('cute-hero');
    var main = document.querySelector('.main-inner');
    if (!hero || !main) return;
    main.insertBefore(hero, main.firstChild);
  }

  initHero();
  initIntro();
  initSakura();
  initClickEffects();
  initCursor();
})();
