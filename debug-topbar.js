// ============================================================
// debug-topbar.js
// 목적: 수정(detail) 페이지에서 키보드가 올라올 때 topbar가
//       사라지는 현상을 진단하기 위한 임시 디버그 오버레이.
// 사용법: index.html의 </body> 직전, 다른 <script> 태그들
//         (특히 bootstrap.js) 아래에 아래 한 줄을 추가하세요.
//
//   <script src="./debug-topbar.js"></script>
//
// 확인 방법:
//   1. 이 스크립트를 넣고 배포/커밋 후 실제 폰에서 접속
//   2. 기도제목 상세(수정) 페이지로 이동
//   3. 제목 또는 내용 입력창을 탭해서 키보드를 띄움
//   4. 화면 우상단에 뜨는 패널의 숫자가 바뀌는 걸 관찰
//      (topbar가 사라지는 순간 어떤 값이 튀는지가 핵심)
//   5. 진단 끝나면 index.html에서 이 스크립트 태그를 지우면 됩니다.
//      (원본 코드는 전혀 건드리지 않습니다)
// ============================================================
(function () {
  const panel = document.createElement('div');
  panel.id = '__kb_debug_panel';
  panel.style.cssText = [
    'position:fixed',
    'top:0',
    'right:0',
    'z-index:999999',
    'background:rgba(0,0,0,.85)',
    'color:#0f0',
    'font:11px/1.5 monospace',
    'padding:8px 10px',
    'white-space:pre',
    'pointer-events:none',
    'max-width:70vw',
    'border-bottom-left-radius:8px'
  ].join(';');
  panel.textContent = 'debug-topbar.js loaded';
  document.body.appendChild(panel);

  function fmt(n) {
    if (n === undefined || n === null || Number.isNaN(n)) return 'n/a';
    return Math.round(n * 100) / 100;
  }

  function update(label) {
    const frame = document.getElementById('frame');
    const topbar = document.getElementById('topbar');
    const detailScroll = document.getElementById('detail-scroll');
    const vv = window.visualViewport;

    const frameRect = frame ? frame.getBoundingClientRect() : null;
    const topbarRect = topbar ? topbar.getBoundingClientRect() : null;

    const lines = [];
    lines.push('[event] ' + label);
    lines.push('window.scrollY: ' + fmt(window.scrollY));
    lines.push('window.scrollX: ' + fmt(window.scrollX));
    lines.push('vv.offsetTop: ' + fmt(vv && vv.offsetTop));
    lines.push('vv.offsetLeft: ' + fmt(vv && vv.offsetLeft));
    lines.push('vv.height: ' + fmt(vv && vv.height));
    lines.push('window.innerHeight: ' + fmt(window.innerHeight));
    lines.push('frame.top: ' + fmt(frameRect && frameRect.top));
    lines.push('frame.bottom: ' + fmt(frameRect && frameRect.bottom));
    lines.push('topbar.top: ' + fmt(topbarRect && topbarRect.top));
    lines.push('topbar.bottom: ' + fmt(topbarRect && topbarRect.bottom));
    lines.push('detailScroll.scrollTop: ' + fmt(detailScroll && detailScroll.scrollTop));

    panel.textContent = lines.join('\n');

    // topbar가 화면 위로 넘어가면(top이 음수) 패널 배경을 빨간색으로 바꿔서
    // 바로 눈에 띄게 함
    if (topbarRect && topbarRect.top < 0) {
      panel.style.background = 'rgba(200,0,0,.9)';
    } else {
      panel.style.background = 'rgba(0,0,0,.85)';
    }
  }

  function bindLogging(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('focus', () => {
      update('focus:' + id);
      setTimeout(() => update('focus:' + id + '+50ms'), 50);
      setTimeout(() => update('focus:' + id + '+300ms'), 300);
      setTimeout(() => update('focus:' + id + '+600ms'), 600);
    });
    el.addEventListener('blur', () => update('blur:' + id));
  }

  // 앱 스크립트들(router.js 등)이 DOM/이벤트를 다 바인딩한 뒤에 실행되도록
  // 약간 지연
  window.addEventListener('load', () => {
    bindLogging('detail-title-input');
    bindLogging('detail-body-input');

    window.addEventListener('scroll', () => update('window.scroll'), { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => update('visualViewport.resize'));
      window.visualViewport.addEventListener('scroll', () => update('visualViewport.scroll'));
    }
    const ds = document.getElementById('detail-scroll');
    if (ds) {
      ds.addEventListener('scroll', () => update('detail-scroll.scroll'), { passive: true });
    }

    update('initial');
  });
})();
