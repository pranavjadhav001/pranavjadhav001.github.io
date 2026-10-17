// player.js: one idempotent paint(t) per figure, played once when the board scrolls into view.
// Usage: chalkFigure({ END: 12, paint: function(t){ ... } })
// Generic beats: .el[data-t] fades in, .draw[data-t] strokes on. The figure's paint handles the rest.
function chalkFigure(opts){
  var END = opts.END;
  var timed = Array.prototype.map.call(document.querySelectorAll('[data-t]'), function(el){
    return { el: el, t: parseFloat(el.getAttribute('data-t')), cls: el.classList.contains('draw') ? 'on' : 'show' };
  });

  function paint(t){
    timed.forEach(function(b){ b.el.classList.toggle(b.cls, t >= b.t); });
    if (opts.paint) opts.paint(t);
  }

  var replay = document.getElementById('replay');
  var t0 = 0, raf = null, started = false;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function tick(){
    var t = (performance.now() - t0) / 1000;
    if (t >= END){ paint(END); raf = null; return; }   // freeze on the final frame
    paint(t);
    raf = requestAnimationFrame(tick);
  }
  function play(){
    started = true;
    if (raf) cancelAnimationFrame(raf);
    if (reduced){ paint(END); return; }
    t0 = performance.now(); paint(0);
    raf = requestAnimationFrame(tick);
  }
  replay.addEventListener('click', play);

  // auto-play once, the first time the board is mostly on screen
  paint(reduced ? END : 0);
  var board = document.querySelector('.board');
  if ('IntersectionObserver' in window && !reduced){
    var io = new IntersectionObserver(function(entries){
      if (entries.some(function(e){ return e.isIntersecting; }) && !started){ io.disconnect(); play(); }
    }, { threshold: 0.4 });
    io.observe(board);
  } else {
    play();
  }

  window.addEventListener('beforeprint', function(){
    if (raf) cancelAnimationFrame(raf);
    paint(END);
  });
  function postHeight(){
    parent.postMessage({
      chalkHeight: Math.ceil(document.body.getBoundingClientRect().height),
      chalkSrc: location.pathname.split('/').pop()
    }, '*');
  }
  window.addEventListener('load', postHeight);
  window.addEventListener('resize', postHeight);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(postHeight);
  setTimeout(postHeight, 1500);
}
