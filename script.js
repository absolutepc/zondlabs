'use strict';
// Every displayed statistic is made from individual vector dots, never a raster font.
const font = {
'0':['01110','10001','10011','10101','11001','10001','01110'],
'1':['00100','01100','00100','00100','00100','00100','01110'],
'2':['01110','10001','00001','00010','00100','01000','11111'],
'3':['11110','00001','00001','01110','00001','00001','11110'],
'4':['00010','00110','01010','10010','11111','00010','00010'],
'5':['11111','10000','10000','11110','00001','00001','11110'],
'6':['01110','10000','10000','11110','10001','10001','01110'],
'7':['11111','00001','00010','00100','01000','01000','01000'],
'8':['01110','10001','10001','01110','10001','10001','01110'],
'9':['01110','10001','10001','01111','00001','00001','01110']
};
function renderDotNumbers(){
 document.querySelectorAll('[data-dots]').forEach(el=>{
  const text=el.dataset.dots;
  const width=text.length*6-1;
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 ${width+1} 8" role="img" aria-label="${text}" preserveAspectRatio="xMinYMid meet"><g fill="currentColor">`;
  [...text].forEach((digit,i)=>{(font[digit]||font['0']).forEach((row,y)=>{[...row].forEach((on,x)=>{if(on==='1')svg+=`<circle cx="${i*6+x}" cy="${y}" r=".36"/>`;});});});
  svg+='</g></svg>';
  el.innerHTML=svg;
  el.setAttribute('aria-label',text);
 });
}
renderDotNumbers();
const menuButton=document.getElementById('menuButton');const mobileMenu=document.getElementById('mobileMenu');
function setMenu(open){menuButton.classList.toggle('is-open',open);mobileMenu.classList.toggle('is-open',open);menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');mobileMenu.inert=!open;}
menuButton.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
window.addEventListener('resize',()=>{if(window.innerWidth>820)setMenu(false)});
// Image changes are preloaded to avoid a blank frame.
const featureImage=document.getElementById('featureImage');
document.querySelectorAll('.mini-image').forEach(button=>button.addEventListener('click',()=>{
 const src=button.dataset.src;
 const pre=new Image();pre.src=src;const set=()=>{featureImage.src=src;featureImage.alt=button.dataset.alt;};
 if(pre.complete)set();else pre.onload=set;
 document.querySelectorAll('.mini-image').forEach(b=>{b.classList.toggle('is-active',b===button);b.setAttribute('aria-pressed',String(b===button))});
}));
const slides=[
 {caption:'ЭЛЕКТРОНИКА / ДИЗАЙН / ИНЖЕНЕРИЯ',filter:'none',title:'xDot',image:'/assets/hero.webp'},
 {caption:'ПРОДУМАННАЯ КОНСТРУКЦИЯ И ЭСТЕТИКА',filter:'saturate(.9) brightness(.9)',title:'Дизайн',image:'/assets/product.webp'},
 {caption:'СОБСТВЕННЫЕ РЕШЕНИЯ ДЛЯ РЕАЛЬНОГО МИРА',filter:'saturate(1.1) contrast(1.1)',title:'Инженерия',image:'/assets/engineering.webp'}
];
const heroImg=document.querySelector('.hero-art img');const heroSlideCaption=document.getElementById('heroSlideCaption');
document.querySelectorAll('[data-slide]').forEach(button=>button.addEventListener('click',()=>{const slide=Number(button.dataset.slide);document.querySelectorAll('[data-slide]').forEach(b=>{b.classList.toggle('is-selected',b===button);b.setAttribute('aria-pressed',String(b===button));});heroSlideCaption.textContent=slides[slide].caption;heroImg.style.filter=slides[slide].filter;const next=new Image();next.src=slides[slide].image;const swap=()=>{heroImg.src=slides[slide].image;};if(next.complete)swap();else next.onload=swap;document.querySelector('.hero-side-index strong').textContent=slides[slide].title;}));
const productDialog=document.getElementById('productDialog');document.getElementById('detailsOpen').addEventListener('click',()=>productDialog.showModal());document.getElementById('dialogClose').addEventListener('click',()=>productDialog.close());productDialog.addEventListener('click',e=>{if(e.target===productDialog)productDialog.close()});
const contactDialog=document.getElementById('contactDialog');document.getElementById('contactInfo').addEventListener('click',e=>{e.preventDefault();contactDialog.showModal()});document.getElementById('contactClose').addEventListener('click',()=>contactDialog.close());document.getElementById('contactDone').addEventListener('click',()=>contactDialog.close());contactDialog.addEventListener('click',e=>{if(e.target===contactDialog)contactDialog.close()});
