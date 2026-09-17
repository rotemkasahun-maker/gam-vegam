/* Source-to-build diagnosis patch: safe global start trigger. */
document.addEventListener('click',function(e){
  var t=e.target.closest('[data-action="start"],[data-r="start"]');
  if(!t)return;
  e.preventDefault();e.stopImmediatePropagation();
  var m=document.querySelector('#modal');
  m.innerHTML='<div class="scrim open"></div><section class="sheet open"><button class="close" data-patch-close>×</button><p class="eyebrow">הצעד הראשון</p><h1>מה תרצי לעשות?</h1><div class="sheet-options"><button data-patch="create">🌱 ליצור משהו</button><button data-patch="search">🔎 למצוא משהו</button><button data-patch="offer">✨ להציע משהו</button></div></section>';
  m.querySelector('[data-patch-close]').onclick=function(){m.innerHTML=''};
},true);
window.__GV_BUILD_MARKER__='37cbf77-source-sync';
