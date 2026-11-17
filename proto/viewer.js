(function(){
var D=window.PROTO;var cur=D.start,hist=[],showAll=false;
var $=function(s){return document.querySelector(s)};
var stage=$('#stage'),img=$('#scr'),spots=$('#spots'),hint=$('#hint'),title=$('#stitle'),strip=$('#strip'),step=$('#stepn');
var order=D.order;
// thumbnails
order.forEach(function(id,i){var s=D.screens[id];var b=document.createElement('button');b.type='button';b.className='th';b.setAttribute('data-id',id);
  b.innerHTML='<span class="tn">'+(i+1)+'</span><img alt="" loading="lazy" src="'+s.thumb+'"><span class="tl">'+s.title+'</span>';
  b.addEventListener('click',function(){go(id,true)});strip.appendChild(b)});
function flash(all){[].forEach.call(spots.children,function(h){h.classList.remove('fl');void h.offsetWidth;h.classList.add('fl')})}
function render(){
  var s=D.screens[cur];stage.classList.remove('in');void stage.offsetWidth;
  stage.style.maxWidth=(s.w&&s.w<(D.W*0.8))?Math.round(s.w*1.4)+'px':'';stage.style.margin=stage.style.maxWidth?'0 auto':'';img.onload=function(){stage.classList.add('in')};img.src=s.src;img.alt=s.title;if(img.complete)stage.classList.add('in');
  title.textContent=s.title;hint.textContent=s.hint||'';
  var idx=order.indexOf(cur);step.textContent=(idx+1)+' / '+order.length;
  spots.innerHTML='';var list=(s.spots||[]).concat(s.nav===false?[]:(D.nav||[]));
  list.forEach(function(p){var a=document.createElement('button');a.type='button';a.className='hs'+(p.main?' main':'');
    var sw=s.w||D.W;a.style.left=(p.x/sw*100)+'%';a.style.top=(p.y/s.h*100)+'%';a.style.width=(p.w/sw*100)+'%';a.style.height=(p.h/s.h*100)+'%';
    a.setAttribute('aria-label',p.label||D.screens[p.to].title);if(p.label)a.title=p.label;
    a.addEventListener('click',function(e){e.stopPropagation();if(p.to===cur){flash();return}go(p.to)});spots.appendChild(a)});
  [].forEach.call(strip.children,function(b){var on=b.getAttribute('data-id')===cur;b.classList.toggle('on',on);if(on&&b.scrollIntoView)b.scrollIntoView({block:'nearest',inline:'center',behavior:'smooth'})});
  $('#back').disabled=!hist.length;
  setTimeout(flash,350);
  try{history.replaceState(null,'','#'+cur)}catch(e){}
}
function go(id,jump){if(!D.screens[id])return;if(id!==cur){hist.push(cur);cur=id;window.scrollTo({top:0,behavior:'auto'});render()}}
$('#back').addEventListener('click',function(){if(!hist.length)return;cur=hist.pop();window.scrollTo({top:0});render()});
$('#restart').addEventListener('click',function(){hist=[];cur=D.start;window.scrollTo({top:0});render()});
$('#toggle').addEventListener('click',function(){showAll=!showAll;document.body.classList.toggle('showall',showAll);this.setAttribute('aria-pressed',showAll)});
stage.addEventListener('click',function(e){if(e.target===img||e.target===spots)flash()});
document.addEventListener('keydown',function(e){if(e.key==='Backspace'||e.key==='ArrowLeft'){$('#back').click()}});
var h=(location.hash||'').slice(1);if(D.screens[h])cur=h;
addEventListener('hashchange',function(){var k=(location.hash||'').slice(1);if(D.screens[k]&&k!==cur){hist.push(cur);cur=k;render()}});
render();
})();
