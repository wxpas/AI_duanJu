/* ==========================================================================
 * AI 短剧工作台 · 交互
 * --------------------------------------------------------------------------
 * 原生 JS，无依赖。内容数据在 data.js（window.STUDIO_DATA）。
 *
 * 模块
 *   工具函数 / 本地存储 / toast / 复制
 *   initTheme      主题切换（圆形揭示）
 *   initPlan       30 天计划：倒计时 + 进度卡
 *   initSidebar    侧边栏收起、移动端抽屉、滚动高亮
 *   createSelect   下拉选择（listbox，可键盘操作）
 *   initComposer   提示词生成器
 *   initRail       制作流程横向滚动
 *   initGallery    作品瀑布流：筛选 / 排序 / 搜索 / 加载更多 / 点赞
 *   initLightbox   作品预览弹层：推拉摇动效 + 字幕 + 键盘切换
 * ========================================================================== */
(function () {
  'use strict';

  var DATA = window.STUDIO_DATA;
  if (!DATA) return;

  /* ---------------------------------------------------------------------- */
  /* 工具函数                                                                */
  /* ---------------------------------------------------------------------- */
  var NS = 'duanju:';
  var root = document.documentElement;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function sleep(ms) { return new Promise(function (resolve) { setTimeout(resolve, ms); }); }
  function escapeRegExp(text) { return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function debounce(fn, ms) {
    var timer;
    return function () {
      var args = arguments, self = this;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  function rafThrottle(fn) {
    var queued = false;
    return function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; fn(); });
    };
  }

  /** 横向滚动的一排：根据滚动位置加 fade-start / fade-end，提示两侧还有内容 */
  function watchOverflow(el) {
    var update = rafThrottle(function () {
      var max = el.scrollWidth - el.clientWidth;
      el.classList.toggle('fade-start', el.scrollLeft > 4);
      el.classList.toggle('fade-end', max - el.scrollLeft > 4);
    });
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(el);
    update();
    return update;
  }

  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || '') || /Mac OS X/.test(navigator.userAgent || '');
  var MOD_KEY = isMac ? '⌘' : 'Ctrl';

  var touchQuery = window.matchMedia('(hover: none) and (pointer: coarse)');
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function reducedMotion() { return motionQuery.matches; }
  function scrollBehavior() { return reducedMotion() ? 'auto' : 'smooth'; }

  function icon(id, cls) {
    return '<svg class="icon' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#' + id + '"/></svg>';
  }

  /** 12345 -> 1.2 万 */
  function formatCount(n) {
    if (n < 10000) return String(n);
    var wan = n / 10000;
    return (wan >= 100 ? Math.round(wan) : Math.round(wan * 10) / 10) + ' 万';
  }
  function formatDuration(seconds) { return pad2(Math.floor(seconds / 60)) + ':' + pad2(seconds % 60); }
  function formatDate(iso) {
    var parts = iso.split('-');
    return Number(parts[1]) + ' 月 ' + Number(parts[2]) + ' 日';
  }
  /** 由字符串得到稳定的色相，用于头像底色 */
  function hueOf(text) {
    var hash = 0;
    for (var i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) % 360;
    return hash;
  }

  /** localStorage 包一层：被禁用或写满时不报错 */
  var store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(NS + key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch (e) { /* 忽略 */ }
    }
  };

  /* ---------------------------------------------------------------------- */
  /* toast                                                                   */
  /* ---------------------------------------------------------------------- */
  var toastHost = $('#toasts');

  /**
   * toast('已复制', { type: 'ok' })
   * toast('已重置', { action: { label: '撤销', onClick: fn } })
   */
  function toast(message, options) {
    options = options || {};
    // 弹层（<dialog>）打开时页面其余部分处于 top layer 之下，把容器挪进弹层才能看见
    var openDialog = $('dialog[open]');
    var host = openDialog || document.body;
    if (toastHost.parentNode !== host) host.appendChild(toastHost);

    var el = document.createElement('div');
    el.className = 'toast toast--' + (options.type || 'info');
    el.innerHTML = icon(options.type === 'ok' ? 'i-check' : 'i-info') + '<span></span>';
    el.lastChild.textContent = message;

    var timer;
    function dismiss() {
      clearTimeout(timer);
      if (!el.isConnected || el.classList.contains('is-leaving')) return;
      el.classList.add('is-leaving');
      setTimeout(function () { el.remove(); }, 220);
    }
    if (options.action) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'toast__action';
      btn.textContent = options.action.label;
      btn.addEventListener('click', function () { options.action.onClick(); dismiss(); });
      el.appendChild(btn);
    }

    toastHost.appendChild(el);
    while (toastHost.children.length > 3) toastHost.firstElementChild.remove();

    var duration = options.duration || (options.action ? 5000 : 2400);
    timer = setTimeout(dismiss, duration);
    el.addEventListener('pointerenter', function () { clearTimeout(timer); });
    el.addEventListener('pointerleave', function () { timer = setTimeout(dismiss, 1200); });
    return dismiss;
  }

  /* ---------------------------------------------------------------------- */
  /* 复制到剪贴板（file:// 或 iframe 里 Clipboard API 不可用时自动降级）       */
  /* ---------------------------------------------------------------------- */
  function copyText(text) {
    function fallback() {
      var host = $('dialog[open]') || document.body;
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;';
      host.appendChild(ta);
      var active = document.activeElement;
      ta.select();
      ta.setSelectionRange(0, text.length);
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      if (active && active.focus) active.focus({ preventScroll: true });
      return ok;
    }
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, fallback);
    }
    return Promise.resolve(fallback());
  }

  /* ---------------------------------------------------------------------- */
  /* 主题                                                                    */
  /* ---------------------------------------------------------------------- */
  function initTheme() {
    var btn = $('#themeToggle');
    var meta = $('meta[name="theme-color"]');

    function apply(theme) {
      root.dataset.theme = theme;
      btn.setAttribute('aria-label', theme === 'dark' ? '切换到浅色主题' : '切换到深色主题');
      if (meta) meta.setAttribute('content', getComputedStyle(root).getPropertyValue('--bg').trim());   // 地址栏颜色跟随页面底色
    }
    apply(root.dataset.theme === 'light' ? 'light' : 'dark');

    btn.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      function commit() { apply(next); store.set('theme', next); }

      // 支持 View Transitions 时，从按钮位置做一个圆形揭示
      if (!document.startViewTransition || reducedMotion()) { commit(); return; }
      var rect = btn.getBoundingClientRect();
      var x = rect.left + rect.width / 2;
      var y = rect.top + rect.height / 2;
      var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
      var transition = document.startViewTransition(commit);
      transition.ready.then(function () {
        root.animate(
          { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
          { duration: 460, easing: 'cubic-bezier(.4, 0, .2, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      }).catch(function () { /* 过渡被打断时忽略 */ });
    });

    // 没有手动选过主题时，跟随系统
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
      if (store.get('theme', null) == null) apply(e.matches ? 'light' : 'dark');
    });
  }

  /* ---------------------------------------------------------------------- */
  /* 30 天计划：顶部倒计时 + 侧边栏进度卡                                     */
  /* ---------------------------------------------------------------------- */
  function initPlan() {
    var DAY = 86400000;
    var bar = $('#announce');
    var text = $('#announceText');
    var countdown = $('#countdown');
    var cells = {};
    $$('[data-unit]', countdown).forEach(function (el) { cells[el.dataset.unit] = el; });

    var totalDays = Number(bar.dataset.days) || 30;
    var fixedDeadline = bar.dataset.deadline ? Date.parse(bar.dataset.deadline) : NaN;
    var start = Number(store.get('planStart', NaN));
    if (!isFinite(start) || start > Date.now()) { start = Date.now(); store.set('planStart', start); }

    var defaultText = text.textContent;
    var timer = 0;
    var isOver = null;

    function deadline() { return isFinite(fixedDeadline) ? fixedDeadline : start + totalDays * DAY; }

    function setCell(unit, value) {
      var el = cells[unit];
      var next = pad2(value);
      if (el.textContent === next) return;
      var first = el.textContent === '--';
      el.textContent = next;
      if (first) return;
      el.classList.remove('is-tick');
      void el.offsetWidth;                      // 强制重排，重新触发动画
      el.classList.add('is-tick');
    }

    var shownDay = 0;
    function renderCard() {
      var day = clamp(Math.floor((Date.now() - start) / DAY) + 1, 1, totalDays);
      if (day === shownDay) return;
      shownDay = day;
      var phase = DATA.plan.filter(function (p) { return day >= p.from && day <= p.to; })[0] || DATA.plan[DATA.plan.length - 1];
      $('#planDay').textContent = '第 ' + day + ' 天';
      $('#planBar').style.width = (day / totalDays * 100) + '%';
      $('#planProgress').setAttribute('aria-valuenow', String(day));
      $('#planProgress').setAttribute('aria-valuetext', '第 ' + day + ' 天，共 ' + totalDays + ' 天');
      $('#planPhase').textContent = phase.name + ' · ' + phase.task;
    }

    function render() {
      var left = Math.max(0, deadline() - Date.now());
      setCell('d', Math.floor(left / DAY));
      setCell('h', Math.floor(left % DAY / 3600000));
      setCell('m', Math.floor(left % 3600000 / 60000));
      setCell('s', Math.floor(left % 60000 / 1000));
      var over = left <= 0;
      if (over !== isOver) {
        isOver = over;
        bar.classList.toggle('is-over', over);
        text.textContent = over ? '30 天计划到期啦，回顾一下成果，或者重新开始一轮' : defaultText;
        countdown.hidden = over;
      }
      renderCard();
      return !over;
    }

    function tick() {
      clearTimeout(timer);
      if (render()) timer = setTimeout(tick, 1000 - Date.now() % 1000 + 8);   // 对齐到整秒
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearTimeout(timer); else tick();
    });
    tick();

    // 关闭提示条：本次会话内不再出现
    $('#announceClose').addEventListener('click', function () {
      try { sessionStorage.setItem(NS + 'announceClosed', '1'); } catch (e) { /* 忽略 */ }
      var finish = function () { root.classList.add('announce-dismissed'); bar.classList.remove('is-closing'); bar.style.height = ''; };
      if (reducedMotion()) { finish(); return; }
      bar.style.height = bar.offsetHeight + 'px';
      void bar.offsetWidth;
      bar.classList.add('is-closing');
      bar.style.height = '0px';
      setTimeout(finish, 260);
    });

    // 重新开始（可撤销）
    $('#planReset').addEventListener('click', function () {
      var previous = start;
      start = Date.now();
      store.set('planStart', start);
      tick();
      toast('已重新开始 30 天计划', {
        type: 'ok',
        action: { label: '撤销', onClick: function () { start = previous; store.set('planStart', previous); tick(); } }
      });
    });
  }

  /* ---------------------------------------------------------------------- */
  /* 侧边栏：桌面端收起 / 移动端抽屉 / 滚动高亮                               */
  /* ---------------------------------------------------------------------- */
  function initSidebar() {
    var sidebar = $('#sidebar');
    var toggle = $('#sidebarToggle');
    var menuBtn = $('#menuBtn');
    var backdrop = $('#backdrop');
    var main = $('#shellMain');
    var mobile = window.matchMedia('(max-width: 960px)');

    function syncToggle() {
      var collapsed = root.classList.contains('sidebar-collapsed');
      if (mobile.matches) {
        toggle.setAttribute('aria-label', '关闭导航');
        toggle.removeAttribute('aria-expanded');
      } else {
        toggle.setAttribute('aria-label', collapsed ? '展开侧边栏' : '收起侧边栏');
        toggle.setAttribute('aria-expanded', String(!collapsed));
      }
    }

    function setCollapsed(collapsed) {
      root.classList.toggle('sidebar-collapsed', collapsed);
      store.set('sidebar', collapsed ? 'collapsed' : 'open');
      syncToggle();
    }

    function drawerOpen() { return root.classList.contains('drawer-open'); }

    function openDrawer() {
      root.classList.add('drawer-open');
      menuBtn.setAttribute('aria-expanded', 'true');
      backdrop.hidden = false;
      requestAnimationFrame(function () { backdrop.classList.add('is-on'); });
      main.inert = true;                         // 抽屉打开时，背后的内容不可聚焦
      toggle.focus({ preventScroll: true });
    }

    function closeDrawer(restoreFocus) {
      if (!drawerOpen()) return;
      root.classList.remove('drawer-open');
      menuBtn.setAttribute('aria-expanded', 'false');
      backdrop.classList.remove('is-on');
      setTimeout(function () { if (!drawerOpen()) backdrop.hidden = true; }, 260);
      main.inert = false;
      if (restoreFocus !== false) menuBtn.focus({ preventScroll: true });
    }

    toggle.addEventListener('click', function () {
      if (mobile.matches) closeDrawer();
      else setCollapsed(!root.classList.contains('sidebar-collapsed'));
    });
    menuBtn.addEventListener('click', function () { if (drawerOpen()) closeDrawer(); else openDrawer(); });
    backdrop.addEventListener('click', function () { closeDrawer(); });
    sidebar.addEventListener('click', function (e) {
      if (mobile.matches && e.target.closest('a')) closeDrawer(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawerOpen()) { e.preventDefault(); closeDrawer(); }
    });
    mobile.addEventListener('change', function () { closeDrawer(false); syncToggle(); });
    syncToggle();

    // 滚动高亮：取「上沿已越过视口 35% 处」的最后一个区块
    var links = $$('.nav__item[data-spy]');
    var sections = links.map(function (a) { return document.getElementById(a.dataset.spy); }).filter(Boolean);
    var topbar = $('#topbar');
    var update = rafThrottle(function () {
      var line = window.innerHeight * 0.35;
      var current = sections[0];
      sections.forEach(function (s) { if (s.getBoundingClientRect().top <= line) current = s; });
      if (window.innerHeight + window.scrollY >= root.scrollHeight - 2) current = sections[sections.length - 1];
      links.forEach(function (a) {
        if (current && a.dataset.spy === current.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
      topbar.classList.toggle('is-stuck', topbar.getBoundingClientRect().top <= 0 && window.scrollY > 4);
    });
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------------------------------------------------------------------- */
  /* 下拉选择（按钮 + listbox）                                              */
  /* 键盘：↑↓ / Home / End 移动，Enter / 空格 选中，Esc / Tab 关闭             */
  /* ---------------------------------------------------------------------- */
  var openSelects = [];

  function createSelect(el, config) {
    var btn = $('.select__btn', el);
    var menu = $('.select__menu', el);
    var valueEl = $('.select__value', el);
    var options = config.options;
    var current = config.value;
    var active = -1;
    var isOpen = false;

    menu.textContent = '';
    var items = options.map(function (opt, i) {
      var li = document.createElement('li');
      li.id = 'opt-' + el.dataset.select + '-' + i;
      li.setAttribute('role', 'option');
      var label = document.createElement('span');
      label.textContent = opt.label;
      li.appendChild(label);
      if (opt.hint) {
        var hint = document.createElement('small');
        hint.textContent = opt.hint;
        li.appendChild(hint);
      }
      li.insertAdjacentHTML('beforeend', icon('i-check', 'select__check'));
      menu.appendChild(li);
      return li;
    });

    function indexOfValue(value) {
      for (var i = 0; i < options.length; i++) if (options[i].value === value) return i;
      return -1;
    }

    function render() {
      var idx = indexOfValue(current);
      items.forEach(function (li, i) { li.setAttribute('aria-selected', String(i === idx)); });
      var opt = options[idx];
      valueEl.textContent = opt ? (opt.short || opt.label) : '';
    }

    function setActive(i) {
      active = clamp(i, 0, items.length - 1);
      items.forEach(function (li, j) { li.classList.toggle('is-active', j === active); });
      menu.setAttribute('aria-activedescendant', items[active].id);
      items[active].scrollIntoView({ block: 'nearest' });
    }

    function place() {
      el.classList.remove('is-up', 'is-end');
      var menuRect = menu.getBoundingClientRect();
      var btnRect = btn.getBoundingClientRect();
      if (menuRect.bottom > window.innerHeight - 8 && btnRect.top > menuRect.height + 16) el.classList.add('is-up');
      if (menuRect.right > window.innerWidth - 8) el.classList.add('is-end');
    }

    function open() {
      if (isOpen) return;
      openSelects.slice().forEach(function (s) { s.close(false); });
      isOpen = true;
      menu.hidden = false;
      el.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      place();
      setActive(Math.max(0, indexOfValue(current)));
      menu.focus({ preventScroll: true });
      openSelects.push(api);
    }

    function close(focusButton) {
      if (!isOpen) return;
      isOpen = false;
      menu.hidden = true;
      el.classList.remove('is-open', 'is-up', 'is-end');
      btn.setAttribute('aria-expanded', 'false');
      menu.removeAttribute('aria-activedescendant');
      openSelects.splice(openSelects.indexOf(api), 1);
      if (focusButton !== false) btn.focus({ preventScroll: true });
    }

    function choose(i) {
      var opt = options[i];
      if (!opt) return;
      var changed = opt.value !== current;
      current = opt.value;
      render();
      close();
      if (changed && config.onChange) config.onChange(current, opt);
    }

    btn.addEventListener('click', function () { if (isOpen) close(); else open(); });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); }
    });
    menu.addEventListener('keydown', function (e) {
      switch (e.key) {
        case 'ArrowDown': e.preventDefault(); setActive(active + 1); break;
        case 'ArrowUp': e.preventDefault(); setActive(active - 1); break;
        case 'Home': e.preventDefault(); setActive(0); break;
        case 'End': e.preventDefault(); setActive(items.length - 1); break;
        case 'Enter': case ' ': e.preventDefault(); choose(active); break;
        case 'Escape': e.preventDefault(); e.stopPropagation(); close(); break;
        case 'Tab': close(false); break;
        default: break;
      }
    });
    menu.addEventListener('click', function (e) {
      var li = e.target.closest('[role="option"]');
      if (li) choose(items.indexOf(li));
    });
    menu.addEventListener('pointermove', function (e) {
      var li = e.target.closest('[role="option"]');
      var i = li ? items.indexOf(li) : -1;
      if (i >= 0 && i !== active) setActive(i);
    });
    menu.addEventListener('focusout', function (e) {
      if (isOpen && !el.contains(e.relatedTarget)) close(false);
    });

    var api = {
      el: el,
      close: close,
      get value() { return current; },
      /** 代码里设置值；不触发 onChange */
      set: function (value) { if (indexOfValue(value) >= 0) { current = value; render(); } },
      label: function () { var o = options[indexOfValue(current)]; return o ? o.label : ''; }
    };
    render();
    return api;
  }

  document.addEventListener('pointerdown', function (e) {
    openSelects.slice().forEach(function (s) { if (!s.el.contains(e.target)) s.close(false); });
  });

  /* ---------------------------------------------------------------------- */
  /* 提示词生成器                                                            */
  /* ---------------------------------------------------------------------- */
  var composer = null;   // 对外暴露：{ setMode, fill, focus }

  /**
   * 生成提示词。现在只是在本地把模板和输入拼起来；
   * 接入真实服务时，把这个函数换成 fetch 请求即可（返回 Promise<string>）。
   */
  function requestPrompt(payload) {
    var mode = DATA.modes.filter(function (m) { return m.id === payload.mode; })[0];
    return sleep(reducedMotion() ? 0 : 420).then(function () { return mode.build(payload); });
  }

  function initComposer() {
    var form = $('#composer');
    var tabsEl = $('#composerTabs');
    var ink = $('#composerInk');
    var panel = $('#composerPanel');
    var label = $('#promptLabel');
    var input = $('#prompt');
    var count = $('#promptCount');
    var error = $('#promptError');
    var submit = $('#generateBtn');
    var suggest = $('#suggest');
    var result = $('#result');

    var modes = {};
    DATA.modes.forEach(function (m) { modes[m.id] = m; });

    var saved = store.get('composer', {});
    var state = {
      mode: modes[saved.mode] ? saved.mode : DATA.defaults.mode,
      drafts: {},          // 每个环节各自保留草稿
      busy: false,
      last: null           // 最近一次生成：{ mode, output }
    };

    /* --- 环节 tab --- */
    var tabs = DATA.modes.map(function (m) {
      var tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'tab';
      tab.id = 'tab-' + m.id;
      tab.dataset.mode = m.id;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', 'composerPanel');
      tab.innerHTML = icon(m.icon) + '<span></span>';
      tab.lastChild.textContent = m.label;
      tabsEl.appendChild(tab);
      return tab;
    });

    function revealTab(tab) {
      var left = tab.offsetLeft, right = left + tab.offsetWidth;
      var viewLeft = tabsEl.scrollLeft, viewRight = viewLeft + tabsEl.clientWidth;
      if (left >= viewLeft + 24 && right <= viewRight - 24) return;
      tabsEl.scrollTo({ left: left - (tabsEl.clientWidth - tab.offsetWidth) / 2, behavior: scrollBehavior() });
    }

    function moveInk() {
      var tab = tabs.filter(function (t) { return t.dataset.mode === state.mode; })[0];
      if (!tab) return;
      ink.style.width = tab.offsetWidth + 'px';
      ink.style.transform = 'translateX(' + tab.offsetLeft + 'px)';
    }

    /* --- 下拉 --- */
    function persist() {
      store.set('composer', {
        mode: state.mode, genre: selects.genre.value, ratio: selects.ratio.value, duration: selects.duration.value
      });
    }
    var selects = {};
    ['genre', 'ratio', 'duration'].forEach(function (key) {
      var opts = DATA.options[key];
      var initial = saved[key];
      var valid = opts.some(function (o) { return o.value === initial; });
      selects[key] = createSelect($('[data-select="' + key + '"]', form), {
        options: opts,
        value: valid ? initial : DATA.defaults[key],
        onChange: persist
      });
    });

    /* --- 打字机占位 --- */
    var typer = (function () {
      var timer = 0, list = [], index = 0, pos = 0, dir = 1;
      function step() {
        var full = list[index];
        pos += dir;
        input.placeholder = '例如：' + full.slice(0, pos);
        var delay = dir > 0 ? 75 : 28;
        if (dir > 0 && pos >= full.length) { dir = -1; delay = 1900; }
        else if (dir < 0 && pos <= 0) { dir = 1; index = (index + 1) % list.length; delay = 380; }
        timer = setTimeout(step, delay);
      }
      return {
        start: function (mode) {
          clearTimeout(timer);
          list = mode.placeholders || [];
          if (!list.length) { input.placeholder = mode.placeholder || ''; return; }
          if (reducedMotion()) { input.placeholder = '例如：' + list[0]; return; }
          index = 0; pos = 0; dir = 1;
          input.placeholder = '例如：';
          timer = setTimeout(step, 400);
        }
      };
    })();

    /* --- 输入框 --- */
    function autosize() {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 300) + 'px';
    }
    function updateCount() {
      var max = modes[state.mode].max;
      var len = input.value.length;
      count.textContent = len + ' / ' + max;
      count.classList.toggle('is-near', len >= max * 0.9 && len < max);
      count.classList.toggle('is-full', len >= max);
    }
    function clearError() {
      error.hidden = true;
      error.textContent = '';
      input.removeAttribute('aria-invalid');
    }
    function showError(message) {
      error.textContent = message;
      error.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      form.classList.remove('is-shake');
      void form.offsetWidth;
      form.classList.add('is-shake');
      input.focus();
    }

    function renderSuggest() {
      var mode = modes[state.mode];
      suggest.textContent = '';
      if (!mode.suggestions || !mode.suggestions.length) return;
      var tip = document.createElement('span');
      tip.className = 'suggest__label';
      tip.textContent = '试试：';
      suggest.appendChild(tip);
      mode.suggestions.forEach(function (s, i) {
        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip';
        chip.style.setProperty('--i', i);
        chip.dataset.value = s.value || s.label;
        var span = document.createElement('span');
        span.textContent = s.label;
        chip.appendChild(span);
        suggest.appendChild(chip);
      });
      suggest.scrollLeft = 0;
      if (updateSuggestFade) updateSuggestFade();
    }

    function setMode(id, options) {
      options = options || {};
      var mode = modes[id];
      if (!mode) return;
      state.drafts[state.mode] = input.value;
      state.mode = id;

      tabs.forEach(function (tab) {
        var on = tab.dataset.mode === id;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        if (on) revealTab(tab);
      });
      panel.setAttribute('aria-labelledby', 'tab-' + id);
      label.textContent = mode.field;
      input.maxLength = mode.max;
      input.value = options.text != null ? options.text : (state.drafts[id] || '');
      Object.keys(selects).forEach(function (key) { selects[key].el.hidden = mode.opts.indexOf(key) < 0; });

      clearError();
      updateCount();
      autosize();
      renderSuggest();
      typer.start(mode);
      moveInk();
      persist();
      if (options.focus) input.focus({ preventScroll: true });
    }

    tabsEl.addEventListener('click', function (e) {
      var tab = e.target.closest('.tab');
      if (tab) setMode(tab.dataset.mode);
    });
    // tab 之间用方向键切换（roving tabindex）
    tabsEl.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var next = -1;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next < 0) return;
      e.preventDefault();
      setMode(tabs[next].dataset.mode);
      tabs[next].focus();
    });

    input.addEventListener('input', function () { updateCount(); autosize(); if (!error.hidden) clearError(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : submit.click(); }
    });

    suggest.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      input.value = chip.dataset.value.slice(0, modes[state.mode].max);
      updateCount(); autosize(); clearError();
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    });

    /* --- 结果面板 --- */
    var resultBody = $('#resultBody');
    var copyBtn = $('#copyBtn');
    var nextBtn = $('#nextStepBtn');
    var copyTimer = 0;

    /** 把模板里还留着的【空】高亮出来；全部用 textContent / 节点拼装，不走 innerHTML */
    function renderOutput(text, blanks) {
      resultBody.textContent = '';
      if (!blanks.length) { resultBody.textContent = text; return; }
      var pattern = new RegExp('(' + blanks.map(escapeRegExp).join('|') + ')');
      text.split(pattern).forEach(function (part) {
        if (!part) return;
        if (blanks.indexOf(part) < 0) { resultBody.appendChild(document.createTextNode(part)); return; }
        var mark = document.createElement('mark');
        mark.textContent = part;
        resultBody.appendChild(mark);
      });
    }

    function showResult(mode, payload, output) {
      state.last = { mode: mode.id, output: output };
      var summary = [mode.label];
      mode.opts.forEach(function (key) { summary.push(selects[key].label()); });
      $('#resultTitle').textContent = summary.join(' · ') + '（对应教程附录 ' + mode.ref + '）';

      // 只提示模板自带的空；用户粘贴的台词里出现【】不算
      var blanks = mode.blanks || [];
      renderOutput(output, blanks);
      var blank = $('#resultBlank');
      blank.hidden = blanks.length === 0;
      if (blanks.length) blank.lastElementChild.textContent = '还有 ' + blanks.length + ' 处【】需要你粘贴到豆包后自己补全。';

      var chapter = $('#resultChapter');
      chapter.href = DATA.tutorialUrl + '#ch' + mode.chapter;
      chapter.textContent = '教程第 ' + mode.chapter + ' 章 · ' + mode.chapterTitle + ' →';

      nextBtn.hidden = !mode.next;
      if (mode.next) {
        nextBtn.dataset.mode = mode.next;
        nextBtn.firstElementChild.textContent = '下一步：' + mode.nextText;
      }

      resetCopyButton();
      result.hidden = false;
      // 重新触发入场动画
      result.style.animation = 'none'; void result.offsetWidth; result.style.animation = '';
      resultBody.scrollTop = 0;
      var rect = result.getBoundingClientRect();
      if (rect.bottom > window.innerHeight || rect.top < 0) {
        result.scrollIntoView({ behavior: scrollBehavior(), block: 'nearest' });
      }
    }

    function resetCopyButton() {
      clearTimeout(copyTimer);
      copyBtn.classList.remove('is-done');
      copyBtn.innerHTML = icon('i-copy') + '<span>复制</span>';
    }

    copyBtn.addEventListener('click', function () {
      if (!state.last) return;
      copyText(state.last.output).then(function (ok) {
        if (!ok) {
          // 复制失败时选中文本，方便手动复制
          var range = document.createRange();
          range.selectNodeContents(resultBody);
          var sel = window.getSelection();
          sel.removeAllRanges(); sel.addRange(range);
          toast('浏览器不允许自动复制，已帮你选中文本，按 ' + MOD_KEY + ' + C 复制', { type: 'warn', duration: 4000 });
          return;
        }
        copyBtn.classList.add('is-done');
        copyBtn.innerHTML = icon('i-check') + '<span>已复制</span>';
        clearTimeout(copyTimer);
        copyTimer = setTimeout(resetCopyButton, 1800);
      });
    });

    $('#resultClose').addEventListener('click', function () { result.hidden = true; submit.focus({ preventScroll: true }); });
    nextBtn.addEventListener('click', function () {
      setMode(nextBtn.dataset.mode, { focus: true });
      form.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
    });
    $('#doubaoLink').href = DATA.doubaoUrl;

    /* --- 提交 --- */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (state.busy) return;
      var mode = modes[state.mode];
      var text = input.value.trim();
      if (!text && !mode.allowEmpty) { showError(mode.emptyMessage || '先写点内容，再生成提示词。'); return; }

      var payload = {
        mode: mode.id, text: text,
        genre: selects.genre.value, ratio: selects.ratio.value, duration: selects.duration.value
      };
      state.busy = true;
      submit.classList.add('is-loading');
      submit.setAttribute('aria-busy', 'true');
      requestPrompt(payload).then(function (output) {
        showResult(mode, payload, output);
      }).catch(function () {
        toast('生成失败，请再试一次', { type: 'warn' });
      }).then(function () {
        state.busy = false;
        submit.classList.remove('is-loading');
        submit.removeAttribute('aria-busy');
      });
    });

    $('#submitKbd').firstElementChild.textContent = MOD_KEY;   // 快捷键提示：Mac 显示 ⌘

    watchOverflow(tabsEl);
    var updateSuggestFade = watchOverflow(suggest);
    window.addEventListener('resize', debounce(function () { moveInk(); autosize(); }, 120));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInk);

    setMode(state.mode);

    /**
     * 把生成器滚到屏幕中间。
     * 聚焦要和点击同步（先聚焦、再滚动）：隔一个定时器再聚焦的话，手机上不会弹出键盘。
     */
    function revealComposer(shouldFocus) {
      if (shouldFocus !== false) input.focus({ preventScroll: true });
      form.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
    }
    function focusComposer() { revealComposer(true); }

    composer = {
      setMode: setMode,
      focus: focusComposer,
      /** 从别处（做同款）带着内容进来 */
      fill: function (options) {
        if (options.genre) { selects.genre.set(options.genre); }
        setMode(options.mode || state.mode, { text: options.text });
        // 内容已经填好：触屏上只滚过去、不聚焦，免得键盘弹出来挡住「生成提示词」
        revealComposer(!touchQuery.matches);
      }
    };

    $('#newBtn').addEventListener('click', focusComposer);
    // 流程卡片上的「写提示词」
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-use-mode]');
      if (!btn) return;
      setMode(btn.dataset.useMode);
      focusComposer();
    });
  }

  /* ---------------------------------------------------------------------- */
  /* 制作流程：横向滚动（按钮 / 拖拽 / 进度条）                               */
  /* ---------------------------------------------------------------------- */
  function initRail() {
    var rail = $('#rail');
    var prev = $('#railPrev');
    var next = $('#railNext');
    var bar = $('#railBar');
    var tools = $('#railTools');
    var progress = bar.parentNode;

    var update = rafThrottle(function () {
      var max = rail.scrollWidth - rail.clientWidth;
      var x = rail.scrollLeft;
      var scrollable = max > 2;
      tools.hidden = !scrollable;
      progress.hidden = !scrollable;
      prev.setAttribute('aria-disabled', String(x <= 2));
      next.setAttribute('aria-disabled', String(x >= max - 2));
      if (!scrollable) return;
      var ratio = rail.clientWidth / rail.scrollWidth;            // 可见比例 = 滑块宽度
      bar.style.width = (ratio * 100) + '%';
      bar.style.transform = 'translateX(' + (x / max) * (1 / ratio - 1) * 100 + '%)';
    });

    function page(direction) {
      rail.scrollBy({ left: direction * Math.max(240, rail.clientWidth * 0.8), behavior: scrollBehavior() });
    }
    prev.addEventListener('click', function () { if (prev.getAttribute('aria-disabled') !== 'true') page(-1); });
    next.addEventListener('click', function () { if (next.getAttribute('aria-disabled') !== 'true') page(1); });
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(rail);
    update();

    // 鼠标拖拽滚动（触屏直接用原生滚动）
    var drag = { down: false, moved: false, startX: 0, startLeft: 0 };
    var snapTimer = 0;
    function restoreSnap() { clearTimeout(snapTimer); rail.classList.remove('no-snap'); }

    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag.down = true; drag.moved = false; drag.startX = e.clientX; drag.startLeft = rail.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag.down) return;
      var dx = e.clientX - drag.startX;
      if (!drag.moved && Math.abs(dx) > 5) {
        drag.moved = true;
        clearTimeout(snapTimer);
        rail.classList.add('is-dragging', 'no-snap');      // 拖动过程中关掉吸附，否则会和手动滚动打架
      }
      if (drag.moved) rail.scrollLeft = drag.startLeft - dx;
    });
    function endDrag() {
      if (!drag.down) return;
      drag.down = false;
      if (!drag.moved) return;
      rail.classList.remove('is-dragging');

      // 松手后顺着拖动方向滑到相邻的卡片，再恢复吸附（直接恢复会瞬间跳回最近的卡片）
      var first = $('.step', rail);
      var step = first.offsetWidth + (parseFloat(getComputedStyle(first.parentNode).columnGap) || 0);
      var max = rail.scrollWidth - rail.clientWidth;
      var x = rail.scrollLeft;
      var forward = x > drag.startLeft;
      var target = clamp((forward ? Math.ceil(x / step) : Math.floor(x / step)) * step, 0, max);
      rail.scrollTo({ left: target, behavior: scrollBehavior() });
      snapTimer = setTimeout(restoreSnap, reducedMotion() ? 0 : 600);

      // 拖拽结束的那一次 click 不应该触发卡片链接
      setTimeout(function () { drag.moved = false; }, 0);
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    rail.addEventListener('click', function (e) {
      if (drag.moved) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    rail.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }

  /* ---------------------------------------------------------------------- */
  /* 点赞（卡片与弹层共用一份状态）                                          */
  /* ---------------------------------------------------------------------- */
  var likes = (function () {
    var liked = {};
    (store.get('likes', []) || []).forEach(function (id) { liked[id] = true; });
    var listeners = [];
    return {
      has: function (id) { return !!liked[id]; },
      count: function (work) { return work.likes + (liked[work.id] ? 1 : 0); },
      toggle: function (id) {
        if (liked[id]) delete liked[id]; else liked[id] = true;
        store.set('likes', Object.keys(liked));
        listeners.forEach(function (fn) { fn(id, !!liked[id]); });
        return !!liked[id];
      },
      onChange: function (fn) { listeners.push(fn); }
    };
  })();

  function paintLike(btn, work, withLabel) {
    var on = likes.has(work.id);
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', (on ? '取消点赞' : '点赞') + '，当前 ' + likes.count(work) + ' 个赞');
    $('.like__n', btn).textContent = withLabel ? (on ? '已赞 ' : '点赞 ') + formatCount(likes.count(work)) : formatCount(likes.count(work));
  }

  function popLike(btn) {
    btn.classList.remove('is-pop');
    void btn.offsetWidth;
    btn.classList.add('is-pop');
  }

  /* ---------------------------------------------------------------------- */
  /* 作品瀑布流                                                              */
  /* ---------------------------------------------------------------------- */
  var lightbox = null;   // initLightbox 里赋值：{ open }
  var gallery = null;    // 对外：{ find }

  /**
   * 取下一页数据。现在是本地数组 + 人为延迟，用来演示骨架屏；
   * 接入真实接口时把这里换成 fetch 即可。
   */
  function fetchPage(list, offset, size) {
    return sleep(reducedMotion() ? 0 : 650).then(function () { return list.slice(offset, offset + size); });
  }

  function initGallery() {
    var PAGE_SIZE = 8;
    var MIN_COL = 236;

    var grid = $('#masonry');
    var filtersEl = $('#filters');
    var pill = $('#filtersPill');
    var status = $('#galleryStatus');
    var empty = $('#galleryEmpty');
    var more = $('#galleryMore');
    var moreBtn = $('#loadMore');
    var endText = $('#galleryEnd');
    var sentinel = $('#sentinel');
    var searchInput = $('#searchInput');
    var searchClear = $('#searchClear');
    var cardTpl = $('#tplCard');
    var skeletonTpl = $('#tplSkeleton');

    var works = DATA.works;
    var byId = {};
    works.forEach(function (w) { byId[w.id] = w; });
    var filterLabel = {};
    DATA.filters.forEach(function (f) { filterLabel[f.id] = f.label; });

    var state = {
      filter: 'all',
      sort: store.get('sort', DATA.defaults.sort),
      query: '',
      list: [],        // 当前筛选 + 排序后的全部作品
      shown: 0,        // 已经渲染了多少个
      loading: false,
      token: 0,        // 每次重置 +1，用来丢弃过期的异步结果
      cols: 0
    };
    var cards = {};    // id -> 卡片元素（筛选切换时复用，图片不用重新加载）

    /* --- 筛选按钮 --- */
    var filterBtns = DATA.filters.map(function (f) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter';
      btn.dataset.filter = f.id;
      btn.innerHTML = '<span></span><i></i>';
      btn.firstChild.textContent = f.label;
      filtersEl.appendChild(btn);
      return btn;
    });

    function movePill() {
      var active = filterBtns.filter(function (b) { return b.dataset.filter === state.filter; })[0];
      if (!active) return;
      pill.style.width = active.offsetWidth + 'px';
      pill.style.transform = 'translateX(' + active.offsetLeft + 'px)';
    }
    watchOverflow(filtersEl);

    function matchesQuery(work, query) {
      if (!query) return true;
      var haystack = [work.title, work.author, filterLabel[work.genre], work.desc].concat(work.tags).join(' ').toLowerCase();
      return query.toLowerCase().split(/\s+/).every(function (word) { return haystack.indexOf(word) >= 0; });
    }

    function paintFilters() {
      filterBtns.forEach(function (btn) {
        var id = btn.dataset.filter;
        var n = works.filter(function (w) { return (id === 'all' || w.genre === id) && matchesQuery(w, state.query); }).length;
        var on = id === state.filter;
        btn.lastChild.textContent = n;
        btn.classList.toggle('is-active', on);
        btn.setAttribute('aria-pressed', String(on));
      });
      movePill();
    }

    /* --- 卡片 --- */
    function createCard(work) {
      var el = cardTpl.content.firstElementChild.cloneNode(true);
      el.dataset.id = work.id;

      var media = $('.card__media', el);
      media.style.setProperty('--ratio', work.w + ' / ' + work.h);
      media.style.setProperty('--tone', work.tone);
      media.setAttribute('aria-label', '预览《' + work.title + '》');

      var img = $('.card__img', el);
      img.width = work.w;
      img.height = work.h;
      img.alt = work.alt;
      img.addEventListener('load', function () { el.classList.add('is-loaded'); });
      img.addEventListener('error', function () { el.classList.add('is-broken'); });
      img.src = work.src;
      if (img.complete && img.naturalWidth) el.classList.add('is-loaded');

      $('.card__badge', el).textContent = filterLabel[work.genre];
      $('.card__dur', el).lastElementChild.textContent = formatDuration(work.seconds);
      $('.card__title', el).textContent = work.title;
      $('.card__author', el).textContent = work.author;
      var avatar = $('.avatar', el);
      avatar.textContent = work.author.charAt(0);
      avatar.style.setProperty('--hue', hueOf(work.author));
      paintLike($('.like', el), work, false);
      return el;
    }

    function cardFor(work) {
      if (!cards[work.id]) cards[work.id] = createCard(work);
      return cards[work.id];
    }

    /* --- 瀑布流布局：每次把元素放进当前最矮的一列 --- */
    function columnCount() {
      var width = grid.clientWidth;
      if (width < 520) return 2;
      var gap = parseFloat(getComputedStyle(grid).columnGap) || 16;
      return clamp(Math.floor((width + gap) / (MIN_COL + gap)), 2, 5);
    }

    function buildColumns() {
      state.cols = columnCount();
      grid.textContent = '';
      for (var i = 0; i < state.cols; i++) {
        var col = document.createElement('div');
        col.className = 'masonry__col';
        grid.appendChild(col);
      }
    }

    function shortestColumn() {
      var cols = grid.children, best = cols[0];
      for (var i = 1; i < cols.length; i++) if (cols[i].offsetHeight < best.offsetHeight) best = cols[i];
      return best;
    }

    function place(el) { shortestColumn().appendChild(el); }

    /** 列数变化时，把已渲染的卡片按原顺序重新分配 */
    function relayout() {
      var next = columnCount();
      if (next === state.cols) return;
      var shown = state.list.slice(0, state.shown).map(cardFor);
      var pending = $$('.skeleton', grid);
      buildColumns();
      shown.concat(pending).forEach(function (el) { el.style.animation = 'none'; place(el); });
    }

    /* --- 状态文案 --- */
    function paintStatus() {
      var total = state.list.length;
      var parts = [];
      if (state.query) parts.push('搜索「' + state.query + '」');
      if (state.filter !== 'all') parts.push(filterLabel[state.filter]);
      status.textContent = (parts.length ? parts.join(' · ') + ' · ' : '') + '共 ' + total + ' 个作品';

      var hasMore = state.shown < total;
      empty.hidden = total > 0;
      grid.hidden = total === 0;
      more.hidden = total === 0;
      moreBtn.hidden = !hasMore;
      moreBtn.disabled = state.loading;
      moreBtn.textContent = state.loading ? '加载中…' : '加载更多';
      endText.hidden = hasMore || total === 0;
      endText.textContent = '已经到底啦 · 共 ' + total + ' 个作品';
      grid.setAttribute('aria-busy', String(state.loading));
    }

    /* --- 渲染 --- */
    function compute() {
      var list = works.filter(function (w) {
        return (state.filter === 'all' || w.genre === state.filter) && matchesQuery(w, state.query);
      });
      list.sort(state.sort === 'hot'
        ? function (a, b) { return likes.count(b) - likes.count(a); }
        : function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
      state.list = list;
    }

    function appendCards(items, replace) {
      items.forEach(function (work, i) {
        var card = cardFor(work);
        card.style.animation = '';
        card.style.setProperty('--i', i);
        if (replace && replace[i]) replace[i].replaceWith(card);
        else place(card);
      });
      state.shown += items.length;
    }

    /** 筛选 / 排序 / 搜索变化后，从第一页重新渲染 */
    function reset() {
      state.token++;
      state.loading = false;
      state.shown = 0;
      compute();
      buildColumns();
      appendCards(state.list.slice(0, PAGE_SIZE));
      paintFilters();
      paintStatus();
    }

    function loadMore() {
      if (state.loading || state.shown >= state.list.length) return;
      var token = state.token;
      var upcoming = state.list.slice(state.shown, state.shown + PAGE_SIZE);
      state.loading = true;

      // 先按真实比例放骨架屏占位，数据回来后原位替换
      var skeletons = upcoming.map(function (work) {
        var sk = skeletonTpl.content.firstElementChild.cloneNode(true);
        $('.skeleton__media', sk).style.setProperty('--ratio', work.w + ' / ' + work.h);
        place(sk);
        return sk;
      });
      paintStatus();

      fetchPage(state.list, state.shown, PAGE_SIZE).then(function (items) {
        if (token !== state.token) return;          // 期间筛选条件变了，丢弃
        state.loading = false;
        appendCards(items, skeletons);
        skeletons.forEach(function (sk) { if (sk.isConnected) sk.remove(); });
        paintStatus();
      });
    }

    /* --- 事件 --- */
    filtersEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (!btn || btn.dataset.filter === state.filter) return;
      state.filter = btn.dataset.filter;
      reset();
    });

    createSelect($('[data-select="sort"]'), {
      options: DATA.options.sort,
      value: DATA.options.sort.some(function (o) { return o.value === state.sort; }) ? state.sort : DATA.defaults.sort,
      onChange: function (value) { state.sort = value; store.set('sort', value); reset(); }
    });

    grid.addEventListener('click', function (e) {
      var card = e.target.closest('.card');
      if (!card) return;
      var work = byId[card.dataset.id];
      var likeBtn = e.target.closest('.like');
      if (likeBtn) {
        if (likes.toggle(work.id)) popLike(likeBtn);
        return;
      }
      var media = e.target.closest('.card__media');
      if (media && lightbox) lightbox.open(state.list, state.list.indexOf(work), media);
    });

    likes.onChange(function (id) {
      var card = cards[id];
      if (card) paintLike($('.like', card), byId[id], false);
    });

    moreBtn.addEventListener('click', loadMore);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries.some(function (en) { return en.isIntersecting; })) loadMore();
      }, { rootMargin: '0px 0px 240px 0px' }).observe(sentinel);
    }

    /* --- 搜索 --- */
    var applyQuery = debounce(function () {
      var query = searchInput.value.trim();
      if (query === state.query) return;
      state.query = query;
      reset();
    }, 180);
    searchInput.addEventListener('input', function () {
      searchClear.hidden = !searchInput.value;
      applyQuery();
    });
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        state.query = searchInput.value.trim();
        reset();
        $('#gallery').scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
      } else if (e.key === 'Escape' && searchInput.value) {
        e.preventDefault();
        clearSearch();
      }
    });
    function clearSearch() {
      searchInput.value = '';
      searchClear.hidden = true;
      if (state.query) { state.query = ''; reset(); }
    }
    searchClear.addEventListener('click', function () { clearSearch(); searchInput.focus(); });
    $('#galleryReset').addEventListener('click', function () {
      state.filter = 'all';
      searchInput.value = '';
      searchClear.hidden = true;
      state.query = '';
      reset();
    });

    // 「/」聚焦搜索框
    document.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target;
      if (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || $('dialog[open]')) return;
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    });

    /* --- 尺寸变化 --- */
    var onResize = debounce(function () { relayout(); movePill(); }, 120);
    if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(grid);
    else window.addEventListener('resize', onResize);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(movePill);

    reset();

    gallery = {
      find: function (id) { return byId[id]; },
      all: function () { return works.slice(); }
    };
  }

  /* ---------------------------------------------------------------------- */
  /* 作品预览弹层                                                            */
  /* 用 <dialog>.showModal()：自带焦点圈定、Esc 关闭、背景不可交互            */
  /* ---------------------------------------------------------------------- */
  function initLightbox() {
    var PREVIEW_MS = 8000;

    var dialog = $('#lightbox');
    if (!dialog || typeof dialog.showModal !== 'function') return;   // 太老的浏览器：不提供预览

    var panel = $('#lbPanel');
    var stage = $('#lbStage');
    var frame = $('#lbFrame');
    var img = $('#lbImg');
    var sub = $('#lbSub');
    var playBtn = $('#lbPlay');
    var playIcon = $('#lbPlayIcon');
    var seek = $('#lbSeek');
    var bar = $('#lbBar');
    var time = $('#lbTime');
    var likeBtn = $('#lbLike');

    var filterLabel = {};
    DATA.filters.forEach(function (f) { filterLabel[f.id] = f.label; });

    var list = [];
    var index = 0;
    var opener = null;
    var anim = null;
    var raf = 0;
    var lineIndex = -1;
    var closing = false;

    function current() { return list[index]; }

    /* --- 预览动效（Web Animations API） --- */
    function paintProgress() {
      var t = anim ? Number(anim.currentTime) || 0 : 0;
      var p = clamp(t / PREVIEW_MS, 0, 1);
      bar.style.setProperty('--p', p.toFixed(4));
      seek.setAttribute('aria-valuenow', String(Math.round(p * 100)));
      var sec = Math.min(PREVIEW_MS / 1000, Math.floor(t / 1000));
      time.textContent = '0:' + pad2(sec) + ' / 0:' + pad2(PREVIEW_MS / 1000);

      var lines = current().lines || [];
      var next = lines.length ? Math.min(lines.length - 1, Math.floor(p * lines.length)) : -1;
      if (next !== lineIndex) {
        lineIndex = next;
        sub.classList.add('is-out');
        var textNow = next >= 0 ? lines[next] : '';
        setTimeout(function () {
          if (lineIndex !== next) return;
          sub.textContent = textNow;
          sub.classList.remove('is-out');
        }, reducedMotion() ? 0 : 120);
      }
    }

    function loop() {
      paintProgress();
      raf = requestAnimationFrame(loop);
    }

    function setPlayState(stateName) {           // 'playing' | 'paused' | 'ended'
      playBtn.classList.toggle('is-replay', stateName === 'ended');
      playIcon.setAttribute('href', stateName === 'playing' ? '#i-pause' : stateName === 'ended' ? '#i-replay' : '#i-play');
      playBtn.setAttribute('aria-label', stateName === 'playing' ? '暂停预览' : stateName === 'ended' ? '重新播放' : '播放预览');
    }

    function play() {
      if (!anim) return;
      if (anim.playState === 'finished' || (Number(anim.currentTime) || 0) >= PREVIEW_MS) anim.currentTime = 0;
      anim.play();
      setPlayState('playing');
      cancelAnimationFrame(raf);
      loop();
    }

    function pause() {
      if (!anim) return;
      anim.pause();
      cancelAnimationFrame(raf);
      paintProgress();
      setPlayState('paused');
    }

    function togglePlay() {
      if (!anim) return;
      if (anim.playState === 'running') pause(); else play();
    }

    function stopPreview() {
      cancelAnimationFrame(raf);
      if (anim) { anim.onfinish = null; anim.cancel(); anim = null; }
    }

    function setupPreview(work) {
      stopPreview();
      lineIndex = -1;
      sub.textContent = '';
      var motion = DATA.motions[work.motion] || DATA.motions.push;
      $('#lbMotion').textContent = '动效 · ' + motion.label;
      if (!img.animate) { paintProgress(); return; }
      anim = img.animate(motion.frames, { duration: PREVIEW_MS, easing: 'ease-in-out', fill: 'both' });
      anim.pause();
      anim.onfinish = function () {
        cancelAnimationFrame(raf);
        paintProgress();
        setPlayState('ended');
      };
      paintProgress();
      if (reducedMotion()) setPlayState('paused'); else play();
    }

    /** 大图解码完成后再替换，画面不会闪；期间如果已经切到别的作品就放弃 */
    function upgradeImage(work) {
      if (!work.large) return;
      var big = new Image();
      var swap = function () { if (dialog.open && current() === work) img.src = work.large; };
      big.src = work.large;
      if (big.decode) big.decode().then(swap, function () { /* 大图加载失败：继续用封面 */ });
      else big.onload = swap;
    }

    /* --- 内容 --- */
    function show(i) {
      index = (i + list.length) % list.length;
      var work = current();

      frame.style.setProperty('--ratio', work.w + ' / ' + work.h);
      frame.style.setProperty('--r', (work.w / work.h).toFixed(4));
      stage.style.setProperty('--tone', work.tone);       // 画框和两侧留白都用封面的平均色
      img.classList.remove('is-swap');
      img.src = work.src;                          // 封面已经在缓存里，先显示它
      img.alt = work.alt;
      void img.offsetWidth;
      img.classList.add('is-swap');
      upgradeImage(work);

      var tags = $('#lbTags');
      tags.textContent = '';
      [filterLabel[work.genre]].concat(work.tags).forEach(function (t, n) {
        var el = document.createElement('span');
        el.className = 'tag' + (n === 0 ? ' tag--genre' : '');
        el.textContent = t;
        tags.appendChild(el);
      });
      $('#lbTitle').textContent = work.title;
      $('#lbAuthor').textContent = work.author;
      $('#lbDate').textContent = formatDate(work.date) + ' 发布';
      var avatar = $('#lbAvatar');
      avatar.textContent = work.author.charAt(0);
      avatar.style.setProperty('--hue', hueOf(work.author));
      $('#lbDesc').textContent = work.desc;
      $('#lbViews').textContent = formatCount(work.views);
      $('#lbDur').textContent = formatDuration(work.seconds);
      $('#lbIdea').textContent = work.idea;
      paintLikes();

      var single = list.length < 2;
      $('#lbPrev').hidden = single;
      $('#lbNext').hidden = single;

      setupPreview(work);

      // 链接里带上作品 id，刷新或分享后能直接打开
      try { history.replaceState(history.state, '', '#work-' + work.id); } catch (e) { /* 个别环境不允许改地址 */ }

      // 预加载相邻两张
      [index - 1, index + 1].forEach(function (n) {
        var neighbor = list[(n + list.length) % list.length];
        if (neighbor && neighbor !== work) { new Image().src = neighbor.src; }
      });
    }

    function paintLikes() {
      var work = current();
      if (!work) return;
      $('#lbLikes').textContent = formatCount(likes.count(work));
      paintLike(likeBtn, work, true);
    }

    /**
     * fromUrl 为 true 表示地址里已经带着 #work-xxx（直接打开链接、前进 / 后退），不再新增历史记录；
     * 否则新增一条，这样浏览器或手机的「返回」是关闭预览，而不是离开页面。
     */
    function open(works, i, trigger, fromUrl) {
      list = works.slice();
      opener = trigger || null;
      closing = false;
      dialog.classList.remove('is-closing');
      if (!dialog.open) {
        if (!fromUrl) {
          try { history.pushState({ lightbox: true }, '', '#work-' + list[Math.max(0, i)].id); } catch (e) { /* 忽略 */ }
        }
        root.style.setProperty('--sbw', (window.innerWidth - root.clientWidth) + 'px');   // 滚动条宽度
        dialog.showModal();
        root.classList.add('is-locked');
        // 焦点放在面板本身：空格直接控制播放，Tab 再进入各个按钮
        // （否则默认落在第一个按钮「上一个」上，按空格会误切作品）
        panel.focus({ preventScroll: true });
      }
      show(Math.max(0, i));
      dialog.scrollTop = 0;
    }

    /**
     * 关闭预览。
     * viaHistory：由「返回」触发，地址已经变回去了，不用再动历史记录。
     * done：完全关闭、地址也恢复之后回调。
     */
    function close(viaHistory, done) {
      if (!dialog.open || closing) return;
      closing = true;
      cancelAnimationFrame(raf);
      if (anim) anim.pause();                    // 先停在当前画面，等弹层关掉再清理，淡出时画面不会跳一下

      var pending = 2;                           // 等两件事：关闭动画、地址恢复
      function step() { if (--pending === 0 && done) done(); }

      if (viaHistory === true) {
        step();
      } else if (history.state && history.state.lightbox) {
        // 这条记录是打开时新增的：退回去，等 popstate 确认（收不到也不卡住）
        var settled = false;
        var settle = function () {
          if (settled) return;
          settled = true;
          window.removeEventListener('popstate', settle);
          step();
        };
        window.addEventListener('popstate', settle);
        setTimeout(settle, 500);
        try { history.back(); } catch (e) { settle(); }
      } else {
        // 直接打开的链接：只把地址里的 #work-xxx 去掉
        try { history.replaceState(history.state, '', location.pathname + location.search); } catch (e) { /* 忽略 */ }
        step();
      }

      var finish = function () {
        dialog.classList.remove('is-closing');
        if (dialog.open) dialog.close();
        step();
      };
      if (reducedMotion()) { finish(); return; }
      dialog.classList.add('is-closing');
      setTimeout(finish, 200);
    }

    dialog.addEventListener('close', function () {
      closing = false;
      stopPreview();
      root.classList.remove('is-locked');
      // toast 容器如果被挪进了弹层，放回 body
      if (toastHost.parentNode !== document.body) document.body.appendChild(toastHost);
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
      opener = null;
    });

    // 浏览器「返回」：地址里已经没有 #work-xxx，把预览关掉
    window.addEventListener('popstate', function () {
      if (dialog.open && !closing && !/^#work-/.test(location.hash)) close(true);
    });
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); close(); });   // Esc：走带动画的关闭
    dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });   // 点空白处关闭

    $('#lbClose').addEventListener('click', function () { close(); });
    $('#lbPrev').addEventListener('click', function () { show(index - 1); });
    $('#lbNext').addEventListener('click', function () { show(index + 1); });
    playBtn.addEventListener('click', togglePlay);

    // 点进度条跳转
    seek.addEventListener('click', function (e) {
      if (!anim) return;
      var rect = seek.getBoundingClientRect();
      var wasRunning = anim.playState === 'running';
      anim.currentTime = clamp((e.clientX - rect.left) / rect.width, 0, 0.999) * PREVIEW_MS;
      if (wasRunning) { play(); } else { anim.pause(); setPlayState('paused'); paintProgress(); }
    });

    dialog.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'ArrowLeft' && list.length > 1) { e.preventDefault(); show(index - 1); }
      else if (e.key === 'ArrowRight' && list.length > 1) { e.preventDefault(); show(index + 1); }
      else if ((e.key === ' ' || e.key === 'k') && !e.target.closest('button, a')) { e.preventDefault(); togglePlay(); }
    });

    // 触屏：左右滑切换，画面跟手移动一点
    var swipe = null;
    function endSwipe(commit) {
      if (!swipe) return;
      var s = swipe;
      swipe = null;
      frame.style.transition = reducedMotion() ? 'none' : 'translate .25s cubic-bezier(.2, .8, .2, 1)';
      frame.style.translate = '';
      if (commit && s.horizontal && Math.abs(s.dx) > 56 && list.length > 1) show(index + (s.dx < 0 ? 1 : -1));
    }
    stage.addEventListener('touchstart', function (e) {
      swipe = null;
      if (e.touches.length !== 1 || e.target.closest('button, .lightbox__bar')) return;
      swipe = { x: e.touches[0].clientX, y: e.touches[0].clientY, dx: 0, horizontal: null };
    }, { passive: true });
    stage.addEventListener('touchmove', function (e) {
      if (!swipe) return;
      var dx = e.touches[0].clientX - swipe.x;
      var dy = e.touches[0].clientY - swipe.y;
      if (swipe.horizontal === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        swipe.horizontal = Math.abs(dx) > Math.abs(dy);          // 方向一旦确定就不再变
        frame.style.transition = 'none';
      }
      if (!swipe.horizontal) return;
      // 横向滑动由这里接管：不让浏览器把它当成滚动 / 惯性滑动，否则紧接着的那一次点按会被吞掉
      if (e.cancelable) e.preventDefault();
      swipe.dx = dx;
      if (list.length > 1) frame.style.translate = (dx * 0.35).toFixed(1) + 'px 0';
    }, { passive: false });
    stage.addEventListener('touchend', function () { endSwipe(true); });
    stage.addEventListener('touchcancel', function () { endSwipe(false); });

    // 点赞
    likeBtn.addEventListener('click', function () {
      if (likes.toggle(current().id)) popLike(likeBtn);
    });
    likes.onChange(function () { if (dialog.open) paintLikes(); });

    // 做同款：把一句话创意带回提示词生成器
    $('#lbRemix').addEventListener('click', function () {
      var work = current();
      opener = null;                               // 关闭后焦点交给输入框，不回到卡片
      close(false, function () {
        if (composer) composer.fill({ mode: 'script', text: work.idea, genre: work.composerGenre });
        toast('已填入《' + work.title + '》的创意，可以直接改写', { type: 'ok' });
      });
    });

    // 复制链接
    $('#lbShare').addEventListener('click', function () {
      copyText(location.href).then(function (ok) {
        toast(ok ? '作品链接已复制' : '复制失败，请手动复制地址栏链接', { type: ok ? 'ok' : 'warn' });
      });
    });

    lightbox = { open: open, close: function () { close(); } };

    // 地址里带 #work-xxx 时直接打开
    function openFromHash() {
      var match = /^#work-(.+)$/.exec(location.hash);
      if (!match || !gallery) return;
      var work = gallery.find(decodeURIComponent(match[1]));
      if (!work) return;
      var all = gallery.all();
      open(all, all.indexOf(work), null, true);
    }
    window.addEventListener('hashchange', function () { if (!dialog.open) openFromHash(); });
    openFromHash();
  }

  /* ---------------------------------------------------------------------- */
  /* 回到顶部                                                                */
  /* ---------------------------------------------------------------------- */
  function initToTop() {
    var btn = $('#toTop');
    var update = rafThrottle(function () { btn.classList.toggle('is-on', window.scrollY > 640); });
    window.addEventListener('scroll', update, { passive: true });
    update();
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
      $('#main').focus({ preventScroll: true });
    });
  }

  /* ---------------------------------------------------------------------- */
  /* 启动                                                                    */
  /* ---------------------------------------------------------------------- */
  function boot() {
    [initTheme, initPlan, initSidebar, initComposer, initRail, initGallery, initLightbox, initToTop].forEach(function (init) {
      try { init(); } catch (err) {
        // 某个模块出错不影响其它模块
        if (window.console) console.error('[studio] ' + (init.name || 'init') + ' 失败：', err);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
