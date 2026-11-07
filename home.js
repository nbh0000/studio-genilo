// 홈 비교 표: 가로 스크롤 끝에 닿으면 오른쪽 페이드를 걷는다.
(function () {
  var box = document.querySelector('.ix-table');
  if (!box) return;
  function update() { box.classList.toggle('is-end', box.scrollLeft + box.clientWidth >= box.scrollWidth - 4); }
  box.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();
