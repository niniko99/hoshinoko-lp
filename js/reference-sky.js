/* Reference daytime/evening colors; preserve the original night and all actions. */
(function(){
  'use strict';
  var main=document.querySelector('main'),can=document.getElementById('can'),sky=document.querySelector('.reference-sky');
  if(!main||!can||!sky)return;
  var targets=main.querySelectorAll('.hero-copy,.hero-brand,.sec-title,.big-word,.mid-word,.today-big,.lead,.read,.photo-words,.can b,.can span,.can-note,.flow b,.flow-note,.cta-mid p,.swipe-hint,.price-note,.price-sub');
  function top(el){var y=0;while(el){y+=el.offsetTop;el=el.offsetParent;}return y;}
  function layout(){
    var base=top(main),H=main.offsetHeight,night=H*.745;
    var join=top(can)-base+can.offsetHeight;
    var fade=Math.min(Math.max(window.innerHeight*.55,300),650);
    var eveningTop=join-fade,ending=night+fade;
    var eveningHeight=ending-eveningTop;
    var imageHeight=Math.max(eveningHeight*2.2,main.clientWidth*2048/683);
    sky.style.setProperty('--reference-height',ending+'px');
    sky.style.setProperty('--reference-evening-image-height',imageHeight+'px');
    sky.style.setProperty('--reference-blue-height',(join+fade)+'px');
    sky.style.setProperty('--reference-evening-top',eveningTop+'px');
    sky.style.setProperty('--reference-day-fade',(fade*2)+'px');
    sky.style.setProperty('--reference-night-fade',(fade*2)+'px');
    Array.prototype.forEach.call(targets,function(el){
      var y=top(el)-base+el.offsetHeight/2;
      // The evening image uses its pale peach through purple region, avoiding its star field.
      var sourceRow=((imageHeight-eveningHeight)*.2+y-eveningTop)/imageHeight;
      var ink=y<join||sourceRow<.463;
      var inNight=y>=night;
      el.classList.toggle('reference-dusk-ink',!inNight&&y>=join&&sourceRow>=.37&&sourceRow<.463);
      el.classList.toggle('reference-ink',!inNight&&ink);
      el.classList.toggle('reference-white',!inNight&&!ink);
    });
  }
  var pending=false;
  function schedule(){if(pending)return;pending=true;requestAnimationFrame(function(){pending=false;layout();});}
  window.addEventListener('resize',schedule);window.addEventListener('load',schedule);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(schedule);
  if('ResizeObserver'in window)new ResizeObserver(schedule).observe(main);
  layout();
})();
