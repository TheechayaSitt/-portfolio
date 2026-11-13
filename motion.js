(function(){
var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var FINE=matchMedia('(hover: hover) and (pointer: fine)').matches;
var css='#mvprog{position:fixed;left:0;top:0;height:3px;width:100%;background:#DFFF1A;transform-origin:0 50%;transform:scaleX(0);z-index:70;pointer-events:none;box-shadow:0 0 12px rgba(223,255,26,.6)}'
+'#mvring{position:fixed;left:0;top:0;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;border:1.5px solid rgba(223,255,26,.9);pointer-events:none;z-index:69;opacity:0;transition:width .25s,height .25s,margin .25s,background .25s,opacity .3s,border-color .25s;mix-blend-mode:normal}'
+'#mvring.on{opacity:1}#mvring.hov{width:58px;height:58px;margin:-29px 0 0 -29px;background:rgba(223,255,26,.18);border-color:#DFFF1A}#mvring.dn{width:24px;height:24px;margin:-12px 0 0 -12px}'
+'.mvspot{position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:radial-gradient(420px circle at var(--mx,50%) var(--my,40%),rgba(223,255,26,.16),transparent 60%);opacity:0;transition:opacity .5s;z-index:0}#top:hover .mvspot{opacity:1}#top>*{position:relative}#top>svg,#top>.mvspot{position:absolute}'
+'.mvpre{opacity:0;transform:translateY(34px) scale(.98)}.mvin{opacity:1;transform:none;transition:opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)}'
+'.mvimg{clip-path:inset(8% 8% 8% 8% round 18px);opacity:.3}.mvimg.mvshow{clip-path:inset(0 0 0 0 round 0);opacity:1;transition:clip-path 1s cubic-bezier(.2,.7,.2,1),opacity .8s}'
+'@keyframes mvup{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:none}}'
+'.mvhero>*{animation:mvup .9s cubic-bezier(.2,.7,.2,1) both}.mvhero>*:nth-child(2){animation-delay:.08s}.mvhero>*:nth-child(3){animation-delay:.18s}.mvhero>*:nth-child(4){animation-delay:.28s}.mvhero>*:nth-child(5){animation-delay:.38s}.mvhero>*:nth-child(6){animation-delay:.5s}'
+'.mvmag{transition:translate .35s cubic-bezier(.3,1.4,.5,1)}'
+'html{scroll-behavior:smooth}'
+'@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}.mvpre,.mvimg{opacity:1!important;transform:none!important;clip-path:none!important}.mvhero>*{animation:none}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

function ready(f){if(document.readyState!=='loading')setTimeout(f,0);else document.addEventListener('DOMContentLoaded',f)}
ready(function(){var root=document.getElementById('root')||document.body,t=null,done=false,start=Date.now();
  function go(){if(done)return;done=true;mo.disconnect();init()}
  var mo=new MutationObserver(function(){clearTimeout(t);t=setTimeout(go,350);if(Date.now()-start>3500)go()});
  mo.observe(root,{childList:true,subtree:true});t=setTimeout(go,600)});

function init(){
  // 1. scroll progress
  var pr=document.createElement('div');pr.id='mvprog';document.body.appendChild(pr);
  var tick=false;function onS(){if(tick)return;tick=true;requestAnimationFrame(function(){tick=false;var h=document.documentElement.scrollHeight-innerHeight;pr.style.transform='scaleX('+(h>0?scrollY/h:0)+')'})}
  addEventListener('scroll',onS,{passive:true});onS();
  if(RM)return;

  // 2. hero: intro stagger, spotlight, parallax shapes
  function heroEls(){var h=document.getElementById('top');if(!h)return null;var sp=h.querySelector(':scope > .mvspot');if(!sp){sp=document.createElement('div');sp.className='mvspot';h.insertBefore(sp,h.firstChild)}
    var deco=[].slice.call(h.querySelectorAll(':scope > svg'));deco.forEach(function(sv,i){if(!sv.dataset.depth){sv.dataset.depth=String(((i%4)+1)*(sv.classList.contains('shape')?14:8));sv.style.transition='translate .6s cubic-bezier(.2,.7,.2,1)'}});return {h:h,deco:deco}}
  heroEls();
  document.addEventListener('pointermove',function(e){var h=document.getElementById('top');if(!h||!h.contains(e.target)){if(h&&h._mvin){h._mvin=0;[].forEach.call(h.querySelectorAll(':scope > svg'),function(sv){sv.style.translate=''})}return}
    var E=heroEls();h._mvin=1;var r=h.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
    h.style.setProperty('--mx',(x*100)+'%');h.style.setProperty('--my',(y*100)+'%');
    E.deco.forEach(function(sv){var d=+sv.dataset.depth;sv.style.translate=((x-.5)*-d)+'px '+((y-.5)*-d)+'px'})},{passive:true});

  // 3. cursor ring (desktop only, native cursor stays)
  if(FINE){
    var ring=document.createElement('div');ring.id='mvring';document.body.appendChild(ring);
    var mx=-100,my=-100,rx=mx,ry=my,moving=false;
    addEventListener('pointermove',function(e){mx=e.clientX;my=e.clientY;if(!ring.classList.contains('on'))ring.classList.add('on');if(!moving){moving=true;requestAnimationFrame(loop)}},{passive:true});
    document.addEventListener('pointerleave',function(){ring.classList.remove('on')});
    addEventListener('pointerdown',function(){ring.classList.add('dn')});addEventListener('pointerup',function(){ring.classList.remove('dn')});
    document.addEventListener('pointerover',function(e){var t=e.target.closest&&e.target.closest('a,button,[role="button"],summary,label,.pcard,.jobcard');ring.classList.toggle('hov',!!t)});
    function loop(){rx+=(mx-rx)*.2;ry+=(my-ry)*.2;ring.style.transform='translate('+rx+'px,'+ry+'px)';if(Math.abs(mx-rx)+Math.abs(my-ry)>.3)requestAnimationFrame(loop);else moving=false}
  }

  // 4. magnetic buttons
  if(FINE){
    document.addEventListener('pointermove',function(e){var b=e.target.closest&&e.target.closest('.btn,.navcta,.dkfab,.backbtn,.nextcard .arrow');
      if(!b)return;b.classList.add('mvmag');var r=b.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;b.style.translate=(x*.22)+'px '+(y*.3)+'px';
      if(!b._mvl){b._mvl=1;b.addEventListener('pointerleave',function(){b.style.translate=''})}},{passive:true});
  }

  // 5. staggered reveal (Web Animations: survives framework re-renders that reset class/style attributes)
  var EZ='cubic-bezier(.2,.7,.2,1)';
  function arm(el,frames,opt){var an=el.animate(frames,Object.assign({fill:'backwards',easing:EZ},opt));an.pause();an.currentTime=0;return an}
  var SEL='.pcard,.pf,.lift,.jobcard,.st,.tool,.cert,.step,.card,.impact,.pfnote,figure';
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;io.unobserve(e.target);var an=e.target._mvan;if(an)an.play()})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  [].forEach.call(document.querySelectorAll(SEL),function(el){if(el.closest('#top,.dk,.dkwrap,#langsw,nav,header'))return;var r=el.getBoundingClientRect();if(!(r.top>innerHeight*.92&&r.height>0))return;
    var sib=el.parentElement?[].indexOf.call(el.parentElement.children,el):0;
    el._mvan=arm(el,[{opacity:0,transform:'translateY(34px) scale(.98)'},{opacity:1,transform:'none'}],{duration:800,delay:Math.min(sib,6)*70});io.observe(el)});

  // 6. image reveal (case study screenshots and large images)
  var iio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){iio.unobserve(e.target);e.target._mvan&&e.target._mvan.play()}})},{threshold:.15});
  [].forEach.call(document.querySelectorAll('main img, section img'),function(im){if(im.closest('#top,.clogo,.logo,.dk,.pcard,.lift'))return;var r=im.getBoundingClientRect();if(r.width<320||r.top<innerHeight)return;
    im._mvan=arm(im,[{clipPath:'inset(8% 8% 8% 8% round 18px)',opacity:.3},{clipPath:'inset(0 0 0 0 round 0px)',opacity:1}],{duration:1000});iio.observe(im)});

  // 7. count-up for stat numbers (Main)
  var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;cio.unobserve(e.target);var n=e.target.firstChild;if(!n||n.nodeType!==3)return;var orig=n.nodeValue,to=parseFloat(orig);if(!(to>0))return;var s=performance.now();
    (function f(t){var p=Math.min(1,(t-s)/1100);if(e.target.firstChild!==n)return;n.nodeValue=p<1?String(Math.round(to*(1-Math.pow(1-p,3)))):orig;if(p<1)requestAnimationFrame(f)})(s)})},{threshold:.6});
  [].forEach.call(document.querySelectorAll('.stn'),function(el){cio.observe(el)});
}
})();
