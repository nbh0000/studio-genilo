(function () {
  var input = document.getElementById('guideQ');
  if (!input) return;
  var links = Array.prototype.slice.call(document.querySelectorAll('.hub-links a'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('.hub-group'));
  var status = document.getElementById('guideQStatus');
  function apply(q) {
    var words = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;
    links.forEach(function (a) {
      var hit = words.every(function (w) { return a.textContent.toLowerCase().indexOf(w) !== -1; });
      a.hidden = !hit;
      if (hit) shown += 1;
    });
    groups.forEach(function (g) { g.hidden = !g.querySelector('.hub-links a:not([hidden])'); });
    if (status) status.textContent = words.length ? (shown ? '"' + q.trim() + '" 검색 결과 ' + shown + '개' : '"' + q.trim() + '"이(가) 들어간 가이드가 없습니다.') : '';
  }
  var q = new URLSearchParams(location.search).get('q') || '';
  input.value = q;
  if (q) apply(q);
  input.addEventListener('input', function () { apply(input.value); });
})();
